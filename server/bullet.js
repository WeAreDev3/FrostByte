var Class = require('./class');

var Bullet = Class.extend({
    init: function(gun, direction) {
        this.gun = gun;
        this.speed = this.gun.bulletSpeed;
        this.direction = direction ? direction : this.gun.player.direction;
        this.x1 = this.gun.player.x - (5 + this.gun.player.size) * Math.cos(this.direction);
        this.y1 = this.gun.player.y - (5 + this.gun.player.size) * Math.sin(this.direction);
        this.x2 = this.x1 - 10 * Math.cos(this.direction);
        this.y2 = this.y1 - 10 * Math.sin(this.direction);
        this.prevX = this.x1;

        this.previousState = {};
    },
    getChangedState: function() {
        var currentState = {
            'gun': {
                'player': {
                    'id': this.gun.player.id,
                    'x': this.x1,
                    'y': this.y1,
                    'size': this.gun.player.size
                },
                'damage': this.gun.damage,
                'bulletSpeed': this.speed
            },
            'direction': this.direction
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
    update: function(timeElapsed) {
        var game = this.gun.player.lobby.game;

        if (this.x1 < 0 || this.x1 > game.width || this.y1 < 0 || this.y1 > game.height) {
            game.removeBullet(this);
            return;
        }

        // m is the slope of the line, m2 is opposite reciprocal, or the slope of the perpendicular line
        var m = (this.y2 - this.y1) / (this.x2 - this.x1),
            m2 = -1 / m,
            intersection = [];

        for (var i = 0, len = game.enemies.length; i < len; i++) {
            // The x and y intersect of the line and enemy
            intersection[0] = ((game.enemies[i].x * -m2) + (this.x1 * m) + game.enemies[i].y - this.y1) / (m - m2);
            intersection[1] = m * intersection[0] - (m * this.x1) + this.y1;

            var distanceFromBulletLine = Math.sqrt(Math.pow((game.enemies[i].x - intersection[0]), 2) + Math.pow((game.enemies[i].y - intersection[1]), 2)),
                isIntersectionOnBullet = this.x2 > this.prevX ? intersection[0] > this.prevX && intersection[0] < this.x2 : intersection[0] < this.prevX && intersection[0] > this.x2;

            if (isIntersectionOnBullet && distanceFromBulletLine <= game.enemies[i].size && game.enemies[i].health() > 0) {
                game.enemies[i].hit(this.gun.damage);
                game.removeBullet(this);
                return;
            }
        }

        this.prevX = this.x1;
        this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
        this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
        this.x2 = this.x1 - 10 * Math.cos(this.direction);
        this.y2 = this.y1 - 10 * Math.sin(this.direction);
    }
});

module.exports = Bullet;
