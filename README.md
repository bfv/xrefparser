# OpenEdge XREF parser in TypeScript

This is a parser/searcher library for OpenEdge xref files.

## Initialization

Searching the sources which contain creates and deletes of in 'Klantbes' table is as easy as:

```
import { Parser, Searcher } from 'xrefparser';

const parser = new Parser();
const xrefdata = parser.parseDir('c:/usr/xref', 'D:\\wintmp\\build492943069\\devmain\\');  // dir xref files, compilation base dir

const searcher = new Searcher(xrefdata);

const sources = searcher
                .getTabelReferences('Klantbes', true, undefined, true)  // tablename, hasCreates, hasUpdates, hasDeletes
                .map(table => table.sourcefile);

console.log(sources);

```

## Parser class
When instantiated there's beasically on relevant method; parseDir

### parseDir
```parseDir(dirname: string, sourcebasedir?: string): XrefFile[]```
`dirname` is the root directory where all the .xref files are located.
`sourcebasedir` is the optional parameter stating what the root directory of the sources when they were compiled. This is substracted from the `sourcefile` properties.

## Searcher class
Right now the `Searcher` class has 1 method:
The only constructor takes `XrefFile[]` as input.

### getTabelReferences
```getTabelReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean): string[]```

Looks for uses of `tablename` in the all the `Xreffile` objects and returns an array of source names. If for the `has*` parameters `undefined` is used, the particular action is not searched for. This contrary to `hasCreated = false` where sources are returned that do *not* create the particular table.

## Performance
Above case takes on a Dell XPS15 9560 around 8s to parse all the xref files and 3ms to search for create/delete references in the 'Klantbes' table.
There are around 3850 xref files which are combined 350MB on disk.

## Assumptions
This being an early version of this package there are a few assumptions:
- xref files have a .xref extension
- the root directory of all the xref files is called `xref`
