
function Note(scene, area, time)
{
	this.scene = scene;

	/* Cylinder */
	this.radius = hitAreas[area].radius * 0.8;
	this.height = 20;

	/* Position */
	this.area = area;
	this.time = time;

	this.parentPos = hitAreas[area].mesh.position.clone();
};

Note.prototype.update = function (elapsed) {
	const SCALE = 100; // Dist between two bars
	const OFFSET = 10;

	var fac = Math.abs(this.time - elapsed)/4;

	if (this.mesh) {
		this.mesh.position.y = this.parentPos.y + SCALE * (this.time - elapsed) + OFFSET;

		this.mesh.scale.copy(this.scale);
		this.mesh.scale.multiplyScalar(Math.pow(Math.max(0.001, 1-fac), 0.8));
		this.mat.opacity = 1-fac;

		if (fac > 2) {
			this.destroy();
		}
	} else {
		if (fac < 2) {
			this.create();
		}
	}
};

Note.prototype.create = function (elapsed) {
	this.geo = new THREE.SphereGeometry( this.radius, 32, 32 );
	//this.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height/2, 32 );
	this.mat = new THREE.MeshBasicMaterial( {color: 0xE91E63} );
	this.mat.transparent = true;
	this.mesh = new THREE.Mesh( this.geo, this.mat );
	scene.add( this.mesh );

	this.scale = new THREE.Vector3(1, 0.2, 1);
	this.mesh.castShadow = true;
	this.mat.opacity = 0;

	this.mesh.position.copy(this.parentPos);
};

Note.prototype.destroy = function (elapsed) {
	this.scene.remove(this.mesh);
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
	this.mesh = undefined;
};
