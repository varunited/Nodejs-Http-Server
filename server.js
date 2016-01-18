var net = require('net');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var uuid = require('node-uuid');

var postDump = {};
var METHOD = {
    GET: get_handler,
    POST: post_handler
}

var CONTENT_TYPE = {
    html: 'text/html'
}

//-------------PARSING----------------------------------------------------------

function stringifyResponse(response) {
    var responseString = response['status'] + '\r\n';
    for (key in response) {
        if (response.hasOwnProperty(key) && key != 'content' && key != 'status') {
            responseString += key + ': ' + response[key] + '\r\n';
        }

    }
    responseString += '\r\n';
    if ('content' in response) responseString += response['content'];
    return responseString;
}

function formPartsParser(request, formPart) {
    var key = formPart['header'].match(/\bname=\"(.*?)\"/)[1];
    request['form'][key] = {};
    request['form'][key]['header'] = formPart['header'];
    if (formPart['body']) {
        if (isFinite(formPart['body'])) {
            request['form'][key]['body'] = parseFloat(formPart['body']);
            console.log("Bodies"+request['form'][key]['body']);
        } else {
          request['form'][key]['body'] = formPart['body'];
        }
    } else {
        request['form'][key]['body'] = undefined;
    }
}

function multipartParser(request) {
    request['form'] = {};
    request['boundary'] = '--' + request['header']['Content-Type'].split('=')[1];
    var formPart = {};
    var formArray = [];
    request['body'].split(request['boundary']).forEach(function(data, index) {
        if (data) {
            //form[index+1] = {};
            formArray = data.split('\r\n\r\n');
            formPart['header'] = formArray[0].substring(2).replace(/\r\n/g, '; '); // Substring for ommiting \r\n from header and regex for fusing headers.
            formPart['body'] = formArray[1].slice(0, -2); //Removes \r\n from end of the body.
            if (formPart['header']) {
                formPartsParser(request, formPart);
            }
        }
    });
}

function bodyParser(request, bodyParts) { //FOR POST REQUEST
    var bodyString = '';
    bodyParts.forEach(function(bodyPart, index) {
        if (index > 0) {
            //console.log(index  +  bodyPart);
            bodyString += bodyPart + '\r\n\r\n';// FIX THIS FOR Contnt-type = x-www-form-urlencoded
        }
    });
    //console.log(bodyString);
    request['body'] = bodyString;
}

function protocolParser(request, prot) {
    request['header']['method'] = prot[0];
    request['header']['path'] = prot[1];
    request['header']['version'] = prot[2];
}

function headerParser(request, headerParts) {
    protocolParser(request, headerParts[0].split(' '));
    headerParts.forEach(function(data, index) {
        if (index > 0) {
            var elem = data.split(': ');
            request['header'][elem[0]] = elem[1];
        }
    });

    if (request['header'].hasOwnProperty('Cookie')) {
        console.log("present");
        var cookies = request['header']['Cookie'].split(';');
        var client_cookies = {};
        cookies.forEach(function(cook) {
           var cookArr = cook.trim().split('=');
           client_cookies[cookArr[0]] = cookArr[1];
        });
        request['header']['Cookie'] = client_cookies;

    } else {
          console.log("Not Present");
          request['header']['Cookie'] = '';
    }
}

//Handlers----------------------------------------------------------------------

function responseHandler(request, response) {
    response['Date'] = new Date().toUTCString();
    response['Connection'] = 'close';
    response['Server'] = 'NodeServer';

    if (request['header']['Cookie'] == '') {
        response['Set-Cookie'] = 'sid=' + uuid.v4().toString();
        console.log("_________________"+response['Set-Cookie']+"____________________");
    }

    var responseString = stringifyResponse(response);
    request["socket"].write(responseString, function(err) {
            request["socket"].end();
    });
}

function ok200Handler(request, response) {
    response['status'] = 'HTTP/1.1 200 OK';
    if (response['content']) {
        response['Content-Length'] = (response['content'].length).toString();
    }
    responseHandler(request, response);
}

function err404Handler(request, response) {
    response['status'] = "HTTP/1.1 404 Not Found";
    response['content'] = "Content Not Found";
    response['Content-type'] = "text/HTML";
    responseHandler(request, response);
}

function staticFileHandler(request, response) {
    var filePath = false;
    filePath = request['header']['path'];
    if (filePath == '/' || filePath == '/favicon.ico') {
        filePath = './public/index.html';
    } else {
        filePath = './public' + filePath;
    }

    fs.readFile(filePath, function(err, data) {
        if (err) {
            err404Handler(request, response);
        } else {
            response['content'] = data.toString();
            var contentType = filePath.split('.').pop();
            response['Content-type'] = CONTENT_TYPE[contentType];
            ok200Handler(request, response);
        }
    });
}

function get_handler(request, response) {
    console.log(request);
    staticFileHandler(request,response);
}

function post_handler(request, response) {
    if (request['header']['Content-Type'].includes('multipart/form-data')) {
        //console.log("THEREEEEEEEEEEEEEEEEEEEEEEEE");
        multipartParser(request);
    } else {
        request['content'] = qs.parse(request['body']);
    }
    console.log(request);
    staticFileHandler(request, response);
}

function methodHandler(request,response) {
    METHOD[request['header']['method']](request,response);
}

function requestHandler(request, requestString) {
    var response = {};
    var requestParts = requestString.split('\r\n\r\n');
    headerParser(request, requestParts[0].split('\r\n'));

    if (request['header']['method'] === 'POST') {
        bodyParser(request, requestParts);
    }
    methodHandler(request,response);
}
//------------------------------------------------------------------------------
net.createServer(function(socket) {
    var request = {};
    request["socket"] = socket;
    request['header'] = {};
    request['body'] = {};
    socket.on('data', function(data) {
        console.log('---------------RAW---------------\n ' +  data.toString() + '\n---------------Raw Ends---------------');
        requestHandler(request, data.toString());
        //console.log(request['body']);
    });

}).listen(8000, '0.0.0.0');
