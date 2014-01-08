Gun = function(type, accuracy, damage, kick, bulletSpeed, rate) {
    this.type = type;
    this.accuracy = accuracy;
    this.damage = damage;
    this.kick = kick;
    this.bulletSpeed = bulletSpeed;
    this.wasFired = false;
    this.rate = rate / 1000;
    this.timeSinceLastFire = 0;
    this.character = null;
};

Gun.prototype.fire = function() {
    if (this.timeSinceLastFire >= this.rate) {
        this.timeSinceLastFire -= this.rate;

        switch (this.type) {
            case 'semi-auto':
                if (!this.wasFired) {
                    this.wasFired = true;
                    new Bullet(this, this.bulletSpeed, this.character.direction);
                    crosshairs.kickCounter++;
                }
                break;
            case 'full-auto':
                new Bullet(this, this.bulletSpeed, this.character.direction);
                crosshairs.kickCounter++;
                break;
            case 'shotgun':
                if (!this.wasFired) {
                    this.wasFired = true;
                    for (var i = 0; i < 5; i++) {
                        new Bullet(this, this.bulletSpeed, this.character.direction + (Math.random() * 2 - 1) * this.character.gun.accuracy / 100);
                    }
                    crosshairs.kickCounter++;
                }
                break;
        }
        // console.log(crosshairs.kickCounter);
    }
};
