'use strict';

const {expect} = require('chai');
const fs = require('fs');
const path = require('path');

const {createGraphFromFile, convertFileToAst} = require('../../lib/parser');

function createPath(name) {
  return path.join(__dirname, '..', 'fixtures', name + '.less');
}

function loadTestFile(name) {
  return new Promise((res, rej) => {
    const filePath = createPath(name);
    fs.readFile(filePath, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res({f: result, name: filePath});
      }
    });
  });
}

function verifyGraph(g, vertexList, edgeList = []) {
  let nodes = g.nodes().sort();
  let edges = g.edges().sort((a, b) => a.v <= b.v);

  edgeList = edgeList.map(e => ({ v: createPath(e.v), w: createPath(e.w) }))
    .sort((a, b) => a.v <= b.v);
  vertexList = vertexList.map(createPath).sort();

  expect(nodes).to.eql(vertexList);
  expect(edges).to.eql(edgeList);
}

function sign(file) {
  return file.length;
}

describe('convertFileToAst', function() {

  it("returns ast for less file", () => {
    return loadTestFile("t5").then(({f, name}) => {
      return convertFileToAst(f, name, []);
    }).then(({ast, fileName}) => {
      expect(ast.firstRoot).to.be.true;
      expect(fileName).to.equal(path.join(process.cwd(), "tests/fixtures/t5.less"));
    });
  });

  it("returns ast for less file respecting include paths", () => {
    return loadTestFile("test_fold").then(({f, name}) => {
      return convertFileToAst(f, name, ['tests/fixtures/fold']);
    }).then(({ast, fileName}) => {
      expect(ast.firstRoot).to.be.true;
      expect(fileName).to.equal(path.join(process.cwd(), "tests/fixtures/test_fold.less"));
    });
  })

});

describe('createGraphFromFile', () => {

  it("returns 1 node graph for file with no deps", () => {
    return loadTestFile("t5").then(({f, name}) => {
      return createGraphFromFile(f, sign, {
        fileName: name,
        filePaths: []
      }).then(g => {
        verifyGraph(g, ['t5'], []);
      });
    });
  });

  it("returns 2 node graph for file with one dep", () => {
    return loadTestFile("t3").then(({f, name}) => {
      return createGraphFromFile(f, sign, {
        fileName: name,
        filePaths: []
      }).then(g => {
        verifyGraph(g, ['t3', 't5'], [{ v: 't5', w: 't3' }]);
      });
    });
  });

  it("returns 3 nodes for file with 3 deps", () => {
    return loadTestFile("t4").then(({f, name}) => {
      return createGraphFromFile(f, sign, {
        fileName: name,
        filePaths: []
      }).then(g => {
        verifyGraph(g, ['t3', 't4', 't5'], [
          { v: 't5', w: 't3' },
          { v: 't3', w: 't4' }
        ]);
      });
    });
  });

  it("returns 4 nodes for file with 4 deps", () => {
    return loadTestFile("t1").then(({f, name}) => {
      return createGraphFromFile(f, sign, {
        fileName: name,
        filePaths: []
      }).then(g => {
        verifyGraph(g, ['t1', 't2', 't3', 't5'], [
          { v: 't5', w: 't3' },
          { v: 't3', w: 't1' },
          { v: 't2', w: 't1' },
        ]);
      });
    });
  });

  it("returns 6 nodes for file with 6 deps", () => {
    return loadTestFile("t6").then(({f, name}) => {
      return createGraphFromFile(f, sign, {
        fileName: name,
        filePaths: []
      }).then(g => {
        verifyGraph(g, ['t1', 't2', 't3', 't4', 't5', 't6'], [
          { v: 't5', w: 't3' },
          { v: 't3', w: 't1' },
          { v: 't2', w: 't1' },
          { v: 't3', w: 't4' },
          { v: 't1', w: 't6' },
          { v: 't4', w: 't6' }
        ]);
      });
    });
  });

});
