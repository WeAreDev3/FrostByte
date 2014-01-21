function resizeBrowser() {
    // Resize the game to be as big as possible while maintaining the proper aspect ratio
    var width = window.innerWidth,
        height = window.innerHeight;

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

    scale = height / 1000;
}