/*
 * crosshairs.js - this is what replaces the mouse on the canvas
 * and determines where the player is facing/firing at
 */

Crosshairs = Class.extend({
    init: function(player) {
        this.player = player;

        this.x = this.player.x;
        this.y = this.player.y;

        this.size = 13;

        this.distFromPlayer = 0;
        this.distFromMouse = 0;
        this.mouseDistFromPlayer = 0;

        this.angleWithPlayer = this.player.direction; // The angle relative to the player
        this.mouseAngleWithPlayer = this.player.direction; // The mouses angel relative to the player

        this.kickCounter = 0;

        var cursor = document.getElementById('cursor') || document.createElement('img');
        cursor.src = 'img/crosshairs.png';
        cursor.id = 'cursor';
        cursor.ondragstart = (function() {
            return false;
        });
        cursor.draggable = false;
        document.getElementsByTagName('body')[0].appendChild(cursor);

        this.cursor = cursor;
    },
    draw: function(context, scale) {
        if (this.player.hitPoints > 0) {
            var x = this.x * scale,
                y = this.y * scale,
                size = this.size * scale;

            // context.beginPath();
            // context.arc(x, y, size, 0, 2 * Math.PI, false);
            // context.lineWidth = 2 * this.scale;
            // context.strokeStyle = '#FE634D';
            // context.stroke();
            // context.closePath();

            this.cursor.width = (this.size + 3) * scale * 2;
            this.cursor.height = this.cursor.width;
        }
    },
    update: function(timeElapsed) {
        // The actual spot the player is firing at laggs behind the cursor a bit
        if (this.player.hitPoints > 0) {
            var mouseXDiff = Game.input.mouse.drawnX - this.x,
                mouseYDiff = Game.input.mouse.drawnY - this.y,
                playerXDiff = this.player.x - this.x,
                playerYDiff = this.player.y - this.y,
                mousePlayerXDiff = Game.input.mouse.drawnX - this.player.x,
                mousePlayerYDiff = Game.input.mouse.drawnY - this.player.y;

            this.distFromPlayer = Math.sqrt((playerXDiff * playerXDiff) + (playerYDiff * playerYDiff));
            this.distFromMouse = Math.sqrt((mouseXDiff * mouseXDiff) + (mouseYDiff * mouseYDiff));
            this.angleWithPlayer = this.player.direction - Math.PI;
            this.mouseAngleWithPlayer = Math.atan2((Game.input.mouse.drawnY - this.player.y), (Game.input.mouse.drawnX - this.player.x));
            this.mouseDistFromPlayer = Math.sqrt((mousePlayerXDiff * mousePlayerXDiff) + (mousePlayerYDiff * mousePlayerYDiff));

            if (this.angleWithPlayer > Math.PI / 2 || this.angleWithPlayer < Math.PI / -2) {
                if (this.angleWithPlayer / this.mouseAngleWithPlayer < 0 && this.angleWithPlayer > 0) {
                    this.angleWithPlayer -= Math.PI * 2;
                } else if (this.angleWithPlayer / this.mouseAngleWithPlayer < 0 && this.angleWithPlayer < 0) {
                    this.angleWithPlayer += Math.PI * 2;
                }
            }

            this.angleWithPlayer += (this.mouseAngleWithPlayer - this.angleWithPlayer) / this.player.mobility;
            this.distFromPlayer += (this.mouseDistFromPlayer - this.distFromPlayer) / this.player.mobility;

            for (var i = this.kickCounter - 1; i >= 0; i--) {
                this.angleWithPlayer += (Math.random() * 2 * Math.PI - Math.PI) * this.player.gun.kick / 100;
            }

            this.kickCounter = 0;

            this.x = this.player.x + this.distFromPlayer * Math.cos(this.angleWithPlayer);
            this.y = this.player.y + this.distFromPlayer * Math.sin(this.angleWithPlayer);
        }
    }
});
