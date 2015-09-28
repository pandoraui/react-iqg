'use strict';

// var _path = require('path');
//
//
// var gulpRoot = _path.join(__dirname, '../../../')
// var lodashPath = _path.join(gulpRoot, 'node_modules/lodash/');
// var lodashPath = 'lodash/';

var _ = {
  // Collection
  'sortBy': require('lodash.sortby'),

  // lang
  'clone': require('lodash.clone'),
  'isEqual': require('lodash.isequal'),

  // Object
  'extend': require('lodash.assign')
};

module.exports = _;

/*
// Array
module.exports = {
  'chunk': require('./array/chunk'),
  'compact': require('./array/compact'),
  'difference': require('./array/difference'),
  'drop': require('./array/drop'),
  'dropRight': require('./array/dropRight'),
  'dropRightWhile': require('./array/dropRightWhile'),
  'dropWhile': require('./array/dropWhile'),
  'fill': require('./array/fill'),
  'findIndex': require('./array/findIndex'),
  'findLastIndex': require('./array/findLastIndex'),
  'first': require('./array/first'),
  'flatten': require('./array/flatten'),
  'flattenDeep': require('./array/flattenDeep'),
  'head': require('./array/head'),
  'indexOf': require('./array/indexOf'),
  'initial': require('./array/initial'),
  'intersection': require('./array/intersection'),
  'last': require('./array/last'),
  'lastIndexOf': require('./array/lastIndexOf'),
  'object': require('./array/object'),
  'pull': require('./array/pull'),
  'pullAt': require('./array/pullAt'),
  'remove': require('./array/remove'),
  'rest': require('./array/rest'),
  'slice': require('./array/slice'),
  'sortedIndex': require('./array/sortedIndex'),
  'sortedLastIndex': require('./array/sortedLastIndex'),
  'tail': require('./array/tail'),
  'take': require('./array/take'),
  'takeRight': require('./array/takeRight'),
  'takeRightWhile': require('./array/takeRightWhile'),
  'takeWhile': require('./array/takeWhile'),
  'union': require('./array/union'),
  'uniq': require('./array/uniq'),
  'unique': require('./array/unique'),
  'unzip': require('./array/unzip'),
  'unzipWith': require('./array/unzipWith'),
  'without': require('./array/without'),
  'xor': require('./array/xor'),
  'zip': require('./array/zip'),
  'zipObject': require('./array/zipObject'),
  'zipWith': require('./array/zipWith')
};

// Chain
module.exports = {
  'chain': require('./chain/chain'),
  'commit': require('./chain/commit'),
  'concat': require('./chain/concat'),
  'lodash': require('./chain/lodash'),
  'plant': require('./chain/plant'),
  'reverse': require('./chain/reverse'),
  'run': require('./chain/run'),
  'tap': require('./chain/tap'),
  'thru': require('./chain/thru'),
  'toJSON': require('./chain/toJSON'),
  'toString': require('./chain/toString'),
  'value': require('./chain/value'),
  'valueOf': require('./chain/valueOf'),
  'wrapperChain': require('./chain/wrapperChain')
};

// Collection
module.exports = {
  'all': require('./collection/all'),
  'any': require('./collection/any'),
  'at': require('./collection/at'),
  'collect': require('./collection/collect'),
  'contains': require('./collection/contains'),
  'countBy': require('./collection/countBy'),
  'detect': require('./collection/detect'),
  'each': require('./collection/each'),
  'eachRight': require('./collection/eachRight'),
  'every': require('./collection/every'),
  'filter': require('./collection/filter'),
  'find': require('./collection/find'),
  'findLast': require('./collection/findLast'),
  'findWhere': require('./collection/findWhere'),
  'foldl': require('./collection/foldl'),
  'foldr': require('./collection/foldr'),
  'forEach': require('./collection/forEach'),
  'forEachRight': require('./collection/forEachRight'),
  'groupBy': require('./collection/groupBy'),
  'include': require('./collection/include'),
  'includes': require('./collection/includes'),
  'indexBy': require('./collection/indexBy'),
  'inject': require('./collection/inject'),
  'invoke': require('./collection/invoke'),
  'map': require('./collection/map'),
  'max': require('./math/max'),
  'min': require('./math/min'),
  'partition': require('./collection/partition'),
  'pluck': require('./collection/pluck'),
  'reduce': require('./collection/reduce'),
  'reduceRight': require('./collection/reduceRight'),
  'reject': require('./collection/reject'),
  'sample': require('./collection/sample'),
  'select': require('./collection/select'),
  'shuffle': require('./collection/shuffle'),
  'size': require('./collection/size'),
  'some': require('./collection/some'),
  'sortBy': require('./collection/sortBy'),
  'sortByAll': require('./collection/sortByAll'),
  'sortByOrder': require('./collection/sortByOrder'),
  'sum': require('./math/sum'),
  'where': require('./collection/where')
};


// Date
module.exports = {
  'now': require('./date/now')
};


// Function
module.exports = {
  'after': require('./function/after'),
  'ary': require('./function/ary'),
  'backflow': require('./function/backflow'),
  'before': require('./function/before'),
  'bind': require('./function/bind'),
  'bindAll': require('./function/bindAll'),
  'bindKey': require('./function/bindKey'),
  'compose': require('./function/compose'),
  'curry': require('./function/curry'),
  'curryRight': require('./function/curryRight'),
  'debounce': require('./function/debounce'),
  'defer': require('./function/defer'),
  'delay': require('./function/delay'),
  'flow': require('./function/flow'),
  'flowRight': require('./function/flowRight'),
  'memoize': require('./function/memoize'),
  'modArgs': require('./function/modArgs'),
  'negate': require('./function/negate'),
  'once': require('./function/once'),
  'partial': require('./function/partial'),
  'partialRight': require('./function/partialRight'),
  'rearg': require('./function/rearg'),
  'restParam': require('./function/restParam'),
  'spread': require('./function/spread'),
  'throttle': require('./function/throttle'),
  'wrap': require('./function/wrap')
};


// lang
module.exports = {
  'clone': require('./lang/clone'),
  'cloneDeep': require('./lang/cloneDeep'),
  'eq': require('./lang/eq'),
  'gt': require('./lang/gt'),
  'gte': require('./lang/gte'),
  'isArguments': require('./lang/isArguments'),
  'isArray': require('./lang/isArray'),
  'isBoolean': require('./lang/isBoolean'),
  'isDate': require('./lang/isDate'),
  'isElement': require('./lang/isElement'),
  'isEmpty': require('./lang/isEmpty'),
  'isEqual': require('./lang/isEqual'),
  'isError': require('./lang/isError'),
  'isFinite': require('./lang/isFinite'),
  'isFunction': require('./lang/isFunction'),
  'isMatch': require('./lang/isMatch'),
  'isNaN': require('./lang/isNaN'),
  'isNative': require('./lang/isNative'),
  'isNull': require('./lang/isNull'),
  'isNumber': require('./lang/isNumber'),
  'isObject': require('./lang/isObject'),
  'isPlainObject': require('./lang/isPlainObject'),
  'isRegExp': require('./lang/isRegExp'),
  'isString': require('./lang/isString'),
  'isTypedArray': require('./lang/isTypedArray'),
  'isUndefined': require('./lang/isUndefined'),
  'lt': require('./lang/lt'),
  'lte': require('./lang/lte'),
  'toArray': require('./lang/toArray'),
  'toPlainObject': require('./lang/toPlainObject')
};


// math
module.exports = {
  'add': require('./math/add'),
  'ceil': require('./math/ceil'),
  'floor': require('./math/floor'),
  'max': require('./math/max'),
  'min': require('./math/min'),
  'round': require('./math/round'),
  'sum': require('./math/sum')
};


// number
module.exports = {
  'inRange': require('./number/inRange'),
  'random': require('./number/random')
};


// Object
module.exports = {
  'assign': require('./object/assign'),
  'create': require('./object/create'),
  'defaults': require('./object/defaults'),
  'defaultsDeep': require('./object/defaultsDeep'),
  'extend': require('./object/extend'),
  'findKey': require('./object/findKey'),
  'findLastKey': require('./object/findLastKey'),
  'forIn': require('./object/forIn'),
  'forInRight': require('./object/forInRight'),
  'forOwn': require('./object/forOwn'),
  'forOwnRight': require('./object/forOwnRight'),
  'functions': require('./object/functions'),
  'get': require('./object/get'),
  'has': require('./object/has'),
  'invert': require('./object/invert'),
  'keys': require('./object/keys'),
  'keysIn': require('./object/keysIn'),
  'mapKeys': require('./object/mapKeys'),
  'mapValues': require('./object/mapValues'),
  'merge': require('./object/merge'),
  'methods': require('./object/methods'),
  'omit': require('./object/omit'),
  'pairs': require('./object/pairs'),
  'pick': require('./object/pick'),
  'result': require('./object/result'),
  'set': require('./object/set'),
  'transform': require('./object/transform'),
  'values': require('./object/values'),
  'valuesIn': require('./object/valuesIn')
};


// String
module.exports = {
  'camelCase': require('./string/camelCase'),
  'capitalize': require('./string/capitalize'),
  'deburr': require('./string/deburr'),
  'endsWith': require('./string/endsWith'),
  'escape': require('./string/escape'),
  'escapeRegExp': require('./string/escapeRegExp'),
  'kebabCase': require('./string/kebabCase'),
  'pad': require('./string/pad'),
  'padLeft': require('./string/padLeft'),
  'padRight': require('./string/padRight'),
  'parseInt': require('./string/parseInt'),
  'repeat': require('./string/repeat'),
  'snakeCase': require('./string/snakeCase'),
  'startCase': require('./string/startCase'),
  'startsWith': require('./string/startsWith'),
  'template': require('./string/template'),
  'templateSettings': require('./string/templateSettings'),
  'trim': require('./string/trim'),
  'trimLeft': require('./string/trimLeft'),
  'trimRight': require('./string/trimRight'),
  'trunc': require('./string/trunc'),
  'unescape': require('./string/unescape'),
  'words': require('./string/words')
};


// An object environment feature flags.
var support = {};

module.exports = support;


// Utility
module.exports = {
  'attempt': require('./utility/attempt'),
  'callback': require('./utility/callback'),
  'constant': require('./utility/constant'),
  'identity': require('./utility/identity'),
  'iteratee': require('./utility/iteratee'),
  'matches': require('./utility/matches'),
  'matchesProperty': require('./utility/matchesProperty'),
  'method': require('./utility/method'),
  'methodOf': require('./utility/methodOf'),
  'mixin': require('./utility/mixin'),
  'noop': require('./utility/noop'),
  'property': require('./utility/property'),
  'propertyOf': require('./utility/propertyOf'),
  'range': require('./utility/range'),
  'times': require('./utility/times'),
  'uniqueId': require('./utility/uniqueId')
};


*/
