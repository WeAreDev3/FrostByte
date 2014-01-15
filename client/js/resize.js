function resizeBrowser() {
    // Resize the game to be as big as possible while maintaining the proper aspect ratio
    var width = window.innerWidth,
        height = window.innerHeight;

    if (width / height >= 1.6) {
        canvas.height = height;
        canvas.width = height * 1.6;
    } else {
        canvas.width = width;
        canvas.height = width / 1.6;
    }

    scale = height / 1000;
}
