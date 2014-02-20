Enemy = Character.extend({
    init: function(id, state) {
        this._super(id, state.x, state.y);

        this.resetHitPoints(state.maxHitPoints);
        this.setSize(10);
        this.setSpeed(50);
        this.setMobility(10);
        this.setDirection(0);
        this.setColor(255, 60, 0);

        this.lines = [];
        this.lineCounter = 0;

        this.alpha = 1;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.hitPoints > 0) {
            var healthRemaining = this.healthGone();
            this.setColor(parseInt(255 - (healthRemaining * 189)), parseInt(60 + (healthRemaining * 145)), parseInt(0 + (healthRemaining * 255)));
        }
    },
    draw: function(context, scale) {
        var x = this.x * scale,
            y = this.y * scale,
            size = this.size * scale;

        // Draws Body
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();

        // Draws death animation
        if (this.lines.length) {
            for (var i = this.lines.length - 1; i >= 0; i--) {
                line = this.lines[i];
                line.a = this.alpha;

                context.beginPath();
                context.moveTo(x + line.x * this.lineCounter * line.vel, y + line.y * this.lineCounter * line.vel);
                context.lineTo(x + line.x * this.lineCounter * line.vel * -1, y + line.y * this.lineCounter * line.vel * -1);
                context.lineWidth = line.width;
                context.strokeStyle = 'rgba(' + parseInt(line.r) + ', ' + parseInt(line.g) + ', ' + parseInt(line.b) + ', ' + parseFloat(line.a) + ')';
                context.stroke();
                context.closePath();
            }
        }

        if (this.hitPoints <= 0) {
            context.fillStyle = "rgba(" + (this.alpha > .6 ? 95 : 43) + ",149,238," + (this.alpha > .3 ? 1 : this.alpha + .3) + ")";
            context.beginPath();
            context.arc(x, y, size * (this.alpha > .7 ? .3 : (1 - this.alpha)), 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
        }

        if (this.lineCounter < 20) {
            this.lineCounter += 2;
        }
    },
    update: function(timeElapsed) {
        // If dead, add lines to show on death
        if (this.hitPoints <= 0) {
            if (this.alpha - timeElapsed * 2 >= 0) {
                this.alpha -= timeElapsed * 2;
            } else {
                this.alpha = 0;
            }

            if (!this.lines.length) {
                this.lineCounter = 0;

                for (var i = Math.random() * 5 + 7; i >= 0; i--) {
                    this.lines.push({
                        'x': Math.random() * 2 - 1,
                        'y': Math.random() * 2 - 1,
                        'vel': Math.random() / 1.5,
                        'width': Math.random() * 2 + 2,
                        'r': Math.random() * 50 + 55,
                        'g': Math.random() * 50 + 150,
                        'b': Math.random() * 50 + 205
                    });
                }
            }
        }
    }
});
