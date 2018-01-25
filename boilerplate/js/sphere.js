
function Sphere(scene)
{
	this.geo = new THREE.SphereGeometry(25, 32, 32);
	this.mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
	this.mesh = new THREE.Mesh(this.geo, this.mat);
	scene.add(this.mesh);

	this.isGrabbed = false;
	this.grabTimer = 0;
};

Sphere.prototype.update = function () {
	this.grabTimer -= 1;

	if (this.grabTimer < 0 && this.isGrabbed) {
		this.release()
	}
}

Sphere.prototype.checkCollision = function (handPos)
{
	var dist = this.mesh.position.distanceTo(arrayToVector(handPos));
	return dist < 50;

	// Color gradient over distance
	//dist = Math.max(0, Math.min(1, dist/500));
	//var color = pickHex([255,0,0], [0,255,0], dist);
	//this.mat.color.setRGB(color[0]/255, color[1]/255, color[2]/255);

	//var color = 0xFF0000;
	//if (dist < 50)
	//	var color = 0x00FF00;
	//this.mat.color.setHex(color);
};

Sphere.prototype.grab = function ()
{
	this.isGrabbed = true;
	this.grabTimer = 4;
	this.mat.color.setHex(0x0000FF);
};

Sphere.prototype.release = function ()
{
	this.isGrabbed = false;
	this.grabTimer = 0;
	this.mat.color.setHex(0xFFFF00);
};

extend( THREE.SphereGeometry, Sphere );
