import { Parser, ParserConfig } from './parser';
import { XrefFile } from './xreffile';
import { expect, should } from 'chai';
import 'mocha';
import * as path from 'path';

const testcaseDir = __dirname + path.sep + '..' + path.sep + 'testcases' + path.sep;
const helloDir = testcaseDir + path.sep + 'hello' + path.sep;
const ooDir = testcaseDir + path.sep + 'oo' + path.sep;
const dbDir = testcaseDir + path.sep + 'db' + path.sep;

describe('Parser class', () => {

    it('Non existent directory should return zero XrefFile\'s', () => {
        const parser = new Parser();
        const result = parser.parseDir('C:\\xyz');
        expect(result).to.have.lengthOf(0);
    });

    it('Test cases directory should return more than 0 results', () => {
        const parser = new Parser();
        const result = parser.parseDir(testcaseDir);
        expect(result).length.gt(0);
    });
});

describe('ParseFile base', () => {

    it('ParseFile returns XrefFile', () => {
        const parser = new Parser();
        const result = parser.parseFile(helloDir + 'helloworld.p.xref');
        expect(result).to.be.instanceOf(XrefFile);
    });
});

describe('ParseFile database tables', () => {

    const parser = new Parser();
    const xreffile = parser.parseFile(dbDir + 'customer.p.xref');

    it('customer.p contains only 1 tablename reference', () => {
        expect(xreffile.tablenames.length).to.be.equal(1);
    });

    it('customer.p contains Customer tablename reference', () => {
        const tableNameIndex = xreffile.tablenames.indexOf('Customer');
        expect(tableNameIndex).to.be.greaterThan(-1);
    });

    it('customer.p XreFile should have one item in table array', () => {
        expect(xreffile.tables.length).to.be.equal(1);
    });

    it('customer.p XreFile should have Customer table in table array', () => {
        const customerTable = xreffile.tables.filter(element => element.name.toLowerCase() === 'customer')[0];
        expect(customerTable).to.be.an('Object');
    });

    const xreffile2 = parser.parseFile(dbDir + 'custorderline.p.xref');
    // console.log(JSON.stringify(xreffile2, undefined, 2));

    it('custorderline.p contains 3 tablename references', () => {
        expect(xreffile2.tablenames.length).to.be.equal(3);
    });

    it('custorderline.p contains Customer, Order, OrderLine tablename references', () => {
        let tableNameIndex = xreffile2.tablenames.indexOf('Customer');
        expect(tableNameIndex).to.be.greaterThan(-1);
        tableNameIndex = xreffile2.tablenames.indexOf('Order');
        expect(tableNameIndex).to.be.greaterThan(-1);
        tableNameIndex = xreffile2.tablenames.indexOf('OrderLine');
        expect(tableNameIndex).to.be.greaterThan(-1);
    });

});

describe('ParseFile temp-tables', () => {

});

