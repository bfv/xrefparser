
import { Table, Field, Class, MethodInvocation, Procedure, Run, Method, Constructor, Interface } from './model';
import { TempTable, TempTableField } from './model';
import { normalize } from 'path';
import { replaceAll } from './util';

export class XrefFile {

    xreffile = '';
    sourcefile = '';
    class?: Class;
    interface?: Interface;
    cpInternal = '';
    cpStream = '';
    includes: string[] = [];
    tablenames: string[] = [];
    ttnames: string[] = [];
    instantiates: string[] = [];
    invokes: MethodInvocation[] = [];
    annotations: string[] = [];
    procedures: Procedure[] = [];
    runs: Run[] = [];
    tables: Table[] = [];
    temptables: TempTable[] = [];

    constructor(file: string, xrefbasedir: string) {
        this.xreffile = this.normalize(file, xrefbasedir);
    }

    setSourceFile(sourcefile: string) {
        this.sourcefile = sourcefile;
    }

    addTable(tablename: string, db: string, created: boolean = false, deleted: boolean = false, updated: boolean = false) {

        if (this.tablenames.indexOf(tablename) < 0) {
            this.tablenames.push(tablename);
        }

        let table = this.tables.filter(tbl => tbl.name === tablename && tbl.database === db)[0];
        if (table === undefined) {
            table = new Table(tablename, db);
            this.tables.push(table);
        }

        table.isCreated = table.isCreated || created;
        table.isDeleted = table.isDeleted || deleted;
        table.isUpdated = table.isUpdated || updated;

        return table;
    }

    addField(fieldname: string, table: Table, isUpdated: boolean = false) {

        if (fieldname === undefined || fieldname.trim() === '') {
            return;
        }

        let field = table.fields.filter(fld => fld.name === fieldname)[0];
        if (field === undefined) {
            field = new Field(fieldname);
            table.fields.push(field);
        }

        field.isUpdated = field.isUpdated || isUpdated;

        return field;
    }

    finish() {
        this.instantiates.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.includes.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.invokes.sort((a, b) => a.class.toLowerCase() < b.class.toLowerCase() ? -1 : 1);
        this.tablenames.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
    }

    normalize(file: string, dir: string): string {
        file = replaceAll(file, '\\', '/');
        file = replaceAll(file, '//', '/');
        dir = replaceAll(dir, '\\', '/');
        dir = replaceAll(dir, '//', '/');
        file = file.replace(dir, '');
        return file;
    }
}

