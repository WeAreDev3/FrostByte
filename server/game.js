// Link our files together
var Class = require('./class'),
    Enemy = require('./enemy'),
    Bullet = require('./bullet'),
    UUID = require('node-uuid'),
    Utils = require('./utils');

var Game = Class.extend({
    init: function() {
        this.width = 1600; // = 16 * 100
        this.height = 1000; // = 10 * 100

        this.players = {};
        this.enemies = [];
        this.bullets = [];

        this.spawnEnemy(15);

        this.start();
    },
    addBullet: function(bullet) {
        this.bullets.push(bullet);
        console.log('bullet');
    },
    removeBullet: function(bullet) {
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
    },
    spawnEnemy: function(number) {
        var location = {
            'x': null,
            'y': null,
            'direction': null
        };

        for (var i = number - 1; i >= 0; i--) {
            switch (Utils.randomInt(4)) {
                case 0: // Start at top
                    location.y = 0;
                    location.x = Utils.randomInt(this.width);
                    location.direction = 0;
                    break;

                case 1: // Start from the right
                    location.x = this.width;
                    location.y = Utils.randomInt(this.height);
                    location.direction = 0;
                    break;

                case 2: // Start at the bottom
                    location.y = this.height;
                    location.x = Utils.randomInt(this.width);
                    location.direction = 0;
                    break;

                case 3: // Start from the left
                    location.x = 0;
                    location.y = Utils.randomInt(this.height);
                    location.direction = 0;
                    break;
            }
        }

        this.enemies.push(new Enemy(UUID(), 0, location.x, location.y, location.direction, this));
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

            for (var i = self.bullets.length - 1; i >= 0; i--) {
                self.bullets[i].update();
            };
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
                    // Add their current state (x, y, direction)
                    update.players[player] = self.players[player].getState();
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

// // The Game class's definition
// var Game = function() {
//     // Define the width and height of the server's viewport -
//     // we will be using a 16:10 aspect ratio
//     this.width = 1600; // = 16 * 100
//     this.height = 1000; // = 10 * 100

//     // An object containing all of the players in the game
//     this.players = {};

//     // An array of all the enemies
//     this.enemies = [];

//     // An array of all the bullets currently on the map
//     this.bullets = [];

//     // Start the game loop
//     this.startLoop();
// };

// // Add the client's character to the game
// Game.prototype.addChar = function(client) {
//     this.players[client.id] = new Character(client);
// };

// // Remove the client's character from the game
// Game.prototype.removeChar = function(client) {
//     // console.log('Deleting:', this.players[client.id]);
//     delete this.players[client.id];
// };

// Game.prototype.addEnemy = function() {
//     this.enemies.push(new Character());
// };

// Game.prototype.addBullet = function(x, y, size, damage, speed, direction, playerId) {
//     this.bullets.push(new Bullet({
//             'character': {
//                 'x': parseFloat(x).toFixed(2),
//                 'y': parseFloat(y).toFixed(2),
//                 'size': parseInt(size),
//                 'id': playerId
//             },
//             'damage': parseInt(damage)
//         },
//         parseInt(speed),
//         parseFloat(direction),
//         playerId
//     ));
// };

// // Start the synchronized game loop
// Game.prototype.startLoop = function() {
//     var lastFrame = 0, // Initialize the game loop
//         count = 0, // Initialize the interval counter
//         self = this; // Capture the game object for usage below

//     // Update the physics of the game

//     function physUpdate(timeElapsed) {
//         for (var player in self.players) {
//             if (self.players.hasOwnProperty(player)) {
//                 self.players[player].update(timeElapsed);
//             }
//         }
//     }

//     // Serve the updated game to the clients

//     function serveUpdate(timeElapsed) {
//         // The object containing the information the clients use to update
//         var update = {
//             'players': {},
//             'bullets': []
//         };

//         // For each player,
//         for (var player in self.players) {
//             if (self.players.hasOwnProperty(player)) {
//                 // Add their array to the update object
//                 update.players[player] = [];
//                 // Add their x and y position and direction to their array
//                 update.players[player].push(self.players[player].x);
//                 update.players[player].push(self.players[player].y);
//                 update.players[player].push(self.players[player].direction);
//             }
//         }

//         for (var i = self.bullets.length - 1; i >= 0; i--) {
//             if (!self.bullets[i].sent) {
//                 // console.log(self.bullets[i]);
//                 update.bullets.push(self.bullets[i]);
//                 self.bullets[i].sent = true;
//             }
//         }

//         // Send the data to each client
//         for (var player in self.players) {
//             if (self.players.hasOwnProperty(player)) {
//                 self.players[player].client.emit('update', update);
//             }
//         }
//     }

//     // Set the update interval to 15ms (see end of call)
//     setInterval(function() {
//         // Define the time elapsed since the last frame
//         var thisFrame = Date.now(),
//             timeElapsed = (thisFrame - lastFrame) / 1000;

//         // Update the physics of the game
//         physUpdate(timeElapsed);

//         // Every 3 intervals (45ms),
//         if (count % 3 == 0) {
//             count = 0;
//             // Serve the update to the clients
//             serveUpdate(timeElapsed);
//         };

//         lastFrame = thisFrame;
//         count++;
//     }, 15);
// };

module.exports = Game;
