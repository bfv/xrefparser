
import * as fs from 'fs';
import * as path from 'path';
import { XrefLine, Class, Accessor, Method } from './model';
import { XrefFile } from './xreffile';

export class Parser {

    private crudIgnore = ['PUBLIC-DATA-MEMBER', 'PUBLIC-PROPERTY', 'SHARED', 'DATA-MEMBER'];
    private crudTypes = ['ACCESS', 'UPDATE', 'CREATE', 'DELETE'];

    parseDir(dirname: string, sourcebasedir?: string): XrefFile[] {

        const parsed: XrefFile[] = [];

        if (fs.existsSync(dirname)) {

            this.readFiles(dirname, []).forEach(file => {

                if (path.extname(file) === '.xref') {
                    const xreffile = this.parseFile(file, sourcebasedir);
                    const targetFile = xreffile.xreffile.replace('/xref/', '/xrefjson/') + '.json';
                    const targetDir = path.dirname(targetFile);
                    this.mkdir(targetDir);

                    fs.writeFileSync(targetFile, JSON.stringify(xreffile, undefined, 2));
                    parsed.push(xreffile);
                }
            });

        }

        return parsed;
    }

    parseFile(file: string, sourcebasedir?: string): XrefFile {

        const xreffile = new XrefFile(file);

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
                case 'CPINTERNAL':
                    this.processCpInternal(xrefline, xreffile);
                    break;
                case 'CPSTREAM':
                    this.processCpStream(xrefline, xreffile);
                    break;
                case 'INCLUDE':
                    this.processInclude(xrefline, xreffile);
                    break;
                case 'INVOKE':
                    this.processInvoke(xrefline, xreffile);
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
                case 'METHOD':
                    this.processMethod(xrefline, xreffile);
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
        xreffile.class = new Class(xrefline.info);
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

        if (xrefline.type === 'ACCESS' || xrefline.type === 'UPDATE') {

            const tableinfo = tablepart[0].split('.');
            if (tableinfo[1] !== undefined) {
                const table = xreffile.addTable(tableinfo[1], tableinfo[0], false, false, xrefline.type === 'UPDATE');
                xreffile.addField(tablepart[1], table, xrefline.type === 'UPDATE');
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
        console.log(classObject.methods, method);
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

    private processMethod(xrefline: XrefLine, xreffile: XrefFile) {

        const methodInfo = xrefline.info.split(',');

        const method: Method = {
            name: methodInfo[5],
            accessor: <Accessor>methodInfo[0],
            static: (methodInfo[1] === 'STATIC'),
            override: (methodInfo[2] === 'OVERRIDE'),
            final: (methodInfo[3] === 'FINAL'),
            abstract: (methodInfo[4] === 'ABSTRACT'),
            returntype: methodInfo[6],
            signature: []
        };

        for (let i = 7; i < methodInfo.length; i++) {
            method.signature.push(methodInfo[i]);
        }

        xreffile.methods.push(method);
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
}
