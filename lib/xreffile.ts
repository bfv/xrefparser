
import { Table, Field, Class } from './model';

export class XrefFile {

    xreffile: string = '';
    sourcefile: string = '';
    class?: Class;
    includes: string[] = [];
    tablenames: string[] = [];
    classes: string[] = [];
    invokes: string[] = [];
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
        let field = table.fields.filter(fld => fld.name === fieldname)[0];
        if (field === undefined) {
            field = new Field(fieldname);
            table.fields.push(field);
        }

        field.isUpdated = field.isUpdated || isUpdated;

        return field;
    }

    finish() {
        this.classes.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.includes.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.invokes.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
        this.tablenames.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
    }
}

