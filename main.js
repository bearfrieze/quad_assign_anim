qa.setup(600, 2, 250, 0.5);
qa.drawAll();

// Loop
function loop(stamp) {
	qa.step();
	qa.drawAll();
	requestAnimationFrame(loop);
}

// Begin
requestAnimationFrame(loop);