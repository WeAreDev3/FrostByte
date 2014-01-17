// Include all of the necessary node modules
var UUID = require('node-uuid'),
    // Link our files together
    Game = require('./game');

// The Lobby class's definition
var Lobby = function() {
    this.clients = []; // The list of connected clients
    this.full = false; // Whether or not the lobby is full
    this.size = 5; // The maximum number of people in a lobby
    this.id = UUID(); // Give the lobby an ID
    this.game = new Game(); // Give the lobby its own game
};

// Make a client join the lobby when they connect
Lobby.prototype.join = function(client) {
    this.clients.push(client.id); // Add the client to the list of clients
    this.game.addChar(client); // Add the client's player to the game

    // Tell the client they've joined the lobby
    client.emit('joinedGame', {
        id: this.id // Give the client the lobby's ID
    });

    // If the client was the last open space in the game, make the lobby full
    if (this.clients.length === this.size) {
        this.full = true;
    }
};

// Remove a client from the lobby when they disconnect
Lobby.prototype.leave = function(client) {
    // Remove the client from the list of clients
    this.clients.splice(this.clients.indexOf(client.id), 1);
    // Remove the client's character from the game
    this.game.removeChar(client);

    console.log('Removed', client.id, 'from lobby', this.id);
};

// Handle the different messages that clients send to the lobby
Lobby.prototype.onMessage = function(client, message) {
    var command = message[0],
        parameters = message.substring(1, message.length).split(','),
        currentPlayer;

    // console.log(command, parameters);

    // Handle each command that we know
    switch (command) {
        case 'i': // Handle the command i (input)
            currentPlayer = this.game.players[client.id];
            if (currentPlayer) {
                currentPlayer.moveChanges.concat(parameters);
            }
            break;

        case 'd': // Handle the command d (direction)
            currentPlayer = this.game.players[client.id];
            if (currentPlayer) {
                currentPlayer.direction = parameters[0];
            }
            break;

        case 'j': // Handle the command j (join)
            client.x = parseFloat(parameters[0]);
            client.y = parseFloat(parameters[1]);
            client.direction = parseFloat(parameters[2]);
            joinNewLobby(client);

            // Clean up items from the client that aren't needed any more
            delete client.x;
            delete client.y;
            delete client.direction;
            break;

        case 'b': // Handle the command b (add bullet)
            // console.log(parameters);
            this.game.addBullet.apply(this.game, parameters);
            // console.log(this.game.bullets);
    }
};

// Find an open lobby and join it

function joinNewLobby(client) {
    var found = false;

    // Search through all of the lobbies
    for (var i = lobbies.length - 1; i >= 0; i--) {
        // If a lobby is not full
        if (!lobbies[i].full) {
            // Join the lobby
            lobbies[i].join(client);

            // Save the knowledge of finding a lobby (for code below)
            found = true;
            break;
        }
    }

    // If an open lobby was not found, create a new one
    if (!found) {
        createNewLobby(client);
    }
}

function createNewLobby(client) {
    lobbies.push(new Lobby());
    joinNewLobby(client);
}

// The list of lobbies
lobbies = [];

// Allow other files to access the following lobby functions
module.exports = {
    create: createNewLobby,

    // Find which lobby the client is in
    findPlayer: function(client) {
        for (var i = lobbies.length - 1; i >= 0; i--) {
            if (lobbies[i].clients.indexOf(client.id) !== -1) {
                return lobbies[i];
            }
        }
        return new Lobby();
    }
};
