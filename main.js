var fs = require('fs');
var server = require('./server.js');

var USERS = {
    'ajith@gmail.com':
     { info:
        { userName: 'Ajith',
          userEmail: 'ajith@gmail.com',
          userNumber: '987',
          userPass: 'xyz' },
       //sId: '4846a634-45c7-44f5-9556-1aed362f1e1e'
     },
       'varunited@gmail.com':
        { info:
           { userName: 'Varun Sharma',
             userEmail: 'varunited@gmail.com',
             userNumber: '123',
             userPass: 'abc' },
          //sId: '43db7081-af0f-4c5c-8af0-7cb3e598f53c'
        }
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
    'rakesh@gmail.com': [
        { "post-id": 1, "post-title": "Post 1", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 2, "post-title": "Post 2", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
        { "post-id": 3, "post-title": "Post 3", "post-content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ]
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

/*function getDashBoard(request, response) {
    console.log("GETDASHBOARD TRIED");
    fs.readFile('./public/dashBoard.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}*/
function signup(request, response) {
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

    fs.readFile('./public/dashBoard.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

function login(request, response) {
    var uId = request['content']['userEmail'];
    if (USERS.hasOwnProperty(uId) && USERS[uId]['info']['userPass'] == request['content']['userPass']) {
        var sId = request['header']['Cookie']['sid'];
        USERS[uId]['sId'] = sId;
        server.addSession(request, USERS[uId]['info']);
    } else {
        //Open Other Page
        err404Handler(request, response);
    }
    fs.readFile('./public/dashBoard.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });

}

function addPost(request, response) {
    var user = server.getSession(request);
    var uId = user['userEmail'];

    var formData = request['form'];
    var postData = {};
    postData["post-id"] = POSTS[uId].length + 1;
    postData["post-title"] = formData['field1']['content'];
    postData["post-content"] = formData['field2']['content'];
    POSTS[uId].push(postData);
    console.log(POSTS);
    fs.readFile('./public/dashBoard.html', function(err, data) {
        if (err) {
            server.err404Handler(request, response);
        } else {
            server.sendHTML(request, response, data.toString());
        }
    });
}

function dashBoard(request, response) {
    if (request['header']['Referer'].includes('signup.html') ) {
        signup(request, response);

    } else if (request['header']['Referer'].includes('login.html')) {
        login(request, response);

    } else if (request['header']['Referer'].includes('addPost.html')) {
        addPost(request, response);

    } else if (request['header']['X-Requested-With'] == 'XMLHttpRequest') {
        //var cookieId = request['header']['Cookie']['sid'];
        var user = server.getSession(request);
        var uId = user['userEmail'];
        var data = {
            userName: USERS[uId]['info']['userName'],
            posts: POSTS[uId]
        }
        server.sendJSON(request, response, data);
    }  //else {
        fs.readFile('./public/dashBoard.html', function(err, data) {
            if (err) {
                server.err404Handler(request, response);
            } else {
                server.sendHTML(request, response, data.toString());
            }
        });
    //}
}

server.addRoute('get', '/', home);
//server.addRoute('get', '/dashBoard.html', getDashBoard);
server.addRoute('post', '/dashBoard.html', dashBoard);
server.startServer(8000);
