Enemy = Character.extend({
    init: function(id, state) {
        this._super(id, state.x, state.y);

        this.resetHitPoints(state.maxHitPoints);
        this.setSize(10);
        this.setSpeed(50);
        this.setMobility(10);
        this.setDirection(0);
        this.setColor(255, 45, 0);

        this.alpha = 1;
        this.killAnimation = 3;
    },
    hit: function(damage) {
        this.hitPoints -= damage;

        if (this.health() > 0) {
            var inflicted = 1 - this.health();
            this.setColor(parseInt(255 - (inflicted * 189)), parseInt(60 + (inflicted * 145)), parseInt(0 + (inflicted * 255)));
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
        if (this.health() <= 0) {
            console.log(this.killAnimation);
            context.fillStyle = "rgba(43,149,238," + (this.alpha>.7?1:this.alpha+.3) + ")";
            context.beginPath();
            context.arc(x, y, this.killAnimation * scale, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
            this.killAnimation += .3 * scale;
        };
    },
    update: function(timeElapsed) {
        // If alive...
        if (this.health() > 0) {
            var self = this,
                nearestPlayer,
                prevDistance,
                offScreen = false,
                players = [];

            // Create an array of all the players to loop through them with Array.reduce()
            Game.forEachPlayer(function(player, id) {
                players.push(player);
            });

            // Go through all the players and check who is the closest
            if (players.length) {
                nearestPlayer = players.reduce(function(prevPlayer, currPlayer) {
                    var currDistance = Math.sqrt(Math.pow(currPlayer.x - self.x, 2) + Math.pow(currPlayer.y - self.y, 2));
                    if (prevDistance === undefined) {
                        prevDistance = Math.sqrt(Math.pow(prevPlayer.x - self.x, 2) + Math.pow(prevPlayer.y - self.y, 2));
                    }
                    // console.log(prevDistance, currDistance);
                    if (prevDistance > currDistance) {
                        prevDistance = currDistance;
                        return currPlayer;
                    }

                    return prevPlayer;
                });

                this.setDirection(+Math.atan2((nearestPlayer.y - this.y), (nearestPlayer.x - this.x).toFixed(3)));
            }

            this.setPosition(this.x + this.speed * Math.cos(this.direction) * timeElapsed, this.y + this.speed * Math.sin(this.direction) * timeElapsed);

            if (this.x < 0) {
                this.setPosition(0, this.y);
                offScreen = true;
            }
            if (this.x > Game.width) {
                this.setPosition(Game.width, this.y);
                offScreen = true;
            }
            if (this.y < 0) {
                this.setPosition(this.x, 0);
                offScreen = true;
            }
            if (this.y > Game.height) {
                this.setPosition(this.x, Game.height);
                offScreen = true;
            }

            if (offScreen) {
                this.setDirection(this.direction + Math.PI);
            }
        } else {
            // If dead, fade out
            var rgb = this.color.match(/^rgba\((\d+),(\d+),(\d+)/i),
                dead = true;

            this.setColor(rgb[1], rgb[2], rgb[3], this.alpha);

            this.alpha -= timeElapsed * 2;

            if (this.alpha <= 0) {
                Game.removeEnemy(this);
            }
        }
    }
});
