const {createGraphFromFile} = require('./lib/parser');
const assign = require('object-assign');

module.exports = function(sign, file, filename, lessOpts) {
  return createGraphFromFile(file, sign, assign({}, lessOpts, {filename}));
}
