const {createGraphFromFile} = require('./lib/parser');
const assign = require('object-assign');

module.exports = function(lessOpts) {
  return {
    parse(sign, file, filename) {
      return createGraphFromFile(file, sign, assign({}, {filename}));
    }
  }
}
