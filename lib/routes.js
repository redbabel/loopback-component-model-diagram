const path = require('path');
const diagram = require('./diagram');

const publicDir = 'public';

const routes = (loopbackApplication, router, options) => {
  router.get('/source', (req, res) =>
    res.send(diagram(loopbackApplication, options)));

  router.get('/docs', (req, res) =>
    res.sendFile(path.join(__dirname, `${publicDir}/docs.html`)));

  router.use(loopbackApplication.loopback.static(path.join(__dirname, publicDir)));

  return router;
};

module.exports = routes;
