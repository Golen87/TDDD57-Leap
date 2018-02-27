
function Note(scene, radius, track, time)
{
	/* Cylinder */
	this.radius = radius;
	this.height = 40;

	this.geo = new THREE.CylinderGeometry( this.radius, this.radius, this.height/2, 32 );
	this.mat = new THREE.MeshBasicMaterial( {color: 0xE91E63} );
	this.mat.transparent = true;
	this.mesh = new THREE.Mesh( this.geo, this.mat );
	scene.add( this.mesh );

	this.mat.opacity = 0.5;

	/* Position */
	this.track = track;
	this.time = time;

	this.parentPos = drums[this.track].mesh.position.clone();
	this.mesh.position.copy(this.parentPos);
};

Note.prototype.update = function (elapsed) {
	const SCALE = 100; // Dist between two bars

	this.mesh.position = this.parentPos.clone();
	//this.mesh.position.y += SCALE * this.time;
};
