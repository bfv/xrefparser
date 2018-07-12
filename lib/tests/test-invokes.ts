
import { initParser } from './init';
import * as fs from 'fs';

const t1 = (new Date()).getTime();
// const xrefdata = initParser(
//     'C:/devoe/sandbox/src/xref_out/xref',
//     'C:\\devoe\\sandbox\\src\\',
//     {
//         classes: false,
//         interfaces: false,
//         procedures: false
//     }
// );


const xrefdata = initParser(
    'C:/usr/xref',
    'D:\\wintmp\\build492943069\\devmain\\',
    {
        classes: false,
        interfaces: false,
        procedures: false
    }
);

const t2 = (new Date()).getTime();

fs.writeFile('c:\\tmp\\parsed.json', JSON.stringify(xrefdata, undefined), (err) => {
    if (err) {
        console.log(err);
    }
    console.log('elapsed:', ((t2 - t1) / 1000).toFixed(2));
});

// console.log(JSON.stringify(xrefdata, undefined, 2));
