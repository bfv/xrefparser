import { Parser, ParserConfig } from './parser';
import { expect } from 'chai';
import 'mocha';

describe('Parser class', () => {

    it('Non existent directory should return zero XrefFile\'s', () => {
        const parser = new Parser();
        const result = parser.parseDir('c:\\xyz');
        expect(result).to.have.lengthOf(0);
    });

    it('Test cases directory should return more than 0 results', () => {
        const parser = new Parser();
    });
});
