var server = require('./server.js');
var main = server.net.createServer(function(socket)).listen(7777);
console.log("");
