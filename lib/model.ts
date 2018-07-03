
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
    inherits: string[] = [];
    implements: string[] = [];
    useWidgetPool = false;
    final = false;
    abstract = false;
    serializable = false;
    constructors: Constructor[] = [];
    methods: Method[] = [];
}

export interface TableDefintion {
    table: string;
    database: string;
}

export class MethodInvocation {
    class = '';
    methods: string[] = [];
}

export class Procedure {
    name = '';
    private = false;
}

export class Run {
    name = '';
    persistent = false;
    dynamic = false;
}

export class Method {
    name = '';
    accessor: Accessor = 'public';  // private is not xreffed
    static = false;
    override = false;
    final = false;
    abstract = false;
    returntype = '';
    signature: Parameter[] = [];
}

export class Constructor {
    accessor: Accessor = 'public';  // private is not xreffed
    static = false;
    signature: Parameter[] = [];
}

export class Parameter {
    name = '';
    mode: ParameterMode = 'input';
    datatype = '';
}

export type Accessor = 'public' | 'protected' | 'private';                     // private is not used with XREF
export type ParameterMode = 'input' | 'output' | 'input-output' | 'buffer';
