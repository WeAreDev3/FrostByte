var Entity = require('./entity');

var Character = Entity.extend({
    init: function(id, type, x, y) {
        this._super(id, type, x, y);
    },
    setSize: function(size) {
        this.size = size;
    },
    setSpeed: function(speed) {
        this.speed = speed;
    },
    setMobility: function(mobility) {
        this.mobility = mobility;
    },
    setDirection: function(direction) {
        this.direction = direction;
    },
    setColor: function(color) {
        this.color = color;
    },
    setHitPoints: function(maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
        this.hitPoints = this.maxHitPoints;
    },
    health: function(hitPoints) {
        if (hitPoints !== undefined) {
            this.hitPoints = hitPoints;
        }
        return this.hitPoints / this.maxHitPoints;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.hitPoints <= 0) {
            this.kill();
        }
    },
    kill: function() {
        this.hitPoints = 0;
        this.setSpeed(0);
        this.setMobility(0);
    },
    getState: function() {
        return {
            'x': this.x,
            'y': this.y,
            'direction': this.direction,
            'size': this.size,
            'color': this.color
        };
    },
    update: function(timeElapsed) {

    }
});

// var Gun = require('./gun'),
//     Game = require('./game');

// var Character = function(client) {
//     if (client) {
//         this.client = client;
//         this.type = 'player';
//         this.name = client.id;
//         this.hp = 100;
//         this.health = 100; // Percent
//         this.size = 12;
//         this.speed = 100;
//         this.mobility = 10;
//         this.x = client.x;
//         this.y = client.y;
//         this.direction = client.direction;
//         this.gun = new Gun('full-auto');
//         this.gun.character = this;
//         this.color = '#4D90FE';
//         this.transparency = 1;

//         this.moveChanges = [];
//     } else {
//         this.type = 'enemy';
//         this.hp = 100;
//         this.health = 100; // Percent
//         this.size = 10;
//         this.speed = 100;
//         this.mobility = 10;
//         this.x = Math.random() * 1600;
//         this.y = Math.random() * 1000;
//         this.direction = Math.random() * Math.PI * 2;
//         this.color = 'rbg(255, 0, 0)';
//         this.transparency = 1;
//     }
// };

// Character.prototype.update = function(timeElapsed) {
//     var damageDone = 100 - this.health;

//     if (this.type === 'player') {
//         this.gun.timeSinceLastFire += timeElapsed;

//         for (var i = this.moveChanges.length - 1; i >= 0; i--) {
//             switch (this.moveChanges[i]) {
//                 // If the client sent 'u' (up)
//                 case 'u':
//                     // Move the player up
//                     this.y -= this.speed * timeElapsed;
//                     break;
//                     // If the client sent 'd' (down)
//                 case 'd':
//                     // Move the player down
//                     this.y += this.speed * timeElapsed;
//                     break;
//                     // If the client sent 'l' (left)
//                 case 'l':
//                     // Move the player left
//                     this.x -= this.speed * timeElapsed;
//                     break;
//                     // If the client sent 'r' (right)
//                 case 'r':
//                     // Move the player right
//                     this.x += this.speed * timeElapsed;
//                     break;
//             }
//         }
//         this.moveChanges = [];
//     } else {
//         this.x += this.speed * Math.cos(this.direction) * timeElapsed;
//         this.y += this.speed * Math.sin(this.direction) * timeElapsed;

//         if (this.x < 0 || this.x > Game.width || this.y < 0 || this.y > Game.height) {
//             this.direction += Math.PI;
//         }

//         // if (this.mobility < 0) {
//         //     this.direction += Math.PI / this.mobility * timeElapsed;
//         // }

//         this.color = 'rgba(' + parseInt(255 - (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + parseInt(0 + (damageDone * 1.28)) + ',' + this.transparency + ')';

//         if (this.health <= 0) {
//             this.transparency -= timeElapsed * 2;
//         }
//     }
// };

// Character.prototype.hit = function(damage) {
//     this.health -= damage;

//     if (this.health <= 0) {
//         this.kill();
//     }
// };

// Character.prototype.kill = function() {
//     this.health = 0;
//     this.speed = 0;
//     this.mobility = 0;
// };

module.exports = Character;
