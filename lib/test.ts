import { Parser } from "./parser";
import { Searcher } from "./searcher";

console.log('start parsing:', new Date().toLocaleTimeString());

let parser = new Parser();
let xrefdata = parser.parseDir('c:/usr/xref', 'D:\\wintmp\\build492943069\\devmain\\');

console.log('end parsing:  ', new Date().toLocaleTimeString());


let searcher = new Searcher(xrefdata);

const t1 = Date.now();
let tables = searcher
                .getTabelReferences('Klantbes', undefined, true, undefined)
                .map(table => table.sourcefile);

console.log(tables);

const t2 = Date.now();

console.log('done, elapsed:', ((t2 - t1) / 1000).toFixed(3), 's');
