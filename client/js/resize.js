function resizeBrowser() {
    // Resize the game to be as big as possible while maintaining the proper aspect ratio
    var width = window.innerWidth,
        height = window.innerHeight;

    console.log('The page is', width, 'x', height);

    if (width / height >= 1.6) {
        width = height * 1.6;
    } else {
        height = width / 1.6;
    }
    console.log('The canvas is', width, 'x', height);

    scale = height / 1000;

    console.log('The page has been scaled by a factor of', scale);
}
