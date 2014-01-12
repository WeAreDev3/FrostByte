var UUID = require('node-uuid'),
    Game = require('./game');

var Lobby = function(client) {
    this.clients = [];
    this.full = false; // Whether or not the lobby is full
    this.size = 5; // The maximum number of people in a lobby
    this.id = UUID();
    this.game = new Game();
};

Lobby.prototype.join = function(client) {
    this.clients.push(client.id);
    this.game.addChar(client.id);
    client.emit('joinedGame', {
        id: this.id
    });

    console.log('Client ' + client.id + ' added to lobby ' + lobbies[i].id + '.');

    if (this.clients.length === this.size) {
        this.full = true;
    };
};

lobbies = [];

module.exports = {
    join: function(client) {
        var found = false;
        for (var i = lobbies.length - 1; i >= 0; i--) {
            if (!lobbies[i].full) {
                lobbies[i].join(client);
                found = true;
                break;
            };
        };

        if (!found) {
            this.create(client);
        };
    },

    create: function(client) {
        lobbies.push(new Lobby(client));
        this.join(client);
    }
};
