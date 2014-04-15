window.onload = function() {
    var playButton = document.getElementById('play');
    playButton.onclick = setupGame;

    document.getElementById('createLobby').onclick = function() {
        socket.emit('newLobby');
    };

    document.getElementById('joinLobby').onclick = function() {
        var lobbyId = document.getElementById('lobbies').querySelector('tr.selected td').innerText;

        if (lobbyId) {
            document.getElementById('lobbies').classList.add('remove-display');

            // Tell the  server we are ready to play the game (I lost the game)
            socket.emit('play', {
                lobbyId: lobbyId
            });

            startGame();
        }
    };
};

function setupGame() {
    var usernameInput = document.getElementById('username');

    username = usernameInput.value.trim();

    if (username.length) {
        document.getElementById('signIn').classList.add('remove-display');

        socket.emit('signIn', {
            name: username
        });
    } else {
        usernameInput.value = username;
        usernameInput.focus();
    }
}

function startGame() {
    document.getElementById('intro').classList.add('playing');
    document.getElementById('frame').classList.add('playing');
    document.querySelector('html').classList.add('playing');
    document.querySelector('header').classList.add('playing');
}
