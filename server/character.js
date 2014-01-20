var Class = require('./class');

var Character = Class.extend({
    init: function(id, x, y) {
        this.id = id;
        this.setPosition(x, y);

        this.previousState = {};
    },
    setSize: function(size) {
        this.size = size;
    },
    setSpeed: function(speed) {
        this.speed = speed;
    },
    setMobility: function(mobility) {
        this.mobility = mobility;
    },
    setDirection: function(direction) {
        this.direction = direction;
    },
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },
    setColor: function(r, g, b, a) {
        // Assuming giving Red and Green and Blue seperatly and optionaly Alpha
        a = a !== undefined ? a : '1';
        this.color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    },
    resetHitPoints: function(maxHitPoints) {
        if (maxHitPoints !== undefined) {
            this.maxHitPoints = maxHitPoints;
        }

        this.hitPoints = this.maxHitPoints;
    },
    setHitPoints: function(hitPoints) {
        if (hitPoints > this.maxHitPoints) {
            this.hitPoints = this.maxHitPoints;
        } else if (hitPoints < 0) {
            this.hitPoints = 0;
        } else {
            this.hitPoints = hitPoints;
        }
    },
    health: function() {
        return this.hitPoints / this.maxHitPoints;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.health() <= 0) {
            this.kill();
        }
    },
    kill: function() {
        this.setHitPoints(0);
        this.setSpeed(0);
        this.setMobility(0);
    },
    getChangedState: function() {
        var currentState = {
            'x': this.x,
            'y': this.y,
            'direction': this.direction,
            'maxHitPoints': this.maxHitPoints,
            'hitPoints': this.hitPoints,
            'color': this.color
        },
            changes = {};

        for (var item in currentState) {
            if (currentState.hasOwnProperty(item)) {
                if (currentState[item] !== this.previousState[item]) {
                    changes[item] = currentState[item];
                }
            }
        }
        
        this.previousState = currentState;
        return changes;
    },
    update: function(timeElapsed) {}
});

module.exports = Character;
