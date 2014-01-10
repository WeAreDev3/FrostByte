Character = function(specs) {
    this.type = specs.type;
    this.name = specs.name;
    this.hp = specs.hp;
    this.health = 100; // Percent
    this.size = specs.size;
    this.speed = specs.speed;
    this.mobility = specs.mobility;
    this.x = specs.x;
    this.y = specs.y;
    this.direction = specs.direction;
    this.gun = specs.gun;
    this.gun.character = this;
    this.color = specs.color;
};

Character.prototype.draw = function() {
    var namePositionX = this.x - (context.measureText(this.name).width / 2),
        namePositionY = this.y + (this.size * 2);

    // Draws Body
    context.fillStyle = this.color;

    if (this.type == 'player') {
        // Square
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.direction);
        context.fillRect(-1 * this.size, -1 * this.size, this.size * 2, this.size * 2);
        context.restore();
    } else {
        // Circle
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();

    }

    // Draws health
    context.fillStyle = '#000';
    context.fillText(this.health + '%', this.x - (context.measureText(this.health + '%').width / 2), this.y + 3);

    // Draws Name
    context.fillStyle = '#000';
    context.fillText(this.name, namePositionX, namePositionY);
};

Character.prototype.update = function(timeElapsed) {
    if (this.type === 'player') {
        if (input.w) { // Up (Press W)
            this.y -= this.speed * timeElapsed;
        }
        if (input.s) { // Down (Press S)
            this.y += this.speed * timeElapsed;
        }
        if (input.a) { // Left (Press A)
            this.x -= this.speed * timeElapsed;
        }
        if (input.d) { // Right (Press D)
            this.x += this.speed * timeElapsed;
        }

        this.direction = Math.atan2((crosshairs.y - this.y), (crosshairs.x - this.x)) + Math.PI;

        if (input.mouseDown) {
            this.gun.fire();
        }

        this.gun.timeSinceLastFire += timeElapsed;

        if (!input.mouseDown && this.gun.timeSinceLastFire >= this.gun.rate) {
            this.gun.timeSinceLastFire = this.gun.rate;
        }

        if (!input.mouseDown) {
            this.gun.wasFired = false;
        }

    } else {
        this.x += this.speed * Math.cos(this.direction) * timeElapsed;
        this.y += this.speed * Math.sin(this.direction) * timeElapsed;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.direction += Math.PI;
        }

        if (this.mobility < 0) {
            this.direction += Math.PI / this.mobility * timeElapsed;
        }

        this.color = 'rgb(' + parseInt(255 * (this.health * 2) / 200) + ',' + parseInt(255 * (100 - this.health * 2) / 200) + ',' + parseInt(255 * (100 - this.health * 2) / 200) + ')';
    }
};
