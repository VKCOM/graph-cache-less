# graph-cache-less

This is a ```LESS``` parser for [graph-cache](https://github.com/VKCOM/graph-cache) library.

## Installation

```npm install --save graph-cache-less```

## Usage
```javascript
const createGraphCache = require('graph-cache');
const lessParser = require('graph-cache-less');

function parser(lessOpts, sign, file, filename) {
  return lessParser(sign, file, filename, lessOpts);
}

const gcache = createGraphCache(parser.bind(null, lessOpts), sign, {});
```

lessOpts — options that will be passed directly to ```LESS``` compiler.

## Testing

This library is tested using ```Mocha``` and ```Chai```. You can run test suit with ```npm test```.
You can run ```npm run test-watch``` to rerun tests on file updates.


## Contributing

Issues and PR's are welcomed here. 
