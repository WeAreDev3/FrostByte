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
        parameters = message.substring(1, message.length).split(',');

    // Handle each command that we know
    switch (command) {
        // Handle the command i (input)
        case 'i':
            // Figure out which client sent the input, based on the ID
            for (var player in this.game.players) {
                if (this.game.players.hasOwnProperty(player) && player === client.id) {
                    for (var i = parameters.length - 1; i >= 0; i--) {
                        // Analyze each of the parameters passed to the lobby
                        switch (parameters[i]) {
                            // If the client sent 'u' (up)
                            case 'u':
                                // Move the player up
                                this.game.players[player].y -= this.game.players[player].speed * 0.016666667;
                                break;
                                // If the client sent 'd' (down)
                            case 'd':
                                // Move the player down
                                this.game.players[player].y += this.game.players[player].speed * 0.016666667;
                                break;
                                // If the client sent 'l' (left)
                            case 'l':
                                // Move the player left
                                this.game.players[player].x -= this.game.players[player].speed * 0.016666667;
                                break;
                                // If the client sent 'r' (right)
                            case 'r':
                                // Move the player right
                                this.game.players[player].x += this.game.players[player].speed * 0.016666667;
                                break;
                        }
                    }
                }
            }
            break;

        case 'j': // Handle the command j (join)
            client.x = parseFloat(parameters[0]);
            client.y = parseFloat(parameters[1]);
            joinNewLobby(client);
            break;
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
