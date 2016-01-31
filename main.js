var fs = require('fs');
var server = require('./server.js');

function home(request, response) {
    fs.readFile('./public/index.html', function(err, data) {
        if (err) {
            err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

server.addRoute('get', '/', home);
server.startServer(8000);
