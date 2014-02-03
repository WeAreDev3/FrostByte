var Lobby = require('./lobby');

var Router = {
    findOpenLobby: function(lobbies) {
        // Search through all of the lobbies
        for (var lobby in lobbies) {
            // If a lobby is not full
            if (!lobbies[lobby].full) {
                // console.log('Found lobby:', lobbies[lobby]);
                return lobbies[lobby];
            }
        }

        lobby = this.createLobby(lobbies);
        lobbies[lobby.id] = lobby;

        return lobbies[lobby.id];
    },
    createLobby: function(lobbies) {
        return new Lobby(5);
    }
};

module.exports = Router;
