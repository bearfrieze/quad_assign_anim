qa.setup(600, 2, 100, 0.5);
qa.drawAll();

// Loop
var frame = 0;
var timer = 0;
function loop(stamp) {
	if (frame % 60 === 0) {
		// Timestamp
		if (frame !== 0)
			console.log(Math.round(60 / (stamp - timer) * 1000));
		timer = stamp;
	}
	qa.step();
	qa.drawAll();
	frame++;
	requestAnimationFrame(loop);
}

// Begin
requestAnimationFrame(loop);