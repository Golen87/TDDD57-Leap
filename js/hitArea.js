
function HitArea(scene, id, radius)
{
	this.id = id;

	this.radius = radius;
	this.height = 60;

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
}

HitArea.prototype.checkCollision = function (hand)
{
	for (var i = 0; i < hand.fingers.length; i++) {
		if (hand.fingers[i]) {
			var point = arrayToVector(hand.fingers[i].tipPosition);
			var velocity = arrayToVector(hand.fingers[i].tipVelocity);
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

	var hDiff = Math.abs(this.mesh.position.y - point.y);

	if (dist < this.radius &&
		hDiff < this.height &&
		velocity.y < -100)
	{
		if (!this.isHit) {
			var fac = generalSmoothStep(10, Math.pow(dist/this.radius, 2));
			sidetapSound.play();
			congaSounds[this.id].play(0 + fac*700);
		}
		this.hit();
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

HitArea.prototype.hit = function () {
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
