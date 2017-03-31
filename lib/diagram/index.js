const generator = require('./generator');

const nomnomlSourceCache = {};

const diagram = (loopbackApplication, options) => {
  const optionsKey = JSON.stringify(options);
  let cachedValue = nomnomlSourceCache[optionsKey];
  if (cachedValue) {
    return cachedValue;
  }

  cachedValue = generator.generate(loopbackApplication, options);
  // something fishy is going on if there are more then 50 cache values.
  // Safely don't cache it for now to avoid malicious OOMs.
  // a Poor mans LRU cache - suitable because there are not many permutations expected
  if (Object.keys(nomnomlSourceCache).length < 50) {
    nomnomlSourceCache[optionsKey] = cachedValue;
  }
  return cachedValue;
};

module.exports = diagram;
