window.onload = function () {
	var playButton = document.getElementById('play');
	playButton.onclick = setupGame;
}

function setupGame () {
	var editItems = [document.getElementById('play'), document.getElementById('follow'), document.getElementById('info')];

	//Add an opacity fade to each item that needs it
	for (var i = editItems.length - 1; i >= 0; i--) {
		editItems[i].classList.add('opacity-transition');
	};

	window.setTimeout(function () {
		//Remove the items from the screen completely
		for (var i = editItems.length - 1; i >= 0; i--) {
			editItems[i].classList.add('remove-display');
		};
	}, 250);

	//Notify elements of stage 2 of game setup
	document.getElementsByTagName('body')[0].classList.add('stage2');
}