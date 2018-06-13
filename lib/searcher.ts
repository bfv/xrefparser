import { XrefFile } from './xreffile';


export class Searcher {

    private info: XrefFile[];

    constructor(info: XrefFile[]) {
        this.info = info;
    }


    getTabelReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean) {

        const noCriteria = (hasCreates === undefined && hasUpdates === undefined && hasDeletes === undefined);

        const result = this.info.filter(xreffile => {
            const tmp = xreffile.tables.filter(table => table.name.toLowerCase() === tablename.toLowerCase() && (
                (hasCreates !== undefined && table.isCreated === hasCreates) ||
                (hasUpdates !== undefined && table.isUpdated === hasUpdates) ||
                (hasDeletes !== undefined && table.isDeleted === hasDeletes) ||
                (noCriteria)));
            return (tmp.length > 0);
        });

        return result;
    }

    add(xreffiles: XrefFile[]) {

        xreffiles.forEach(xreffile => {
            const i = this.info.findIndex(item => item.sourcefile === xreffile.sourcefile);

            if (i === -1) {
                this.info.push(xreffile);
            }
            else {
                this.info[i] = xreffile;
            }
        });
    }

}
