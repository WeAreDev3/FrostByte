/*
  accuracy: Higher is WORSE
  damage: Higher is BETTER
  kick: Higher is WORSE
  bulletSpeed: Higher is BETTER
  rate: Higher is WORSE
*/
var types = {
    'semi-auto': {
        'accuracy': 5,
        'damage': 40, 
        'kick': 5,
        'bulletSpeed': 15,
        'rate': 140
    },
    'full-auto': {
        'accuracy': 8,
        'damage': 30, 
        'kick': 2,
        'bulletSpeed': 15,
        'rate': 100
    },
    'shotgun': {
        'accuracy': 13,
        'damage': 20, 
        'kick': 7,
        'bulletSpeed': 17,
        'rate': 220
    }
};

Gun = function(type) {
    this.type = type;
    this.accuracy = types[type].accuracy;
    this.damage = types[type].damage;
    this.kick = types[type].kick;
    this.bulletSpeed = types[type].bulletSpeed;
    this.wasFired = false;
    this.rate = types[type].rate / 1000;
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
                    for (var i = 0; i < 15; i++) {
                        new Bullet(this, this.bulletSpeed, this.character.direction + (Math.random() * 2 - 1) * this.character.gun.accuracy / 100);
                    }
                    crosshairs.kickCounter++;
                }
                break;
        }
    }
};
