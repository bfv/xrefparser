import { XrefFile } from './xreffile';


export class Searcher {

    private info: XrefFile[];

    constructor(info: XrefFile[]) {
        this.info = info;
    }


    getTabelReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean): XrefFile[] {

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

    getFieldReferences(fieldname: string, tablename?: string, hasUpdates?: boolean): XrefFile[] {

        let xreffiles: XrefFile[] = [];
        if (tablename !== undefined) {
            xreffiles = this.getTabelReferences(tablename);
        }
        else {
            xreffiles = this.info;
        }

        const noCriteria = (hasUpdates === undefined);

        const result = xreffiles.filter(xreffile => {

            let found = false;
            xreffile.tables.forEach(element => {
                const fieldIndex = element.fields.findIndex(item => item.name.toLowerCase() === fieldname.toLowerCase() &&
                                                    (noCriteria || (hasUpdates !== undefined && item.isUpdated === hasUpdates)));
                if (fieldIndex >= 0) {
                    found = true;
                }
            });

            return found;
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
