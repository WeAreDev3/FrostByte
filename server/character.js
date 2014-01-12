var Gun = require('./gun');

var Character = function(client) {
    this.client = client;
    this.type = 'player';
    this.name = this.client.id;
    this.hp = 100;
    this.health = 100; // Percent
    this.size = 12;
    this.speed = 100;
    this.mobility = 10;
    this.x = client.x;
    this.y = client.y;
    this.direction = 0;
    this.gun = new Gun('full-auto');
    this.gun.character = this;
    this.color = '#4D90FE';
    this.transparency = 1;

};

Character.prototype.update = function(timeElapsed) {
    var damageDone = 100 - this.health;

    if (this.type === 'player') {
        this.gun.timeSinceLastFire += timeElapsed;
    } else {
        this.x += this.speed * Math.cos(this.direction) * timeElapsed;
        this.y += this.speed * Math.sin(this.direction) * timeElapsed;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.direction += Math.PI;
        }

        if (this.mobility < 0) {
            this.direction += Math.PI / this.mobility * timeElapsed;
        }

        this.color = 'rgba(' + parseInt(255 - (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + this.transparency + ')';

        if (this.health <= 0) {
            this.transparency -= timeElapsed * 2;
        }
        if (this.transparency <= 0) {
            enemies.splice(enemies.indexOf(this), 1);
        }
    }
};

Character.prototype.hit = function(damage) {
    this.health -= damage;

    if (this.health <= 0) {
        this.kill();
    }
};

Character.prototype.kill = function() {
    this.health = 0;
    this.speed = 0;
    this.mobility = 0;
};

module.exports = Character;
