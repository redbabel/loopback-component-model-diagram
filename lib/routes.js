'use strict';

const path = require('path');
const diagram = require('./diagram');

const routes = (loopbackApplication, router) => {
  const loopback = loopbackApplication.loopback;
  const nomnomlScriptPath = path.join(__dirname, '../node_modules/nomnoml/dist/nomnoml.js');

  router.get('/source', (req, res) => {
    const diagramSource = diagram(loopbackApplication);
    res.send(diagramSource);
  });

  router.use(loopback.static(path.join(__dirname, 'public')));
  router.use('/scripts/nomnoml.js', loopback.static(nomnomlScriptPath));

  return router;
};

module.exports = routes;
