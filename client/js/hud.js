Hud = Class.extend({
    init: function(hud) {

        this.hud = hud;
        this.playerHealth = document.getElementById('player-health').childNodes[0];
        this.maxPlayerHealth = document.getElementById('max-player-health');
        this.healthMeter = document.getElementById('health-meter');
        this.score = document.getElementById('player-score');
        this.kills = document.getElementById('player-kills');
    },
    setHealth: function(hitPoints, maxHitPoints) {
        if (maxHitPoints !== undefined) {
            this.healthMeter.max = maxHitPoints;
            this.healthMeter.low = maxHitPoints * 0.3;
            this.maxPlayerHealth.textContent = maxHitPoints;
        }

        this.healthMeter.value = hitPoints;
        this.playerHealth.nodeValue = hitPoints;
    },
    setScore: function(score) {
        this.score.textContent = score;
    },
    setKills: function(kills) {
        this.kills.textContent = kills;
    }
});