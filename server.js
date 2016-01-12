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

function responseStringify(response) {
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

function formBuilder(request, formParts) {
    if (formParts['header']) {
        var key = formParts['header'].match(/\bname=\"(.*?)\"/)[1];
        request['form'][key] = {};
        request['form'][key]['header'] = formParts['header'];
        if (isFinite(formParts['body'])) {
            request['form'][key]['body'] = parseFloat(formParts['body']);
            console.log(request['form'][key]['body']);
        } else {
          request['form'][key]['body'] = formParts['body'];
        }
        //console.log();
        //console.log(formParts);
    }
}

function formParser(request) {
    request['form'] = {};
    request['boundary'] = '--' + request['header']['Content-Type'].split('=')[1];
    var formParts = {};
    var formArray = [];
    request['body'].split(request['boundary']).forEach(function(data, index) {
        if (data) {
            //form[index+1] = {};
            formArray = data.split('\r\n\r\n');
            formParts['header'] = formArray[0].substring(2).replace(/\r\n/g, '; ');
            formParts['body'] = formArray[1].slice(0, -2);
            formBuilder(request, formParts);

        }
    });
    //console.log(form);

}

function parseBody(request, bodyParts) { //FOR POST REQUEST
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

function parseProtocol(request, prot) {
    request['header']['method'] = prot[0];
    request['header']['path'] = prot[1];
    request['header']['version'] = prot[2];
}

function parseHeader(request, headerParts) {
    parseProtocol(request, headerParts[0].split(' '));
    headerParts.forEach(function(data, index) {
        if (index > 0) {
            var elem = data.split(': ');
            request['header'][elem[0]] = elem[1];
        }
    });
}

//Handlers----------------------------------------------------------------------

function responseHandler(request, response) {
    response['Date'] = new Date().toUTCString();
    response['Connection'] = 'close';
    response['Server'] = 'NodeServer';
    var responseString = responseStringify(response);
    request["socket"].write(responseString, function(err) {
            request["socket"].end();
    });
}

function ok200Handler(request, response) {
    response['status'] = 'HTTP/1.1 200 OK';
    if (response['content'])  response['Content-Length'] = (response['content'].length).toString();
    responseHandler(request, response);
}

function staticFileHandler(request, response) {
    var filePath = false;
    if (request['header']['path'] == '/') filePath = './public/index.html';
    if (request['header']['path'] == '/favicon.ico') filePath = './public/index.html';
    if (request['header']['path'] == '/form.html') filePath = './public/form.html';
    if (request['header']['path'] == '/altform.html') filePath = './public/altform.html';
    if (request['header']['method'] == 'POST') filePath = './temp/test.html';


    fs.readFile(filePath, function(err, data) {
        if (!err) {
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
        formParser(request);
    } else {
        request['content'] = qs.parse(request['body']);
    }
    console.log(request);
    console.log(request['form']['username1']['header'].split('; '));
    console.log(request['form']['username1']['body'] + 2);
    console.log(request['form']['username2']['header'].split('; '));
    console.log(request['form']['username2']['body'] + 2);
    console.log(request['form']['username3']['header'].split('; '));
    console.log(request['form']['username3']['body'] + 2);

    staticFileHandler(request, response);
}

function methodHandler(request,response) {
    METHOD[request['header']['method']](request,response);
}

function requestHandler(request, requestString) {
    var response = {};
    var requestParts = requestString.split('\r\n\r\n');
    parseHeader(request, requestParts[0].split('\r\n'));

    if (request['header']['method'] === 'POST') {
        parseBody(request, requestParts);
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
