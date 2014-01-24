// Link our files together
var Class = require('./class'),
    Bullet = require('./bullet'),
    Enemy = require('./enemy'),
    Utils = require('./utils');

var Game = Class.extend({
    init: function() {
        this.width = 1600; // = 16 * 100
        this.height = 1000; // = 10 * 100

        this.players = {};
        this.enemies = {};
        this.bullets = {};

        this.level = 0;
        this.nextLevel();

        this.start();
    },
    addBullet: function(bullet) {
        this.bullets[bullet.id] = bullet;
    },
    removeBullet: function(bullet) {
        delete this.bullets[bullet.id];
    },
    addEnemy: function(enemy) {
        this.enemies[enemy.id] = enemy;
    },
    nextLevel: function() {
        this.forEachPlayer(function(player, id) {
            player.resetHitPoints();
            console.log(player.name, 'has done', Utils.formatNumber(player.stats.damage), 'damage.');
        });
        this.spawnEnemies(16 * ((this.level + 1) / 2), this.level);
        this.level++;
    },
    removeEnemy: function(enemy) {
        delete this.enemies[enemy.id];
    },
    spawnEnemies: function(number) {
        // console.log('spawing', number);
        var location = {
            'x': 0,
            'y': 0
        };

        for (var i = 0; i < number; i++) {
            switch (Utils.randomInt(4)) {
                case 0: // Start at top
                    location.x = Utils.randomInt(this.width);
                    location.y = 0;
                    break;

                case 1: // Start from the right
                    location.x = this.width;
                    location.y = Utils.randomInt(this.height);
                    break;

                case 2: // Start at the bottom
                    location.x = Utils.randomInt(this.width);
                    location.y = this.height;
                    break;

                case 3: // Start from the left
                    location.x = 0;
                    location.y = Utils.randomInt(this.height);
                    break;
            }

            this.addEnemy(new Enemy(location.x, location.y, this.level, this));
        }
    },
    forEachPlayer: function(callback) {
        for (var playerID in this.players) {
            if (this.players.hasOwnProperty(playerID)) {
                callback(this.players[playerID], playerID);
            }
        }
    },
    forEachEnemy: function(callback) {
        for (var enemyID in this.enemies) {
            if (this.enemies.hasOwnProperty(enemyID)) {
                callback(this.enemies[enemyID], enemyID);
            }
        }
    },
    forEachBullet: function(callback) {
        for (var bulletID in this.bullets) {
            if (this.bullets.hasOwnProperty(bulletID)) {
                callback(this.bullets[bulletID], bulletID);
            }
        }
    },
    start: function() {
        var lastFrame = Date.now(), // Initialize the game loop
            count = 0, // Initialize the interval counter
            self = this; // Capture the game object for usage below

        // Update the physics of the game

        function physUpdate(timeElapsed) {
            self.forEachPlayer(function(player, id) {
                player.update(timeElapsed);
            });

            self.forEachEnemy(function(enemy, id) {
                enemy.update(timeElapsed);
            });

            self.forEachBullet(function(bullet, id) {
                bullet.update(timeElapsed);
            });

            if (!Object.keys(self.enemies).length) {
                self.nextLevel();
            }
        }

        // Serve the updated game to the clients

        function serveUpdate() {
            // The object containing the information the clients use to update
            var update = {
                'players': {},
                'enemies': {},
                'bullets': {}
            };

            // Add the players state to the update: (x, y, direction, hitPoints, color)
            self.forEachPlayer(function(player, id) {
                update.players[id] = player.getChangedState();
            });

            // Add all the enemy states to the update: (x, y, direction, hitPoints, color)
            self.forEachEnemy(function(enemy, id) {
                update.enemies[id] = enemy.getChangedState();
            })

            // Add all the bullet states to the update: (gun{player{id, x, y, size}, damage, bulletSpeed}, direction)
            self.forEachBullet(function(bullet, id) {
                update.bullets[id] = bullet.getChangedState();
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
