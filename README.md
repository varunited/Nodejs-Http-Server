# Servarunited

Servarunited is an HTTP web-server written in node.js using sockets.

### Installation

```sh
npm install servarunited
```

```js
var server = require('servarunited');
```

### How to set-up:

 - To start the server, use server.startServer(port, address)
    ```js
    server.startServer(8080, '127.0.0.1');
    ```
 - Routing mechanism
    - For adding a route, use server.addRoute(method, path, function)
        ```js
        server.addRoute('get', '/', home);
        ```
      - method corresponds to the HTTP method (get or post)
      - path is the requested path by the browser
      - function is the user-defined function

    - addRoute(method, path, function) binds the function to a set of method and path
        ```js
        function addRoute(method, path, func) {
            ROUTES[method][path] = func;
        }
        ```

    - ROUTES is an object used to build method-path pair
        ```js
        var ROUTES = {
            get : {},
            post : {}
        }
        ```

### How to use:        

- To send the HTML data, use server.sendHTML(request, response, requested_HTML)
    ```js
    server.sendHTML(request, response, content);
    ```

- To send the JSON data, use server.sendJSON(request, response, JSON_content)
    ```js
    server.sendJSON(request, response, content);
    ```

- To handle sessions, use:
    - To add session
        ```js
        server.addSession(request, content);
        ```

    - To get session
        ```js
        server.getSession(request);
        ```

    - To delete session
        ```js
        server.deleteSession(request);
        ```


### License

MIT

**Open Source matters!**
