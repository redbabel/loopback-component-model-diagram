(function (nomnoml) {
  var parse = nomnoml.parse;

  function getQueryStringParams() {
    var pairs = location.search.slice(1).split('&');
    var result = {};

    pairs.forEach(function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return result;
  }

  function removeCompartments(ast, index) {
    ast.nodes.forEach(function(node) {
      node.compartments.splice(index, 1);
    });
  }

  function addDirectives(ast, directives) {
    Object.keys(directives).forEach(function(directive) {
      ast.directives[directive] = directives[directive];
    });
  }

  nomnoml.parse = function(code) {
    var ast = parse(code);
    var params = getQueryStringParams();

    addDirectives(ast, params);

    if (params.methods && params.methods === 'false') {
      removeCompartments(ast, 2);
    }

    if (params.properties && params.properties === 'false') {
      removeCompartments(ast, 1);
    }

    return ast;
  }

  function getSource(cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        cb(xhttp.responseText);
      }
    };

    xhttp.open('GET', 'source/', true);
    xhttp.send();
  }

  var canvas = document.getElementById('target-canvas');

  getSource(function(source) {
    nomnoml.draw(canvas, source);
  });
})(nomnoml);
