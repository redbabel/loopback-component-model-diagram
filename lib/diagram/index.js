const generator = require('./generator');

let nomnomlSource = '';

const diagram = (loopbackApplication, options) => {
  if (nomnomlSource) {
    return nomnomlSource;
  }

  nomnomlSource = generator.generate(loopbackApplication, options);

  return nomnomlSource;
};

module.exports = diagram;
