
import { Table, Field, Class, MethodInvocation, Procedure } from './model';

export class XrefFile {

    xreffile = '';
    sourcefile = '';
    class?: Class;
    cpInternal = '';
    cpStream = '';
    includes: string[] = [];
    tablenames: string[] = [];
    instantiates: string[] = [];
    invokes: MethodInvocation[] = [];
    annotations: string[] = [];
    procedures: Procedure[] = [];
    tables: Table[] = [];

    constructor(file: string) {
        this.xreffile = file;
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
}

