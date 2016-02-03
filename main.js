var fs = require('fs');
var server = require('./server.js');

var USERS = {
    'ajith@gmail.com':
     { info:
        { userName: 'Ajith',
          userEmail: 'ajith@gmail.com',
          userNumber: '987',
          userPass: 'xyz' },
       sId: '4846a634-45c7-44f5-9556-1aed362f1e1e' },
       'varunited@gmail.com':
        { info:
           { userName: 'Varun Sharma',
             userEmail: 'varunited@gmail.com',
             userNumber: '123',
             userPass: 'abc' },
          sId: '43db7081-af0f-4c5c-8af0-7cb3e598f53c' }
};

var POSTS = {
    'ajith@gmail.com': [
        { "post-id": 1, "post-title": "Post 1", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 2, "post-title": "Post 2", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 3, "post-title": "Post 3", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ],
    'varunited@gmail.com': [
        { "post-id": 1, "post-title": "Post 1", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 2, "post-title": "Post 2", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 3, "post-title": "Post 3", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ],
}

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

    } else {
        function findUser(SID) {
            for(var key in USERS) {
                if(USERS[key].sId == SID) return key
            }
        }
        var sId = request['header']['Cookie']['sid'];
        var uId = findUser(sId);
        var data = {
            userName: USERS[uId]['info']['userName'],
            posts: POSTS[uId]
        }
        server.sendJSON(request, response, data)
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
