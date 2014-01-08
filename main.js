window.onload = function() {
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

    function startLoop() {
        var frameId = 0,
            lastFrame = Date.now(),
            count = 0;

        function loop() {
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

function initCanvas() {
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

function update(timeElapsed) {
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

function draw(context) {
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

function handleKeyDown(event) {
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

function handleKeyUp(event) {
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

function handleMouseMove(event) {
    input.mouse.x = event.x;
    input.mouse.y = event.y;

    cursor.style.left = event.x - cursor.width / 2 + 'px';
    cursor.style.top = event.y - cursor.height / 2 + 'px';
}

function handleMouseDown() {
    input.mouseDown = true;
}

function handleMouseUp() {
    input.mouseDown = false;
}

function clearScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}
