var parser = require('./lib/parser');

module.exports = function(sign, file, filename, lessOpts) {
  return parser.createGraphFromFile(file, sign, Object.assign({}, lessOpts, { filename: filename }));
}
