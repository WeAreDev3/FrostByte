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

        lobby = new Lobby(5);
        lobbies[lobby.id] = lobby;
        return lobbies[lobby.id];
    }
};

module.exports = Router;
