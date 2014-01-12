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
    this.game.addChar(client);

    client.emit('joinedGame', {
        id: this.id
    });

    console.log('Client ' + client.id + ' added to lobby ' + this.id + '.');

    if (this.clients.length === this.size) {
        this.full = true;
    };
};

Lobby.prototype.onMessage = function(client, message) {
    var command = message[0],
        parameters = message.substring(1, message.length).split('');

    // console.log('command:', command, 'parameters:', parameters);

    switch (command) {
        case 'i': // input
            for (var i = this.game.players.length - 1; i >= 0; i--) {
                console.log(this.game.players[i].name, client.id);
                if (this.game.players[i].name === client.id) {
                    console.log(this.game.players[i].x, this.game.players[i].y);
                    for (var j = parameters.length - 1; j >= 0; j--) {
                        switch (parameters[i]) {
                            case 'u':
                                this.game.players[i].y -= this.game.players[i].speed * 0.016666667;
                                break;
                            case 'd':
                                this.game.players[i].y += this.game.players[i].speed * 0.016666667;
                                break;
                            case 'l':
                                this.game.players[i].x -= this.game.players[i].speed * 0.016666667;
                                break;
                            case 'r':
                                this.game.players[i].x += this.game.players[i].speed * 0.016666667;
                                break;
                        }
                    }
                    console.log(this.game.players[i].x, this.game.players[i].y);
                }
            }
            break;
    }
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
    },

    findPlayer: function(client) {
        for (var i = lobbies.length - 1; i >= 0; i--) {
            if (lobbies[i].clients.indexOf(client.id) !== -1) {
                return lobbies[i];
            }
        }

        return null;
    }
};
