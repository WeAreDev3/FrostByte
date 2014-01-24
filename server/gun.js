var Class = require('./class'),
    Bullet = require('./bullet');

var Gun = Class.extend({
    init: function(player, type) {
        this.type = type;

        this.accuracy = this.types[type].accuracy;
        this.damage = this.types[type].damage;
        this.kick = this.types[type].kick;
        this.bulletSpeed = this.types[type].bulletSpeed;

        this.wasFired = false;
        this.rate = this.types[type].rate / 1000;
        this.timeSinceLastFire = 0;
        this.player = player;
    },
    types: {
        /*
          accuracy: Higher is WORSE
          damage: Higher is BETTER
          kick: Higher is WORSE
          bulletSpeed: Higher is BETTER
          rate: Higher is WORSE
        */
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
    },
    fire: function() {
        if (this.timeSinceLastFire >= this.rate) {
            this.timeSinceLastFire -= this.rate;

            switch (this.type) {
                case 'semi-auto':
                    if (!this.wasFired) {
                        this.wasFired = true;

                        this.player.lobby.game.addBullet(new Bullet(this));
                    }
                    break;
                case 'full-auto':
                    this.player.lobby.game.addBullet(new Bullet(this));
                    break;
                case 'shotgun':
                    if (!this.wasFired) {
                        this.wasFired = true;

                        for (var i = 0, n = 3, halfN = (n - 1) / 2; i < n; i++) {
                            this.player.lobby.game.addBullet(new Bullet(this, this.player.direction + (((i - halfN) / halfN) * this.player.gun.accuracy) / 100));
                        }
                    }
                    break;
            }
        }
    }
});

module.exports = Gun;
