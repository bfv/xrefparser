
import { initParser } from './init';


const xrefdata = initParser('C:/devoe/sandbox/src/xref_out/xref', 'C:\\devoe\\sandbox\\src\\');
console.log(JSON.stringify(xrefdata, undefined, 2));
