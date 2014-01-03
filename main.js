window.onload = function () {
    canvas = document.getElementById('frame');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    //We use a loop to keep the entire program synchronous
    function startLoop () {
        var frameId = 0;
        var lastFrame = Date().now();

        function loop () {
            var timeElapsed = Date().now() - lastFrame();

            frameId = window.requestAnimationFrame(loop);

            update(timeElapsed);
            draw(context);
        }

        loop();
    }

    startLoop();

}

function update (timeElapsed) {
    /*Every frame, update will update the necessary game 
      variables so that the draw function can draw them
      out properly.*/
}

function draw (context) {
    /*Every frame, draw will clear the frame and redraw all
      of the onscreen elements with the updated variables.*/
}