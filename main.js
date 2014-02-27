qa.setup(600, 3, 50, 0.5);
qa.drawAll();

// Loop
function loop(stamp) {
	qa.step();
	qa.drawAll();
	requestAnimationFrame(loop);
}

// Begin
requestAnimationFrame(loop);