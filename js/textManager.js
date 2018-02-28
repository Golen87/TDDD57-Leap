
function TextManager()
{
};

TextManager.prototype.init = function(scene, font) {
	this.scene = scene;
	this.font = font;
};

TextManager.prototype.addText = function(string, size, thickness) {
	var textGeo = new THREE.TextGeometry( string, {
		font: this.font,
		size: size,
		height: thickness,
	} );
	textGeo.center();
	var textMaterial = new THREE.MeshStandardMaterial({
		color: 0xEF6033,
		metalness: 0.0,
	});
	var text = new THREE.Mesh(textGeo , textMaterial);
	text.castShadow = true;
	text.receiveShadow = true;
	this.scene.add(text);

	return text;
}
