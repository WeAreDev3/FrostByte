window.onload = function() {
    var playButton = document.getElementById('play');
    playButton.onclick = setupGame;
};

function setupGame() {
    document.getElementById('intro').classList.add('playing');
    document.getElementById('frame').classList.add('playing');
    document.getElementsByTagName('html')[0].classList.add('playing');
    socket.emit('play');
}
