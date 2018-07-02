
import { Parser } from '../parser';
import { XrefFile } from '../xreffile';

export function initParser(xrefdir: string, basedir: string): XrefFile[] {

    console.log('start parsing:', new Date().toLocaleTimeString());

    const parser = new Parser();
    const xrefdata = parser.parseDir(xrefdir, basedir);

    console.log('  end parsing:', new Date().toLocaleTimeString());

    return xrefdata;

}

