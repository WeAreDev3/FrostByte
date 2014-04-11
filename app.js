/*
** app.js is where the server starts its program.
** It instantiates a new node.js server, opens its
** port to any incoming clients, and configures socket.io.
*/

// Include all of the required node modules
var http = require('http'),
    path = require('path'),
    express = require('express'),
    // Create a working node app
    app = express(),
    server = http.createServer(app),
    // Instantiate a websocket server
    io = require('socket.io').listen(server),
    // Link all of our files together
    router = require('./server/router'),
    // Instantiate the lobby object at the very beginning to globalize
    lobbies = {};

// Set the main directory for client files to the /client directory
app.set("view options", {
    layout: false
});
app.use(express.static(path.resolve(__dirname, 'client')));
app.get('/changelog', function(req, res) {
    res.sendfile(__dirname + '/client/changelog.html');
});

// Configure the websocket
io.configure(function() {

    // Don't log unimportant (to us) stuff to the console
    io.set('log level', 0);

    // Require a handshake before proceeding with a client
    io.set('authorization', function(handshakeData, callback) {
        callback(null, true); // error-first callback style
    });

});

// Generates and returns a list of all of the lobbies on the server
function createLobbyList() {
    var lobbyList = {};

    for (var lobby in lobbies) {
        if (lobbies.hasOwnProperty(lobby)) {
            lobbyList[lobby] = {
                'playerCount': Object.keys(lobbies[lobby].clients).length
            }
        }
    }

    return lobbyList;
}

// Runs 'callback' on all connected clients
function forEachSocket(callback) {
    var clients = io.sockets.clients();

    for (var i = clients.length - 1; i >= 0; i--) {
        callback(clients[i]);
    }
}

// Define what happens when a user connects to the server
io.on('connection', function(socket) {
    // Log the new socket's ID to the server's console
    console.log('Socket connected:', socket.id);

    // When signing in, send them all the lobbies
    socket.on('signIn', function(data) {
        socket.name = data.name;
        socket.isInLobby = true;
        socket.emit('lobbyList', createLobbyList());
    });

    // When the player requests that a new lobby be created, create a new lobby
    socket.on('newLobby', function() {
        var lobby = router.createLobby(5),
            listOfLobbies;

        lobbies[lobby.id] = lobby;

        listOfLobbies = createLobbyList();
        forEachSocket(function(socket) {
            if (socket.isInLobby) {
                socket.emit('lobbyList', listOfLobbies);
            }
        });
        
    });

    // When the player is ready to play, add them to an open lobby
    socket.on('play', function(data) {
        router.findLobby(lobbies, data.lobbyId).addPlayer(socket);
        socket.isInLobby = false;

        var listOfLobbies = createLobbyList();
        forEachSocket(function(socket) {
            if (socket.isInLobby) {
                socket.emit('lobbyList', listOfLobbies);
            }
        });
    });

    // Process data received from the socket
    socket.on('message', function(message) {
        if (!socket.player) {
            router.findOpenLobby(lobbies).addPlayer(socket);
        }

        // Do whatever the message requires
        socket.player.parseMessage(message);
    });

    // Define what happens when a user disconnects
    socket.on('disconnect', function() {
        // Log the socket's disconnection w/ ID to the console
        console.log('Socket disconnected:', socket.id);
        if (socket.player) {
            var listOfLobbies;

            // Remove the player & user from the lobby
            console.log('Player left lobby', socket.player.lobby.id);
            socket.player.lobby.removePlayer(socket);

            // If the user was the last one in the lobby, destroy the lobby
            if (!Object.keys(socket.player.lobby.clients).length) {
                socket.player.lobby.remove(lobbies);
            }

            listOfLobbies = createLobbyList();
            forEachSocket(function(socket) {
                if (socket.isInLobby) {
                    socket.emit('lobbyList', listOfLobbies);
                }
            });
        }
    });
});

// Set the server to listen for clients on localhost:3000
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
    var addr = server.address();
    // Log the server's address to the console
    console.log('Server listening at', addr.address + ':' + addr.port);
});
