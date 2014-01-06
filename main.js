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

    /*
      (In order)
      type: Name of gun
      accuracy: Higher is WORSE
      damage: Higher is BETTER
      kick: Higher is WORSE
      bulletSpeed: Higher is BETTER
      rate: Higher is WORSE
    */

    var semiAuto = ['semi-auto', 5, 30, 5, 17, 140],
        fullAuto = ['full-auto', 8, 20, 5, 10, 100],
        shotgun = ['shotgun', 13, 10, 7, 17, 220],
        playerSpecs = {
            'type': 'player',
            'name': 'Bob',
            'hp': 100,
            'size': 12,
            'speed': 100,
            'mobility': 10,
            'x': canvas.width / 2,
            'y': canvas.height / 2,
            'direction': Math.PI / 2,
            'gun': create(Gun, fullAuto),
            'color': '#4D90FE'
        },
        enemySpecs = {
            'type': 'enemy',
            'name': null,
            'hp': 50,
            'size': 12,
            'speed': 45,
            'mobility': 10,
            'x': null,
            'y': null,
            'direction': 0,
            'gun': null,
            'color': 'rbg(0,255,0)'
        };

    player = new Character(playerSpecs);
    crosshairs = new Crosshairs(canvas.width / 2, canvas.height / 2);

    for (var i = 0; i < 3; i++) {
        enemySpecs.name = i;
        enemySpecs.x = Math.random() * canvas.width;
        enemySpecs.y = Math.random() * canvas.height;
        enemySpecs.direction = Math.PI / (Math.random() * 2 - 1);
        enemySpecs.gun = create(Gun, fullAuto);

        enemies.push(new Character(enemySpecs));
    }

    console.log(player);
    console.log(crosshairs);
    console.log(enemies);

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

function create(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

bullets = [];
enemies = [];

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
    context.arc(this.x, this.y, 13, 0, 2 * Math.PI, false);
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

Character = function(specs) {
    this.type = specs.type;
    this.name = specs.name;
    this.hp = specs.hp;
    this.health = 100; // Percent
    this.size = specs.size;
    this.speed = specs.speed;
    this.mobility = specs.mobility;
    this.x = specs.x;
    this.y = specs.y;
    this.direction = specs.direction;
    this.gun = specs.gun;
    this.gun.character = this;
    this.color = specs.color;
};

Character.prototype.draw = function () {
    var namePositionX = this.x - (context.measureText(this.name).width / 2),
        namePositionY = this.y + (this.size * 2);

    // Draws Body
    context.fillStyle = this.color;

    // Square
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.direction);
    context.fillRect(-1 * this.size, -1 * this.size, this.size * 2, this.size * 2);
    context.restore();

    // Circle
    // context.beginPath();
    // context.arc(this.x, this.y, 15, 0, 2 * Math.PI, false);
    // context.fill();
    // context.closePath();

    // Draws health
    context.fillStyle = '#000';
    context.fillText(this.health + '%', this.x - (context.measureText(this.health + '%').width / 2), this.y + 3);

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
            this.gun.fire();
        }

        this.gun.timeSinceLastFire += timeElapsed;

        if (!input.mouseDown && this.gun.timeSinceLastFire >= this.gun.rate) {
            this.gun.timeSinceLastFire = this.gun.rate;
        }

        if (!input.mouseDown) {
            this.gun.wasFired = false;
        }

    } else {
        this.x += this.speed * Math.cos(this.direction) * timeElapsed;
        this.y += this.speed * Math.sin(this.direction) * timeElapsed;

        if (this.mobility < 0) {
            this.direction += Math.PI / this.mobility * timeElapsed;
        };

        this.color = 'rgb(' + parseInt(255 * (100 - this.health) / 100) + ',' + parseInt(255 * this.health / 100) + ',0)';
    }
};

Bullet = function(gun, speed, direction) {
    this.gun = gun;
    this.speed = speed;
    this.x = this.gun.character.x;
    this.y = this.gun.character.y;
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
    context.closePath();
};

Bullet.prototype.update = function(timeElapsed) {
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        bullets.splice(bullets.indexOf(this), 1);
        return;
    }

    for (var i = 0, len = enemies.length; i < len; i++) {
        if (Math.sqrt((this.x - enemies[i].x) * (this.x - enemies[i].x) + (this.y - enemies[i].y) * (this.y - enemies[i].y)) <= enemies[i].size) {
            enemies[i].health -= this.gun.damage;
            console.log(enemies[i]);
            if (enemies[i].health < 0) {
                enemies[i].health = 0;
                enemies[i].speed = 0;
                enemies[i].mobility = 0;
            }

            bullets.splice(bullets.indexOf(this), 1);
            return;
        }
    }

    this.x -= this.speed * Math.cos(this.direction) * timeElapsed * 100;
    this.y -= this.speed * Math.sin(this.direction) * timeElapsed * 100;
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
    this.character = null;
};

Gun.prototype.fire = function() {
    if (this.timeSinceLastFire >= this.rate) {
        this.timeSinceLastFire -= this.rate;

        switch (this.type) {
            case 'semi-auto':
                if (!this.wasFired) {
                    this.wasFired = true;
                    new Bullet(this, this.bulletSpeed, this.character.direction);
                    crosshairs.kickCounter++;
                }
                break;
            case 'full-auto':
                new Bullet(this, this.bulletSpeed, this.character.direction);
                crosshairs.kickCounter++;
                break;
            case 'shotgun':
                if (!this.wasFired) {
                    this.wasFired = true;
                    for (var i = 0; i < 5; i++) {
                        new Bullet(this, this.bulletSpeed, this.character.direction + (Math.random() * 2 - 1) * this.character.gun.accuracy / 100);
                    }
                    crosshairs.kickCounter++;
                }
                break;
        }
        console.log(crosshairs.kickCounter);
    }
};

function update (timeElapsed) {
    var i;
    /*Every frame, update will run commands and call functions to update
        the necessary game variables so that the draw function can draw them
        out properly.*/

    // Can't cache the length of the arrays b/c they can change mid-loop.
    for (i = 0; i < enemies.length; i++) {
        enemies[i].update(timeElapsed);
    }

    for (i = 0; i < bullets.length; i++) {
        bullets[i].update(timeElapsed);
    }

    player.update(timeElapsed);
    crosshairs.update(timeElapsed);
}

function draw (context) {
    var i,
        len;
    /*Every frame, draw will clear the frame and redraw all
      of the onscreen elements with the updated variables.*/

    //Step 1: Clear the screen
    clearScreen();

    //Step 2: Draw all items on the screen
    player.draw();

    for (i = 0, len = enemies.length; i < len; i++) {
        enemies[i].draw();
    }

    for (i = 0, len = bullets.length; i < len; i++) {
        bullets[i].draw();
    }

    //Step 2a: Crosshairs should be last so it is always on top.
    crosshairs.draw();
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
