var Class = require('./class');

var Character = Class.extend({
    init: function(id, x, y) {
        this.id = id;
        this.setPosition(x, y);

        this.previousState = {};
        this.forceUpdate = false;
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
    updateColor: function() {
        var healthGone = this.healthGone();

        // Transition the color based on health
        this.setColor(parseInt(this.baseColor.start.red + (healthGone * this.baseColor.delta.red)),
            parseInt(this.baseColor.start.green + (healthGone * this.baseColor.delta.green)),
            parseInt(this.baseColor.start.blue + (healthGone * this.baseColor.delta.blue)));
    },
    resetRoundScore: function() {
        this.lifeScore = 0;
        console.log('round score reset');
    },
    resetHitPoints: function(maxHitPoints) {
        if (maxHitPoints !== undefined) {
            this.maxHitPoints = maxHitPoints;
        }

        if (this.isDead !== undefined) {
            this.isDead = false;
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

        this.updateColor();
    },
    healthGone: function() {
        return 1 - (this.hitPoints / this.maxHitPoints);
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
            'color': this.color,
            'name': this.name
        },
            changes = {};

        if (!this.forceUpdate) {
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

        this.previousState = currentState;
        return changes;
    },
    update: function(timeElapsed) {}
});

module.exports = Character;
