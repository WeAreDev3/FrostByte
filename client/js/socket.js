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
    'gun': create(Gun, 'full-auto'),
    'color': '#90EE4D'
};

socket = io.connect();
socket.on('connect', function() {
    player.id = socket.socket.sessionid;

    console.log('Connected successfully as', player.id);

    // Send that we are ready to join
    socket.emit('play', {
        'x': player.x,
        'y': player.y,
        'direction': player.direction
    });
});

socket.on('joinedGame', function(data) {
    console.log('Joined the lobby:' + data.id);
});

socket.on('update', function(data) {
    // console.log(data);
    for (var playerId in data.players) {
        if (data.players.hasOwnProperty(playerId)) {
            if (playerId !== player.id) {
                if (!otherPlayers[playerId]) {
                    otherPlayers[playerId] = new Character(otherPlayersStates);
                    otherPlayers[playerId].name = playerId;
                    console.log('new player:', otherPlayers[playerId]);
                }

                otherPlayers[playerId].x = data.players[playerId].x;
                otherPlayers[playerId].y = data.players[playerId].y;
                otherPlayers[playerId].direction = data.players[playerId].direction;
            } else {
                player.setState(data.players[playerId]);
            }
        }
    }

    for (playerId in otherPlayers) {
        if (otherPlayers.hasOwnProperty(playerId) && !(playerId in data.players)) {
            console.log('user deleted:', playerId);
            delete otherPlayers[playerId];
        }
    }

    enemies = data.enemies;

    // socket.send('b' + this.gun.character.x + ',' + this.gun.character.y + ',' + this.gun.character.size + ',' + this.speed + ',' + this.direction);
    for (var i = data.bullets.length - 1; i >= 0; i--) {
        // console.log(data.bullets[i]);
        if (data.bullets[i].playerId !== player.id) {
            new Bullet({
                    'character': {
                        'x': data.bullets[i].gun.character.x,
                        'y': data.bullets[i].gun.character.y,
                        'size': data.bullets[i].gun.character.size
                    },
                    'damage': data.bullets[i].gun.damage
                },
                data.bullets[i].speed,
                data.bullets[i].direction
            );
        }
    }
});
