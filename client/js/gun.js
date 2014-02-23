Gun = Class.extend({
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
        'sniper': {
            'accuracy': 35,
            'damage': 150,
            'kick': 5,
            'bulletSpeed': 15,
            'rate': 500
        },
        'full-auto': {
            'accuracy': 55,
            'damage': 30,
            'kick': 2,
            'bulletSpeed': 15,
            'rate': 100
        },
        'shotgun': {
            'accuracy': 70,
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
                case 'sniper':
                    if (!this.wasFired) {
                        this.wasFired = true;

                        Game.addBullet(new Bullet(this));
                        this.player.crosshairs.kickCounter++;
                    }
                    break;
                case 'full-auto':
                    Game.addBullet(new Bullet(this));
                    this.player.crosshairs.kickCounter++;
                    break;
                case 'shotgun':
                    if (!this.wasFired) {
                        this.wasFired = true;

                        for (var i = 0, n = 5, halfN = (n - 1) / 2; i < n; i++) {
                            Game.addBullet(new Bullet(this, this.player.direction + ((i - halfN) / halfN) / 10));
                        }
                        this.player.crosshairs.kickCounter++;
                    }
                    break;
            }
        }
    }
});
