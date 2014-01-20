socket = io.connect();
socket.on('connect', function() {
    console.log('Connected successfully as', socket.socket.sessionid);
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
            delete Game.players[id];
            console.log('Player left:', id);
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
            delete Game.enemies[id];
            console.log('Enemy died:', id);
        }
    });

    // For each bullet in the update
    for (bulletID in update.bullets) {
        // Check if it is new
        if (!Game.bullets[bulletID]) {
            Game.addBullet(new Bullet(bulletID, update.bullets[bulletID]));
        }

        // Apply the change
        Game.bullets[bulletID].setState(update.bullets[bulletID]);
    }

    // Check if any bullets dissapeared
    Game.forEachBullet(function(bullet, id) {
        if (!(id in update.bullets)) {
            delete Game.bullets[id];
            console.log('Bullet dissapeared:', id);
        }
    });
});
