
function Note(scene, radius)
{
	//this.id = id;

	this.radius = radius;
	this.height = 40;

	this.isHit = false;
	this.hitTimer = 0;

	this.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height/2, 32 );
	this.mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	this.mat.transparent = true;
	this.mesh = new THREE.Mesh( this.geo, this.mat );
	scene.add( this.mesh );
};

Note.prototype.update = function () {
	this.mesh.position.z += 1;
	this.hitTimer -= 1;

	if (this.hitTimer < 0 && this.isHit) {
		this.release()
	}

	this.mat.opacity -= (this.mat.opacity - 0.3) / 20;
}

Note.prototype.checkCollision = function (hand)
{
	var point = arrayToVector(hand.fingers[2].tipPosition);
	var velocity = arrayToVector(hand.fingers[2].tipVelocity);
	//point.y += velocity.y/100; Will pass through

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
			//congaSounds[this.id].play(0 + fac*700);
		}
		this.hit(hand);
	}
};

Note.prototype.hit = function (hand) {
	this.isHit = true;
	this.hitTimer = 4;

	this.mat.color.setHex(0x00FF00);
	this.mat.opacity = 0.8;
};

Note.prototype.release = function () {
	this.isHit = false;
	this.hitTimer = 0;
	this.mat.color.setHex(0xFFFF00);
};
