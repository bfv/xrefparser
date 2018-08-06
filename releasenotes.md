# Release notes XREFPARSER
For details see: https://github.com/bfv/xrefparser

# 3.0.3
- #15, sequences are no longer reported on as tables

# 3.0.2
- doc release
- added reference to release notes to README.md

# 3.0.1
- fixed deploy bug

# 3.0.0
- implemented various unit tests
- Parser.parseFile is private (again)
- XrefFile.xreffile no longer contains full path, just the relative one
- added processing SEARCH xref lines for temp-table
- added processing REFERENCE xref lines
- added 4gl (eclipse project) for testcases
- added build.xml for 4gl --> xref
- Searching for implementaions of interfaces in Searcher

# 2.2.1
- sync release notes and version

# 2.2.0
- test publish minor version

# 2.1.1
- test release for automated deployment
- setup unit testing

## 2.1.0
- Configurable Parser via ParserConfig class

## 2.0.0
- normalized invoke info
- added to XrefFlile
  - run
  - procedure
  - method
  - constructor
  - interface
- more class info
- corrected casing class names in parameters
- removed writing XrefFile to file

## 1.1.0
- renamed `Xreffile.classes` property to `instantiates` for clarity

## 1.0.0
- fixed issue #16
- introduced tests dir/case (WIP)
- introduced release notes
- renamed `getTabelReferences` to `getTableReferences`