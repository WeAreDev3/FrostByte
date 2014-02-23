var Lobby = require('./lobby');

var Router = {
    findOpenLobby: function(lobbies) {
        var lobby;

        // Search through all of the lobbies
        for (lobby in lobbies) {
            // If a lobby is not full
            if (!lobbies[lobby].full) {
                // console.log('Found lobby:', lobbies[lobby]);
                return lobbies[lobby];
            }
        }

        lobby = this.createLobby(5);
        lobbies[lobby.id] = lobby;

        return lobbies[lobby.id];
    },
    createLobby: function(size) {
        return new Lobby(size);
    },
    findLobby: function(lobbies, lobbyId) {
        if (lobbyId in lobbies && !lobbies[lobbyId].full) {
            return lobbies[lobbyId];
        }
    }
};

module.exports = Router;
