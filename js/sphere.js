
function Sphere(scene)
{
	//this.geo = new THREE.SphereGeometry(25, 32, 32);
	//this.mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
	//this.mesh = new THREE.Mesh(this.geo, this.mat);
	//scene.add(this.mesh);

	this.radius = 60;
	this.height = 40;

	this.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height, 32 );
	this.mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	this.mat.transparent = true;
	this.mat.opacity = 0.5;
	this.mesh = new THREE.Mesh( this.geo, this.mat );
	scene.add( this.mesh );

	this.isGrabbed = false;
	this.grabTimer = 0;
	this.offset = null;
};

Sphere.prototype.update = function () {
	this.grabTimer -= 1;

	if (this.grabTimer < 0 && this.isGrabbed) {
		this.release()
	}

	var d = new Date();
	var n = d.getTime();
	this.mat.opacity = 0.5-0.25*Math.sin(n/1000);
}

Sphere.prototype.checkCollision = function (hand)
{
	//var dist = this.mesh.position.distanceTo(arrayToVector(hand.palmPosition));
	//return dist < 50;

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
		if (!this.isGrabbed) {
			var fac = generalSmoothStep(10, dist/this.radius);
			console.log(dist/this.radius, fac);
			congaSounds[0].play(-500 + fac*500);
		}
		this.grab(hand);
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

Sphere.prototype.grab = function (hand)
{
	this.isGrabbed = true;
	this.grabTimer = 4;
	this.mat.color.setHex(0x0000FF);

	if (this.offset === null) {
		this.offset = new THREE.Vector3(0, 0, 0);
		this.offset.add( arrayToVector(hand.palmPosition) );
		this.offset.sub( this.mesh.position );
	}
};

Sphere.prototype.followHand = function (hand) {
	this.mesh.position.fromArray(hand.palmPosition);
	this.mesh.position.sub(this.offset);
}

Sphere.prototype.release = function ()
{
	this.isGrabbed = false;
	this.grabTimer = 0;
	this.mat.color.setHex(0xFFFF00);

	this.offset = null;
};

extend( THREE.SphereGeometry, Sphere );
