import { XrefFile } from './xreffile';
import { Table, TableDefintion } from './model';
import { ENGINE_METHOD_NONE } from 'constants';


export class Searcher {

    private xreffiles: XrefFile[] = [];

    constructor(xreffiles?: XrefFile[]) {
        if (xreffiles !== undefined) {
            this.xreffiles = xreffiles;
        }
    }

    getDatabaseNames(sources?: string[]): string[] {

        const dbnames: string[] = [];

        this.xreffiles
            .filter(xreffile => sources === undefined || (sources.findIndex(source => source === xreffile.sourcefile) >= 0))
            .forEach(item => {
                item.tables.forEach(table => {
                    dbnames.push(table.database.toLowerCase());
                });
            });

        return [...new Set(dbnames)];
    }

    getTableNames(sources?: string[]): TableDefintion[] {

        const tables: TableDefintion[] = [];

        this.xreffiles
            .filter(xreffile => sources === undefined || (sources.findIndex(source => source === xreffile.sourcefile) >= 0))
            .forEach(item => {
                item.tables.forEach(table => {
                    const idx = tables.findIndex(tbl => tbl.database === table.database && tbl.table === table.name);
                    if (idx === -1) {
                        tables.push({ table: table.name, database: table.database.toLowerCase() });
                    }
                });
            });

        return tables;
    }

    getTableReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean): XrefFile[] {

        const noCriteria = (hasCreates === undefined && hasUpdates === undefined && hasDeletes === undefined);

        const result = this.xreffiles.filter(xreffile => {
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
            xreffiles = this.getTableReferences(tablename);
        }
        else {
            xreffiles = this.xreffiles;
        }

        const noCriteria = (hasUpdates === undefined);

        const result = xreffiles.filter(xreffile => {

            let found = false;
            for (let i = 0; i < xreffile.tables.length; i++) {
                const table = xreffile.tables[i];
                if (tablename === undefined || (table.name.toLowerCase() === tablename.toLowerCase())) {
                    const fieldIndex = table.fields.findIndex(field => field.name.toLowerCase() === fieldname.toLowerCase() &&
                        (noCriteria || (hasUpdates !== undefined && field.isUpdated === hasUpdates)));
                    if (fieldIndex >= 0) {
                        found = true;
                        break;
                    }
                }
            }
            return found;
        });

        return result;
    }

    getDatabaseReferences(databaseName: string): XrefFile[] {

        const references: XrefFile[] = [];

        this.xreffiles.forEach(xreffile => {
            const tables = xreffile.tables.filter(table => table.database.toLowerCase() === databaseName.toLowerCase());
            if (tables.length > 0) {
                references.push(xreffile);
            }
        });

        return references;
    }

    getImplementations(interfaceName: string): XrefFile[] {
        const references: XrefFile[] = [];

        this.xreffiles.forEach(xreffile => {
            if (xreffile.class) {
                if (xreffile.class.implements.indexOf(interfaceName) >= 0) {
                    references.push(xreffile);
                }
            }
        });
        return references;
    }

    getIncludeReferences(includeName: string): XrefFile[] {
        return this.xreffiles.filter(xreffile => xreffile.includes.indexOf(includeName) >= 0);
    }

    add(xreffiles: XrefFile[]) {

        xreffiles.forEach(xreffile => {
            const i = this.xreffiles.findIndex(item => item.sourcefile === xreffile.sourcefile);

            if (i === -1) {
                this.xreffiles.push(xreffile);
            }
            else {
                this.xreffiles[i] = xreffile;
            }
        });
    }

}
