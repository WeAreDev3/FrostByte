Player = Character.extend({
    init: function(id, name) {
        this._super(id, Game.width / 2, Game.height / 2);

        this.name = name;

        this.resetHitPoints(100);
        this.setSize(12);
        this.setSpeed(100);
        this.setMobility(10);
        this.setDirection(0);
        this.setColor(77, 144, 254);
        this.setGun('full-auto');
    },
    setGun: function(gun) {
        // Can pass in an actual Gun object or the type of gun
        if (gun instanceof Gun) {
            this.gun = gun;
        } else {
            this.gun = new Gun(this, gun);
        }
    },
    draw: function(context, scale) {
        if (this.hitPoints > 0) {
            var x = this.x * scale,
                y = this.y * scale,
                size = this.size * scale;

            // Draws the body
            context.fillStyle = this.color;
            context.save();
            context.translate(x, y);
            context.rotate(this.direction);
            context.fillRect(-1 * size, -1 * size, size * 2, size * 2);
            context.restore();

            // Draws the name
            context.fillStyle = '#000000';
            context.font = 'normal ' + size + 'pt Roboto';

            var namePositionX = x - (context.measureText(this.name).width / 2),
                namePositionY = y + (size * 2);

            context.fillText(this.name, namePositionX, namePositionY);
        }
    },
    update: function(timeElapsed) {
        if (this.hitPoints > 0) {
            for (var input in Game.tmpInput) {
                if (Game.tmpInput.hasOwnProperty(input) && Game.tmpInput[input] !== Game.input[input]) {
                    Game.input[input] = Game.tmpInput[input];
                    // console.log('i' + input + (Game.input[input] + '')[0]);
                    socket.send('i' + input + (Game.input[input] + '')[0]);
                }
            }

            var currentDirection = this.direction;

            // Move the player if needed
            if (Game.input.u) { // Up
                this.y -= this.speed * timeElapsed;
            }
            if (Game.input.d) { // Down
                this.y += this.speed * timeElapsed;
            }
            if (Game.input.l) { // Left
                this.x -= this.speed * timeElapsed;
            }
            if (Game.input.r) { // Right
                this.x += this.speed * timeElapsed;
            }

            // Make sure the player doesn't go off the screen
            if (this.x < 0) {
                this.setPosition(0, this.y);
            }
            if (this.x > Game.width) {
                this.setPosition(Game.width, this.y);
            }
            if (this.y < 0) {
                this.setPosition(this.x, 0);
            }
            if (this.y > Game.height) {
                this.setPosition(this.x, Game.height);
            }

            // Number.toFixed() returns a string, so make sure to turn it back into a number
            this.direction = (Math.atan2((this.crosshairs.y - this.y), (this.crosshairs.x - this.x)) + Math.PI); //.toFixed(3);

            // If the player direction changes, send the new direction to the server
            if (currentDirection !== this.direction) {
                socket.send('d' + this.direction);
            }

            // Handle the gun firing
            if (Game.input.mouse.down) {
                this.gun.fire();
            }

            this.gun.timeSinceLastFire += timeElapsed;

            if (!Game.input.mouse.down && this.gun.timeSinceLastFire > this.gun.rate) {
                this.gun.timeSinceLastFire = this.gun.rate;
            }

            if (!Game.input.mouse.down && this.gun.wasFired) {
                this.gun.wasFired = false;
            }
        }
    }
});
