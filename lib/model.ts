
export class XrefLine {

    compiledFile!: string;
    containingFile!: string;
    lineNumber!: number;
    type!: string;
    info!: string;

    parse(line: string) {
        const entries = line.trim().split(' ');

        this.compiledFile = entries[0];
        this.containingFile = entries[1];
        this.lineNumber = parseInt(entries[2], 10);
        this.type = entries[3];

        this.info = '';
        while (entries.length > 4) {
            this.info = entries.pop() + ' ' + this.info;
        }
        this.info = this.info.trim();
    }
}

export class Field {

    name: string;
    isUpdated: boolean;

    constructor(fieldname: string) {
        this.name = fieldname;
        this.isUpdated = false;
    }
}

export class Table {

    name = '';
    database = '';
    isCreated = false;
    isDeleted = false;
    isUpdated = false;
    fields: Field[] = [];

    constructor(tablename: string, db: string) {
        this.name = tablename;
        this.database = db;
    }
}

export class Class {

    name = '';
    inherits = '';
    implements: string[] = [];

    constructor(xrefinfo: string) {
        this.processInfo(xrefinfo);
    }

    private processInfo(xrefinfo: string) {
        const entries = xrefinfo.split(',');
        this.name = entries[0];
        for (let i = 1; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.startsWith('INHERITS')) {
                this.inherits = entry.split(' ')[1];
            }
            if (entry.startsWith('IMPLEMENTS')) {
                this.implements.push(entry.split(' ')[1]);
            }
        }
    }
}

