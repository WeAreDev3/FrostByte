window.onload = function() {
    var playButton = document.getElementById('play');
    playButton.onclick = setupGame;
};

function setupGame() {
    document.getElementById('intro').classList.add('playing');
    document.getElementById('frame').classList.add('playing');
    document.getElementsByTagName('html')[0].classList.add('playing');

    username = 'ME';
    // Tell the  server we are ready to play the game (damn it, I lost the game)
    socket.emit('play', {
        name: username
    });
}
