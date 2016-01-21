var net = require('net');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var uuid = require('node-uuid');

var SESSIONS = {};

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

function formPartsParser(request, formPart, index) {
    //var key = formPart['header'].match(/\bname=\"(.*?)\"/)[1];
    var key = 'field'+index;
    request['form'][key] = {};
    partArray = [];
    partObj = {};
    formPart['header'].split('; ').forEach(function(hParts, index) {
        partArray = hParts.split(/=|: /);
        partObj[partArray[0]] = partArray[1].replace(/['"]+/g, '');
    });
    if (formPart['content']) {
        if (isFinite(formPart['content'])) {
            partObj['content'] = parseFloat(formPart['content']);
        } else {
            partObj['content'] = formPart['content'];
        }
    } else {
        partObj['content'] = undefined;
    }
    request['form'][key] = partObj;
}

function multipartParser(request) {
    request['form'] = {};
    request['boundary'] = '--' + request['header']['Content-Type'].split('=')[1];
    var formPart = {};
    var formArray = [];
    request['body'].split(request['boundary']).forEach(function(formData, index) {
        if (formData) {
            //form[index+1] = {};
            formArray = formData.split('\r\n\r\n');
            formPart['header'] = formArray[0].substring(2).replace(/\r\n/g, '; '); //Substring: ommiting \r\n from header and regex for headers.
            formPart['content'] = formArray[1].slice(0, -2); //Removes \r\n from end of the content.
            if (formPart['header']) {
                formPartsParser(request, formPart, index);
            }
        }
    });
}

function bodyParser(request, bodyParts) { //FOR POST REQUEST: //Fix this for multiple Content-Type in request['header'].
    if (request['header']['Content-Type'] == 'application/x-www-form-urlencoded') {
            request['body'] = bodyParts[1];
    } else {
        var bodyString = '';
        bodyParts.forEach(function(bodyPart, index) {
            if (index > 0) {
                bodyString += bodyPart + '\r\n\r\n';// FIX THIS FOR Contnt-type = x-www-form-urlencoded
            }
        });
        request['body'] = bodyString;
    }
}

function protocolParser(request, prot) {
    request['header']['method'] = prot[0];
    request['header']['path'] = prot[1];
    request['header']['version'] = prot[2];
}

function headerParser(request, headerParts) {
    protocolParser(request, headerParts[0].split(' '));
    headerParts.forEach(function(head, index) {
        if (index > 0) {
            var elem = head.split(': ');
            request['header'][elem[0]] = elem[1];
        }
    });

    if (request['header'].hasOwnProperty('Cookie')) {
        console.log("present");
        var clientCookies = {};
        request['header']['Cookie'].split('; ').forEach(function(cook) {
           var cookArr = cook.trim().split('=');
           clientCookies[cookArr[0]] = cookArr[1];
        });
        request['header']['Cookie'] = clientCookies;

    } else {
          console.log("Not Present");
          request['header']['Cookie'] = {};
    }
}

//Handlers----------------------------------------------------------------------

function addSession(request) {
    var clientCookie = request['header']['Cookie'];
    if (clientCookie.hasOwnProperty('sid')) {
        var sid = clientCookie['sid'];
        if (SESSIONS.hasOwnProperty(sid)) {
            SESSIONS[sid] = request['content'];
        }
    }
}


function responseHandler(request, response) {
    response['Date'] = new Date().toUTCString();
    response['Connection'] = 'close';
    response['Server'] = 'NodeServer';
    console.log(response);
    var responseString = stringifyResponse(response);
    console.log(SESSIONS);
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
        multipartParser(request);
    } else {
        request['content'] = qs.parse(request['body']);
        addSession(request)
    }
    console.log(request);
    staticFileHandler(request, response);
}

function methodHandler(request,response) {
    METHOD[request['header']['method']](request,response);
}

function sessionHandler(request, response) {
    if(request['header']['Cookie'].hasOwnProperty('sid')) {
        if (SESSIONS.hasOwnProperty(request['header']['Cookie']['sid'])) {
            return;
        } else {
            SESSIONS[request['header']['Cookie']['sid']] = {};
        }
    } else {
        var cookie = uuid.v4().toString();
        var exDate = 'Fri, 22 Jan 2016 11:00:00 GMT';
        response['Set-Cookie'] = 'sid=' + cookie+"; expires="+exDate;
        SESSIONS[cookie] = {};
    }
}

function requestHandler(request, requestString) {
    var response = {};
    var requestParts = requestString.split('\r\n\r\n');
    headerParser(request, requestParts[0].split('\r\n'));

    if (request['header']['method'] === 'POST') {
        bodyParser(request, requestParts);
    }
    sessionHandler(request, response);
    methodHandler(request,response);
}
//------------------------------------------------------------------------------
net.createServer(function(socket) {
    var request = {};
    request["socket"] = socket;
    request['header'] = {};
    request['body'] = {};
    socket.on('data', function(data) {
        console.log(SESSIONS);
        console.log('---------------RAW---------------\n ' +  data.toString() + '\n---------------Raw Ends---------------');
        requestHandler(request, data.toString());
        //console.log(request['body']);
    });

}).listen(8000, '0.0.0.0');
