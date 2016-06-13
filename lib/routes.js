'use strict';

const path = require('path');
const diagram = require('./diagram');

const routes = (loopbackApplication, router, options) => {
  const loopback = loopbackApplication.loopback;

  router.get('/source', (req, res) => {
    const diagramSource = diagram(loopbackApplication, options);
    res.send(diagramSource);
  });

  router.use(loopback.static(path.join(__dirname, 'public')));

  return router;
};

module.exports = routes;
