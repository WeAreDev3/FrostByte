var Character = require('./character');

var Player = Character.extend({
    init: function(id, x, y, direction, socket) {
        this._super(id, 'player', x, y);

        this.socket = socket;

        this.setHitPoints(100);
        this.setSize(12);
        this.setSpeed(100);
        this.setMobility(10);
        this.setDirection(direction);
        this.setColor('#4D90FE');
        // this.setGun(gun);

        // Input from clients
        this.movments = [];
    },
    setGun: function(gun) {
        this.gun = gun;
    },
    addInput: function(movments) {
        this.movments.concat(movments);
    },
    update: function(timeElapsed) {
        for (var i = this.movments.length - 1; i >= 0; i--) {
            switch (this.movments[i]) {
                case 'u': // If the client sent 'u' (up)
                    this.y -= this.speed * timeElapsed;
                    break;
                case 'd': // If the client sent 'd' (down)
                    this.y += this.speed * timeElapsed;
                    break;
                case 'l': // If the client sent 'l' (left)
                    this.x -= this.speed * timeElapsed;
                    break;
                case 'r': // If the client sent 'r' (right)
                    this.x += this.speed * timeElapsed;
                    break;
            }
        }

        this.movments = [];
    }
});

module.exports = Player;
