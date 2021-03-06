GameClass = Class.extend({
    init: function(width, height, level) {
        this.width = width;
        this.height = height;
        this.scale = 1;
        this.blurred = false;

        this.level = level;

        this.currentPlayer = {};
        this.players = {};
        this.enemies = {};
        this.bullets = {};
    },
    addPlayer: function(player) {
        this.players[player.id] = player;
    },
    removePlayer: function(player) {
        delete this.players[player.id];
    },
    addBullet: function(bullet) {
        this.bullets[bullet.id] = bullet;
    },
    removeBullet: function(bullet) {
        delete this.bullets[bullet.id];
    },
    addEnemy: function(enemy) {
        this.enemies[enemy.id] = enemy;
    },
    removeEnemy: function(enemy) {
        delete this.enemies[enemy.id];
    },
    spawnEnemies: function(number) {
        var location = {
            'x': 0,
            'y': 0
        };

        for (var i = 0; i < number; i++) {
            switch (Utils.randomInt(4)) {
                case 0: // Start at top
                    location.x = Utils.randomInt(this.width);
                    location.y = 0;
                    break;

                case 1: // Start from the right
                    location.x = this.width;
                    location.y = Utils.randomInt(this.height);
                    break;

                case 2: // Start at the bottom
                    location.x = Utils.randomInt(this.width);
                    location.y = this.height;
                    break;

                case 3: // Start from the left
                    location.x = 0;
                    location.y = Utils.randomInt(this.height);
                    break;
            }

            this.addEnemy(new Enemy(UUID(), location.x, location.y, this.level, this));
        }
    },
    nextLevel: function() {
        this.spawnEnemies(16 * ((this.level + 1) / 2));
        this.level++;
    },
    forEachPlayer: function(callback) {
        for (var playerID in this.players) {
            if (this.players.hasOwnProperty(playerID)) {
                callback(this.players[playerID], playerID);
            }
        }
    },
    forEachEnemy: function(callback) {
        for (var enemyID in this.enemies) {
            if (this.enemies.hasOwnProperty(enemyID)) {
                callback(this.enemies[enemyID], enemyID);
            }
        }
    },
    forEachBullet: function(callback) {
        for (var bulletID in this.bullets) {
            if (this.bullets.hasOwnProperty(bulletID)) {
                callback(this.bullets[bulletID], bulletID);
            }
        }

    },
    draw: function(context) {
        // Clear the screen first
        context.clearRect(0, 0, this.width * this.scale, this.height * this.scale);

        this.forEachEnemy(function(enemy, id) {
            enemy.draw(context, this.scale);
        }.bind(this));

        this.forEachPlayer(function(player, id) {
            if (player !== this.currentPlayer && player.hitPoints > 0) {
                player.draw(context, this.scale);
            }
        }.bind(this));

        // Draw the current player last so it is on top of the rest
        this.currentPlayer.draw(context, this.scale);

        this.forEachBullet(function(bullet, id) {
            bullet.draw(context, this.scale);
        }.bind(this));


        // Draw the crosshairs last so it is always on top
        this.currentPlayer.crosshairs.draw(context, this.scale);
    },
    update: function(timeElapsed) {
        this.currentPlayer.update(timeElapsed);

        this.forEachEnemy(function(enemy, id) {
            enemy.update(timeElapsed);
        });

        this.forEachBullet(function(bullet, id) {
            bullet.update(timeElapsed);
        });

        this.currentPlayer.crosshairs.update(timeElapsed);
    },
    start: function() {
        var lastFrame = Date.now(), // Initialize the game loop
            count = 0, // Initialize the interval counter
            self = this, // Capture the game object for usage below
            context = document.getElementById('frame').getContext('2d'); // The canvas context

        // Make sure the canvas size is all good
        this.resizeBrowser();

        // Some environment input variables, updated by the event handlers from above
        this.input = {
            'u': false, // Up
            'd': false, // Down
            'l': false, // Left
            'r': false, // Right
            'm': false, // Mouse down?
            'mouse': { // Mouse locations
                'x': 800,
                'y': 500,
                'drawnX': 800 * this.scale,
                'drawnY': 500 * this.scale
            }
        };

        this.tmpInput = { // Used to see if input actaully needs to be sent to the server
            'u': false,
            'd': false,
            'l': false,
            'r': false,
            'm': false
        };

        // Event handlers. Key up/down. Mouse up/down/move.
        window.onkeydown = this.keyDown.bind(this);
        window.onkeyup = this.keyUp.bind(this);
        window.onmousemove = this.mouseMove.bind(this);
        window.onmousedown = this.mouseDown.bind(this);
        window.onmouseup = this.mouseUp.bind(this);

        window.onblur = this.onBlur.bind(this);
        window.onfocus = this.onFocus.bind(this);

        //Resize the canvas every time the browser is resized
        window.onresize = this.resizeBrowser.bind(this);

        // Disable right-click
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        }, false);

        // We use a loop to keep the entire program synchronous
        (function startLoop() {
            var frameId = 0,
                lastFrame = Date.now(),
                count = 0;

            (function loop() {
                var thisFrame = Date.now(),
                    timeElapsed = (thisFrame - lastFrame) / 1000;

                frameId = window.requestAnimationFrame(loop);

                if (count % 1 === 0) {
                    count = 0;
                    self.update(timeElapsed);
                    self.draw(context);
                }

                lastFrame = thisFrame;
                count++;
            })();
        })();
    },
    resizeBrowser: function() {
        // Resize the game to be as big as possible while maintaining the proper aspect ratio
        var width = window.innerWidth,
            height = window.innerHeight,
            canvas = document.getElementById('frame');

        if (width / height >= 1.6) {
            canvas.height = height;
            width = height * 1.6;
            canvas.width = width;
        } else {
            canvas.width = width;
            height = width / 1.6;
            canvas.height = height;
        }

        leftOff = canvas.offsetLeft;
        topOff = canvas.offsetTop;

        this.scale = height / 1000;
    },
    keyDown: function(event) {
        if (!this.blurred) {
            switch (event.keyCode) {
                case 87: // w
                case 38: // up arrow
                    if (!this.tmpInput.u) { // Only update if we have to
                        this.tmpInput.u = true;
                    }
                    break;
                case 83: // s
                case 40: // down arrow
                    if (!this.tmpInput.d) { // Only update if we have to
                        this.tmpInput.d = true;
                    }
                    break;
                case 65: // a
                case 37: // left arrow
                    if (!this.tmpInput.l) { // Only update if we have to
                        this.tmpInput.l = true;
                    }
                    break;
                case 68: // d
                case 39: // right arrow
                    if (!this.tmpInput.r) { // Only update if we have to
                        this.tmpInput.r = true;
                    }
                    break;
            }
        }
    },
    keyUp: function(event) {
        if (!this.blurred) {
            switch (event.keyCode) {
                case 87: // w
                case 38: // up arrow
                    this.tmpInput.u = false;
                    break;
                case 83: // s
                case 40: // down arrow
                    this.tmpInput.d = false;
                    break;
                case 65: // a
                case 37: // left arrow
                    this.tmpInput.l = false;
                    break;
                case 68: // d
                case 39: // right arrow
                    this.tmpInput.r = false;
                    break;
            }
        }
    },
    mouseMove: function(event) {
        this.input.mouse.x = event.pageX - leftOff;
        this.input.mouse.y = event.pageY - topOff;

        this.currentPlayer.crosshairs.cursor.style.left = (event.pageX - this.currentPlayer.crosshairs.cursor.width / 2).toString(10) + 'px';
        this.currentPlayer.crosshairs.cursor.style.top = (event.pageY - this.currentPlayer.crosshairs.cursor.height / 2).toString(10) + 'px';

        this.input.mouse.drawnX = this.input.mouse.x / this.scale;
        this.input.mouse.drawnY = this.input.mouse.y / this.scale;
    },
    mouseDown: function() {
        this.tmpInput.m = true;
    },
    mouseUp: function() {
        this.tmpInput.m = false;
    },
    onBlur: function() {
        for (var input in this.tmpInput) {
            if (this.tmpInput.hasOwnProperty(input)) {
                this.tmpInput[input] = false;
            }
        }

        this.blurred = true;
    },
    onFocus: function() {
        this.blurred = false;
    }
});
