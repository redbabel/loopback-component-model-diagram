'use strict';

const _ = require('lodash');
const routes = require('./routes');

const modelDiagram = (loopbackApplication, options) => {
  const loopback = loopbackApplication.loopback;
  const loopbackMajor = loopback && loopback.version && loopback.version.split('.')[0] || 1;

  if (loopbackMajor < 2) {
    throw new Error('loopback-component-erd requires loopback 2.0 or newer');
  }

  const opts = _.defaults({}, options, {
    mountPath: '/modeldiagram',
  });

  const router = loopback.Router();

  loopbackApplication.use(opts.mountPath, routes(loopbackApplication, router, opts));
};

exports = module.exports = modelDiagram;
