var http = require('http');
var fs = require('fs');

http.createServer(function(request, response) {

    var url = request.headers['x-url'];

    if (!url || url.indexOf('file://') != 0) {
        return;
    }

    if (request.headers['x-type'] == 'document') {
        // I don't yet have a general solution to save new added CSS rules.
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
            response.writeHead(500);
            response.end(error.message);
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
