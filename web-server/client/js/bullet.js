Bullet = Class.extend({
    init: function(gun, direction, id) {
        this.id = typeof direction === 'number' ? id : direction;

        this.gun = gun;
        this.speed = this.gun.bulletSpeed;
        this.direction = typeof direction === 'number' ? direction : this.gun.player.direction;
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
        };

        for (var item in currentState) {
            if (currentState.hasOwnProperty(item)) {
                if (currentState[item] !== this.previousState[item]) {
                    this.previousState = currentState;
                    return currentState;
                }
            }
        }

        return null;
    },
    setState: function(state) {
        for (var item in state) {
            this[item] = state[item];
        }
    },
    draw: function(context, scale) {
        var x1 = this.x1 * scale,
            x2 = this.x2 * scale,
            y1 = this.y1 * scale,
            y2 = this.y2 * scale;

        context.beginPath();

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        context.lineWidth = 1;
        context.strokeStyle = '#003b4e';
        context.stroke();

        context.closePath();
    },
    update: function(timeElapsed) {
        if (this.x1 < 0 || this.x1 > Game.width || this.y1 < 0 || this.y1 > Game.height) {
            Game.removeBullet(this);
            return;
        }

        // m is the slope of the line, m2 is opposite reciprocal, or the slope of the perpendicular line
        var m = (this.y2 - this.y1) / (this.x2 - this.x1),
            m2 = -1 / m,
            intersection = [];

        for (var i = 0, len = Game.enemies.length; i < len; i++) {
            // The x and y intersect of the line and enemy
            intersection[0] = ((Game.enemies[i].x * -m2) + (this.x1 * m) + Game.enemies[i].y - this.y1) / (m - m2);
            intersection[1] = m * intersection[0] - (m * this.x1) + this.y1;

            var distanceFromBulletLine = Math.sqrt(Math.pow((Game.enemies[i].x - intersection[0]), 2) + Math.pow((Game.enemies[i].y - intersection[1]), 2)),
                isIntersectionOnBullet = this.x2 > this.prevX ? intersection[0] > this.prevX && intersection[0] < this.x2 : intersection[0] < this.prevX && intersection[0] > this.x2;

            if (isIntersectionOnBullet && distanceFromBulletLine <= Game.enemies[i].size && Game.enemies[i].health() > 0) {
                Game.enemies[i].hit(this.gun.damage);
                Game.removeBullet(this);
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
