var PowerUp = function(game) {
	this.game = game;
	this.sprite = null;
	this.x;
	this.y;
	this.size = 1;
};

PowerUp.prototype = {

	create: function() {
		if (numberPlayers > 0) {
			var randNum = this.game.rnd.integerInRange(0, 100);
			if (randNum < 60) {
				this.size = 1;
			} else if (randNum < 80) {
				this.size = 2;
			} else if (randNum < 95) {
				this.size = 3;
			} else {
				this.size = 4;
			}
		} else {
			if (mobile) {
				this.size = 1.5;
			} else {
				this.size = 1;
			}
		}

		this.place();

		if(nextBallHigh == 1){
			this.sprite.loadTexture('superPower');
			nextBallHigh = 2;
		}

		groupPowers.add(this.sprite);

		if (numberPlayers == 0) {
			powerText.setText(highScore+1);
			powerText.x = this.sprite.x;
			powerText.y = this.sprite.y;
		}
	},

	place: function() {
		this.x = this.game.rnd.integerInRange(32/gameScale, 2*w2-32/gameScale);
		this.y = this.game.rnd.integerInRange(32/gameScale, 2*h2-32/gameScale);

		this.sprite = this.game.add.sprite(this.x, this.y, 'power');

		this.sprite.anchor.setTo(.5,.5);
		this.sprite.scale.set((this.size/2)*gameScale);

		this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

		var collSize = 16*gameScale;
		for (var i = 0; i < players.length; i++) {
			for (var j = 0; j < players[i].trailArray.length; j++) {
				var curTrail = players[i].trailArray[j];
				if (curTrail && curTrail.x-collSize < this.sprite.x && curTrail.x+collSize > this.sprite.x &&
					 	curTrail.y-collSize < this.sprite.y && curTrail.y+collSize > this.sprite.y) {
					 	this.sprite.kill();
						this.place();
				}
			}
		}
	},

	render: function(){
		//this.game.debug.body(this.sprite);
	}
};