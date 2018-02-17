
var baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
var armMeshes = [];
var boneMeshes = [];
var spheres = [];
var congaSounds = [];

var congaFiles = [
	'assets/sounds/99735__menegass__conga-2.wav',
	'assets/sounds/121095__thirsk__conga1.wav',
	'assets/sounds/121104__thirsk__conga3.wav',
	'assets/sounds/121096__thirsk__conga2.wav'
];

var stats, renderer, scene, camera, controls;

init();
Leap.loop({background: true}, leapAnimate).connect();

function init() {
	stats = new Stats();
	stats.domElement.style.cssText = 'position: absolute; right: 0; top: 0; z-index: 100; ';
	document.body.appendChild(stats.domElement);

	renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.set(0, 700, 500);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxDistance = 1000;

	controls.target.set(0, 200, 0);

	scene = new THREE.Scene();


	/* Helpers */

	var gridHelper = new THREE.GridHelper(150, 10);
	scene.add(gridHelper);

	var axisHelper = new THREE.AxisHelper(150);
	scene.add(axisHelper);

	var geometry = new THREE.BoxGeometry(300, 20, 300);
	var material = new THREE.MeshNormalMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, -10, 0);
	scene.add(mesh);

	/* Spheres */

	var s = new Sphere(scene);
	s.mesh.position.set(0, 200, 0);
	spheres.push(s);

	var s = new Sphere(scene);
	s.mesh.position.set(100, 300, 0);
	spheres.push(s);

	var s = new Sphere(scene);
	s.mesh.position.set(-100, 200, -100);
	spheres.push(s);

	var pLight = new THREE.PointLight(0xffffff);
	pLight.position.set(300, 300, 300);
	scene.add(pLight);

	var aLight = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( aLight );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load('assets/models/conga.mtl', function(materials) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load('assets/models/conga.obj', function(object) {
			object.scale.set(50, 50, 50);

			for (var i = 0; i < 4; i++) {
				var drum = new Drum(scene);
				drum.mesh = object.clone();
				drum.mesh.position.set(i * 120, 0, 0);
				scene.add(drum.mesh);
			}
		});
	});

	for (var soundFile of congaFiles) {
		congaSounds.push(new Sound(soundFile));
	}

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

		//hand.fingers[2].tipPosition

		let grabbed = hand.grabStrength > 0.5;
		if (grabbed || true) {
			for (var i = spheres.length - 1; i >= 0; i--) {
				var s = spheres[i];
				s.checkCollision(hand);
			}
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


	/* Update spheres */

	for (var i = spheres.length - 1; i >= 0; i--) {
		spheres[i].update();
	}


	renderer.render(scene, camera);
	controls.update();
	stats.update();
}
