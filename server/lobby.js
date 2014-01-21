// Include all of the necessary node modules
var Class = require('./class'),
    Player = require('./player'),
    Game = require('./game'),
    UUID = require('node-uuid');

var Lobby = Class.extend({
    init: function(size) {
        this.id = UUID();
        this.size = size;
        this.full = false;

        this.clients = {};

        this.game = new Game();
    },
    addPlayer: function(socket) {
        socket.emit('joinedLobby', {
            id: this.id,
            width: this.game.width,
            height: this.game.height,
            level: this.game.level
        });

        this.clients[socket.id] = socket;
        this.game.players[socket.id] = new Player(socket, this);

        this.game.forEachPlayer(function(player, id) {
            player.forceUpdate = true;
        });

        this.game.forEachEnemy(function(enemy, id) {
            enemy.forceUpdate = true;
        });

        if (Object.keys(this.clients).length >= this.size) {
            this.full = true;
        }
    },
    removePlayer: function(socket) {
        delete this.clients[socket.id];
        delete this.game.players[socket.id];
    },
    remove: function(lobbies) {
        console.log('Lobby', this.id, 'deleted.');
        delete lobbies[this.id];
    }
});

module.exports = Lobby;
