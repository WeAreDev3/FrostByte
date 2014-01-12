var Game = function() {
    this.width = 1600;
    this.height = 1000;

    startLoop();
};

Game.prototype.addChar = function(client) {
	chars.push(new Character);
};

chars = [];

function startLoop() {
    var lastFrame = 0,
        count = 0;

    window.setInterval(function() {
        var thisFrame = Date.now(),
            timeElapsed = (thisFrame - lastFrame) / 1000;

        physUpdate(timeElapsed);

        if (count % 3 == 0) {
            serveUpdate(timeElapsed);
        };

        lastFrame = thisFrame;
        count++;
    }, 15);
}

function physUpdate(timeElapsed) {
    //Update the physics

}

function serveUpdate(timeElapsed) {
    //Serve the update to the clients
}

module.exports = Game;
