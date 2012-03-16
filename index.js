'use strict';

var routes = [
    {
        from: /^file:\/\/[^/]*\//,
        to: '/'
    }
];
var port = 9104;
var address = '127.0.0.1';
var version = versionTriple('1.0.0');

function versionTriple(version) {
    var triple;
    if (version) {
        triple = version.split('.').map(function(x) {
            return parseInt(x);
        });
    } else {
        triple = [0, 0, 0];
    }
    triple.toString = function() {
        return this.join('.');
    };
    return triple;
}

function start(routes, port, address) {

    var fs = require('fs');
    var diff_match_patch = require('./diff_match_patch').diff_match_patch;
    var diffMatchPatch = new diff_match_patch;

    function patchesToText(patches) {
        var text = [];
        for (var i = 0; i < patches.length; i++) {
            text[i] = diff_match_patch.patch_obj.prototype.toString.call(patches[i]);
        }
        return text.join('');
    }

    require('http').createServer(function(request, response) {

        var url = request.headers['x-url'];
        if (!url) {
            response.writeHead(200);
            response.end('DevTools Autosave ' + version);
            return;
        }

        var protocolVersion = versionTriple(request.headers['x-autosave-version']);
        if (version[0] != protocolVersion[0]) {
            var message = 'Cannot save. ';
            if (version[0] < protocolVersion[0]) {
                message += 'Autosave Server is out of date. Update it by running `sudo npm install -g autosave@' + protocolVersion + '`.';
                response.writeHead(500);
            } else {
                message += 'DevTools Autosave is out of date.' + protocolVersion;
                response.writeHead(400);
            }
            console.error(message);
            response.end(message);
            return;
        }

        var matches;
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (route.from.test(url)) {
                matches = true;
                break;
            }
        }

        if (!matches) {
            if (i === 1) {
                internalServerError(url + ' doesn’t match a route ' + route.from);
            } else {
                internalServerError(url + ' doesn’t match any of the following routes:\n' + routes.map(function(a) {
                    return a.from;
                }).join('\n'));
            }
            return;
        }

        var path = url.replace(route.from, route.to);

        if (/\/[C-Z]:\//.test(path)) {
            // Oh, Windows.
            path = path.slice(1);
        }

        var queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            path = path.slice(0, queryIndex);
        }

        path = decodeURIComponent(path);

        var chunks = [];
        request.setEncoding('utf8');
        request.on('data', function(chunk) {
            chunks.push(chunk);
        });

        request.on('end', function() {
            try {
                var content = fs.readFileSync(path, 'utf8');
            } catch (err) {
                internalServerError('Cannot read file. ' + err);
                return;
            }
            try {
                var patches = JSON.parse(chunks.join(''));
            } catch (error) {
                console.error('Cannot parse a patch. Invalid JSON: ', error);
                return;
            }
            var newFile = diffMatchPatch.patch_apply(patches, content);
            try {
                fs.writeFileSync(path, newFile[0]);
            } catch (err) {
                internalServerError('Cannot write to file. ' + err);
                return;
            }
            response.writeHead(200);
            response.end('OK\n');
            console.log('Saved a ' + request.headers['x-type'] + ' to ' + path + '\n' + patchesToText(patches));
        });

        function internalServerError(message) {
            response.writeHead(500);
            response.end(message);
            console.error(message);
        }

    }).on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.log('http://' + address + ':' + port + ' is already in use. Exiting.');
        }
    }).listen(port, address, function() {
        console.log('DevTools Autosave ' + version + ' is running on http://' + address + ':' + port);
    });
}

if (module.parent) {
    // Loaded via module, i.e. require('index.js')
    exports.start = start;
    exports.routes = routes;
    exports.defaultPort = port;
    exports.defaultAddress = address;
    exports.version = version;
} else {
    // Loaded directly, i.e. `node index.js`
    start(routes, port, address);
}
