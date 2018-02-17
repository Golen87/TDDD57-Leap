
function Drum(scene, id)
{
	this.id = id;

	this.radius = 56;
	this.height = 40;

	this.isHit = false;
	this.hitTimer = 0;
	this.offset = null;

	this.hitArea = new THREE.CylinderGeometry();
	this.hitArea.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height, 32 );
	this.hitArea.mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	this.hitArea.mat.transparent = true;
	this.hitArea.mesh = new THREE.Mesh( this.hitArea.geo, this.hitArea.mat );
	scene.add( this.hitArea.mesh );
};

Drum.prototype.update = function () {
	this.hitTimer -= 1;

	if (this.hitTimer < 0 && this.isHit) {
		this.release()
	}

	this.hitArea.mat.opacity -= (this.hitArea.mat.opacity - 0.3) / 20;
}

Drum.prototype.checkCollision = function (hand)
{
	//var dist = this.mesh.position.distanceTo(arrayToVector(hand.palmPosition));
	//return dist < 50;

	var point = arrayToVector(hand.fingers[2].tipPosition);
	var velocity = arrayToVector(hand.fingers[2].tipVelocity);
	//point.y += velocity.y/100; Will pass through

	var planePoint = point.clone();
	planePoint.y = this.hitArea.mesh.position.y;
	var dist = this.hitArea.mesh.position.distanceTo(planePoint);

	var hDiff = Math.abs(this.hitArea.mesh.position.y - point.y);

	if (dist < this.radius &&
		hDiff < this.height &&
		velocity.y < -100)
	{
		if (!this.isHit) {
			var fac = generalSmoothStep(10, Math.pow(dist/this.radius, 2));
			congaSounds[this.id].play(0 + fac*700);
		}
		this.hit(hand);
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

Drum.prototype.hit = function (hand) {
	this.isHit = true;
	this.hitTimer = 4;
	this.hitArea.mat.color.setHex(0x00FF00);

	if (this.offset === null) {
		this.offset = new THREE.Vector3(0, 0, 0);
		this.offset.add( arrayToVector(hand.palmPosition) );
		this.offset.sub( this.hitArea.mesh.position );
	}

	this.hitArea.mat.opacity = 0.8;
};

Drum.prototype.followHand = function (hand) {
	this.hitArea.mesh.position.fromArray(hand.palmPosition);
	this.hitArea.mesh.position.sub(this.offset);
}

Drum.prototype.release = function () {
	this.isHit = false;
	this.hitTimer = 0;
	this.hitArea.mat.color.setHex(0xFFFF00);

	this.offset = null;
};
