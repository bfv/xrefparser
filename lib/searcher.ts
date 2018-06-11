import { XrefFile } from './xreffile';


export class Searcher {

    private info: XrefFile[];

    constructor(info: XrefFile[]) {
        this.info = info;
    }


    getTabelReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean) {
        const result = this.info.filter(xreffile => {
            const tmp = xreffile.tables.filter(table => table.name === tablename && (
                                                        (hasCreates !== undefined && table.isCreated === hasCreates) ||
                                                        (hasUpdates !== undefined && table.isUpdated === hasUpdates) ||
                                                        (hasDeletes !== undefined && table.isDeleted === hasDeletes)));
            return (tmp.length > 0);
        });

        return result;
    }
}
