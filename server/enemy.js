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
        var nearestPlayer,
            offScreen = false,
            players = [];

        // Create an array of all the players to loop through them with Array.reduce()
        for (var player in this.game.players) {
            if (this.game.players.hasOwnProperty(player)) {
                players.push(this.game.players[player]);
            }
        }

        // Go through all the players and check who is the closest
        if (players.length) {
            nearestPlayer = players.reduce(function(prevPlayer, currPlayer) {
                var prevDistance = Math.sqrt(Math.pow(prevPlayer.x - this.x, 2) + Math.pow(prevPlayer.y - this.y, 2)),
                    currDistance = Math.sqrt(Math.pow(currPlayer.x - this.x, 2) + Math.pow(currPlayer.y - this.y, 2));
                // console.log(prevDistance, currDistance);
                if (prevDistance > currDistance) {
                    return currPlayer;
                }

                return prevPlayer;
            });
        }

        if (nearestPlayer) {
            this.setDirection(Math.atan2((nearestPlayer.y - this.y), (nearestPlayer.x - this.x)).toFixed(3));

        }

        this.setPosition(this.x + this.speed * Math.cos(this.direction) * timeElapsed, this.y + this.speed * Math.sin(this.direction) * timeElapsed);

        if (this.x < 0) {
            this.setPosition(0, this.y);
            offScreen = true;
        } else if (this.x > this.game.width) {
            this.setPosition(this.game.width, this.y);
            offScreen = true;
        } else if (this.y < 0) {
            this.setPosition(this.x, 0);
            offScreen = true;
        } else if (this.y > this.game.height) {
            this.setPosition(this.x, this.game.height);
            offScreen = true;
        }

        if (offScreen) {
            this.setDirection(this.direction + Math.PI);
            // console.log(this.direction);
        }
    }
});

module.exports = Enemy;
