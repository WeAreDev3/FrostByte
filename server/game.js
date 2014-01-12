var Character = require('./character');

var Game = function() {
    this.width = 1600;
    this.height = 1000;
    this.players = [];

    this.startLoop();
};

Game.prototype.addChar = function(client) {
    this.players.push(new Character(client));
};

Game.prototype.startLoop = function() {
    var lastFrame = 0,
        count = 0,
        self = this;

    function physUpdate(timeElapsed) {
        //Update the physics

    }

    function serveUpdate(timeElapsed) {
        //Serve the update to the clients
        for (var i = self.players.length - 1; i >= 0; i--) {
            // self.players[i].client.emit('update', {
            //     'players': self.players
            // });
        }
    }

    setInterval(function() {
        var thisFrame = Date.now(),
            timeElapsed = (thisFrame - lastFrame) / 1000;

        physUpdate(timeElapsed);

        if (count % 3 == 0) {
            count = 0;
            serveUpdate(timeElapsed);
        };

        lastFrame = thisFrame;
        count++;
    }, 15);
};

module.exports = Game;
