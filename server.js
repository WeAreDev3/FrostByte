// Include all of the required node modules
var http = require('http'),
    path = require('path'),
    socketio = require('socket.io'),
    express = require('express'),
    // Link all of our files together
    Lobby = require('./server/lobby'),
    // Create a working node app
    router = express(),
    server = http.createServer(router),
    // Instantiate a websocket server
    io = socketio.listen(server);

// Set the main directory for client files to the client directory
router.use(express.static(path.resolve(__dirname, 'client')));

// Configure the socket
io.configure(function() {

    // Don't log unimportant (to us) stuff to the console
    io.set('log level', 0);

    // Require a handshake before proceeding with a client
    io.set('authorization', function(handshakeData, callback) {
        callback(null, true); // error first callback style
    });

});

var lobby = new Lobby();

// Define what happens when a user connects to the server
io.on('connection', function(client) {
    // Log the new client's ID to the server's console
    console.log('Client connected:', client.id);

    // Pass the client's ID to them
    // client.emit('onconnected', {
    //     id: client.id
    // });

    client.on('play', function(state) {
        lobby.addPlayer(client, state.x, state.y, state.direction, lobby);
    });

    // Process data received from the client
    // So far just input and join
    client.on('message', function(message) {
        // console.log('Recieved:', message);
        lobby.parseMessage(client, message);
        // lobby.findPlayer(client).onMessage(client, message);
    });

    // Define what happens when a user disconnects
    client.on('disconnect', function() {
        // Log the client's disconnection w/ ID to the console
        console.log('Client disconnected:', client.id);
        lobby.removePlayer(client);
    });
});

// Set the server to listen for clients on localhost:3000
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
    var addr = server.address();
    // Log the server's address to the console
    console.log('Server listening at', addr.address + ':' + addr.port);
});
