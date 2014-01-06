window.onload = function () {
    canvas = document.getElementById('frame');
    context = canvas.getContext('2d');

    initCanvas();

    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
    window.onmouseup = handleMouseUp;
    window.onresize = initCanvas;

    input = {
        'w': false,
        'a': false,
        's': false,
        'd': false,
        'mouse': {
            'x': canvas.width / 2,
            'y': canvas.height / 2
        },
        'mouseDown': false
    };

    var semiAuto = new Gun('semi-auto', 0.05, 15, 5, 30, 75),
        fullAuto = new Gun('full-auto', 0.07, 10, 5, 25, 100),
        shotgun = new Gun('shotgun', 0.3, 7, 7, 18, 45);

    player = new Character('player', 'Bob', 12, 100, 10, [canvas.width / 2, canvas.height / 2], Math.PI / 2, fullAuto);
    crosshairs = new Crosshairs(canvas.width / 2 + 100, canvas.height / 2 + 100);

    console.log(crosshairs);

    //We use a loop to keep the entire program synchronous
    function startLoop () {
        var frameId = 0,
            lastFrame = Date.now(),
            count = 0;

        function loop () {
            var thisFrame = Date.now(),
            timeElapsed = (thisFrame - lastFrame) / 1000;

            frameId = window.requestAnimationFrame(loop);

            if (count % 1 === 0) {
                count = 0;
                update(timeElapsed);
                draw(context);
            }

            lastFrame = thisFrame;
            count++;
        }

        loop();
    }

    startLoop();
};

function initCanvas () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

bullets = [];

Crosshairs = function (x, y) {
    this.x = x;
    this.y = y;
    this.distFromPlayer = 0;
    this.distFromMouse = 0;
    this.angle = 0; // The angle that the crosshairs make (with the origin
                    // being @ the player's location)
    this.mouseAngle = 0; // The angle that the mouse makes (with the origin
                         // being @ the player's location)
    this.mouseDistFromPlayer = 0;
    this.kickCounter = 0;

    var curs = document.createElement('img');
    curs.src = './crosshairCursor.png';
    curs.id = 'cursor';
    curs.draggable = false;
    document.getElementsByTagName('body')[0].appendChild(curs);
    
    cursor = document.getElementById('cursor');
};

Crosshairs.prototype.draw = function () {
    context.beginPath();
    context.arc(this.x, this.y, 15, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = '#FE634D';
    context.stroke();
};

Crosshairs.prototype.update = function (timeElapsed) {
    var mouseXDiff = input.mouse.x - this.x,
        mouseYDiff = input.mouse.y - this.y,
        playerXDiff = player.x - this.x,
        playerYDiff = player.y - this.y,
        mousePlayerXDiff = input.mouse.x - player.x,
        mousePlayerYDiff = input.mouse.y - player.y;

    this.distFromPlayer = Math.sqrt((playerXDiff * playerXDiff) + (playerYDiff * playerYDiff));
    this.distFromMouse = Math.sqrt((mouseXDiff * mouseXDiff) + (mouseYDiff * mouseYDiff));
    this.angle = player.direction - Math.PI;
    this.mouseAngle = Math.atan2((input.mouse.y - player.y), (input.mouse.x - player.x));
    this.mouseDistFromPlayer = Math.sqrt((mousePlayerXDiff * mousePlayerXDiff) + (mousePlayerYDiff * mousePlayerYDiff));

    if (this.angle > Math.PI / 2 || this.angle < Math.PI / -2) {
        if (this.angle / this.mouseAngle < 0 && this.angle > 0) {
            this.angle -= Math.PI * 2;
        } else if (this.angle / this.mouseAngle < 0 && this.angle < 0) {
            this.angle += Math.PI * 2;
        }
    }

    this.angle += (this.mouseAngle - this.angle) / player.mobility;
    this.distFromPlayer += (this.mouseDistFromPlayer - this.distFromPlayer) / player.mobility;

    for (var i = this.kickCounter - 1; i >= 0; i--) {
        this.angle += (Math.random() * 2 * Math.PI - Math.PI) * player.gun.kick / 100;
    };

    this.kickCounter = 0;

    this.x = player.x + this.distFromPlayer * Math.cos(this.angle);
    this.y = player.y + this.distFromPlayer * Math.sin(this.angle);
};

Character = function (type, name, size, speed, mobility, position, direction, gun) {
    this.type = type;
    this.name = name;
    this.size = size;
    this.speed = speed;
    this.mobility = mobility;
    this.x = position[0];
    this.y = position[1];
    this.direction = direction;
    this.gun = gun;
};

Character.prototype.draw = function () {
    var namePositionX = this.x - (context.measureText(this.name).width / 2),
        namePositionY = this.y + (this.size * 2);

    // Draws Body
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.direction);
    context.fillStyle = '#4D90FE';
    context.fillRect(-1 * this.size, -1 * this.size, this.size * 2, this.size * 2);
    context.restore();

    // Draws Name
    context.fillStyle = '#000';
    context.fillText(this.name, namePositionX, namePositionY);
};

Character.prototype.update = function (timeElapsed) {
    if (this.type === 'player') {
        if (input.w) { // Up (Press W)
            this.y -= this.speed * timeElapsed;
        }
        if (input.s) { // Down (Press S)
            this.y += this.speed * timeElapsed;
        }
        if (input.a) { // Left (Press A)
            this.x -= this.speed * timeElapsed;
        }
        if (input.d) { // Right (Press D)
            this.x += this.speed * timeElapsed;
        }

        this.direction = Math.atan2((crosshairs.y - this.y), (crosshairs.x - this.x)) + Math.PI;

        if (input.mouseDown) {
            this.gun.fire(this);
        }

        this.gun.timeSinceLastFire += timeElapsed;

        if (!input.mouseDown && this.gun.timeSinceLastFire >= this.gun.rate) {
            this.gun.timeSinceLastFire = this.gun.rate;
        }

        if (!input.mouseDown) {
            this.gun.wasFired = false;
        }

    } else {
        // ...
    }
};

Bullet = function(character, speed, direction) {
    this.character = character;
    this.speed = speed;
    this.x = character.x;
    this.y = character.y;
    this.direction = direction;

    bullets.push(this);
};

Bullet.prototype.draw = function() {
    context.beginPath();
    context.moveTo(this.x - (5 + this.character.size) * Math.cos(this.direction),
                   this.y - (5 + this.character.size) * Math.sin(this.direction));

    context.lineTo(this.x - (10 + this.character.size) * Math.cos(this.direction),
                   this.y - (10 + this.character.size) * Math.sin(this.direction));

    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.stroke();
};

Gun = function(type, accuracy, damage, kick, bulletSpeed, rate) {
    this.type = type;
    this.accuracy = accuracy;
    this.damage = damage;
    this.kick = kick;
    this.bulletSpeed = bulletSpeed;
    this.wasFired = false;
    this.rate = rate / 1000;
    this.timeSinceLastFire = 0;
};

Gun.prototype.fire = function(character) {
    if (this.timeSinceLastFire >= this.rate) {
        this.timeSinceLastFire -= this.rate;

        switch (this.type) {
            case 'semi-auto':
                if (!this.wasFired) {
                    this.wasFired = true;
                    new Bullet(character, this.bulletSpeed, character.direction);
                    crosshairs.kickCounter++;
                }
                break;
            case 'full-auto':
                new Bullet(character, this.bulletSpeed, character.direction);
                crosshairs.kickCounter++;
                break;
            case 'shotgun':
                if (!this.wasFired) {
                    this.wasFired = true;
                    for (var i = 0; i < 4; i++) {
                        new Bullet(character, this.bulletSpeed, character.direction + (Math.random() * 2 - 1) * player.gun.kick / 100);
                    }
                    crosshairs.kickCounter++;
                }
                break;
        }
        console.log(crosshairs.kickCounter);
    }
};

function update (timeElapsed) {
    /*Every frame, update will run commands and call functions to update
        the necessary game variables so that the draw function can draw them
        out properly.*/
    player.update(timeElapsed);
    crosshairs.update(timeElapsed);
}

function draw (context) {
    /*Every frame, draw will clear the frame and redraw all
      of the onscreen elements with the updated variables.*/

    //Step 1: Clear the screen
    clearScreen();

    //Step 2: Draw all items on the screen
    player.draw();
    crosshairs.draw();

    for (var i = 0, len = bullets.length; i < len; i++) {
        bullets[i].draw();
        bullets[i].x -= bullets[i].speed * Math.cos(bullets[i].direction);
        bullets[i].y -= bullets[i].speed * Math.sin(bullets[i].direction);
    }
}

function handleKeyDown (event) {
    switch (event.keyCode) {
        case 87: // w
            input.w = true;
            break;
        case 65: // a
            input.a = true;
            break;
        case 83: // s
            input.s = true;
            break;
        case 68: // d
            input.d = true;
            break;
    }
}

function handleKeyUp (event) {
    switch (event.keyCode) {
        case 87: // w
            input.w = false;
            break;
        case 65: // a
            input.a = false;
            break;
        case 83: // s
            input.s = false;
            break;
        case 68: // d
            input.d = false;
            break;
    }
}

function handleMouseMove (event) {
    input.mouse.x = event.x;
    input.mouse.y = event.y;

    cursor.style.left = event.x - cursor.width / 2 + 'px';
    cursor.style.top = event.y - cursor.height / 2 + 'px';
}

function handleMouseDown () {
    input.mouseDown = true;
}

function handleMouseUp () {
    input.mouseDown = false;
}

function clearScreen () {
    context.clearRect(0, 0, canvas.width, canvas.height);
}
