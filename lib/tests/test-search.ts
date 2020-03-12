
import { Parser, ParserConfig } from '../parser';
import { Searcher } from '../searcher';
import * as path from 'path';
import * as fs from 'fs';

const testcaseDir = 'c:/dev/node/xrefparser/testcases/';

const parser = new Parser();
const xreffiles = parser.parseDir(testcaseDir, 'C:/dev/node/xrefparser/4gl/');
const searcher = new Searcher(xreffiles);
const results = searcher.getIncludeReferences('include/base.i');
