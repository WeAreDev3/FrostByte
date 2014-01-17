// Include all of the necessary node modules
var cls = require('./class'),
    Player = require('./player'),
    Enemy = require('./enemy'),
    Utils = require('./utils'),
    UUID = require('node-uuid'); //,
// Link our files together
// Game = require('./game');

var Lobby = cls.Class.extend({
    init: function(size) {
        this.id = UUID();
        this.size = size;
        this.full = false;

        this.players = {};
        this.enemies = [];
        this.bullets = [];

        this.width = 1600; // = 16 * 100
        this.height = 1000; // = 10 * 100

        this.spawnEnemy();

        this.start();
    },
    join: function(id, x, y, direction, socket) {
        if (!this.full) {
            this.players[id] = new Player(id, x, y, direction, socket);

            if (Object.keys(this.players).length >= this.size) {
                this.full = true;
            }
        }
    },
    leave: function(player) {
        delete this.players[player.id];
    },
    spawnEnemy: function() {
        var location = {
            'x': null,
            'y': null,
            'direction': null
        };

        switch (Utils.randomInt(4)) {
            case 0: // Start at top
                location.y = 0;
                location.x = Utils.randomInt(this.width);
                location.direction = -1 * Utils.randomRange(Math.PI / 4, 3 * Math.PI / 4);
                break;

            case 1: // Start from the right
                location.x = this.width;
                location.y = Utils.randomInt(this.height);
                location.direction = -1 * Utils.randomRange(-1 * Math.PI / 4, Math.PI / 4);
                break;

            case 2: // Start at the bottom
                location.y = this.height;
                location.x = Utils.randomInt(this.width);
                location.direction = Utils.randomRange(Math.PI / 4, 3 * Math.PI / 4);
                break;

            case 3: // Start from the left
                location.x = 0;
                location.y = Utils.randomInt(this.height);
                location.direction = Utils.randomRange(-1 * Math.PI / 4, Math.PI / 4);
                break;
        }

        this.enemies.push(new Enemy(UUID(), 0, location.x, location.y, location.direction));
    },
    parseMessage: function(player, message) {
        var command = message[0],
            parameters = message.substring(1, message.length).split(',');

        // console.log(command, parameters);

        // Handle each command that we know
        switch (command) {
            case 'i': // Handle the command i (input)
                if (this.players[player.id]) {
                    this.players[player.id].addInput(parameters);
                }
                break;

            case 'd': // Handle the command d (direction)
                if (this.players[player.id]) {
                    this.players[player.id].setDirection(parameters[0]);
                }
                break;

                // case 'j': // Handle the command j (join)
                //     player.x = parseFloat(parameters[0]);
                //     player.y = parseFloat(parameters[1]);
                //     player.direction = parseFloat(parameters[2]);
                //     joinNewLobby(player);

                //     // Clean up items from the player that aren't needed any more
                //     delete player.x;
                //     delete player.y;
                //     delete player.direction;
                //     break;

                // case 'b': // Handle the command b (add bullet)
                //     // console.log(parameters);
                //     this.addBullet.apply(this.game, parameters);
                //     // console.log(this.game.bullets);
        }

    },
    start: function() {
        var lastFrame = Date.now(), // Initialize the game loop
            count = 0, // Initialize the interval counter
            self = this; // Capture the lobby object for usage below

        // Update the physics of the game

        function physUpdate(timeElapsed) {
            for (var player in self.players) {
                if (self.players.hasOwnProperty(player)) {
                    self.players[player].update(timeElapsed);
                }
            }

            for (var i = self.enemies.length - 1; i >= 0; i--) {
                self.enemies[i].update(timeElapsed);
            }
        }

        // Serve the updated game to the clients

        function serveUpdate(timeElapsed) {
            // The object containing the information the clients use to update
            var update = {
                'players': {},
                'enemies': [],
                'bullets': []
            };

            // For each player,
            for (var player in self.players) {
                if (self.players.hasOwnProperty(player)) {
                    // Add their array to the update object
                    update.players[player] = [];
                    // Add their x and y position and direction to their array
                    update.players[player].push(self.players[player].x);
                    update.players[player].push(self.players[player].y);
                    update.players[player].push(self.players[player].direction);
                }
            }

            for (var i = self.enemies.length - 1; i >= 0; i--) {
                update.enemies.push(self.enemies[i].getState());   
            }

            for (var i = self.bullets.length - 1; i >= 0; i--) {
                if (!self.bullets[i].sent) {
                    // console.log(self.bullets[i]);
                    update.bullets.push(self.bullets[i]);
                    self.bullets[i].sent = true;
                }
            }

            // Send the data to each client
            for (var player in self.players) {
                if (self.players.hasOwnProperty(player)) {
                    self.players[player].socket.emit('update', update);
                }
            }
        }

        // Set the update interval to 15ms (see end of call)
        setInterval(function() {
            // Define the time elapsed since the last frame
            var thisFrame = Date.now(),
                timeElapsed = (thisFrame - lastFrame) / 1000;

            // Update the physics of the game
            physUpdate(timeElapsed);

            // Every 3 intervals (45ms),
            if (count % 3 == 0) {
                count = 0;
                // Serve the update to the clients
                serveUpdate(timeElapsed);
            };

            lastFrame = thisFrame;
            count++;
        }, 15);
    }
});

module.exports = Lobby;

// // The Lobby class's definition
// var Lobby = function() {
//     this.clients = []; // The list of connected clients
//     this.full = false; // Whether or not the lobby is full
//     this.size = 5; // The maximum number of people in a lobby
//     this.id = UUID(); // Give the lobby an ID
//     this.game = new Game(); // Give the lobby its own game
// };

// // Make a client join the lobby when they connect
// Lobby.prototype.join = function(client) {
//     this.clients.push(client.id); // Add the client to the list of clients
//     this.game.addChar(client); // Add the client's player to the game

//     // Tell the client they've joined the lobby
//     client.emit('joinedGame', {
//         id: this.id // Give the client the lobby's ID
//     });

//     // If the client was the last open space in the game, make the lobby full
//     if (this.clients.length === this.size) {
//         this.full = true;
//     }
// };

// // Remove a client from the lobby when they disconnect
// Lobby.prototype.leave = function(client) {
//     // Remove the client from the list of clients
//     this.clients.splice(this.clients.indexOf(client.id), 1);
//     // Remove the client's character from the game
//     this.game.removeChar(client);

//     console.log('Removed', client.id, 'from lobby', this.id);
// };

// // Handle the different messages that clients send to the lobby
// Lobby.prototype.onMessage = function(client, message) {
//     var command = message[0],
//         parameters = message.substring(1, message.length).split(','),
//         currentPlayer;

//     // console.log(command, parameters);

//     // Handle each command that we know
//     switch (command) {
//         case 'i': // Handle the command i (input)
//             currentPlayer = this.game.players[client.id];
//             if (currentPlayer) {
//                 currentPlayer.moveChanges = currentPlayer.moveChanges.concat(parameters);
//             }
//             break;

//         case 'd': // Handle the command d (direction)
//             currentPlayer = this.game.players[client.id];
//             if (currentPlayer) {
//                 currentPlayer.direction = parameters[0];
//             }
//             break;

//         case 'j': // Handle the command j (join)
//             client.x = parseFloat(parameters[0]);
//             client.y = parseFloat(parameters[1]);
//             client.direction = parseFloat(parameters[2]);
//             joinNewLobby(client);

//             // Clean up items from the client that aren't needed any more
//             delete client.x;
//             delete client.y;
//             delete client.direction;
//             break;

//         case 'b': // Handle the command b (add bullet)
//             // console.log(parameters);
//             this.game.addBullet.apply(this.game, parameters);
//             // console.log(this.game.bullets);
//     }
// };

// // Find an open lobby and join it

// function joinNewLobby(client) {
//     var found = false;

//     // Search through all of the lobbies
//     for (var i = lobbies.length - 1; i >= 0; i--) {
//         // If a lobby is not full
//         if (!lobbies[i].full) {
//             // Join the lobby
//             lobbies[i].join(client);

//             // Save the knowledge of finding a lobby (for code below)
//             found = true;
//             break;
//         }
//     }

//     // If an open lobby was not found, create a new one
//     if (!found) {
//         createNewLobby(client);
//     }
// }

// function createNewLobby(client) {
//     lobbies.push(new Lobby());
//     joinNewLobby(client);
// }

// // The list of lobbies
// lobbies = [];

// // Allow other files to access the following lobby functions
// module.exports = {
//     create: createNewLobby,

//     // Find which lobby the client is in
//     findPlayer: function(client) {
//         for (var i = lobbies.length - 1; i >= 0; i--) {
//             if (lobbies[i].clients.indexOf(client.id) !== -1) {
//                 return lobbies[i];
//             }
//         }
//         return new Lobby();
//     }
// };
