// Link our files together
var Character = require('./character');

// The Game class's definition
var Game = function() {
    // Define the width and height of the server's viewport -
    // we will be using a 16:10 aspect ratio
    this.width = 1600; // = 16 * 100
    this.height = 1000; // = 10 * 100

    // An object containing all of the players in the game
    this.players = {};

    this.bullets = [];

    // Start the game loop
    this.startLoop();
};

// Add the client's character to the game
Game.prototype.addChar = function(client) {
    this.players[client.id] = new Character(client);
};

// Remove the client's character from the game
Game.prototype.removeChar = function(client) {
    // console.log('Deleting:', this.players[client.id]);
    delete this.players[client.id];
};

Game.prototype.addBullet = function(x, y, size, speed, damage, direction) {
    this.bullets.push({
        'sent': false,
        'x': parseFloat(x).toFixed(3),
        'y': parseFloat(y).toFixed(3),
        'size': parseInt(size),
        'speed': parseInt(speed),
        'damage': parseInt(damage),
        'direction': parseFloat(direction).toFixed(7)
    });
};

// Start the synchronized game loop
Game.prototype.startLoop = function() {
    var lastFrame = 0, // Initialize the game loop
        count = 0, // Initialize the interval counter
        self = this; // Capture the game object for usage below

    // Update the physics of the game

    function physUpdate(timeElapsed) {}

    // Serve the updated game to the clients

    function serveUpdate(timeElapsed) {
        // The object containing the information the clients use to update
        var update = {
            'players': {},
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
                self.players[player].client.emit('update', update);
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
};

module.exports = Game;
