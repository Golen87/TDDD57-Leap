
var baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
var armMeshes = [];
var boneMeshes = [];
var drums = [];
var congaSounds = [];
var bongoSounds = [];

var congaFiles = [
	'assets/sounds/99735__menegass__conga-2.wav',
	'assets/sounds/75837__rossf__lm1-conga-hi.wav',
	'assets/sounds/99864__menegass__cngah.wav',
	'assets/sounds/99865__menegass__cngal.wav'
];

var bongoFiles = [
	'assets/sounds/99751__menegass__bongo1.wav',
	'assets/sounds/99752__menegass__bongo2.wav',
	'assets/sounds/99753__menegass__bongo3.wav',
	'assets/sounds/99754__menegass__bongo4.wav'
];

var sidetapSound, note;

var stats, renderer, scene, camera, controls;

init();
Leap.loop({background: true}, leapAnimate).connect();

function init() {
	stats = new Stats();
	stats.domElement.style.cssText = 'position: absolute; right: 0; top: 0; z-index: 100; ';
	document.body.appendChild(stats.domElement);

	renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap

	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.set(0, 1000, 700);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxDistance = 1000;

	controls.target.set(0, 300, 0);

	scene = new THREE.Scene();


	/* Helpers */

	var gridHelper = new THREE.GridHelper(150, 10);
	scene.add(gridHelper);

	var axisHelper = new THREE.AxesHelper(150);
	scene.add(axisHelper);

	var geometry = new THREE.BoxGeometry(300, 20, 300);
	var material = new THREE.MeshNormalMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.position.set(0, -10, 0);
	scene.add(mesh);

	/* Drums */

	var scale = 1.5;
	var positions = [
		new THREE.Vector3(-150*scale, -30*scale, -28*scale),
		new THREE.Vector3(-58*scale,  30*scale, -100*scale),
		new THREE.Vector3( 58*scale,  30*scale, -100*scale),
		new THREE.Vector3( 150*scale, -30*scale, -28*scale),
	];

	//for (var i=0; i<positions.length; i++) {
	//	var pos = positions[i];
	//	var s = new Sphere(scene, i);
	//	s.mesh.position.copy(pos);
	//	s.mesh.position.y += 200;
	//	drums.push(s);
	//}

	var pLight = new THREE.SpotLight(0xffffff);
	pLight.position.set(0, 100, 200);
	pLight.castShadow = true;
	var helper = new THREE.CameraHelper( pLight.shadow.camera );
	scene.add( helper );
	scene.add(pLight);
	pLight.shadow.camera.fov = 50;
	console.log(pLight)

	var pLight = new THREE.SpotLight(0xffffff);
	pLight.position.set(-100, 500, 100);
	pLight.castShadow = true;
	scene.add(pLight);

	var aLight = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( aLight );

	// Load congas
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load('assets/models/conga.mtl', function(materials) {
		materials.preload();
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load('assets/models/conga.obj', function(object) {
			object.scale.set(50*scale, 50*scale, 50*scale);
			object.castShadow = true;
			object.receiveShadow = true;

			for (var i = 0; i < positions.length; i++) {
				var pos = positions[i];
				var drum = new Drum(scene, i);
				drum.mesh = object.clone();
				drum.mesh.position.copy(pos);
				drum.mesh.castShadow = true;
				drum.mesh.receiveShadow = true;
				scene.add(drum.mesh);
				drums.push(drum)

				var area = new HitArea(scene, i, 56*scale);
				area.mesh.position.copy(pos);
				area.mesh.position.y += 198*scale;
				drum.addHitArea(area);
			}
		});
	});

	// Load bongos
	mtlLoader.load('assets/models/bongos.mtl', function(materials) {
		materials.preload();
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load('assets/models/bongos.obj', function(object) {
			object.scale.set(50*scale, 50*scale, 50*scale);
			object.castShadow = true;
			object.receiveShadow = true;

			var pos = new THREE.Vector3(0, 100*scale, 40*scale);
			var drum = new Drum(scene);
			drum.mesh = object.clone();
			drum.mesh.position.copy(pos);
			scene.add(drum.mesh);
			drums.push(drum);

			var area = new HitArea(scene, 0, 53*scale);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 55*scale;
			area.mesh.position.x -= 59*scale;
			drum.addHitArea(area);

			var area = new HitArea(scene, 0, 43*scale);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 55*scale;
			area.mesh.position.x += 65*scale;
			drum.addHitArea(area);
		});
	});

	for (var soundFile of congaFiles) {
		congaSounds.push(new Sound(soundFile));
	}

	for (var soundFile of bongoFiles) {
		bongoSounds.push(new Sound(soundFile));
	}

	sidetapSound = new Sound('assets/sounds/99863__menegass__cngad.wav');

	note = new Note(scene, 40);
	note.mesh.position.set(0, 0, -100);

	//var music = new Audio('assets/music/Donkey Kong Country OST 8 Bonus Room Blitz.mp3');
	//music.play();

	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	//var json = require('./data.json');
	//console.log(json);

	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'assets/music/Donkey Kong Country OST 8 Bonus Room Blitz.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		//sound.play();
	});

	var loader = new THREE.FontLoader();

	loader.load( 'assets/fonts/Super Mario 256_Regular.json', function ( font ) {
		var string = 'TDDD57';
		var textGeo = new THREE.TextGeometry( string, {
			font: font,
			size: 80,
			height: 50,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 5,
			bevelSegments: 8
		} );
		var color = new THREE.Color();
		color.setRGB(255, 0, 0);
		var textMaterial = new THREE.MeshNormalMaterial(); //{ color: color }
		var text = new THREE.Mesh(textGeo , textMaterial);
		text.position.set(-string.length/2*80*scale, 200*scale, -300*scale);
		scene.add(text);
	} );

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function addMesh(meshes) {
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshNormalMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	meshes.push(mesh);

	return mesh;
}

function updateMesh(bone, mesh) {
	mesh.position.fromArray(bone.center());
	mesh.setRotationFromMatrix((new THREE.Matrix4).fromArray(bone.matrix()));
	mesh.quaternion.multiply(baseBoneRotation);
	mesh.scale.set(bone.width, bone.width, bone.length);

	scene.add(mesh);
}

function leapAnimate(frame) {
	var countBones = 0;
	var countArms = 0;

	armMeshes.forEach(function(item) {
		scene.remove(item)
	});
	boneMeshes.forEach(function(item) {
		scene.remove(item)
	});

	//sphere.material.color = new THREE.Color(0xffff00);
	//sphere.position.x += 1;

	for (var hand of frame.hands) {

		//let grabbed = hand.grabStrength > 0.5;

		for (var i = 0; i < drums.length; i++) {
			drums[i].checkCollision(hand);
		}
		
		for (var finger of hand.fingers) {
			for (var bone of finger.bones) {
				if (countBones++ === 0)
					continue;

				var boneMesh = boneMeshes[countBones] || addMesh(boneMeshes);
				updateMesh(bone, boneMesh);
			}
		}

		var arm = hand.arm;
		var armMesh = armMeshes[countArms++] || addMesh(armMeshes);
		updateMesh(arm, armMesh);
		armMesh.scale.set(arm.width / 4, arm.width / 2, arm.length);
	}


	/* Update drums */

	for (var i = 0; i < drums.length; i++) {
		drums[i].update();
	}

	note.update();

	renderer.render(scene, camera);
	controls.update();
	stats.update();
}
