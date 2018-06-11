
import * as fs from 'fs';
import * as path from 'path';
import { XrefLine, Class } from './model';
import { XrefFile } from './xreffile';

export class Parser {

    private crudIgnore = ['PUBLIC-DATA-MEMBER', 'PUBLIC-PROPERTY', 'SHARED'];
    private crudTypes = ['ACCESS', 'UPDATE', 'CREATE', 'DELETE'];

    parseDir(dirname: string, sourcebasedir?: string): XrefFile[] {

        const parsed: XrefFile[] = [];

        if (fs.existsSync(dirname)) {

            this.readFiles(dirname, []).forEach(file => {
                const xreffile = this.parseFile(file, sourcebasedir);

                const targetFile = xreffile.xreffile.replace('/xref/', '/xrefjson/') + '.json';
                const targetDir = path.dirname(targetFile);
                this.mkdir(targetDir);

                fs.writeFileSync(targetFile, JSON.stringify(xreffile, undefined, 2));
                parsed.push(xreffile);
            });

        }

        return parsed;
    }

    parseFile(file: string, sourcebasedir?: string) {

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
                case 'CLASS':
                    this.processClass(xrefline, xreffile);
                    break;
                case 'COMPILE':
                    this.processCompile(xrefline, xreffile);
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
            }
        }
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

        if (xrefline.type === 'ACCESS' || xrefline.type === 'UPDATE') {

            const tablepart = xrefline.info.split(' ');
            if (this.crudIgnore.indexOf(tablepart[0]) < 0) {
                const tableinfo = tablepart[0].split('.');
                if (tableinfo[1] !== undefined) {
                    const table = xreffile.addTable(tableinfo[1], tableinfo[0], false, false, xrefline.type === 'UPDATE');
                    xreffile.addField(tablepart[1], table, xrefline.type === 'UPDATE');
                }
            }
        }
        else if (xrefline.type === 'CREATE' || xrefline.type === 'DELETE') {

            const tablepart = xrefline.info.split(' ');
            if (tablepart[1] !== 'TEMPTABLE') {
                const tableinfo = tablepart[0].split('.');
                xreffile.addTable(tableinfo[1], tableinfo[0], xrefline.type === 'CREATE', xrefline.type === 'DELETE');
            }
        }
    }

    private processNew(xrefline: XrefLine, xreffile: XrefFile) {

        if (xreffile.classes.indexOf(xrefline.info) < 0) {
            xreffile.classes.push(xrefline.info);
        }

    }

    private processInvoke(xrefline: XrefLine, xreffile: XrefFile) {

        if (xreffile.invokes.indexOf(xrefline.info) < 0) {
            xreffile.invokes.push(xrefline.info);
        }

    }

    private processCompile(xrefline: XrefLine, xreffile: XrefFile) {
        xreffile.setSourceFile(xrefline.info);
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
