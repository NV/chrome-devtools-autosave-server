var http = require('http');
var fs = require('fs');

http.createServer(function(request, response) {

	response.writeHead(200);
	response.end('\n');

	var url = request.headers['x-url'];

	if (!url || url.indexOf('file://') != 0) {
		return;
	}

	if (request.headers['x-type'] == 'document') {
		// I don't yet have a general solution to save new added CSS rules.
		return;
	}

	var path = decodeURIComponent(url.replace(/^file:\/\/(?:localhost)?/, ''));
	request.on('data', function(data) {
		console.log('Saved a ' + request.headers['x-type'] + ' to ' + path);
		fs.writeFile(path, data);
	});

}).listen(9104, '127.0.0.1');

console.log('DevTools Autosave is listening on http://127.0.0.1:9104');
