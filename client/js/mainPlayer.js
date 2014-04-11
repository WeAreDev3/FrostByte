MainPlayer = Player.extend({
    init: function(id, name, hud) {
        this.hud = hud;
        this._super(id, name);

        this.crosshairs = new Crosshairs(this);
    },
    setScore: function(score) {
        this.stats.score = score;

        this.hud.setScore(score);
    },
    setKills: function(kills) {
        this.stats.kills = kills;

        this.hud.setKills(kills);
    },
    resetHitPoints: function(maxHitPoints) {
        if (maxHitPoints !== undefined) {
            this.maxHitPoints = maxHitPoints;
        }

        this.hitPoints = this.maxHitPoints;

        this.hud.setHealth(this.hitPoints, this.maxHitPoints);
    },
    setHitPoints: function(hitPoints) {
        if (hitPoints > this.maxHitPoints) {
            this.hitPoints = this.maxHitPoints;
        } else if (hitPoints < 0) {
            this.hitPoints = 0;
        } else {
            this.hitPoints = hitPoints;
        }

        this.hud.setHealth(this.hitPoints);
    },
});
