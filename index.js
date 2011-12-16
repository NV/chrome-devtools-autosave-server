var http = require('http');
var fs = require('fs');

http.createServer(function(request, response) {

    function internalServerError(message) {
        response.writeHead(500);
        response.end(message);
    }

    if (request.headers['x-type'] == 'document') {
        internalServerError("Can't add a new CSS rule. It's not yet supported.");
        return;
    }

    var url = request.headers['x-url'];

    if (!url) {
        internalServerError('X-URL header is missing');
        return;
    }

    if (url.indexOf('file://') != 0) {
        internalServerError('URL (' + url + ') must start with file://');
        return;
    }

    var path = decodeURIComponent(url.replace(/^file:\/\/(?:localhost)?/, ''));

    var chunks = [];
    request.on('data', function(chunk) {
        chunks.push(chunk);
    });

    request.on('end', function() {
        var stream = fs.createWriteStream(path);
        for (var i = 0; i < chunks.length; i++) {
            stream.write(chunks[i]);
        }
        stream.on('error', function(error) {
            console.error(error.message);
            internalServerError(error.message);
        });
        stream.on('close', function() {
            response.writeHead(200);
            response.end('OK\n');
            console.log('Saved a ' + request.headers['x-type'] + ' to ' + path);
        });
        stream.end();
    });

}).listen(9104, '127.0.0.1');

console.log('DevTools Autosave is listening on http://127.0.0.1:9104');
