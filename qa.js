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
		for (var i = 0; i < this.dts.length; i++) {
			var dot = this.dts[i];
			for (var j = 0; j < 2; j++) {
				if (dot.loc[j] + dot.vel[j] <= 0 || dot.loc[j] + dot.vel[j] >= this.siz)
					dot.vel[j] = -dot.vel[j];
				dot.loc[j] += dot.vel[j];
			}
			if (!dot.qad.isInside(dot)) {
				var qad = dot.qad;
				qad.rmvDot(dot);
				this.assign(this.rot, dot);
				qad.par.clean();
			}
		}
	}
};