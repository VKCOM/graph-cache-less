const {parse} = require('less');
const Graph = require('graphlib').Graph;
const fs = require('fs');

function convertFileToAst(lessFile, fileName, filePaths) {
  return new Promise((resolve, reject) => {
    parse(lessFile.toString(), {
      filename: fileName,
      paths: filePaths
    }, (error, ast, files, plugins) => {
      if (error) {
        reject(error);
      } else {
        resolve({ast, fileName});
      }
    });
  });
}

function loadFile(sign, [file]) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve([file, sign(result)]);
      }
    });
  });
}

function walkLessAst(sign, roots, g, loadedFilesAcc) {
  const newRoots = roots.reduce((acc, [file, ast]) => {
    const newAstRoots = ast.rules
      .filter(el => el.importedFilename)
      .map(el => {
        g.setNode(el.importedFilename);
        g.setEdge(el.importedFilename, file);
        return [el.importedFilename, el.root];
      });
    return acc.concat(newAstRoots);
  }, []).reduce((acc, root) => {
    const matches = acc.filter(el => el[0] === root[0]);
    if (matches.length === 0) {
      acc.push(root);
      return acc;
    } else {
      return acc
    }
  }, []);

  if (newRoots.length === 0) {
    return Promise.all(loadedFilesAcc)
      .then(files => {
        files.forEach(([file, signature]) => g.setNode(file, signature));
        return g;
      });
  } else {
    const newLoadedFiles = loadedFilesAcc.concat(
      newRoots.map(loadFile.bind(null, sign))
    );
    return walkLessAst(sign, newRoots, g, newLoadedFiles);
  }
}

function createGraphFromFile(lessFile, sign, opts) {
  return convertFileToAst(lessFile, opts.fileName, opts.filePaths)
    .then(({ast, fileName}) => {
      const g = new Graph({ directed: true });
      g.setNode(fileName, sign(lessFile));

      return walkLessAst(sign, [[fileName, ast]], g, []);
    });
}


module.exports = {
  createGraphFromFile,
  convertFileToAst
};
