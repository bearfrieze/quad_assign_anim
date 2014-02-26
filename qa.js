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
		this.ctx.beginPath();
		this.drawRecursive(this.rot);
		this.ctx.closePath();
		this.ctx.stroke();
	},
	drawRecursive: function(qad) {
		this.ctx.moveTo(qad.loc[0], qad.loc[1]);
		this.ctx.rect(qad.loc[0], qad.loc[1], qad.dim[0], qad.dim[1]);
		if (qad.dts.length !== 0) {
			for (var i = 0; i < qad.dts.length; i++) {
				this.ctx.moveTo(Math.round(qad.dts[i].loc[0]) + qad.dts[i].rad, Math.round(qad.dts[i].loc[1]));
				this.ctx.arc(Math.round(qad.dts[i].loc[0]), Math.round(qad.dts[i].loc[1]), qad.dts[i].rad, 0, 2*Math.PI);
			}
		} else if (qad.qds !== null) {
			for (var i = 0; i < 2; i++)
				for (var j = 0; j < 2; j++)
					this.drawRecursive(qad.qds[i][j]);
		}
	},
	step: function() {
		// Collision test
		var colliding = [];
		for (var i = 0; i < this.dts.length; i++) {
			colliding = colliding.concat(this.colission(this.dts[i]));
		}
		// Remove colliding dots
		for (var i = 0; i < colliding.length; i++) {
			var dot = colliding[i];
			for (var j = 0; j < this.dts.length; j++) {
				if (dot.id === this.dts[j].id) {
					this.dts[j] = this.dts[this.dts.length - 1];
					this.dts.pop();
					break;
				}
			}
			dot.qad.rmvDot(dot);
		}
		for (var i = 0; i < this.dts.length; i++) {
			var dot = this.dts[i];
			// Move the dots
			for (var j = 0; j < 2; j++) {
				if (dot.loc[j] + dot.vel[j] <= 0 || dot.loc[j] + dot.vel[j] >= this.siz)
					dot.vel[j] = -dot.vel[j];
				dot.loc[j] += dot.vel[j];
			}
			// Clean up empty quads
			if (!dot.qad.isInside(dot)) {
				var qad = dot.qad;
				qad.rmvDot(dot);
				this.assign(this.rot, dot);
				qad.par.clean();
			}
		}
	},
	colission: function(dot) {
		var dts = [];
		for(var i = 0; i < dot.qad.dts.length; i++) {
			var otr = dot.qad.dts[i];
			if (otr.id === dot.id) continue; 
			var del = [dot.loc[0] - otr.loc[0], dot.loc[1] - otr.loc[1]];
			if (Math.sqrt((del[0] * del[0]) + (del[1] * del[1])) <= dot.rad * 2)
				dts.push(otr);
		}
		return dts;
	}
};