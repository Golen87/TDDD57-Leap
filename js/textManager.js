
function TextManager()
{
};

TextManager.prototype.init = function(scene, font) {
	this.scene = scene;
	this.font = font;

	this.addText("TDDD57");
};

TextManager.prototype.addText = function(string) {
	var textGeo = new THREE.TextGeometry( string, {
		font: this.font,
		size: 80,
		height: 10,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 5,
		bevelSegments: 8
	} );
	textGeo.center();
	var color = new THREE.Color();
	color.setRGB(255, 0, 0);
	var textMaterial = new THREE.MeshNormalMaterial(); //{ color: color }
	var text = new THREE.Mesh(textGeo , textMaterial);
	text.position.set(0, 400, -300);
	this.scene.add(text);
}
