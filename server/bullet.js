var Class = require('./class'),
    UUID = require('node-uuid');

var Bullet = Class.extend({
    init: function(gun, direction) {
        this.id = UUID();

        this.gun = gun;
        this.speed = this.gun.bulletSpeed;
        this.direction = direction ? direction : this.gun.player.direction;

        this.direction += gun.accuracy * 0.001 * (2 * Math.random() - 1);

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
                    'direction': this.direction,
                    'size': this.gun.player.size
                },
                'damage': this.gun.damage,
                'bulletSpeed': this.speed
            }
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
        var game = this.gun.player.lobby.game,
            self = this;

        if (this.x1 < 0 || this.x1 > game.width || this.y1 < 0 || this.y1 > game.height) {
            game.removeBullet(this);
            return;
        }

        // m is the slope of the line, m2 is opposite reciprocal, or the slope of the perpendicular line
        var m = (this.y2 - this.y1) / (this.x2 - this.x1),
            m2 = -1 / m,
            intersection = [];

        game.forEachEnemy(function(enemy, id) {
            // The x and y intersect of the line and enemy
            intersection[0] = ((enemy.x * -m2) + (self.x1 * m) + enemy.y - self.y1) / (m - m2);
            intersection[1] = m * intersection[0] - (m * self.x1) + self.y1;

            var distanceFromBulletLine = Math.sqrt(Math.pow((enemy.x - intersection[0]), 2) + Math.pow((enemy.y - intersection[1]), 2)),
                isIntersectionOnBullet = self.x2 > self.prevX ? intersection[0] > self.prevX && intersection[0] < self.x2 : intersection[0] < self.prevX && intersection[0] > self.x2;

            if (isIntersectionOnBullet && distanceFromBulletLine <= enemy.size && enemy.healthGone() < 1) {
                enemy.hit(self.gun.damage);

                // Update stats
                if (enemy.damageLeft >= 0) {
                    self.gun.player.stats.score += Math.round((enemy.speed / 70) * self.gun.damage);
                    self.gun.player.lifeScore += Math.round((enemy.speed / 70) * self.gun.damage);
                    self.gun.player.stats.damage += self.gun.damage;
                }

                if (enemy.hitPoints <= 0) {
                    self.gun.player.stats.kills++;
                    console.log(self.gun.player.name, "killed an enemy. Score: ", self.gun.player.stats.score);
                }

                game.removeBullet(self);
                return true;
            }
        });

        this.prevX = this.x1;
        this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
        this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
        this.x2 = this.x1 - 10 * Math.cos(this.direction);
        this.y2 = this.y1 - 10 * Math.sin(this.direction);
    }
});

module.exports = Bullet;
