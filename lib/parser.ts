
import * as fs from 'fs';
import * as path from 'path';
import { XrefLine, Class, Accessor, Method, Parameter, ParameterMode, Constructor, Interface } from './model';
import { XrefFile } from './xreffile';

export class Parser {

    private config: ParserConfig;
    private crudIgnore = ['PUBLIC-DATA-MEMBER', 'PUBLIC-PROPERTY', 'SHARED', 'DATA-MEMBER'];
    private crudTypes = ['ACCESS', 'UPDATE', 'CREATE', 'DELETE', 'REFERENCE'];
    private typesToProcess = [
        'ANNOTATION', 'CLASS', 'COMPILE', 'CONSTRUCTOR', 'CPINTERNAL', 'CPSTREAM',
        'INCLUDE', 'INTERFACE', 'INVOKE', 'METHOD', 'NEW', 'PROCEDURE',
        'PRIVATE-PROCEDURE', 'RUN', 'SEARCH'
    ];

    constructor(config?: ParserConfig) {
        this.config = Object.assign(new ParserConfig(), config);
        this.applyConfig();
    }

    private applyConfig() {

        if (!this.config.classes) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'CLASS');
            this.config.constructors = false;
            this.config.methods = false;
            this.config.interfaces = false;
        }

        if (!this.config.constructors) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'CONSTRUCTOR');
        }

        if (!this.config.methods) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'METHOD');
        }

        if (!this.config.interfaces) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'INTERFACE');
        }

        if (!this.config.invokes) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'INVOKE');
        }

        if (!this.config.news) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'NEW');
        }

        if (!this.config.procedures) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'PROCEDURE');
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'PRIVATE-PROCEDURE');
        }

        if (!this.config.runs) {
            this.typesToProcess = this.typesToProcess.filter(item => item !== 'RUN');
        }
    }

    private includeType(type: string): boolean {
        return (this.typesToProcess.indexOf(type) >= 0);
    }

    parseDir(dirname: string, sourcebasedir?: string): XrefFile[] {

        const parsed: XrefFile[] = [];

        if (fs.existsSync(dirname)) {

            this.readFiles(dirname, []).forEach(file => {

                if (path.extname(file) === '.xref') {
                    const xreffile = this.parseFile(file, dirname, sourcebasedir);
                    parsed.push(xreffile);
                }
            });
        }

        this.postProcess(parsed);

        return parsed;
    }

    // private again because parsing a single file will result in incorrect class names (constructor & methods)
    // only via parseDir and the subsequent postProcess the class names of parameters will be correct
    private parseFile(file: string, xrefbasedir: string, sourcebasedir?: string): XrefFile {

        const xreffile = new XrefFile(file, xrefbasedir);

        const lines = fs.readFileSync(file).toString().split('\n');
        lines.forEach(line => {
            const xrefline = new XrefLine();
            xrefline.parse(line);
            this.processXrefLine(xrefline, xreffile);
        });

        xreffile.sourcefile = this.normalizeSourceFilename(xreffile.sourcefile);
        if (sourcebasedir) {
            xreffile.sourcefile = xreffile.sourcefile.replace(this.normalizeSourceFilename(sourcebasedir), '');
        }

        xreffile.finish();

        return xreffile;
    }

    private processXrefLine(xrefline: XrefLine, xreffile: XrefFile) {

        if (this.crudTypes.indexOf(xrefline.type) >= 0) {
            this.processCrud(xrefline, xreffile);
        }
        else {

            if (this.typesToProcess.indexOf(xrefline.type) < 0) {
                return;
            }

            switch (xrefline.type) {
                case 'ANNOTATION':
                    this.processAnnotation(xrefline, xreffile);
                    break;
                case 'CLASS':
                    this.processClass(xrefline, xreffile);
                    break;
                case 'COMPILE':
                    this.processCompile(xrefline, xreffile);
                    break;
                case 'CONSTRUCTOR':
                    this.processConstructor(xrefline, xreffile);
                    break;
                case 'CPINTERNAL':
                    this.processCpInternal(xrefline, xreffile);
                    break;
                case 'CPSTREAM':
                    this.processCpStream(xrefline, xreffile);
                    break;
                case 'INCLUDE':
                    this.processInclude(xrefline, xreffile);
                    break;
                case 'INTERFACE':
                    this.processInterface(xrefline, xreffile);
                    break;
                case 'INVOKE':
                    this.processInvoke(xrefline, xreffile);
                    break;
                case 'METHOD':
                    this.processMethod(xrefline, xreffile);
                    break;
                case 'NEW':
                    this.processNew(xrefline, xreffile);
                    break;
                case 'PROCEDURE':
                    this.processProcedure(xrefline, xreffile, false);
                    break;
                case 'PRIVATE-PROCEDURE':
                    this.processProcedure(xrefline, xreffile, true);
                    break;
                case 'RUN':
                    this.processRun(xrefline, xreffile);
                    break;
                case 'SEARCH':
                    this.processSearch(xrefline, xreffile);
                    break;
            }
        }
    }

    private processAnnotation(xrefline: XrefLine, xreffile: XrefFile) {
        xreffile.annotations.push(xrefline.info);
    }

    private processCpInternal(xrefline: XrefLine, xreffile: XrefFile) {
        xreffile.cpInternal = xrefline.info;
    }

    private processCpStream(xrefline: XrefLine, xreffile: XrefFile) {
        xreffile.cpStream = xrefline.info;
    }

    private processClass(xrefline: XrefLine, xreffile: XrefFile) {

        const entries = xrefline.info.split(',');

        let inheritsArray = entries[1].replace('INHERITS', '').trim().split(' ');
        if (inheritsArray[0] === '') {
            inheritsArray = [];
        }

        let implementsArray = entries[2].replace('IMPLEMENTS', '').trim().split(' ');
        if (implementsArray[0] === '') {
            implementsArray = [];
        }

        const classObj: Class = {
            name: entries[0],
            inherits: inheritsArray,
            implements: implementsArray,
            useWidgetPool: (entries[3] === 'USE-WIDGET-POOL'),
            final: (entries[4] === 'FINAL'),
            abstract: (entries[5] === 'ABSTRACT'),
            serializable: (entries[6] === 'SERIALIZABLE'),
            constructors: [],
            methods: []
        };

        xreffile.class = classObj;
    }

    private processInterface(xrefline: XrefLine, xreffile: XrefFile) {

        const entries = xrefline.info.split(',');
        let inheritsArray = entries[1].replace('INHERITS', '').trim().split(' ');
        if (inheritsArray[0] === '') {
            inheritsArray = [];
        }

        const interfaceObj: Interface = {
            name: entries[0],
            inherits: inheritsArray,
            methods: []
        };

        xreffile.interface = interfaceObj;
    }

    private processInclude(xrefline: XrefLine, xreffile: XrefFile) {

        if (xrefline.info.startsWith('\"')) {
            return;
        }

        if (xreffile.includes.indexOf(xrefline.info)) {
            xreffile.includes.push(xrefline.info);
        }
    }

    private processCrud(xrefline: XrefLine, xreffile: XrefFile) {

        const tablepart = xrefline.info.split(' ');
        if (this.crudIgnore.indexOf(tablepart[0]) >= 0) {
            return;
        }

        if (tablepart[1] === 'WORKFILE' || tablepart[1] === 'TEMPTABLE') {
            return;
        }

        if (xrefline.type === 'ACCESS' || xrefline.type === 'UPDATE' || xrefline.type === 'REFERENCE') {

            const tableinfo = tablepart[0].split('.');
            if (tableinfo[1] !== undefined) {
                const table = xreffile.addTable(tableinfo[1], tableinfo[0], false, false, xrefline.type === 'UPDATE');
                if (tablepart[1]) {
                    xreffile.addField(tablepart[1], table, xrefline.type === 'UPDATE');
                }
            }
        }
        else if (xrefline.type === 'CREATE' || xrefline.type === 'DELETE') {
            const tableinfo = tablepart[0].split('.');
            xreffile.addTable(tableinfo[1], tableinfo[0], xrefline.type === 'CREATE', xrefline.type === 'DELETE');
        }
    }

    private processNew(xrefline: XrefLine, xreffile: XrefFile) {

        if (xreffile.instantiates.indexOf(xrefline.info) < 0) {
            xreffile.instantiates.push(xrefline.info);
        }

    }

    private processInvoke(xrefline: XrefLine, xreffile: XrefFile) {
        const invokeInfo = xrefline.info.split(':');
        const method = invokeInfo[1];
        const fqclass = invokeInfo[0];

        let classObject = xreffile.invokes.filter(invoke => invoke.class === fqclass)[0];
        if (!classObject) {
            classObject = { class: fqclass, methods: [] };
            xreffile.invokes.push(classObject);
        }

        if (classObject.methods.indexOf(method) < 0) {
            classObject.methods.push(method);
        }

    }

    private processCompile(xrefline: XrefLine, xreffile: XrefFile) {
        xreffile.setSourceFile(xrefline.info);
    }

    private processProcedure(xrefline: XrefLine, xreffile: XrefFile, isPrivate: boolean) {
        const procInfo = xrefline.info.split(',');
        xreffile.procedures.push({ name: procInfo[0], private: isPrivate });
    }

    private processRun(xrefline: XrefLine, xreffile: XrefFile) {

        const procInfo = xrefline.info.split(' ');

        let runObject = xreffile.runs.filter(run => run.name === procInfo[0])[0];
        if (!runObject) {
            runObject = {
                name: procInfo[0],
                persistent: (procInfo[1] !== undefined && procInfo[1] === 'PERSISTENT'),
                dynamic: (procInfo[0].toLowerCase().startsWith('value('))
            };
            xreffile.runs.push(runObject);
        }

    }

    private processSearch(xrefline: XrefLine, xreffile: XrefFile) {

        const searchInfo = xrefline.info.split(' ');

        // for now this method is used just for fetching references to temp-tables
        if (searchInfo.indexOf('TEMPTABLE') === -1) {
            return;
        }

        let ttname = '';
        if (searchInfo[0] === 'DATA-MEMBER') {
            // it's inside a class
            ttname = searchInfo[1].split(':')[1];
        }
        else {
            ttname = searchInfo[0];
        }

        if (xreffile.ttnames.filter(tt => tt.toLowerCase() === ttname.toLowerCase())[0] === undefined) {
            xreffile.ttnames.push(ttname);
        }
    }

    private processMethod(xrefline: XrefLine, xreffile: XrefFile) {
        const method = this.extractMethod(xrefline);
        if (xreffile.class) {
            xreffile.class.methods.push(method);
        }
        else if (xreffile.interface) {
            xreffile.interface.methods.push(method);
        }
    }

    private processConstructor(xrefline: XrefLine, xreffile: XrefFile) {

        const method = this.extractMethod(xrefline, true);
        const constructor: Constructor = {
            accessor: method.accessor,
            static: method.static,
            signature: method.signature
        };

        if (xreffile.class) {
            xreffile.class.constructors.push(constructor);
        }
    }

    private extractMethod(xrefline: XrefLine, isConstructor = false): Method {

        const methodInfo = xrefline.info.split(',');

        const method: Method = {
            name: methodInfo[5],
            accessor: <Accessor>methodInfo[0].toLowerCase(),
            static: (methodInfo[1] === 'STATIC'),
            override: (methodInfo[2] === 'OVERRIDE'),
            final: (methodInfo[3] === 'FINAL'),
            abstract: (methodInfo[4] === 'ABSTRACT'),
            returntype: (isConstructor ? '' : methodInfo[6]),
            signature: []
        };

        let i = (isConstructor ? 6 : 7);
        for (; i < methodInfo.length; i++) {
            const param = this.extractParameter(methodInfo[i]);
            if (param !== undefined) {
                method.signature.push(param);
            }
        }

        return method;
    }

    private extractParameter(paramString: string): Parameter | undefined {

        if (paramString === '') {
            return undefined;
        }

        const paramInfo = paramString.split(' ');

        const param: Parameter = {
            name: paramInfo[1],
            mode: <ParameterMode>paramInfo[0].toLowerCase(),
            datatype: (paramInfo[2] ? paramInfo[2].toLowerCase() : '')
        };

        return param;
    }

    private readFiles(dirname: string, filelist: string[]) {

        const files = fs.readdirSync(dirname);
        files.forEach(file => {
            const filename = dirname + '/' + file;
            if (fs.statSync(filename).isDirectory()) {
                this.readFiles(filename, filelist);
            }
            else {
                filelist.push(filename);
            }
        });

        return filelist;
    }

    private mkdir(dirname: string) {

        let dir = '';
        const parts = dirname.split('/');
        for (let i = 0; i < parts.length; i++) {
            dir += parts[i] + '/';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        }
    }

    private normalizeSourceFilename(test: string) {
        const result = test.replace(/\\/g, '/');
        return result;
    }

    private postProcess(xreffiles: XrefFile[]) {
        if (this.config.methods || this.config.constructors) {
            this.fixClassNames(xreffiles);
        }
    }

    private fixClassNames(xreffiles: XrefFile[]) {

        const classes = this.getClassNames(xreffiles);

        // now iterate over all signature
        for (let i = 0; i < xreffiles.length; i++) {

            const classObj = xreffiles[i].class;
            if (classObj === undefined) {
                continue;
            }

            if (this.config.methods) {
                this.fixParameterDatatype(classes, classObj.methods);
            }

            if (this.config.constructors) {
                this.fixParameterDatatype(classes, classObj.constructors);
            }
        }
    }

    private fixParameterDatatype(classes: string[], array: { signature: Parameter[] }[]) {
        for (let j = 0; j < array.length; j++) {

            const signature = array[j].signature;
            for (let k = 0; k < signature.length; k++) {
                const param = signature[k];    // for clarity
                param.datatype = classes.filter(element => element.toLowerCase() === param.datatype)[0] || param.datatype;
            }
        }
    }

    private getClassNames(xreffiles: XrefFile[]): string[] {

        const classes: string[] = [];
        for (let i = 0; i < xreffiles.length; i++) {
            const xreffile = xreffiles[i];
            if (xreffile.class !== undefined) {
                classes.push(xreffile.class.name);
            }
        }

        return classes;
    }
}

export class ParserConfig {

    classes?: boolean;
    methods?: boolean;
    constructors?: boolean;
    invokes?: boolean;
    interfaces?: boolean;
    news?: boolean;          // instatiates
    procedures?: boolean;
    runs?: boolean;

    constructor() {
        this.classes = true;
        this.methods = true;
        this.constructors = true;
        this.invokes = true;
        this.interfaces = true;
        this.news = true;          // instatiates
        this.procedures = true;
        this.runs = true;
    }
}
