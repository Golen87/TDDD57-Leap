
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
	this.hitAreas.push(area);
};


Drum.prototype.update = function () {
	for (var i = 0; i < this.hitAreas.length; i++) {
		this.hitAreas[i].update();
	}
}

Drum.prototype.checkCollision = function (hand)
{
	for (var i = 0; i < this.hitAreas.length; i++) {
		this.hitAreas[i].checkCollision(hand);
	}
};
