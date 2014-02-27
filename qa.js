var qa = {
	setup: function(siz, lim, num, spd) {

		this.siz = siz; // Size of canvas
		this.lim = lim; // Limit of dots in one quad
		this.num = num; // Number of dots
		this.spd = spd; // Speed of dots

		this.dts = []; // Container for dots
		this.dtsId = 0; // Id counter for dots

		this.rot = new this.Quad([0, 0], [siz, siz], null); // Root quad

		// Main canvas
		var cvs = this.cvs = document.createElement('canvas');
		this.ctx = cvs.getContext('2d');
		cvs.width = siz;
		cvs.height = siz;
		document.body.appendChild(cvs);

		// Spawn
		for (var i = 0; i < num; i++) this.spawn();
	},
	spawn: function() {
		var loc = [Math.random() * this.siz, Math.random() * this.siz];
		var vel = [(Math.random() < 0.5) ? -this.spd : this.spd, (Math.random() < 0.5) ? -this.spd : this.spd];
		var r = Math.round(this.siz / 100);
		var dot = new this.Dot(this.dtsId++, loc, vel, r);
		this.dts.push(dot);
		this.assign(this.rot, dot);
	},
	assign: function(qad, dot) {
		if (qad.dts.length < this.lim && qad.qds === null) {
			qad.putDot(dot);
		} else {
			if (qad.qds === null) qad.divide();
			this.assign(qad.getQad(dot), dot);
		}
	},
	drawAll: function() {
		this.ctx.clearRect(0, 0, this.siz, this.siz);
		this.drawQuads();
		this.drawDots();
	},
	drawQuads: function() {
		this.ctx.beginPath();
		this.drawQuadRecursive(this.rot);
		this.ctx.closePath();
		this.ctx.stroke();
	},
	drawQuadRecursive: function(qad) {
		this.ctx.rect(qad.loc[0], qad.loc[1], qad.dim[0], qad.dim[1]);
		if (qad.qds !== null) {
			for (var i = 0; i < 2; i++)
				for (var j = 0; j < 2; j++)
					this.drawQuadRecursive(qad.qds[i][j]);
		}
	},
	drawDots: function() {
		for (var i = 0; i < this.dts.length; i++) {
			var dot = this.dts[i];
			var hue = 120 - (dot.age / this.dts[0].age * 120);
			this.ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
			this.ctx.beginPath();
			this.ctx.arc(Math.round(dot.loc[0]), Math.round(dot.loc[1]), dot.rad, 0, 2*Math.PI);
			this.ctx.closePath();
			this.ctx.stroke();
			this.ctx.fill();
		}
	},
	step: function() {
		// Collision test
		var colliding = [];
		for (var i = 0; i < this.dts.length; i++) {
			if (this.isColliding(this.dts[i])) colliding.push(this.dts[i]);
		}
		// Kill colliding dots
		for (var i = 0; i < colliding.length; i++) {
			this.kill(colliding[i]);
			this.spawn();
		}
		for (var i = 0; i < this.dts.length; i++) {
			var dot = this.dts[i];
			// Move dots
			for (var j = 0; j < 2; j++) {
				// Reverse direction if about to fly out of bounds
				if (dot.loc[j] + dot.vel[j] <= 0 || dot.loc[j] + dot.vel[j] >= this.siz)
					dot.vel[j] = -dot.vel[j];
				dot.loc[j] += dot.vel[j];
			}
			// Check if dot has left quad
			if (!dot.qad.isInside(dot)) {
				dot.qad.rmvDot(dot); // Clean up
				this.assign(this.rot, dot); // Reassign dot
			}
			// Increment age
			dot.age++;
		}
	},
	isColliding: function(dot) {
		for(var i = 0; i < dot.qad.dts.length; i++) {
			var otr = dot.qad.dts[i];
			if (otr.id === dot.id) continue;
			var del = [dot.loc[0] - otr.loc[0], dot.loc[1] - otr.loc[1]];
			if (Math.sqrt((del[0] * del[0]) + (del[1] * del[1])) <= dot.rad * 2)
				return true;
		}
		return false;
	},
	kill: function(dot) {
		for (var j = 0; j < this.dts.length; j++) {
			if (dot.id === this.dts[j].id) {
				this.dts.splice(j, 1);
				break;
			}
		}
		dot.qad.rmvDot(dot);
	}
};