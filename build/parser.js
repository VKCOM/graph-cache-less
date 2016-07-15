'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('less');

var parse = _require.parse;

var Graph = require('graphlib').Graph;
var fs = require('fs');

function convertFileToAst(lessFile, opts) {
  return new Promise(function (resolve, reject) {
    parse(lessFile.toString(), opts, function (error, ast, files, plugins) {
      if (error) {
        reject(error);
      } else {
        resolve({ ast: ast, fileName: opts.filename });
      }
    });
  });
}

function loadFile(sign, _ref) {
  var _ref2 = _slicedToArray(_ref, 1);

  var file = _ref2[0];

  return new Promise(function (resolve, reject) {
    fs.readFile(file, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve([file, sign(result)]);
      }
    });
  });
}

function walkLessAst(sign, roots, g, loadedFilesAcc) {
  var newRoots = roots.reduce(function (acc, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var file = _ref4[0];
    var ast = _ref4[1];

    var newAstRoots = ast.rules.filter(function (el) {
      return el.importedFilename;
    }).map(function (el) {
      g.setNode(el.importedFilename);
      g.setEdge(el.importedFilename, file);
      return [el.importedFilename, el.root];
    });
    return acc.concat(newAstRoots);
  }, []).reduce(function (acc, root) {
    var matches = acc.filter(function (el) {
      return el[0] === root[0];
    });
    if (matches.length === 0) {
      acc.push(root);
      return acc;
    } else {
      return acc;
    }
  }, []);

  if (newRoots.length === 0) {
    return Promise.all(loadedFilesAcc).then(function (files) {
      files.forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var file = _ref6[0];
        var signature = _ref6[1];
        return g.setNode(file, signature);
      });
      return g;
    });
  } else {
    var newLoadedFiles = loadedFilesAcc.concat(newRoots.map(loadFile.bind(null, sign)));
    return walkLessAst(sign, newRoots, g, newLoadedFiles);
  }
}

function createGraphFromFile(lessFile, sign, opts) {
  return convertFileToAst(lessFile, opts).then(function (_ref7) {
    var ast = _ref7.ast;
    var fileName = _ref7.fileName;

    var g = new Graph({ directed: true });
    g.setNode(fileName, sign(lessFile));

    return walkLessAst(sign, [[fileName, ast]], g, []);
  });
}

module.exports = {
  createGraphFromFile: createGraphFromFile,
  convertFileToAst: convertFileToAst
};