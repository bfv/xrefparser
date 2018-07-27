
import { Parser, ParserConfig } from './parser';
import { Searcher } from './searcher';
import { XrefFile } from './xreffile';
import { expect, should } from 'chai';
import 'mocha';
import * as path from 'path';
import * as fs from 'fs';

const testcaseDir = __dirname + path.sep + '..' + path.sep + 'testcases' + path.sep;

const parser = new Parser();
const xreffiles = parser.parseDir(testcaseDir, 'C:/dev/node/xrefparser/4gl/');

describe('Searcher class', () => {
    describe('Return correct implementors', () => {

        const searcher = new Searcher(xreffiles);

        const result = searcher.getImplementations('oo.IEmpty')
            .map(item => item.class ? item.class.name : '');

        it('Implementers should be at least Empty & MultipleImplements', () => {
            expect(result).to.have.members(['oo.Empty', 'oo.MultipleImplements']);
        });
    });

});
