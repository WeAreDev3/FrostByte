/*
** bullet.js (server-side) defines the Bullet class,
** giving it the ability to update its stats and check
** for specific events that may occur, such as touching
** an enemy, allowing it to behave accordingly.
*/

var Class = require('./class'), // John Resig's Class Inheritance
    UUID = require('node-uuid'); // UUID functionality

// Define the Bullet class
var Bullet = Class.extend({

    // init will get called whenever a new bullet is created
    init: function(gun, direction) {
        // Give the bullet a unique ID
        this.id = UUID();

        // Map a gun to the bullet
        this.gun = gun;

        // Give the bullet a speed
        this.speed = this.gun.bulletSpeed;

        // Set the direction in which the bullet will travel
        this.direction = direction ? direction : this.gun.player.direction;

        // Give the bullet some directional inaccuracy, depending on the bullet accuracy
        this.direction += gun.accuracy * 0.001 * (2 * Math.random() - 1);

        // Define the initial position of the bullet (away from the player body, so it won't hit it)
        this.x1 = this.gun.player.x - (5 + this.gun.player.size) * Math.cos(this.direction);
        this.y1 = this.gun.player.y - (5 + this.gun.player.size) * Math.sin(this.direction);
        this.x2 = this.x1 - 10 * Math.cos(this.direction);
        this.y2 = this.y1 - 10 * Math.sin(this.direction);
        this.prevX = this.x1;

        // Instantiate a previousState object (will come in handy below)
        this.previousState = {};
    },
    getChangedState: function() {
        // Create an object denoting the current state of the bullet
        var currentState = {
            'gun': {
                'player': {
                    'id': this.gun.player.id,
                    'x': this.x1,
                    'y': this.y1,
                    'direction': this.direction,
                    'size': this.gun.player.size
                },
                'damage': this.gun.damage,
                'bulletSpeed': this.speed
            }
        },
            // Instantiate a changes object
            changes = {};

        // If the current state of each item in currentState matches the previous state, remove it
        for (var item in currentState) {
            if (currentState.hasOwnProperty(item)) {
                if (currentState[item] !== this.previousState[item]) {
                    changes[item] = currentState[item];
                }
            }
        }
        // changes should now only reflect differences between previousState and currentState

        // Set the previousState to the currentState
        this.previousState = currentState;

        // Return the changes to whatever asked for it
        return changes;
    },
    update: function(timeElapsed) {
        var game = this.gun.player.lobby.game,
            self = this;

        // If the bullet has gone off the screen, remove it from the game
        if (this.x1 < 0 || this.x1 > game.width || this.y1 < 0 || this.y1 > game.height) {
            game.removeBullet(this);
            return;
        }

        // m is the slope of the line, m2 is opposite reciprocal, or the slope of the perpendicular line
        var m = (this.y2 - this.y1) / (this.x2 - this.x1),
            m2 = -1 / m,
            intersection = [];

        // Find the first enemy to be touching the bullet, and damage them
        game.forEachEnemy(function(enemy, id) {
            // The x and y intersect of the line and enemy
            intersection[0] = ((enemy.x * -m2) + (self.x1 * m) + enemy.y - self.y1) / (m - m2);
            intersection[1] = m * intersection[0] - (m * self.x1) + self.y1;

            // Only check alive enemies, aka. not ones that are fading out
            if (enemy.healthGone() < 1) {

                // If the enemy intersects with the line
                if (self.x2 > self.prevX ? intersection[0] > self.prevX && intersection[0] < self.x2 : intersection[0] < self.prevX && intersection[0] > self.x2) {
                    var distanceFromBulletLine = Math.sqrt(Math.pow((enemy.x - intersection[0]), 2) + Math.pow((enemy.y - intersection[1]), 2));

                    // And is the correct distance from the line
                    if (distanceFromBulletLine <= enemy.size) {
                        enemy.hit(self.gun.damage);

                        // Update stats
                        if (enemy.damageLeft >= 0) {
                            self.gun.player.stats.score += Math.round((enemy.speed / 70) * self.gun.damage);
                            self.gun.player.lifeScore += Math.round((enemy.speed / 70) * self.gun.damage);
                            self.gun.player.stats.damage += self.gun.damage;
                        }

                        if (enemy.hitPoints <= 0) {
                            self.gun.player.stats.kills++;
                            // console.log(self.gun.player.name, "killed enemy #" + self.gun.player.stats.kills + ". Score: ", self.gun.player.stats.score);
                        }

                        // Destroy the bullet
                        game.removeBullet(self);
                        return true;
                    }
                }
            }
        });

        // If the bullet hasn't already been destroyed from the above conditions, update its stats
        this.prevX = this.x1;
        this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
        this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
        this.x2 = this.x1 - 10 * Math.cos(this.direction);
        this.y2 = this.y1 - 10 * Math.sin(this.direction);
    }
});

// Allow the Bullet class to be accessible by other modules
module.exports = Bullet;
