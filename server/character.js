var Gun = require('./gun');

var Character = function(client) {
    this.client = client;
    this.type = 'player';
    this.name = client.id;
    this.hp = 100;
    this.health = 100; // Percent
    this.size = 12;
    this.speed = 100;
    this.mobility = 10;
    this.x = client.x;
    this.y = client.y;
    this.direction = client.direction;
    this.gun = new Gun('full-auto');
    this.gun.character = this;
    this.color = '#4D90FE';
    this.transparency = 1;

    this.moveChanges = [];
};

Character.prototype.update = function(timeElapsed) {
    var damageDone = 100 - this.health;

    if (this.type === 'player') {
        this.gun.timeSinceLastFire += timeElapsed;

        for (var i = this.moveChanges.length - 1; i >= 0; i--) {
            console.log(this.moveChanges[i]);
            switch (this.moveChanges[i]) {
                // If the client sent 'u' (up)
                case 'u':
                    // Move the player up
                    this.y -= this.speed * timeElapsed;
                    break;
                    // If the client sent 'd' (down)
                case 'd':
                    // Move the player down
                    this.y += this.speed * timeElapsed;
                    break;
                    // If the client sent 'l' (left)
                case 'l':
                    // Move the player left
                    this.x -= this.speed * timeElapsed;
                    break;
                    // If the client sent 'r' (right)
                case 'r':
                    // Move the player right
                    this.x += this.speed * timeElapsed;
                    break;
            }
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
