window.onload = function() {
    var playButton = document.getElementById('play');
    playButton.onclick = setupGame;
};

function setupGame() {
    var usernameInput = document.getElementById('username');

    username = usernameInput.value.trim();

    if (username.length) {
        document.getElementById('intro').classList.add('playing');
        document.getElementById('frame').classList.add('playing');
        document.getElementsByTagName('html')[0].classList.add('playing');
        
        // Tell the  server we are ready to play the game (damn it, I lost the game)
        socket.emit('play', {
            name: username
        });
    } else {
        usernameInput.value = username;
        usernameInput.focus();
    }
}
