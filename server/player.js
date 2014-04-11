var Character = require('./character'),
    Gun = require('./gun');

var Player = Character.extend({
    init: function(socket, lobby) {
        this.socket = socket;
        this.lobby = lobby;

        this._super(this.socket.id, this.lobby.game.width / 2, this.lobby.game.height / 2);

        this.name = this.socket.name;

        // Input from client
        this.input = {
            'u': false, // Up
            'd': false, // Down
            'l': false, // Left
            'r': false, // Right
            'm': false // Mouse
        };

        this.baseColor = {
            'start': {
                'red': 77,
                'green': 144,
                'blue': 254
            },
            'delta': {
                'red': 77,
                'green': 144,
                'blue': 254
            }
        };

        this.isDead = false;

        this.resetHitPoints(100);
        this.setSize(12);
        this.setSpeed(100);
        this.setMobility(10);
        this.setDirection(0);
        this.updateColor();
        this.setGun('full-auto');

        this.lifeScore = 0;

        this.stats = {
            'score': 0,
            'damage': 0,
            'kills': 0,
            'deaths': 0
        };

        // Add the player onto the socket to be used elsewhere
        this.socket.player = this;
    },
    setGun: function(gun) {
        // Can pass in an actual Gun object or the type of gun
        if (gun instanceof Gun) {
            this.gun = gun;
        } else {
            this.gun = new Gun(this, gun);
        }
    },
    parseMessage: function(message) {
        var command = message[0],
            parameters = message.substring(1, message.length).split(',');

        // console.log(command, parameters);

        // Handle each command that we know
        switch (command) {
            case 'd': // Handle the 'd' command (Direction)
                this.setDirection(+parameters[0]);
                break;

            case 'i': // Handle the 'i' command (Input)
                switch (parameters[0]) {
                    case 'ut': // The Up/W key is pressed
                    case 'dt': // The Down/S key is pressed
                    case 'lt': // The Left/A key is pressed
                    case 'rt': // The Right/D key is pressed
                    case 'mt': // The Mouse is pressed
                        this.input[parameters[0][0]] = true;
                        break;

                    case 'uf': // The Up/W key is released
                    case 'df': // The Down/S key is released
                    case 'lf': // The Left/A key is released
                    case 'rf': // The Right/D key is released
                    case 'mf': // The Mouse is released
                        this.input[parameters[0][0]] = false;
                        break;
                }
                // console.log('i', parameters, this.input);
                break;
        }

    },
    hit: function(damage) {
        this.hitPoints -= damage;
        console.log(this.name, 'got hit:', this.hitPoints);

        if (this.hitPoints <= 0) {
            this.kill();
        }
    },
    kill: function() {
        // this.lobby.removePlayer(this);
        console.log('Booted!!!');
    },
    getChangedState: function() {
        var currentState = {
            'x': this.x,
            'y': this.y,
            'direction': this.direction,
            'maxHitPoints': this.maxHitPoints,
            'hitPoints': this.hitPoints,
            'color': this.color,
            'name': this.name,
            'stats': {
                'score': this.stats.score,
                'kills': this.stats.kills
            }
        },
            changes = {};

        if (!this.forceUpdate) {
            for (var item in currentState) {
                if (currentState.hasOwnProperty(item)) {
                    if (item === 'stats') {
                        for (var stat in currentState[item]) {
                            if (currentState[item].hasOwnProperty(stat)) {
                                if (typeof this.previousState[item] === 'undefined' || currentState[item][stat] !== this.previousState[item][stat]) {
                                    if (typeof changes.stats === 'undefined') {
                                        changes.stats = {};
                                        // console.log('added stat', stat, currentState[item][stat]);
                                    }

                                    changes.stats[stat] = currentState[item][stat];
                                }
                            }
                        }
                    } else if (currentState[item] !== this.previousState[item]) {
                        changes[item] = currentState[item];
                    }
                }
            }
        } else {
            changes = currentState;
            this.forceUpdate = false;
        }

        this.previousState = currentState;
        return changes;
    },
    update: function(timeElapsed) {
        if (this.hitPoints > 0) {
            // Move the player if needed
            if (this.input.u) { // Up
                this.y -= this.speed * timeElapsed;
            }
            if (this.input.d) { // Down
                this.y += this.speed * timeElapsed;
            }
            if (this.input.l) { // Left
                this.x -= this.speed * timeElapsed;
            }
            if (this.input.r) { // Right
                this.x += this.speed * timeElapsed;
            }

            // Make sure the player doesn't go off the screen
            if (this.x < 0) {
                this.setPosition(0, this.y);
            }
            if (this.x > this.lobby.game.width) {
                this.setPosition(this.lobby.game.width, this.y);
            }
            if (this.y < 0) {
                this.setPosition(this.x, 0);
            }
            if (this.y > this.lobby.game.height) {
                this.setPosition(this.x, this.lobby.game.height);
            }

            // Handle the gun firing
            if (this.input.m) {
                this.gun.fire();
            }

            this.gun.timeSinceLastFire += timeElapsed;

            if (!this.input.m && this.gun.timeSinceLastFire > this.gun.rate) {
                this.gun.timeSinceLastFire = this.gun.rate;
            }

            if (!this.input.m && this.gun.wasFired) {
                this.gun.wasFired = false;
            }
        } else if (!this.isDead) {
            this.stats.deaths++;
            this.isDead = true;
            this.stats.score -= deathPenalty(this.lifeScore);
            this.lifeScore;
            console.log(this.name + " died! Score: " + this.stats.score);
        }
    }
});

function deathPenalty (score) {
    return score / 2;
}

module.exports = Player;
