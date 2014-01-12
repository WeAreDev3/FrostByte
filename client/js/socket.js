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
    for (var userID in data) {
        if (data.hasOwnProperty(userID) && userID !== player.id) {
            if (!otherPlayers[userID]) {
                otherPlayers[userID] = new Character(otherPlayersStates);
                console.log('new player:', otherPlayers[userID]);
            }

            otherPlayers[userID].x = data[userID][0];
            otherPlayers[userID].y = data[userID][1];
        }
    }
});
