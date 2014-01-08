Bullet = function(gun, speed, direction) {
    this.gun = gun;
    this.speed = speed;
    this.direction = direction;
    this.x = this.gun.character.x - (5 + this.gun.character.size) * Math.cos(this.direction);
    this.y = this.gun.character.y - (5 + this.gun.character.size) * Math.sin(this.direction);

    bullets.push(this);
};

Bullet.prototype.draw = function() {
    context.beginPath();
    context.moveTo(this.x, this.y);

    context.lineTo(this.x - (1.5 * this.gun.character.size) * Math.cos(this.direction),
        this.y - (1.5 * this.gun.character.size) * Math.sin(this.direction));

    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.stroke();
    context.closePath();
};

Bullet.prototype.update = function(timeElapsed) {
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        bullets.splice(bullets.indexOf(this), 1);
        return;
    }

    for (var i = 0, len = enemies.length; i < len; i++) {
        if (Math.sqrt(Math.pow((enemies[i].x - this.x), 2) + Math.pow((enemies[i].y - this.y), 2)) <= enemies[i].size) {
            enemies[i].health -= this.gun.damage;
            if (enemies[i].health <= 0) {
                enemies[i].health = 0;
                enemies[i].speed = 0;
                enemies[i].mobility = 0;
            }

            bullets.splice(bullets.indexOf(this), 1);
            return;
        }
    }

    this.x -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
    this.y -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
};
