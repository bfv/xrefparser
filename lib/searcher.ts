import { XrefFile } from './xreffile';


export class Searcher {

    private info: XrefFile[];

    constructor(info: XrefFile[]) {
        this.info = info;
    }


    getTabelReferences(tablename: string, creates?: boolean, deletes?: boolean, updates?: boolean) {
        const result = this.info.filter(xreffile => {
            const tmp = xreffile.tables.filter(table => table.name === tablename && (
                                                        (creates !== undefined && table.isCreated === creates) ||
                                                        (updates !== undefined && table.isUpdated === updates) ||
                                                        (deletes !== undefined && table.isDeleted === deletes)));
            return (tmp.length > 0);
        });

        return result;
    }
}
