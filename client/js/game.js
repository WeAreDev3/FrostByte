function startGame() {
    canvas = document.getElementById('frame');
    context = canvas.getContext('2d');

    initCanvas(); //Sets up the canvas so that it looks right on the screen

    //Event handlers, pretty straightforward stuff
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
    window.onmouseup = handleMouseUp;
    window.onresize = initCanvas; //Re-set-up the canvas every time the browser is resized
    // Disable right-click
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    }, false);

    //Some environment input variables, updated by the event handlers from above
    input = {
        'u': false,
        'd': false,
        'l': false,
        'r': false,
        'mouse': {
            'x': 800,
            'y': 500,
            'drawnX': 800 * scale,
            'drawnY': 500 * scale
        },
        'mouseDown': false
    };

    var playerSpecs = {
        'type': 'player',
        'name': 'ME :)',
        'hp': 100,
        'size': 12,
        'speed': 100,
        'mobility': 10,
        'x': 800,
        'y': 500,
        'direction': Math.PI / 2,
        'gun': new Gun('full-auto'),
        'color': '#4D90FE'
    },
        enemySpecs = {
            'type': 'enemy',
            'name': null,
            'hp': 50,
            'size': 10,
            'speed': 55,
            'mobility': 10,
            'x': null,
            'y': null,
            'direction': 0,
            'gun': null,
            'color': 'rbg(255,0,0)'
        };

    //Create the player!
    player = new Character(playerSpecs);

    otherPlayers = {};

    //Create the crosshairs!
    crosshairs = new Crosshairs(player);

    //defines the function that creates enemies

    function createEnemies(howMany) {
        for (var i = 0; i < howMany; i++) {
            enemySpecs.name = i;
            enemySpecs.x = Math.random() * 1600;
            enemySpecs.y = Math.random() * 1000;
            enemySpecs.direction = Math.PI / (Math.random() * 2 - 1);
            enemySpecs.gun = new Gun('full-auto');

            enemies.push(new Character(enemySpecs));
        }
    }

    // actually creates enemies
    // createEnemies(50);

    console.log(player);
    console.log(crosshairs);
    console.log('Enemies:', enemies);

    //We use a loop to keep the entire program synchronous

    function startLoop() {
        var frameId = 0,
            lastFrame = Date.now(),
            count = 0;

        function loop() {
            var thisFrame = Date.now(),
                timeElapsed = (thisFrame - lastFrame) / 1000;

            frameId = window.requestAnimationFrame(loop);

            // if (count % 1 === 0) {
            // count = 0;
            update(timeElapsed);
            draw(context);
            // }

            lastFrame = thisFrame;
            // count++;
        }

        loop();
    }

    startLoop();
};

//Expands the canvas to the full width and height of the browser window

function initCanvas() {
    resizeBrowser();
}

//Initalize the arrays of bullets and enemies
bullets = [];
enemies = [];

/*Every frame, update will run commands and call functions to update
  the necessary game variables so that the draw function can draw them
  out properly.*/

function update(timeElapsed) {
    var i;


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


/*Every frame, draw will clear the frame and redraw all
  of the onscreen elements with the updated variables.*/

function draw(context) {
    var i,
        others;

    //Step 1: Clear the screen
    clearScreen();

    //Step 2: Draw all items on the screen

    for (i = enemies.length - 1; i >= 0; i--) {
        enemies[i].draw();
    }

    for (others in otherPlayers) {
        if (otherPlayers.hasOwnProperty(others)) {
            otherPlayers[others].draw();
        }
    }

    player.draw();

    for (i = bullets.length - 1; i >= 0; i--) {
        bullets[i].draw();
    }

    //Crosshairs should be drawn last so it is always on top
    crosshairs.draw();
}

// Record the needed keys in the input object

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 87: // w
        case 38: // up arrow
            // Only update if we have to
            if (!input.u) {
                input.u = true;

                // Send the sever Input that the Up key is True
                socket.send('iut');
            }
            break;
        case 83: // s
        case 40: // down arrow
            if (!input.d) {
                input.d = true;

                // Send the sever Input that the Left key is True
                socket.send('idt');
            }
            break;
        case 65: // a
        case 37: // left arrow
            if (!input.l) {
                input.l = true;

                // Send the sever Input that the Down key is True
                socket.send('ilt');
            }
            break;
        case 68: // d
        case 39: // right arrow
            if (!input.r) {
                input.r = true;

                // Send the sever Input that the Right key is True
                socket.send('irt');
            }
            break;
    }
}

// Remove the keys recorded from the input object

function handleKeyUp(event) {
    switch (event.keyCode) {
        case 87: // w
        case 38: // up arrow
            input.u = false;

            // Send the sever Input that the Up key is False
            socket.send('iuf');
            break;
        case 83: // s
        case 40: // down arrow
            input.d = false;

            // Send the sever Input that the Left key is False
            socket.send('idf');
            break;
        case 65: // a
        case 37: // left arrow
            input.l = false;

            // Send the sever Input that the Down key is False
            socket.send('ilf');
            break;
        case 68: // d
        case 39: // right arrow
            input.r = false;

            // Send the sever Input that the Right key is False
            socket.send('irf');
            break;
    }
}

//Record the location of the cursor in the input object

function handleMouseMove(event) {
    input.mouse.x = event.pageX - leftOff;
    input.mouse.y = event.pageY - topOff;

    cursor.style.left = (event.pageX - cursor.width / 2).toString(10) + 'px';
    cursor.style.top = (event.pageY - cursor.height / 2).toString(10) + 'px';

    input.mouse.drawnX = input.mouse.x / scale;
    input.mouse.drawnY = input.mouse.y / scale;
}

//Record a mouse button press in the input object

function handleMouseDown() {
    input.mouseDown = true;

    // Send the server Input that the Mouse is True
    socket.send('imt');
}

//Record the    

function handleMouseUp() {
    input.mouseDown = false;

    // Send the server Input that the Mouse is false
    socket.send('imf');
}

function clearScreen() {
    context.clearRect(0, 0, 1600 * scale, 1000 * scale);
}
