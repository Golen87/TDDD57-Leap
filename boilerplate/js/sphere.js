
function Sphere(scene)
{
	this.geo = new THREE.SphereGeometry(25, 32, 32);
	this.mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
	this.mesh = new THREE.Mesh(this.geo, this.mat);
	scene.add(this.mesh);
};

Sphere.prototype.func = function ()
{
};

extend( THREE.SphereGeometry, Sphere );
