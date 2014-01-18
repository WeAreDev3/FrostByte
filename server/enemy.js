var Character = require('./character');

var Enemy = Character.extend({
    init: function(id, level, x, y, direction, game) {
        this._super(id, 'enemy', x, y);

        this.game = game;

        this.setHitPoints(70 + (level * 5));
        this.setSize(10);
        this.setSpeed(50);
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
        var nearestDist = 5000,
            nearestPlayer,
            players = this.game.players;

        // Maybe something like Array.sort()?
        for (var player in players) {
            if (players.hasOwnProperty(player)) {
                // console.log(players[player]);
                var dist = Math.sqrt(Math.pow(players[player].x - this.x, 2) + Math.pow(players[player].y - this.y, 2));
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestPlayer = players[player];
                };
            }
        }

        this.setDirection((Math.atan2((nearestPlayer.y - this.y), (nearestPlayer.x - this.x)) + Math.PI).toFixed(5));
        this.setPosition(this.x + this.speed * Math.cos(this.direction) * timeElapsed, this.y + this.speed * Math.sin(this.direction) * timeElapsed);

        // console.log(this.direction);

        // if (this.x < 0 || this.x > 1600 || this.y < 0 || this.y > 1000) {
        //     this.direction += Math.PI;
        // }
    }
});

module.exports = Enemy;
