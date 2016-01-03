var net = require('net');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


var postDump = {};
var METHOD = {
    GET: get_handler,
    POST: post_handler
}

var CONTENT_TYPE = {
    html: 'text/html'
}

var staticFileSystem = {
    '/': '/public/index.html'
}
//-------------PARSING----------------------------------------------------------
function parseProtocol(request, prot) {
    request['header']['method'] = prot[0];
    request['header']['path'] = prot[1];
    request['header']['version'] = prot[2];
}

function parseHeader(request, arr) {
    //arr.pop();
    //arr.pop();
    //var requestHeader = {}; //THROWS ERROR WHEN INITIALIZED INSIDE THIS FUNCTION
    parseProtocol(request, arr[0].split(' '));
    arr.shift();
    arr.forEach(function(data) {
        var elem = data.split(': ');
        request['header'][elem[0]] = elem[1];
    });
    //request['header'] = requestHeader;
}

function parseBody(request, queryString) {
        request['body'] = queryString;
} //FOR POST REQUEST

function responseStringify(response) {
    var responseString = response['status'] + '\r\n';
    for (key in response) {
        if (response.hasOwnProperty(key) && key != 'content' && key != 'status') {
            responseString += key + ': ' + response[key] + '\r\n';
        }

    }
    responseString += '\r\n';
    if ('content' in response) responseString += response['content'];
    //--console.log(response);
    //console.log(responseString);
    return responseString;
}

function methodHandler(request,response) {
    METHOD[request['header']['method']](request,response);
}

function get_handler(request, response) {
    console.log(request);
    staticFileHandler(request,response);
}

function post_handler(request, response) {
    request['content'] = qs.parse(request['body']);
    //console.log(request['content']);
    console.log(request);
    //request["socket"].uncork();
    //request["socket"].end();
    //ok200Handler(request, response);
    staticFileHandler(request, response);
}

function staticFileHandler(request, response) {
    var filePath = false;
    if (request['header']['path'] == '/') filePath = './public/index.html';
    if (request['header']['path'] == '/form.html') filePath = './public/form.html';
    if (request['header']['method'] == 'POST') filePath = './temp/test.html';

    fs.readFile(filePath, function(err, data) {
        if (!err) {
            response['content'] = data.toString();
            //--response['content'] = '<html><body><h1>Foo Bar</h1></body></html>';
            var contentType = filePath.split('.').pop();
            response['Content-type'] = CONTENT_TYPE[contentType];
            ok200Handler(request, response);
        }
    });
}

function ok200Handler(request, response) {
    response['status'] = 'HTTP/1.1 200 OK';
    if (response['content'])  response['Content-Length'] = (response['content'].length).toString();
    responseHandler(request, response);
}

function responseHandler(request, response) {
    response['Date'] = new Date().toUTCString();
    response['Connection'] = 'close';
    response['Server'] = 'NodeServer';
    var responseString = responseStringify(response);
    request["socket"].write(responseString, function(err) {
            request["socket"].end();
    });
    //if (response['status'] != "POST") request["socket"].end();
}

function requestHandler(request, requestString) {
    var response = {};
    var requestParts = requestString.split('\r\n\r\n');
    //var requestHeader = {};
    //var requestBody = {}; //FOR POST REQUEST
    console.log("HEAD: " + requestParts[0]);
    parseHeader(request, requestParts[0].split('\r\n'));
    console.log("BODY: " + requestParts[1]);
    if (requestParts[1].length) {
        //console.log(requestParts[1]);
        parseBody(request, requestParts[1]);
        if (!request['header']['Content-Length']) request['header']['Content-Length'] = request['body'].length;
    }
    //parseBody(requestParts[1].split('\n')); //FOR POST REQUEST
    //console.log(request);
    methodHandler(request,response);
}
//------------------------------------------------------------------------------
net.createServer(function(socket) {
    var request = {};
    request["socket"] = socket;
    request['header'] = {};
    request['body'] = {};
    socket.on('data', function(data) {
        //console.log('RAW-REQUEST: ' + data.toString());
        requestHandler(request, data.toString());
    });
}).listen(8080);
