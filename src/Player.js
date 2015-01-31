var Player = function(id, x, y, key, game) {
	this.game = game;
	this.player = null;
	this.score = 0;
	this.direction = 1;
	this.id = id;
	this.x = x;
	this.y = y;
	this.key = key;
	this.killTrail = false;
	this.dead = false;
	this.groupTrail = null;
	this.ready = true;
	this.speed = 1;
	this.angularVelocity = 1;
	this.growth = 30;
	this.frameCount = 0;
	this.lastTrailLength = 0;
	this.enemyTrails = [];
	this.keyText = null;
	this.circle = null;
	this.trailPiece = null;
	this.collectSound = null;
	this.paused = false;
	this.border = [0, this.game.world.width/this.game.world.scale.x,
					0,this.game.world.height/this.game.world.scale.y]
};

Player.prototype = {

	create: function() {
		this.groupTrail = this.game.add.group();
		this.player = this.game.add.sprite(this.x, this.y, 'player' + this.id);
		this.player.anchor.setTo(.5,.5);
		groupTrails.push(this.groupTrail);

		this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.setSize(16*this.game.world.scale.x, 16*this.game.world.scale.x, 0, 0);
		this.groupTrail.enableBody = true;
    //this.groupTrail.physicsBodyType = Phaser.Physics.ARCADE;
    this.lastTrailLength = this.growth;

    //create sound effects
    this.collectSounds = [
    	this.game.add.audio('sfx_collect0'),
    	this.game.add.audio('sfx_collect1'),
    	this.game.add.audio('sfx_collect2'),
    	this.game.add.audio('sfx_collect3')];
		this.unpause();

		this.game.input.onDown.add(this.keyPressed, this);
		this.game.input.keyboard.addKey(this.key).onDown.add(this.keyPressed, this);


	},

	update: function() {
		if (!this.paused && paused) {
			console.log("player attempt pause")
			this.paused = true;
			this.pause();
		} else if (this.paused && !paused) {
			this.paused = false;
			this.unpause();
		}

		if (!this.paused) {
			this.game.physics.arcade.velocityFromAngle(this.player.angle, 300*this.speed, this.player.body.velocity);
			this.player.body.angularVelocity = this.direction*200*this.angularVelocity*this.speed;
			this.frameCount = (this.frameCount + 1) % 1/(this.speed*this.game.world.scale.x);

			if (numberPlayers > 0) {
				this.game.physics.arcade.overlap(this.player, this.enemyTrails, this.kill, null, this);
			} else {
				this.game.physics.arcade.collide(this.player, this.groupTrail, this.kill, null, this);
			}

			this.game.physics.arcade.overlap(this.player, groupPowers, this.collect, null, this);

			//Create trail
			if (this.ready && this.frameCount == 0) {
				this.trailPiece = this.groupTrail.create(this.player.x, this.player.y, 'trail' + this.id);
				this.trailPiece.body.immovable = true;
				this.trailPiece.anchor.setTo(.5,.5);
			}
			
			//erase trail from behind
			if(this.dead && this.frameCount == 0){
				this.killTrail = true;
				this.ready = false;
				//getAt() returns -1 if the object doesn't exist
				var obj = this.groupTrail.getAt(this.groupTrail.length - 1);
				if (obj != -1)
		    	{
		    		obj.body.destroy();
		        obj.kill();
		        obj.parent.removeChild(obj);
		    	}
			}

			if (!this.killTrail && (this.groupTrail.length >= (this.lastTrailLength + this.growth))) {
				this.killTrail = true;
				this.lastTrailLength = this.groupTrail.length;
			}

			//erase trail from front
			if(this.killTrail && this.frameCount == 0){

				//getFirstAlive() returns null if the object doesn't exist
				var obj = this.groupTrail.getFirstAlive();
			    if (obj)
			    {
		    		obj.body.destroy();
		        obj.kill();
		        obj.parent.removeChild(obj);
			    }
			}

			//Screen border collisions
			/*if (numberPlayers > 0) {
				if(((this.player.x-16)<=this.border[0]) || ((this.player.x+16)>=this.border[1])){
					this.kill();
				}
				if(((this.player.y-16)<=this.border[2]) || ((this.player.y+16)>=this.border[3])){
					this.kill();
				}
			} else {*/
			if((this.player.x+8)<=this.border[0]) {
				this.player.x = this.border[1];
			} else if ((this.player.x-8)>=this.border[1]) {
				this.player.x = this.border[0];
			}

			if((this.player.y+8)<=this.border[2]) {
				this.player.y = this.border[3];
			} else if ((this.player.y-8)>=this.border[3]) {
				this.player.y = this.border[2];
			}
			/*}*/
		}
		//Show player's key
		if (!this.keyText) {
			this.keyText = this.game.add.text(
				Math.round(Math.cos(this.player.rotation + Math.PI/2)*88) + this.x,
				Math.round(Math.sin(this.player.rotation + Math.PI/2)*88) + this.y,
				String.fromCharCode(this.key), {
		      font: "80px Arial Black",
		      fill: "#ffffff",
		      align: "center"
		  	});
	  	this.keyText.anchor.setTo(0.5,0.5);

	  	if (numberPlayers == 0) {
	  		this.keyText.setText(bestScore);
	  		this.keyText.scale.set(0.75);
	  	}
		}

	},


	keyPressed: function() {
		if(gameOver && numberPlayers == 0){
			gameOver=false;
			this.game.state.restart(true,false,numberPlayers);
		} else {
			this.direction *= -1;
			if (this.keyText.alpha == 1) {
				this.game.add.tween(this.keyText).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
			}
		}
	},

	kill: function(player, trail) {
		this.keyText.destroy();
		if(!this.dead){
			this.player.kill();
			this.dead = true;
			if (trail) {
				this.circle = new Phaser.Circle(trail.x, trail.y, 16);
				console.log('Player ' + this.id + 'collided with ' + trail.frameName);
				console.log(trail);
				//this.game.paused = true;

			} else {
				console.log('Player ' + this.id + 'collided with a wall');
			}

			var newMax = -1;
			for (var i = 0; i < players.length; i++) {
				if (i != this.id && players[i].score > newMax && !players[i].dead) {
					newMax = players[i].score;
					crowned = i;
				}
			}
			if (crowned != -1 && players[crowned].dead) {
				crowned = -1;
			}
		}
	},

	collect: function(player, power) {

		this.collectSounds[this.game.rnd.integerInRange(0, 3)].play();

		power.kill();
		this.killTrail = false;
		this.growth = 30*power.scale.x;
		this.score = this.score + power.scale.x;
		console.log("palyer" + this.id + " is now " + this.score)

		if (this.score > highScore && numberPlayers != 0) {
			highScore = this.score;
			crowned = this.id;
			lastCrowned = crowned+1;
			players[crowned].removeCrown();
			console.log(crowned)
		}

		if (numberPlayers == 0) {
			highScore++;
			var powerup = new PowerUp(this.game);
			powerup.preload();
			powerup.create();

			if (highScore > bestScore) {
				bestScore = highScore;
				localStorage.setItem("highScore", highScore);
			}
		}

	},

	addCrown: function() {
		this.player.loadTexture('crown' + this.id)
	},

	removeCrown: function() {
		this.player.loadTexture('player' + this.id)
	},

	pause: function() {
		console.log("player pause")
		this.player.body.angularVelocity = 0;
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		//this.game.physics.arcade.velocityFromAngle(this.player.angle, 300*this.speed, this.player.body.velocity);
	},

	unpause: function() {
		console.log("player unpause")
		this.player.body.angularVelocity = this.direction*200*this.angularVelocity*this.speed;
		//this.player.body.velocity = 1;
		//this.game.physics.arcade.velocityFromAngle(this.player.angle, 300*this.speed, this.player.body.velocity);
	},

	render: function(){
		this.game.debug.geom(this.circle,'#cfffff');
		//this.game.debug.body(this.player);

	}
};