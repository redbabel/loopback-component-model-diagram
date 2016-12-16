'use strict';

const path = require('path');
const diagram = require('./diagram');

const routes = (loopbackApplication, router, options) => {
  const loopback = loopbackApplication.loopback;
  const publicDir = 'public';

  router.get('/source', (req, res) => {
    const diagramSource = diagram(loopbackApplication, options);
    res.send(diagramSource);
  });

  router.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, `${publicDir}/docs.html`));
  });

  router.use(loopback.static(path.join(__dirname, publicDir)));

  return router;
};

module.exports = routes;
