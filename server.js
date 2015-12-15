var net = require('net');
var fs = require('fs');

var request = {};
var requestHeader = {}; //THROWS ERROR WHEN INITIALIZED INSIDE THE FUNCTION
var METHOD = {
    GET: get_handler,
    POST: post_handler
}
//-------------PARSING----------------------------------------------------------
function parseProtocol(prot) {
    requestHeader['method'] = prot[0];
    requestHeader['path'] = prot[1];
    requestHeader['version'] = prot[2];
}

function parseHeader(arr) {
    arr.pop();
    arr.pop();

    parseProtocol(arr[0].split(' '));
    arr.shift();
    arr.forEach(function(data) {
        var elem = data.split(': ');
        requestHeader[elem[0]] = elem[1];
    });
    request['header'] = requestHeader;

}

/*function parseBody(arr) {

}*/ //FOR POST REQUEST

//-------------HANDLERS---------------------------------------------------------

function methodHandler(request,response) {
    var handler = METHOD[request['header']['method']];
    handler(request,response);
}

function get_handler(request, response) {
    staticFileHandler(request,response);
}
function post_handler() {

}

function staticFileHandler(request, response) {
    var filePath = false;
    if (request['header']['path'] == '/') filePath = './public/index.html';
    var stats = fs.stat(filePath);
    //console.log(stats);
    var fileSize = stats['size'];
    console.log(fileSize);
}

function requestHandler(requestString) {
    var response = {};
    var requestParts = requestString.split('\r\n\r\n');
    //var requestHeader = {};
    //var requestBody = {}; //FOR POST REQUEST

    parseHeader(requestParts[0].split('\r\n'));
    //parseBody(requestParts[1].split('\n')); //FOR POST REQUEST
    console.log(request);
    methodHandler(request,response);
}

net.createServer(function(socket) {
    request["socket"] = socket;
    socket.on('data', function(data) {
        requestHandler(data.toString());

        var result = "HTTP/1.1 200 OK\r\n\r\n<html><body><h1>Foo Bar</h1></body></html>";
        socket.write(result);
        socket.end();
    });

    /*socket.on('end', function() {
        console.log("Disconnected");
    });*/
}).listen(8080);
