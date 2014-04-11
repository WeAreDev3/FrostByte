/*
** character.js (server-side) defines the Character class,
** giving it the ability to update its stats and check
** for specific events that may occur, such as touching
** an enemy, allowing it to behave accordingly.
*/

var Class = require('./class'); // John Resig's Class Inheritance

var Character = Class.extend({
    // init will get called whenever a new Character is created
    init: function(id, x, y) {
        // Define its ID and position on the screen, as passed in when created
        this.id = id;
        this.setPosition(x, y);

        // Define a couple of variables that will come in handy for recording stuff
        this.previousState = {};
        this.forceUpdate = false;
    },

    // Give the character a different size
    setSize: function(size) {
        this.size = size;
    },

    // Give the character a different speed
    setSpeed: function(speed) {
        this.speed = speed;
    },

    // Give the character a different mobility (speed of rotation)
    setMobility: function(mobility) {
        this.mobility = mobility;
    },

    // Give the character a different direction
    setDirection: function(direction) {
        this.direction = direction;
    },

    // Redefine the position of the character
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },

    // Give the character a new color
    setColor: function(r, g, b, a) {
        // Assuming giving Red, Green and Blue seperately (and, optionally, Alpha)
        a = a !== undefined ? a : '1';
        this.color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    },

    // Update the character's color to reflect the health level
    updateColor: function() {
        var healthGone = this.healthGone();

        // Transition the color based on health
        this.setColor(parseInt(this.baseColor.start.red + (healthGone * this.baseColor.delta.red)),
            parseInt(this.baseColor.start.green + (healthGone * this.baseColor.delta.green)),
            parseInt(this.baseColor.start.blue + (healthGone * this.baseColor.delta.blue)));
    },

    // Set the character's score for the round back to 0
    resetRoundScore: function() {
        this.lifeScore = 0;
        console.log('Round score reset');
    },

    // Set the character's health back to 100%
    resetHitPoints: function(maxHitPoints) {
        if (maxHitPoints !== undefined) {
            this.maxHitPoints = maxHitPoints;
        }

        if (this.isDead !== undefined) {
            this.isDead = false;
        }

        this.hitPoints = this.maxHitPoints;
        this.updateColor();
    },

    // Set the character's health to the given value
    setHitPoints: function(hitPoints) {
        if (hitPoints > this.maxHitPoints) {
            this.hitPoints = this.maxHitPoints;
        } else if (hitPoints < 0) {
            this.hitPoints = 0;
        } else {
            this.hitPoints = hitPoints;
        }

        this.updateColor();
    },

    // Calculate the total number of hitpoints lost so far
    healthGone: function() {
        return 1 - (this.hitPoints / this.maxHitPoints);
    },

    // Handle being hit using the specified damage
    hit: function(damage) {
        this.setHitPoints(this.hitPoints - damage);

        // If the damage exceeds the remaining hitpoints, see ya!
        if (this.health() <= 0) {
            this.kill();
        }
    },

    // Kill the player
    kill: function() {
        this.setHitPoints(0);
        this.setSpeed(0);
        this.setMobility(0);
    },
    getChangedState: function() {
        // Create an object denoting the current state of the bullet
        var currentState = {
            'x': this.x,
            'y': this.y,
            'direction': this.direction,
            'maxHitPoints': this.maxHitPoints,
            'hitPoints': this.hitPoints,
            'color': this.color,
            'name': this.name
        },
            // Instantiate a changes object
            changes = {};

        if (!this.forceUpdate) {
            // If the current state of each item in currentState matches the previous state, remove it
            for (var item in currentState) {
                if (currentState.hasOwnProperty(item)) {
                    if (currentState[item] !== this.previousState[item]) {
                        changes[item] = currentState[item];
                    }
                }
            }
        } else {
            changes = currentState;
            this.forceUpdate = false;
        }
        // changes should now only reflect differences between previousState and currentState

        // Set the previousState to the currentState
        this.previousState = currentState;
        
        // Return the changes to whatever asked for it
        return changes;
    },
    update: function(timeElapsed) {}
});

module.exports = Character;
