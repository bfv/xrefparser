
import { Searcher } from '../searcher';
import { initParser } from './init';

function testFieldSearch(fieldname: string, tablename?: string, hasUpdates?: boolean): number {

    const t1 = Date.now();

    const sources = searcher
        .getFieldReferences(fieldname, tablename, hasUpdates)
        .map(item => item.sourcefile);

    const t2 = Date.now();
    console.log('done, elapsed:', ((t2 - t1) / 1000).toFixed(3), 's');

    console.log(sources);

    return sources.length;
}

const xrefdata = initParser('C:/devoe/sandbox/src/xref_out/xref', 'C:\\devoe\\sandbox\\src\\');
const searcher = new Searcher(xrefdata);

// https://github.com/bfv/xrefparser/issues/16
testFieldSearch('ordernum', 'customer');
