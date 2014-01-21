var otherPlayersStates = {
    'type': 'player',
    'name': 'others',
    'hp': 100,
    'size': 12,
    'speed': 100,
    'mobility': 10,
    'x': 200,
    'y': 200,
    'direction': Math.PI / 2,
    'gun': new Gun('full-auto'),
    'color': '#90EE4D'
},
    enemySpecs = {
        'type': 'enemy',
        'name': null,
        'hp': 50,
        'size': 10,
        'speed': 55,
        'mobility': 10,
        'x': null,
        'y': null,
        'direction': 0,
        'gun': null,
        'color': 'rbg(255,0,0)'
    };

socket = io.connect();
socket.on('connect', function() {
    console.log('Connected successfully as', socket.socket.sessionid);
});

socket.on('joinedLobby', function(data) {
    console.log('Joined the lobby:', data.id);

    // If player reconnects, don't start another game
    if (typeof player === 'undefined') {
        startGame();
    }

    player.id = socket.socket.sessionid;
});

socket.on('update', function(data) {
    // console.log(data);
    for (var playerId in data.players) {
        if (data.players.hasOwnProperty(playerId)) {
            if (playerId !== player.id) {
                if (!otherPlayers[playerId]) {
                    otherPlayers[playerId] = new Character(otherPlayersStates);
                    otherPlayers[playerId].name = playerId;
                    console.log('New player:', otherPlayers[playerId]);
                }

                otherPlayers[playerId].setState(data.players[playerId]);
            } else {
                player.setState(data.players[playerId]);
            }
        }
    }

    for (playerId in otherPlayers) {
        if (otherPlayers.hasOwnProperty(playerId) && !(playerId in data.players)) {
            console.log('User deleted:', playerId);
            delete otherPlayers[playerId];
        }
    }

    enemies = [];

    for (var i = data.enemies.length - 1, newEnemy; i >= 0; i--) {
        enemySpecs.name = i;
        enemySpecs.gun = new Gun('full-auto');

        newEnemy = new Character(enemySpecs);
        newEnemy.setState(data.enemies[i]);

        enemies.push(newEnemy);
    }

    bullets = [];

    for (var i = data.bullets.length - 1; i >= 0; i--) {
        // if (data.bullets[i].playerId !== player.id) {
        // console.log(JSON.stringify(data.bullets[i]));

        new Bullet(data.bullets[i].gun, data.bullets[i].direction);
        // }
    }
});
