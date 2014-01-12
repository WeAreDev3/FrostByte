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
    });

    socket.on('joinedGame', function(data) {
        console.log('Joined the lobby:' + data.id);
        player.id = data.id;
    });

    socket.on('update', function(data) {
        // console.log(data.u);
        for (var userID in data.u) {
            // console.log(userID);
            if (data.hasOwnProperty(userID) && userID !== player.id) {
                console.log('new player:', data[userID]);
                if (!otherPlayers[userID]) {
                    console.log('new new player');
                    otherPlayers[userID] = new Character(otherPlayersStates);
                }

                otherPlayers[userID].x = data[userID].x;
                otherPlayers[userID].y = data[userID].y;
            }
        }
    });