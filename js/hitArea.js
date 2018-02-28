
function HitArea(scene, sound, radius, callback)
{
	this.sound = sound;

	this.radius = radius;
	this.height = 40;
	this.callback = callback;

	this.isHit = false;
	this.hitTimer = 0;

	this.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height/2, 32 );
	this.mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	this.mat.transparent = true;
	this.mesh = new THREE.Mesh( this.geo, this.mat );
	scene.add( this.mesh );
};

HitArea.prototype.update = function () {
	this.hitTimer -= 1;

	if (this.hitTimer < 0 && this.isHit) {
		this.release()
	}

	this.mat.opacity -= (this.mat.opacity - 0.3) / 20;
	this.mat.opacity = 0;
}

HitArea.prototype.checkCollision = function (hand)
{
	// Skip thumb
	var fingerOrder = [2,3,1,4];
	for (var i = 0; i < 4; i++) {
		var f = fingerOrder[i];
		if (hand.fingers[f]) {
			var point = arrayToVector(hand.fingers[f].tipPosition);
			var velocity = arrayToVector(hand.fingers[f].tipVelocity);
			//point.y += velocity.y/100; Will pass through
			this.checkPointCollision(point, velocity);
		}
	}
};

HitArea.prototype.checkPointCollision = function (point, velocity)
{
	var planePoint = point.clone();
	planePoint.y = this.mesh.position.y;
	var dist = this.mesh.position.distanceTo(planePoint);

	var hDiff = Math.abs(this.mesh.position.y - point.y - this.height);

	if (dist < this.radius &&
		hDiff < this.height &&
		velocity.y < -100)
	{
		var distFac = generalSmoothStep(10, Math.pow(dist/this.radius, 2));
		var speedFac = Math.min(1000, -velocity.y - 100) / 1000;

		if (!this.isHit) {
			var volume = 0.5 + 1.5 * speedFac - 1.0 * distFac;
			var volumeSide = 1.0 * distFac + 0.5 * speedFac;
			var pitch = 1.0 + 0.5 * distFac;
			var pitchSide = 0.9 + (100-this.radius)/100; // 65-85 (0.15-0.35)
			//var pitchSide = drumFiles[this.sound].pitch;

			audioManager.play(this.sound, volume, pitch);
			audioManager.play('side', volumeSide, pitchSide);

			this.owner.hit(0.05 + 0.15*speedFac);
			if (this.callback) {
				this.callback(this, planePoint);
			}
		}
		this.hit(speedFac);
	}

	// Color gradient over distance
	//dist = Math.max(0, Math.min(1, dist/500));
	//var color = pickHex([255,0,0], [0,255,0], dist);
	//this.mat.color.setRGB(color[0]/255, color[1]/255, color[2]/255);

	//var color = 0xFF0000;
	//if (dist < 50)
	//	var color = 0x00FF00;
	//this.mat.color.setHex(color);
};

HitArea.prototype.hit = function (speedFac) {
	this.isHit = true;
	this.hitTimer = 4;

	this.mat.color.setHex(0x00FF00);
	this.mat.opacity = 0.8;
};

HitArea.prototype.release = function () {
	this.isHit = false;
	this.hitTimer = 0;
	this.mat.color.setHex(0xFFFF00);
};

extend( THREE.CylinderGeometry, HitArea );
