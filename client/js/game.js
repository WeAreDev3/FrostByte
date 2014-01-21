GameClass = Class.extend({
    init: function(width, height, level) {
        this.width = width;
        this.height = height;
        this.scale = 1;

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
            if (player !== this.currentPlayer) {
                player.draw(context, this.scale);
            }
        }.bind(this));

        // Draw the current player last so it is on top of the rest
        this.currentPlayer.draw(context, this.scale);

        this.forEachBullet(function(bullet, id) {
            bullet.draw(context, this.scale);
        }.bind(this));

        // Draw the crosshairs last so it is always on top
        this.currentPlayer.crosshairs.update(context, this.scale);
    },
    update: function(timeElapsed) {
        this.forEachPlayer(function(player, id) {
            player.update(timeElapsed);
        });

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
            'u': false,
            'd': false,
            'l': false,
            'r': false,
            'mouse': {
                'x': 800,
                'y': 500,
                'drawnX': 800 * this.scale,
                'drawnY': 500 * this.scale,
                'down': false
            }
        };

        // Event handlers. Key up/down. Mouse up/down/move.
        window.onkeydown = this.keyDown.bind(this);
        window.onkeyup = this.keyUp.bind(this);
        window.onmousemove = this.mouseMove.bind(this);
        window.onmousedown = this.mouseDown.bind(this);
        window.onmouseup = this.mouseUp.bind(this);

        //Resize the canvas every time the browser is resized
        window.onresize = this.resizeBrowser.bind(this);

        // Disable right-click
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        }, false);

        //We use a loop to keep the entire program synchronous
        (function startLoop() {
            var frameId = 0,
                lastFrame = Date.now(),
                count = 0;

            (function loop() {
                var thisFrame = Date.now(),
                    timeElapsed = (thisFrame - lastFrame) / 1000;

                frameId = window.requestAnimationFrame(loop);

                // if (count % 1 === 0) {
                // count = 0;
                self.update(timeElapsed);
                self.draw(context);
                // }

                lastFrame = thisFrame;
                // count++;
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
        switch (event.keyCode) {
            case 87: // w
            case 38: // up arrow
                if (!this.input.u) { // Only update if we have to
                    this.input.u = true;
                    socket.send('iut'); // Up True
                }
                break;
            case 83: // s
            case 40: // down arrow
                if (!this.input.d) { // Only update if we have to
                    this.input.d = true;
                    socket.send('idt'); // Down True
                }
                break;
            case 65: // a
            case 37: // left arrow
                if (!this.input.l) { // Only update if we have to
                    this.input.l = true;
                    socket.send('ilt'); // Left True
                }
                break;
            case 68: // d
            case 39: // right arrow
                if (!this.input.r) { // Only update if we have to
                    this.input.r = true;
                    socket.send('irt'); // Right True
                }
                break;
        }
    },
    keyUp: function(event) {
        switch (event.keyCode) {
            case 87: // w
            case 38: // up arrow
                this.input.u = false;
                socket.send('iuf'); // Up False
                break;
            case 83: // s
            case 40: // down arrow
                this.input.d = false;
                socket.send('idf'); // Down False
                break;
            case 65: // a
            case 37: // left arrow
                this.input.l = false;
                socket.send('ilf'); // Left False
                break;
            case 68: // d
            case 39: // right arrow
                this.input.r = false;
                socket.send('irf'); // Right False
                break;
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
        this.input.mouse.down = true;

        // Send the server Input that the Mouse is True
        socket.send('imt');
    },
    mouseUp: function() {
        this.input.mouse.down = false;

        // Send the server Input that the Mouse is false
        socket.send('imf');
    }
});
