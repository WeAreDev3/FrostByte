var Class = require('./class'), // John Resig's Class Inheritance
    Bullet = require('./bullet'), // The Bullet class
    Enemy = require('./enemy'), // The Enemy class
    Utils = require('./utils'); // Utils, to keep code DRY

var Game = Class.extend({
    init: function() {
        // Set the game's aspect ratio to 16:10
        this.width = 1600; // = 16 * 100
        this.height = 1000; // = 10 * 100

        // Initialize all of the necessary objects
        this.players = {};
        this.enemies = {};
        this.bullets = {};
        this.forceUpdate = true;

        // Define any needed variables
        this.level = 1;
        this.prevLevel = 1;
        this.spawningEnemies = 0;
        this.nextLevel();

        // Let the games... begin!
        this.start();
    },
    // Add a new bullet to the game
    addBullet: function(bullet) {
        this.bullets[bullet.id] = bullet;
    },
    // Remove the specified bullet from the game
    removeBullet: function(bullet) {
        delete this.bullets[bullet.id];
    },
    // Add a new enemy to the game
    addEnemy: function(enemy) {
        this.enemies[enemy.id] = enemy;
    },
    // Increment the level and update the players
    nextLevel: function() {
        console.log('\nLevel:', this.level);

        // Reset the round score and the health for each player
        this.forEachPlayer(function(player, id) {
            player.resetHitPoints();
            player.resetRoundScore();
            console.log(player.name, 'has done', Utils.formatNumber(player.stats.damage), 'damage.');
            console.log(player.name, 'has killed', Utils.formatNumber(player.stats.kills), player.stats.kills !== 1 ? 'enemies.' : 'enemy.');
            console.log(player.name, 'has died', Utils.formatNumber(player.stats.deaths), player.stats.deaths !== 1 ? 'times.' : 'time.');
            console.log(player.name, 'has ', Utils.formatNumber(player.stats.score), 'points.');
        });

        // Make more enemies this time
        this.spawningEnemies = 8 * this.level;
        // Keep a record of the spawn time
        this.spawnTime = Date.now();
        // Increment the level variable (finally)
        this.level++;
    },
    // Remove the specified enemy from the game
    removeEnemy: function(enemy) {
        delete this.enemies[enemy.id];
    },
    // Spawn a fresh enemy
    spawnEnemy: function() {
        // Initialize the location variables
        var location = {
            'x': 0,
            'y': 0
        };

        // Pick a random side of the screen to invade from
        switch (Utils.randomInt(4)) {
            case 0: // Start from the top
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

        // Create the new enemy object and simultaneously add it to the object of enemies
        this.addEnemy(new Enemy(location.x, location.y, this.level, this));
        // Decrement the number of remaining enemies to spawn
        this.spawningEnemies--;

        // Record the latest spawn time
        this.spawnTime = Date.now();
    },
    // Allows callback to be called on all players at once
    forEachPlayer: function(callback) {
        for (var playerID in this.players) {
            if (this.players.hasOwnProperty(playerID)) {
                if (callback(this.players[playerID], playerID) === true) {
                    break;
                }
            }
        }
    },
    // Allows callback to be called on all enemies at once
    forEachEnemy: function(callback) {
        for (var enemyID in this.enemies) {
            if (this.enemies.hasOwnProperty(enemyID)) {
                if (callback(this.enemies[enemyID], enemyID) === true) {
                    break;
                }
            }
        }
    },
    // Allows callback to be called on all bullets at once
    forEachBullet: function(callback) {
        for (var bulletID in this.bullets) {
            if (this.bullets.hasOwnProperty(bulletID)) {
                if (callback(this.bullets[bulletID], bulletID) === true) {
                    break;
                }
            }
        }
    },
    // Begin the game
    start: function() {
        var lastFrame = Date.now(), // Initialize the game loop
            count = 0, // Initialize the interval counter
            self = this; // Capture the game object for usage below

        // Update the physics of the game

        function physUpdate(timeElapsed) {
            // Update each player
            self.forEachPlayer(function(player, id) {
                player.update(timeElapsed);
            });

            // Update each enemy
            self.forEachEnemy(function(enemy, id) {
                enemy.update(timeElapsed);
            });

            // Update each bullet
            self.forEachBullet(function(bullet, id) {
                bullet.update(timeElapsed);
            });

            // Spawn all of the enemies with 500ms spawn intervals
            if (self.spawningEnemies > 0) {
                if (Date.now() - self.spawnTime > 500) {
                    self.spawnEnemy();
                }
            } else {
                // If all enemies are gone, start the next level
                if (!Object.keys(self.enemies).length) {
                    self.nextLevel();
                }
            }
        }

        // Serve the updated game to the clients
        function serveUpdate() {
            // The object containing the information the clients use to update
            var update = {
                'players': {},
                'enemies': {},
                'bullets': {},
                'game': {}
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

            // If the level changed, send that
            if (self.prevLevel !== self.level || self.forceUpdate) {
                update.game.level =  self.level - 1;
                self.prevLevel = self.level;

                self.forceUpdate = false;
            }

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
            if (count % 1 == 0) {

                // Update the physics of the game
                physUpdate(timeElapsed);

                // Every 3 intervals (45ms),
                if (count % 3 == 0) {
                    count = 0;
                    // Serve the update to the clients
                    serveUpdate();
                };
            }
            lastFrame = thisFrame;
            count++;
        }, 15);
    }
});

// Allow other modules to access the Game class
module.exports = Game;
