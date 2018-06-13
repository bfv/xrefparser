# OpenEdge XREF parser in TypeScript

This is a parser/searcher library for OpenEdge xref files.

## Initialization

Searching the sources which contain creates and deletes of in 'Klantbes' table is as easy as:

```
import { Parser, Searcher } from 'xrefparser';

const parser = new Parser();
const xrefdata = parser.parseDir('c:/usr/xref', 'D:\\wintmp\\build492943069\\devmain\\');

const searcher = new Searcher(xrefdata);

const sources = searcher
                .getTabelReferences('Klantbes', true, undefined, true)
                .map(table => table.sourcefile);

console.log(sources);

```

## Parser class
When instantiated there's basically one relevant method; parseDir

### parseDir
```
parseDir(dirname: string, sourcebasedir?: string): XrefFile[]
```

`dirname` is the root directory where all the .xref files are located.
`sourcebasedir` is the optional parameter stating what the root directory of the sources when they were compiled. This is substracted from the `sourcefile` properties.

## Searcher class
The only constructor takes `XrefFile[]` as input.

### add
```
add(xreffiles: Xreffile[]);
```

This method add/merges the `xreffiles` into the existing Xreffile[]'s.

### getFieldReferences
```
getFieldReferences(fieldname: string, tablename?: string, hasUpdates?: boolean): XrefFile[]
```

Looks for occurences of `fieldname`, optionally in table `tablename`. The optional `hasUpdates` parameter gives the possibility the search for sources which update a certain field (or not). If `tablename` or `hasUpdates` are not to be taken into consideration, omit them or pass `undefined`.


### getTabelReferences
```
getTabelReferences(tablename: string, hasCreates?: boolean, hasUpdates?: boolean, hasDeletes?: boolean): Xreffile[]
```

Looks for uses of `tablename` in the all the `Xreffile` objects and returns `XrefFile[]`. Use `map` as in the example to turn it into an array of source names (or whatever you want). If for the `has*` parameters `undefined` is used, the particular action is not searched for. This contrary to `hasCreated = false` where sources are returned that do *not* create the particular table.

## Performance
Above case takes on a Dell XPS15 9560 around 8s to parse all the xref files and 3ms to search for create/delete references in the 'Klantbes' table.
There are around 3850 xref files which are combined 350MB on disk.

## Assumptions
This being an early version of this package there are a few assumptions:
- xref files have a .xref extension
- the root directory of all the xref files is called `xref`

## Example `Xreffile`
The `Parser` turns in the `.xref` files into an array of `Xreffile` objects. Beneath an example which is pretty self explanatory:
```
{
  "xreffile": "C:/devoe/sandbox/src/xref_out/xref/CustomerBE.cls.xref",
  "sourcefile": "xref/CustomerBE.cls",
  "cpInternal": "UTF-8",
  "cpStream": "UTF-8",
  "includes": [
    "xref/findfirstcustomer.i"
  ],
  "tablenames": [
    "Customer"
  ],
  "classes": [],
  "invokes": [
    "xref.BaseClass:Cleanup",
    "xref.BusinessEntity:BusinessEntity",
    "xref.CustomerBE:Cleanup"
  ],
  "annotations": [
    "todo(version=12.x, message=refactor for efficiency)",
    "linecheck(lineno=44)",
    "linecheck(lineno=46)"
  ],
  "tables": [
    {
      "name": "Customer",
      "database": "sports2000",
      "isCreated": false,
      "isDeleted": false,
      "isUpdated": true,
      "fields": [
        {
          "name": "CustNum",
          "isUpdated": false
        },
        {
          "name": "CreditLimit",
          "isUpdated": true
        },
        {
          "name": "Name",
          "isUpdated": false
        }
      ]
    }
  ],
  "class": {
    "name": "xref.CustomerBE",
    "inherits": "xref.BusinessEntity",
    "implements": [
      "xref.IDisposable"
    ]
  }
}
```