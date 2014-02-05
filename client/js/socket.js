socket = io.connect();
socket.on('connect', function() {
    console.log('Connected successfully as', socket.socket.sessionid);
});

socket.on('lobbyList', function(lobbies) {
    var lobbyTable = document.getElementById('lobbies').querySelector('table'),
        count = 0,
        tr,
        td;

    for (lobby in lobbies) {
        if (lobbies.hasOwnProperty(lobby)) {
            if (lobbyTable.innerText.indexOf(lobby) === -1) {
                // Add a new lobby to the table
                tr = document.createElement('tr');

                td = document.createElement('td');
                td.innerText = lobby;
                tr.appendChild(td);

                td = document.createElement('td');
                td.innerText = lobbies[lobby].playerCount;

                tr.onclick = function(event) {
                    var self = event.target,
                        siblings = self.parentNode.childNodes;

                    for (var i = siblings.length - 1; i >= 0; i--) {
                        siblings[i].classList.remove('selected');
                    }

                    self.classList.add('selected');
                };

                tr.appendChild(td);

                lobbyTable.querySelector('tbody').appendChild(tr);
            } else {
                // Update the lobby size
                lobbyTable.querySelectorAll('tbody tr')[count].querySelector('td:last-of-type').innerText = lobbies[lobby].playerCount;
            }

            count++;
        }
    }

    lobbyTable.parentElement.classList.remove('remove-display');
});

socket.on('joinedLobby', function(data) {
    console.log('Joined the lobby:', data.id);

    // If player reconnects, don't start another game
    if (typeof Game === 'undefined') {
        Game = new GameClass(data.width, data.height);
        console.log('New Game:', Game);

        Game.currentPlayer = new Player(socket.socket.sessionid, username);
        Game.currentPlayer.crosshairs = new Crosshairs(Game.currentPlayer);
        Game.addPlayer(Game.currentPlayer);

        Game.start();
    } else {
        Game.currentPlayer = new Player(socket.socket.sessionid, username);
        Game.currentPlayer.crosshairs = new Crosshairs(Game.currentPlayer);
        Game.addPlayer(Game.currentPlayer);
    }
});

socket.on('update', function(update) {
    var playerID,
        enemyID,
        bulletID;

    // For every player in the update
    for (playerID in update.players) {
        // Check if they are new
        if (!Game.players[playerID]) {
            Game.addPlayer(new Player(playerID, update.players[playerID].name));
            console.log('Player added:', Game.players[playerID]);
        }

        // Apply the change
        Game.players[playerID].setState(update.players[playerID]);
    }

    // Check if any players left
    Game.forEachPlayer(function(player, id) {
        if (!(id in update.players)) {
            console.log('Player left:', id);
            delete Game.players[id];
        }
    });

    // For each enemy in the update
    for (enemyID in update.enemies) {
        // Check if they are new
        if (!Game.enemies[enemyID]) {
            Game.addEnemy(new Enemy(enemyID, update.enemies[enemyID]));
        }

        // Apply the change
        Game.enemies[enemyID].setState(update.enemies[enemyID])
    }

    // Check if any enemies died
    Game.forEachEnemy(function(enemy, id) {
        if (!(id in update.enemies)) {
            // console.log('Enemy died:', id);
            delete Game.enemies[id];
        }
    });

    // For each bullet in the update
    for (bulletID in update.bullets) {
        // Check if it is new
        if (!Game.bullets[bulletID]) {
            Game.addBullet(new Bullet(update.bullets[bulletID].gun, bulletID));
        }

        // Apply the change
        Game.bullets[bulletID].setState(update.bullets[bulletID]);
    }

    // Check if any bullets dissapeared
    Game.forEachBullet(function(bullet, id) {
        if (!(id in update.bullets)) {
            // console.log(id !== 'undefined' ? 'Server' : 'Client', 'bullet dissapeared' + (id !== 'undefined' ? ': ' + id : ''));
            delete Game.bullets[id];
        }
    });
});
