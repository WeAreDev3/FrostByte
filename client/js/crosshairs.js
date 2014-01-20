Crosshairs = function(player) {
    this.player = player;

    this.x = this.player.x;
    this.y = this.player.y;
    this.size = 13;
    this.distFromPlayer = 0;
    this.distFromMouse = 0;
    this.angle = this.player.direction; // The angle that the crosshairs make (with the origin
    // being @ the player's location)
    this.mouseAngle = this.player.direction; // The angle that the mouse makes (with the origin
    // being @ the player's location)
    this.mouseDistFromPlayer = 0;
    this.kickCounter = 0;

    var curs = document.createElement('img');
    curs.src = 'img/crosshairs.png';
    curs.id = 'cursor';
    curs.ondragstart = (function() {
        return false
    });
    curs.draggable = false;
    document.getElementsByTagName('body')[0].appendChild(curs);

    cursor = document.getElementById('cursor');
};

Crosshairs.prototype.draw = function(context, scale) {
    var x = this.x * scale,
        y = this.y * scale,
        size = this.size * scale;
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = '#FE634D';
    context.stroke();
    context.closePath();

    cursor.width = (this.size + 3) * scale * 2;
    cursor.height = cursor.width;
};

Crosshairs.prototype.update = function(timeElapsed) {
    var mouseXDiff = Game.input.mouse.drawnX - this.x,
        mouseYDiff = Game.input.mouse.drawnY - this.y,
        playerXDiff = this.player.x - this.x,
        playerYDiff = this.player.y - this.y,
        mousePlayerXDiff = Game.input.mouse.drawnX - this.player.x,
        mousePlayerYDiff = Game.input.mouse.drawnY - this.player.y;

    this.distFromPlayer = Math.sqrt((playerXDiff * playerXDiff) + (playerYDiff * playerYDiff));
    this.distFromMouse = Math.sqrt((mouseXDiff * mouseXDiff) + (mouseYDiff * mouseYDiff));
    this.angle = this.player.direction - Math.PI;
    this.mouseAngle = Math.atan2((Game.input.mouse.drawnY - this.player.y), (Game.input.mouse.drawnX - this.player.x));
    this.mouseDistFromPlayer = Math.sqrt((mousePlayerXDiff * mousePlayerXDiff) + (mousePlayerYDiff * mousePlayerYDiff));

    if (this.angle > Math.PI / 2 || this.angle < Math.PI / -2) {
        if (this.angle / this.mouseAngle < 0 && this.angle > 0) {
            this.angle -= Math.PI * 2;
        } else if (this.angle / this.mouseAngle < 0 && this.angle < 0) {
            this.angle += Math.PI * 2;
        }
    }

    this.angle += (this.mouseAngle - this.angle) / this.player.mobility;
    this.distFromPlayer += (this.mouseDistFromPlayer - this.distFromPlayer) / this.player.mobility;

    for (var i = this.kickCounter - 1; i >= 0; i--) {
        this.angle += (Math.random() * 2 * Math.PI - Math.PI) * this.player.gun.kick / 100;
    }

    this.kickCounter = 0;

    this.x = this.player.x + this.distFromPlayer * Math.cos(this.angle);
    this.y = this.player.y + this.distFromPlayer * Math.sin(this.angle);
};
