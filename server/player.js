var Character = require('./character'),
    Gun = require('./gun');

var Player = Character.extend({
    init: function(socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;

        var x = this.lobby.game.width / 2,
            y = this.lobby.game.height / 2;

        this._super(this.socket.id, x, y);

        this.setPosition(x, y);
        this.setHitPoints(100);
        this.setSize(12);
        this.setSpeed(100);
        this.setMobility(10);
        this.setDirection(0);
        this.setColor('#4D90FE');
        this.setGun(new Gun('full-auto', this));

        socket.player = this;

        // Input from client
        this.movements = [];
    },
    setGun: function(gun) {
        this.gun = gun;
    },
    addMovements: function(movements) {
        this.movements = this.movements.concat(movements);
    },
    parseMessage: function(message) {
        var command = message[0],
            parameters = message.substring(1, message.length).split(',');

        // console.log(command, parameters);

        // Handle each command that we know
        switch (command) {
            case 'm': // Handle the command m (move)
                this.addMovements(parameters);
                break;

            case 'd': // Handle the command d (direction)
                this.setDirection(parameters[0]);
                break;

            case 'f': // Handle the command f (fire)
                this.gun.fire();
                // console.log(this.lobby.game.bullets);
                break;
        }

    },
    update: function(timeElapsed) {
        for (var i = this.movements.length - 1; i >= 0; i--) {
            switch (this.movements[i]) {
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

        this.movements = [];
    }
});

module.exports = Player;
