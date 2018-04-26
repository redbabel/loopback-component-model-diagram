(function (nomnoml) {
  var source = '';

  function getQueryStringParams() {
    var pairs = location.search.slice(1).split('&');
    var result = {};

    pairs.forEach(function (pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return result;
  }

  function removeModels(src, modelsToExclude) {
    if (!modelsToExclude || !modelsToExclude.length || modelsToExclude.length === 0) {
      return;
    }

    modelsToExclude.forEach(function (modelName) {
      src = src.replace(new RegExp('.*\\[(<.*> )?' + modelName + '(\\||\\]).*', 'g'), '');
    });

    return src;
  }

  function removeProperties(src) {
    var newSrc = '';
    var z = 0;

    for (var i = 0; i < src.length; i++) {
      if (src[i] === '|' && i - 1 >= 0 && src[i - 1] !== '\\') {
        newSrc += src.substring(z, i);
        var close = false;
        for (var j = i + 1; j < src.length && !close; j++) {
          if (src[j] === ']' && src[j - 1] !== '\\') {
            z = j;
            i = j;
            close = true;
          }
        }
      }
    }

    newSrc += src.substring(z);

    return newSrc;
  }

  function overrideDirectives(src, directives) {
    Object.keys(directives).forEach(function (directive) {
      if (directive && directives[directive]) {
        var newDirectiveSrc = '#' + directive + ': ' + directives[directive];
        var indexOfDirective = src.indexOf('#' + directive);
        if (indexOfDirective > -1) {
          src = src.replace(new RegExp('#' + directive + '.*', 'g'), newDirectiveSrc);
        } else {
          src = newDirectiveSrc + '\n' + src;
        }
      }
    });

    return src;
  }

  function applyParams(src, params) {
    if (params.exclude) {
      var modelsToExclude = params.exclude.split(',');
      src = removeModels(src, modelsToExclude);
    }

    if (params.properties && params.properties === 'false') {
      src = removeProperties(src);
    }

    src = overrideDirectives(src, params);

    return src;
  }

  function getSource(cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        cb(xhttp.responseText);
      }
    };

    xhttp.open('GET', 'source/' + location.search, true);
    xhttp.send();
  }

  function createBlob() {
    var blob = new Blob([source], { type: 'text/plain' });
    this.href = window.URL.createObjectURL(blob);
  }

  document.getElementById('download-source').addEventListener('click', createBlob, false);

  getSource(function (src) {
    var canvas = document.getElementById('target-canvas');
    var params = getQueryStringParams();

    source = applyParams(src, params);

    nomnoml.draw(canvas, source);
  });
})(nomnoml);
