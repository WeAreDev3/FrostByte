var Character = require('./character'),
    UUID = require('node-uuid');

var Enemy = Character.extend({
    init: function(x, y, level, game) {
        this._super(UUID(), x, y);

        this.game = game;

        this.resetHitPoints(70 + (level * Math.random() * 20));
        this.damageLeft = this.hitPoints; // Used for scoring purposes

        this.baseColor = {
            'start': {
                'red': 255,
                'green': 60,
                'blue': 0
            },
            'delta': {
                'red': -189,
                'green': 145,
                'blue': 255
            }
        };

        this.setSize(10);
        this.setSpeed(50 + (level * Math.random() * 10));
        this.setMobility(10);
        this.setDirection(0);
        this.updateColor();
        this.damage = 5;

        this.alpha = 1;
    },
    hit: function(damage) {
        this.hitPoints -= damage;
        this.damageLeft -= damage;

        if (this.hitPoints < 0) {
            this.hitPoints = 0;
        }

        if (this.damageLeft < 0) {
            this.damageLeft = -1;
        }

        this.updateColor();
    },
    update: function(timeElapsed) {
        // If alive...
        if (this.hitPoints > 0) {
            var self = this,
                nearestPlayer,
                closestDistance,
                offScreen = false,
                players = [];

            // Create an array of all the players to loop through them with Array.reduce()
            this.game.forEachPlayer(function(player, id) {
                if (player.hitPoints > 0) {
                    players.push(player);
                }
            });

            // Go through all the players and check who is the closest so this enemy can follow them
            if (players.length) {
                nearestPlayer = players.reduce(function(prevPlayer, currPlayer) {
                    var currDistance = Math.sqrt(Math.pow(currPlayer.x - self.x, 2) + Math.pow(currPlayer.y - self.y, 2));
                    if (closestDistance === undefined) {
                        closestDistance = Math.sqrt(Math.pow(prevPlayer.x - self.x, 2) + Math.pow(prevPlayer.y - self.y, 2));
                    }
                    // console.log(closestDistance, currDistance);
                    if (closestDistance > currDistance) {
                        closestDistance = currDistance;
                        return currPlayer;
                    }

                    return prevPlayer;
                });

                this.setDirection(+Math.atan2((nearestPlayer.y - this.y), (nearestPlayer.x - this.x).toFixed(3)));

                // If there is only one player closestDistance wouldn't be defined yet
                if (closestDistance === undefined) {
                    closestDistance = Math.sqrt(Math.pow(nearestPlayer.x - this.x, 2) + Math.pow(nearestPlayer.y - this.y, 2));
                }

                // If enemy is touching the nearest player, hit the player and kill this enemy
                if (closestDistance <= (this.size + nearestPlayer.size)) {
                    nearestPlayer.hit(this.damage);

                    this.hit(this.hitPoints);
                }
            }

            this.setPosition(this.x + this.speed * Math.cos(this.direction) * timeElapsed, this.y + this.speed * Math.sin(this.direction) * timeElapsed);

            // Make sure the enemy can't off the screen
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
