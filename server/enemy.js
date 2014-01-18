var Character = require('./character');

var Enemy = Character.extend({
    init: function(id, level, x, y, direction) {
        this._super(id, 'enemy', x, y);

        this.setHitPoints(70 + (level * 5));
        this.setSize(10);
        this.setSpeed(5);
        this.setMobility(10);
        this.setDirection(direction);
        this.setColor('#FF0000');

        // console.log(direction);
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.hitPoints <= 0) {
            this.kill();
        } else {
            var inflicted = 1 - this.health()
            this.setColor('rgb(' + parseInt(255 - (inflicted * 128)) + ',' + parseInt(0 + (inflicted * 128)) + ',' + parseInt(0 + (inflicted * 128)) + ')');
        }
    },
    update: function(timeElapsed) {
        this.x += this.speed * Math.cos(this.direction) * timeElapsed;
        this.y += this.speed * Math.sin(this.direction) * timeElapsed;

        // if (this.x < 0 || this.x > 1600 || this.y < 0 || this.y > 1000) {
        //     this.direction += Math.PI;
        // }
    }
});

module.exports = Enemy;
