var Character = require('./character'),
    UUID = require('node-uuid');

var Enemy = Character.extend({
    init: function(x, y, level, game) {
        this._super(UUID(), x, y);

        this.game = game;

        this.resetHitPoints(70 + (level * Math.random() * 20));
        this.setSize(10);
        this.setSpeed(50 + (level * Math.random() * 10));
        this.setMobility(10);
        this.setDirection(0);
        this.setColor(255, 45, 0);

        this.alpha = 1;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.health() > 0) {
            var inflicted = 1 - this.health();
            this.setColor(parseInt(255 - (inflicted * 189)), parseInt(60 + (inflicted * 145)), parseInt(0 + (inflicted * 255)));
        }
    },
    update: function(timeElapsed) {
        // If alive...
        if (this.health() > 0) {
            var self = this,
                nearestPlayer,
                prevDistance,
                offScreen = false,
                players = [];

            // Create an array of all the players to loop through them with Array.reduce()
            this.game.forEachPlayer(function(player, id) {
                players.push(player);
            });

            // Go through all the players and check who is the closest
            if (players.length) {
                nearestPlayer = players.reduce(function(prevPlayer, currPlayer) {
                    var currDistance = Math.sqrt(Math.pow(currPlayer.x - self.x, 2) + Math.pow(currPlayer.y - self.y, 2));
                    if (prevDistance === undefined) {
                        prevDistance = Math.sqrt(Math.pow(prevPlayer.x - self.x, 2) + Math.pow(prevPlayer.y - self.y, 2));
                    }
                    // console.log(prevDistance, currDistance);
                    if (prevDistance > currDistance) {
                        prevDistance = currDistance;
                        return currPlayer;
                    }

                    return prevPlayer;
                });

                this.setDirection(+Math.atan2((nearestPlayer.y - this.y), (nearestPlayer.x - this.x).toFixed(3)));
            }

            this.setPosition(this.x + this.speed * Math.cos(this.direction) * timeElapsed, this.y + this.speed * Math.sin(this.direction) * timeElapsed);

            if (this.x < 0) {
                this.setPosition(0, this.y);
                offScreen = true;
            }
            if (this.x > this.game.width) {
                this.setPosition(this.game.width, this.y);
                offScreen = true;
            }
            if (this.y < 0) {
                this.setPosition(this.x, 0);
                offScreen = true;
            }
            if (this.y > this.game.height) {
                this.setPosition(this.x, this.game.height);
                offScreen = true;
            }

            if (offScreen) {
                this.setDirection(this.direction + Math.PI);
            }
        } else {
            // If dead, fade out
            var rgb = this.color.match(/^rgba\((\d+),(\d+),(\d+)/i);

            this.setColor(rgb[1], rgb[2], rgb[3], this.alpha);

            this.alpha -= timeElapsed * 2;

            if (this.alpha <= 0) {
                this.game.removeEnemy(this);
            }
        }
    }
});

module.exports = Enemy;
