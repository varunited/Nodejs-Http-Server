var fs = require('fs');
var server = require('./server.js');

var USERS = {};

function home(request, response) {
    fs.readFile('./public/index.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

function signup(request, response) {

    fs.readFile('./public/signup.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

function login(request, response) {
    fs.readFile('./public/login.html', function(err, data) {
        //console.log("WAT????????????????");
        //console.log(data.toString());
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

/*function dashBoard(request, response) {
    if (request['header']['Referer'].includes('signup.html') ) {
        var userContent = request['content'];
        var userId = request['header']['Cookie']['sid'];
        server.addSession(request, userContent);
        //console.log(SESSIONS);
        USERS[userId] = userContent;
        console.log("User-Info\n");
        console.log(USERS);
        console.log("\nUser-Info-Ends");
    } else if (request['header']['Referer'].includes('login.html')) {
        var userContent = request['content'];
        var userId = request['header']['Cookie']['sid'];
        if (USERS[userId]['userEmail'] == userContent['userEmail'] && USERS[userId]['userPass'] == userContent['userPass']) {

        } else {
            //Open Other Page
            err404Handler(request, response);
        }

    }
    fs.readFile('./public/dashBoard.html', function(err, data) {
        //console.log("WAT????????????????");
        //console.log(data.toString());
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}*/







function dashBoard(request, response) {
    if (request['header']['Referer'].includes('signup.html') ) {
        var userContent = request['content'];
        var uId = userContent['userEmail'];
        USERS[uId] = {}
        USERS[uId]['info'] = userContent;
        var sId = request['header']['Cookie']['sid'];
        USERS[uId]['sId'] = sId;
        server.addSession(request, USERS[uId]['info']);
        console.log("User-Info\n");
        console.log(USERS);
        console.log("\nUser-Info-Ends");
    } else if (request['header']['Referer'].includes('login.html')) {
        var userContent = request['content'];
        var uId = userContent['userEmail'];
        if (USERS.hasOwnProperty(uId) && USERS[uId]['info']['userPass'] == userContent['userPass']) {

        } else {
            //Open Other Page
            err404Handler(request, response);
        }

    }
    fs.readFile('./public/dashBoard.html', function(err, data) {
        //console.log("WAT????????????????");
        //console.log(data.toString());
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}


















server.addRoute('get', '/', home);
server.addRoute('get', '/signup.html', signup);
server.addRoute('get', '/login.html', login);
server.addRoute('post', '/dashBoard.html', dashBoard);
server.startServer(8000);
