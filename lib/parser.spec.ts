import { Parser, ParserConfig } from './parser';
import { XrefFile } from './xreffile';
import { expect, should } from 'chai';
import 'mocha';
import * as path from 'path';

const testcaseDir = __dirname + path.sep + '..' + path.sep + 'testcases' + path.sep;
const helloDir = testcaseDir + path.sep + 'hello' + path.sep;
const ooDir = testcaseDir + path.sep + 'oo' + path.sep;
const dbDir = testcaseDir + path.sep + 'db' + path.sep;
const ttDir = testcaseDir + path.sep + 'tt' + path.sep;

const parser = new Parser();
const xreffiles = parser.parseDir(testcaseDir, 'C:/devoe/xrefbaseline/src/');
console.error(JSON.stringify(xreffiles, undefined, 2));

describe('Parser class', () => {

    it('Non existent directory should return zero XrefFile\'s', () => {
        const result = parser.parseDir('C:\\xyz');
        expect(result).to.have.lengthOf(0);
    });

    it('Test cases directory should return more than 0 results', () => {
        const result = parser.parseDir(testcaseDir);
        expect(result).length.gt(0);
    });
});

describe('ParseFile base', () => {

    it('ParseFile returns XrefFile', () => {
        const result = getXrefFile('hello/helloworld.p.xref');
        expect(result).to.be.instanceOf(XrefFile);
    });
});

describe('ParseFile database tables', () => {

    const xreffile = getXrefFile('db/customer.p.xref');

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

    const xreffile2 = getXrefFile('db/custorderline.p.xref');

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

    const xreffile = getXrefFile('tt/updatettfield.p.xref');

    it('updatettfield.p should have 1 ttnames entry', () => {
        expect(xreffile.ttnames.length).to.be.equal(1);
    });

    it('updatettfield.p contains ttsports tablenames entry', () => {
        const ttnameIndex = xreffile.ttnames.indexOf('ttsports');
        expect(ttnameIndex).to.be.gt(-1);
    });

    const xreffile2 = getXrefFile('tt/TTTestClass.cls.xref');
    it('TTTestClass.cls contains ttsports tablenames entry', () => {
        const ttnameIndex = xreffile2.ttnames.indexOf('tttest');
        expect(ttnameIndex).to.be.gt(-1);
    });

    const xreffile3 = getXrefFile('tt/mixedttdb.p.xref');
    it('mixedttdb.p contains ttsports tablenames entry', () => {
        const ttnameIndex = xreffile3.ttnames.indexOf('ttsports');
        expect(ttnameIndex).to.be.gt(-1);
    });

});

describe('ParseFile classes', () => {

    const xreffile = getXrefFile('oo/Empty.cls.xref');

    it('XrefFile.class property present', () => {
        expect(xreffile.class).to.be.an('Object');
    });

    it('Class name correct (case)', () => {

        let className = '';
        if (xreffile.class) {
            className = xreffile.class.name;
        }
        expect(className).to.be.equal('oo.Empty');
    });
});

describe('ParseFile class implement interface', () => {

    const xreffile = getXrefFile('oo/Empty.cls.xref');

    it('Implement interface', () => {

        let implementsInterface = '';
        if (xreffile.class) {
            implementsInterface = xreffile.class.implements[0];
        }
        expect(implementsInterface).to.be.equal('oo.IEmpty');
    });

    const xreffile2 = getXrefFile('oo/MultipleImplements.cls.xref');

    it('Implement > 1 interface', () => {

        let interfacesImplemented = false;
        if (xreffile2.class) {
            interfacesImplemented = true;
            expect(xreffile2.class.implements[0]).to.be.equal('oo.IEmpty');
            expect(xreffile2.class.implements[1]).to.be.equal('oo.IDisposable');
        }
        expect(interfacesImplemented).to.be.equal(true);
    });

});

describe('ParseFile class constructors', () => {

    const xreffile = getXrefFile('oo/DeliverAddress.cls.xref');

    it('DeliverAddress has 4 constructors', () => {
        // console.error(JSON.stringify(xreffile, undefined, 2));
        let classElementPresent = false;
        if (xreffile.class) {
            classElementPresent = true;
            const classRef = xreffile.class;
            expect(classRef.constructors.length).to.be.equal(4);
        }
        expect(classElementPresent).to.be.equal(true);
    });

    it('DeliverAddress has 1 static constructor', () => {
        if (xreffile.class) {
            const classRef = xreffile.class;

            const statics = classRef.constructors.filter(element => element.static === true);
            expect(statics.length).to.be.equal(1);
        }

    });

    it('DeliverAddress has 2 public constructors', () => {
        if (xreffile.class) {
            const classRef = xreffile.class;

            const statics = classRef.constructors.filter(element => element.accessor === 'public');
            expect(statics.length).to.be.equal(2);
        }
    });

    it('DeliverAddress has 1 protected constructor', () => {
        if (xreffile.class) {
            const classRef = xreffile.class;

            const statics = classRef.constructors.filter(element => element.accessor === 'protected');
            expect(statics.length).to.be.equal(1);
        }
    });

    it('DeliverAddress has 2 constructors with parameters', () => {
        if (xreffile.class) {
            const classRef = xreffile.class;
            const statics = classRef.constructors.filter(element => element.signature.length > 0);
            expect(statics.length).to.be.equal(2);
        }
    });

    // the correct check for case of parameters can only be done after
    it('DeliverAddress constructor class parameters correct case', () => {
        if (xreffile.class) {
            const classRef = xreffile.class;
            const statics = classRef.constructors.filter(element => element.signature[0] && element.signature[0].datatype === 'oo.Address');
            expect(statics.length).to.be.equal(1);
        }
    });

});

function getXrefFile(name: string): XrefFile {
    return xreffiles.filter(item => item.xreffile === name)[0];
}
