qa.Quad = function(loc, dim, par) {
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
				this.dts.splice(i, 1);
				dot.qad = null;
				break;
			}
		}
		// this.par.clean();
	}
	this.isInside = function(dot) {
		if (dot.loc[0] >= this.loc[0] && dot.loc[0] <= this.loc[0] + this.dim[0])
			if (dot.loc[1] >= this.loc[1] && dot.loc[1] <= this.loc[1] + this.dim[1])
				return true;
		return false;
	}
	this.clean = function() {
		if (this.qds !== null) {
			var empty = true;
			for (var i = 0; i < 2; i++)
				for (var j = 0; j < 2; j++)
					if (this.qds[i][j].dts.length !== 0 || this.qds[i][j].qds !== null) {
						empty = false;
						break;
					}
			if (empty) {
				this.qds = null;
				this.par.clean();
			}
		}
	}
};