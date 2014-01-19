var Class = require('./class');

var Character = Class.extend({
    init: function(id, x, y) {
        this.id = id;
        this.setPosition(x, y);
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
    setColor: function(color) {
        this.color = color;
    },
    setHitPoints: function(maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
        this.hitPoints = this.maxHitPoints;
    },
    health: function(hitPoints) {
        if (hitPoints !== undefined) {
            this.hitPoints = hitPoints;
        }
        return this.hitPoints / this.maxHitPoints;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.hitPoints <= 0) {
            this.kill();
        }
    },
    kill: function() {
        this.hitPoints = 0;
        this.setSpeed(0);
        this.setMobility(0);
    },
    getState: function() {
        return {
            'x': this.x,
            'y': this.y,
            'direction': this.direction
            /*,
            'size': this.size,
            'color': this.color*/
        };
    },
    update: function(timeElapsed) {}
});

module.exports = Character;
