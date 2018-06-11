# OpenEdge XREF parser in TypeScript

This is a parser/searcher library for OpenEdge xref files.

## Initialization

Searching the sources which contains creates and deletes of in 'Klantbes' table is as easy as:

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

## Performance
Above case takes on a Dell XPS15 9560 around 8s to parse all the xref files and 3ms to search for create/delete references in the 'Klantbes' table.
There are around 3850 xref files which are combined 350MB on disk.