var Character = require('./character');

var Game = function() {
    this.width = 1600;
    this.height = 1000;
    this.players = {};

    this.startLoop();
};

Game.prototype.addChar = function(client) {
    this.players[client.id] = new Character(client);
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
        var update = {};


        for (var player in self.players) {
            if (self.players.hasOwnProperty(player)) {
                update[player] = [];
                update[player].push(self.players[player].x);
                update[player].push(self.players[player].y);
            }
        }

        for (var player in self.players) {
            if (self.players.hasOwnProperty(player)) {
                self.players[player].client.emit('update', {
                    'u': update
                });
            }
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
