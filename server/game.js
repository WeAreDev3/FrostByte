// Link our files together
var Class = require('./class'),
    Bullet = require('./bullet'),
    Enemy = require('./enemy'),
    Utils = require('./utils'),
    UUID = require('node-uuid');

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
    },
    removeBullet: function(bullet) {
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
    },
    addEnemy: function(enemy) {
        this.enemies.push(enemy);
    },
    removeEnemy: function(enemy) {
        this.enemies.splice(this.enemys.indexOf(enemy), 1);
    },
    spawnEnemy: function(number) {
        var location = {
            'x': 0,
            'y': 0
        };

        for (var i = number - 1; i >= 0; i--) {
            switch (Utils.randomInt(4)) {
                case 0: // Start at top
                    location.x = Utils.randomInt(this.width);
                    break;

                case 1: // Start from the right
                    location.x = this.width;
                    location.y = Utils.randomInt(this.height);
                    break;

                case 2: // Start at the bottom
                    location.y = this.height;
                    location.x = Utils.randomInt(this.width);
                    break;

                case 3: // Start from the left
                    location.y = Utils.randomInt(this.height);
                    break;
            }

            this.addEnemy(new Enemy(UUID(), location.x, location.y, 0, this));
        }
    },
    forEachPlayer: function(callback) {
        for (var player in this.players) {
            if (this.players.hasOwnProperty(player)) {
                callback(this.players[player], player);
            }
        }
    },
    forEachEnemy: function(callback) {
        for (var i = 0, length = this.enemies.length; i < length; i++) {
            callback(this.enemies[i], i);
        }
    },
    forEachBullet: function(callback) {

        // Can't cache the length of bullets b/c it could change midway through the loop
        for (var i = 0; i < this.bullets.length; i++) {
            callback(this.bullets[i], i);
        }
    },
    start: function() {
        var lastFrame = Date.now(), // Initialize the game loop
            count = 0, // Initialize the interval counter
            self = this; // Capture the lobby object for usage below

        // Update the physics of the game

        function physUpdate(timeElapsed) {
            self.forEachPlayer(function(player, id) {
                player.update(timeElapsed);
            });

            self.forEachEnemy(function(enemy, id) {
                enemy.update(timeElapsed);
            });

            self.forEachBullet(function(bullet, index) {
                bullet.update(timeElapsed);
            });
        }

        // Serve the updated game to the clients

        function serveUpdate() {
            // The object containing the information the clients use to update
            var update = {
                'players': {},
                'enemies': [],
                'bullets': []
            };

            // Add the players state to the update: (x, y, direction)
            self.forEachPlayer(function(player, id) {
                update.players[id] = player.getState();
            });

            // Add all the enemy states to the update: (x, y, direction)
            self.forEachEnemy(function(enemy, index) {
                update.enemies.push(enemy.getState());
            })

            // Add all the bullet states to the update: (gun, )
            self.forEachBullet(function(bullet, index) {
                // if (!bullet.sent) {
                update.bullets.push(bullet.getState());

                // bullet.sent = true;
                // }
            });

            // Send the data to each client
            self.forEachPlayer(function(player, id) {
                player.socket.emit('update', update);
            });
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
                serveUpdate();
            };

            lastFrame = thisFrame;
            count++;
        }, 15);
    }
});

module.exports = Game;
