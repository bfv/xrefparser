import { XrefFile } from "./xreffile";


export class Searcher {

    private info: XrefFile[];

    constructor(info: XrefFile[]) {
        this.info = info;
    }

    getTabelReferences(tablename: string, creates?: boolean, deletes?: boolean, updates?: boolean) {
        let result = this.info.filter(xreffile => {
            let tmp = xreffile.tables.filter(table => table.name == tablename &&
                                                        (creates === undefined || table.isCreated === creates) &&
                                                        (deletes === undefined || table.isDeleted === deletes));
            return (tmp.length > 0);
        });

        return result;
    }
}