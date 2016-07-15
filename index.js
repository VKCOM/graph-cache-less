var parser = require('./build/parser');
var assign = require('object-assign');

module.exports = function(sign, file, filename, lessOpts) {
  return parser.createGraphFromFile(file, sign, assign({}, lessOpts, {filename}));
}
