'use strict';

const generator = require('./generator');
let nomnomlSource = '';

const diagram = (loopbackApplication) => {
  if (nomnomlSource) {
    return nomnomlSource;
  }

  nomnomlSource = generator.generate(loopbackApplication);

  return nomnomlSource;
};

module.exports = diagram;
