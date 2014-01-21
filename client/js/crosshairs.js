Crosshairs = function(x, y, character) {
    this.x = x;
    this.y = y;
    this.character = character;
    this.distFromPlayer = 0;
    this.distFromMouse = 0;
    this.angle = 0; // The angle that the crosshairs make (with the origin
    // being @ the player's location)
    this.mouseAngle = 0; // The angle that the mouse makes (with the origin
    // being @ the player's location)
    this.mouseDistFromPlayer = 0;
    this.kickCounter = 0;

    var curs = document.createElement('img');
    curs.src = 'img/crosshairs.png';
    curs.id = 'cursor';
    curs.ondragstart = (function(){return false});
    curs.draggable = false;
    document.getElementsByTagName('body')[0].appendChild(curs);

    cursor = document.getElementById('cursor');
};

Crosshairs.prototype.draw = function() {
    context.beginPath();
    context.arc(this.x, this.y, 13, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = '#FE634D';
    context.stroke();
    context.closePath();
};

Crosshairs.prototype.update = function(timeElapsed) {
    var mouseXDiff = input.mouse.x - this.x,
        mouseYDiff = input.mouse.y - this.y,
        playerXDiff = this.character.x - this.x,
        playerYDiff = this.character.y - this.y,
        mousePlayerXDiff = input.mouse.x - this.character.x,
        mousePlayerYDiff = input.mouse.y - this.character.y;

    this.distFromPlayer = Math.sqrt((playerXDiff * playerXDiff) + (playerYDiff * playerYDiff));
    this.distFromMouse = Math.sqrt((mouseXDiff * mouseXDiff) + (mouseYDiff * mouseYDiff));
    this.angle = this.character.direction - Math.PI;
    this.mouseAngle = Math.atan2((input.mouse.y - this.character.y), (input.mouse.x - this.character.x));
    this.mouseDistFromPlayer = Math.sqrt((mousePlayerXDiff * mousePlayerXDiff) + (mousePlayerYDiff * mousePlayerYDiff));

    if (this.angle > Math.PI / 2 || this.angle < Math.PI / -2) {
        if (this.angle / this.mouseAngle < 0 && this.angle > 0) {
            this.angle -= Math.PI * 2;
        } else if (this.angle / this.mouseAngle < 0 && this.angle < 0) {
            this.angle += Math.PI * 2;
        }
    }

    this.angle += (this.mouseAngle - this.angle) / this.character.mobility;
    this.distFromPlayer += (this.mouseDistFromPlayer - this.distFromPlayer) / this.character.mobility;

    for (var i = this.kickCounter - 1; i >= 0; i--) {
        this.angle += (Math.random() * 2 * Math.PI - Math.PI) * this.character.gun.kick / 100;
    }

    this.kickCounter = 0;

    this.x = this.character.x + this.distFromPlayer * Math.cos(this.angle);
    this.y = this.character.y + this.distFromPlayer * Math.sin(this.angle);
};
