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
		var dot = {
			loc: [Math.random() * this.siz, Math.random() * this.siz],
			vel: [(Math.random() < 0.5) ? -this.spd : this.spd, (Math.random() < 0.5) ? -this.spd : this.spd],
			r: Math.round(this.siz / 100),
			qad: null,
			id: this.dtsId++
		};
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
	Quad: function(loc, dim, par) {
		this.loc = loc; // Location
		this.dim = dim; // Dimension
		this.par = par; // Parent
		this.dts = []; // Dots
		this.qds = null; // Quads
		this.divide = function() {
			this.qds = [];
			for (var i = 0; i < 2; i++) {
				this.qds[i] = [];
				var nDim = [Math.round(dim[0] / 2), Math.round(dim[1] / 2)];
				for (var j = 0; j < 2; j++) {
					var nLoc = [Math.round(loc[0] + (dim[0] / 2 * j)), Math.round(loc[1] + (dim[1] / 2 * i))];
					this.qds[i][j] = new qa.Quad(nLoc, nDim, this);
				}
			}
			for (var i = 0; i < this.dts.length; i++)
				qa.assign(this.getQad(this.dts[i]), this.dts[i]);
			this.dts = [];
		}
		this.getQad = function(dot) {
			var i = (dot.loc[0] < this.loc[0] + (this.dim[0] / 2)) ? 0 : 1;
			var j = (dot.loc[1] < this.loc[1] + (this.dim[1] / 2)) ? 0 : 1;
			return this.qds[j][i];
		}
		this.putDot = function(dot) {
			this.dts.push(dot);
			dot.qad = this;
		}
		this.rmvDot = function(dot) {
			for (var i = 0; i < this.dts.length; i++) {
				if(this.dts[i].id === dot.id) {
					this.dts[i] = this.dts[this.dts.length - 1];
					this.dts.pop();
					dot.qad = null;
					return;
				}
			}
		}
		this.isInside = function(dot) {
			if (dot.loc[0] >= this.loc[0] && dot.loc[0] <= this.loc[0] + this.dim[0])
				if (dot.loc[1] >= this.loc[1] && dot.loc[1] <= this.loc[1] + this.dim[1])
					return true;
			return false;
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
				this.ctx.moveTo(Math.round(qad.dts[i].loc[0]) + qad.dts[i].r, Math.round(qad.dts[i].loc[1]));
				this.ctx.arc(Math.round(qad.dts[i].loc[0]), Math.round(qad.dts[i].loc[1]), qad.dts[i].r, 0, 2*Math.PI);
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
				this.clean(qad.par);
			}
		}
	},
	clean: function(qad) {
		if (qad.qds !== null) {
			var empty = true;
			for (var i = 0; i < 2; i++)
				for (var j = 0; j < 2; j++)
					if (qad.qds[i][j].dts.length !== 0 || qad.qds[i][j].qds !== null) {
						empty = false;
						break;
					}
			if (empty) {
				qad.qds = null;
				this.clean(qad.par);
			}
		}
	}
};

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