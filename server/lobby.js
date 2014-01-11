var UUID = require('node-uuid');

var Lobby = function(client) {
    this.clients = [];
    this.full = false; // Whether or not the lobby is full
    this.size = 5; // The maximum number of people in a lobby
    this.id = UUID();


    if (client) {
        this.clients.push(client);
    };
};

Lobby.prototype.join = function(client) {
    this.clients.push(client.id);
    if (this.clients.length === this.size) {
        this.full = true;
    };
};

lobbies = [];

module.exports = {
    join: function(client) {
        var found = false;
        for (var i = lobbies.length - 1; i >= 0;) {
            if (!lobbies[i].full) {
                lobbies[i].join(client);
                found = true;
            };
        };
        if (!found) {
            this.create(client);
        };
    },

    create: function(client) {
        lobbies.push(new Lobby(client));
    }
};
