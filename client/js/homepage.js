window.onload = function() {
    var playButton = document.getElementById('play');
    playButton.onclick = setupGame;

    document.getElementById('createLobby').onclick = function() {
        socket.emit('newLobby');
        document.getElementById('lobbies').classList.add('remove-display');

        startGame();
    };

    document.getElementById('joinLobby').onclick = function() {
        // Tell the  server we are ready to play the game (damn it, I lost the game)
        socket.emit('play');

        startGame();
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
    document.getElementsByTagName('html')[0].classList.add('playing');
}
