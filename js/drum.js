
function Drum(scene, id)
{
	this.id = id;

	this.radius = 56;
	this.height = 40;

	this.isHit = false;
	this.hitTimer = 0;
	this.offset = null;

	this.hitAreas = []
};

Drum.prototype.addHitArea = function(area) {
	area.owner = this;
	this.hitAreas.push(area);
};


Drum.prototype.update = function () {
	for (var i = 0; i < this.hitAreas.length; i++) {
		this.hitAreas[i].update();
	}

	if (this.originalScale) {
		this.mesh.scale.x += (this.originalScale.x - this.mesh.scale.x)/5;
		this.mesh.scale.y += (this.originalScale.y - this.mesh.scale.y)/5;
		this.mesh.scale.z += (this.originalScale.z - this.mesh.scale.z)/5;
	}
}

Drum.prototype.checkCollision = function (hand)
{
	for (var i = 0; i < this.hitAreas.length; i++) {
		this.hitAreas[i].checkCollision(hand);
	}
};

Drum.prototype.hit = function ()
{
	if (!this.originalScale) {
		this.originalScale = this.mesh.scale.clone();
	}

	this.mesh.scale.x = this.originalScale.x * 1.1;
	this.mesh.scale.y = this.originalScale.y * 0.9;
	this.mesh.scale.z = this.originalScale.z * 1.1;
};
