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
    'color': '#90FE4D'
};

socket = io.connect('/');
socket.on('onconnected', function(data) {
    console.log('Connected successfully to the socket.io server. My server-side ID is ' + data.id);
    player.id = data.id;

    // Send that we are ready to join
    socket.send('j' + player.x + ',' + player.y);
});

socket.on('joinedGame', function(data) {
    console.log('Joined the lobby:' + data.id);
});

socket.on('update', function(data) {
    // console.log(data);
    for (var userID in data.players) {
        if (data.players.hasOwnProperty(userID) && userID !== player.id) {
            if (!otherPlayers[userID]) {
                otherPlayers[userID] = new Character(otherPlayersStates);
                console.log('new player:', otherPlayers[userID]);
            }

            otherPlayers[userID].x = data.players[userID][0];
            otherPlayers[userID].y = data.players[userID][1];
            otherPlayers[userID].direction = data.players[userID][2];

            otherPlayers[userID].name = userID;
        }
    }

    for (userID in otherPlayers) {
        if (otherPlayers.hasOwnProperty(userID) && !(userID in data.players)) {
            console.log('user deleted:', userID);
            delete otherPlayers[userID];
        }
    }

    // socket.send('b' + this.gun.character.x + ',' + this.gun.character.y + ',' + this.gun.character.size + ',' + this.speed + ',' + this.direction);
    for (var i = data.bullets.length - 1; i >= 0; i--) {
        // console.log(data.bullets);
        new Bullet({
                'character': {
                    'x': data.bullets[i].x,
                    'y': data.bullets[i].y,
                    'size': data.bullets[i].size
                },
                'damage': data.bullets[i].damage
            },
            data.bullets[i].speed,
            data.bullets[i].direction
        );
    }
});
