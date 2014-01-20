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
    lobbies = {};

// Set the main directory for client files to the client directory
app.use(express.static(path.resolve(__dirname, 'client')));

// Configure the socket
io.configure(function() {

    // Don't log unimportant (to us) stuff to the console
    io.set('log level', 0);

    // Require a handshake before proceeding with a client
    io.set('authorization', function(handshakeData, callback) {
        callback(null, true); // error first callback style
    });

});

// Define what happens when a user connects to the server
io.on('connection', function(socket) {
    // Log the new socket's ID to the server's console
    console.log('Socket connected:', socket.id);

    // When the player is ready to play, add them to an open lobby
    socket.on('play', function(data) {
        socket.name = data.name;
        router.findOpenLobby(lobbies).addPlayer(socket);
    });

    // Process data received from the socket
    socket.on('message', function(message) {
        if (!socket.player) {
            router.findOpenLobby(lobbies).addPlayer(socket);
        }

        socket.player.parseMessage(message);
    });

    // Define what happens when a user disconnects
    socket.on('disconnect', function() {
        // Log the socket's disconnection w/ ID to the console
        console.log('Socket disconnected:', socket.id);
        if (socket.player) {
            socket.player.lobby.removePlayer(socket);
            console.log('And left the lobby:', socket.player.lobby.id);
        }
    });
});

// Set the server to listen for clients on localhost:3000
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
    var addr = server.address();
    // Log the server's address to the console
    console.log('Server listening at', addr.address + ':' + addr.port);
});
