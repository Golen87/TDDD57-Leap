
var baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
var armMeshes = [];
var boneMeshes = [];
var drums = [];
var hitAreas = [];


var audioManager = new AudioManager();
var textManager = new TextManager();
var noteManager = null;

var stats, renderer, scene, camera, controls;

var controller = Leap.loop({background: true}, leapAnimate);
controller.connect();

window.requestAnimationFrame(step);

var files_to_preload = [
	{ type: 'mesh', name: 'conga' },
	{ type: 'mesh', name: 'bongos' }
];

pre_init();

function pre_init() {
	renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	stats = new Stats();
	stats.domElement.style.cssText = 'position: absolute; right: 0; top: 0; z-index: 100; ';
	document.body.appendChild(stats.domElement);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.set(0, 1000, 700);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxDistance = 1000;

	controls.target.set(0, 300, 0);

	scene = new THREE.Scene();

	preload_files(files_to_preload).then(init);
}

function init(preloaded_data) {
	var geometry = new THREE.PlaneBufferGeometry( 100, 100 );
	var planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffdd99 } );
	var ground = new THREE.Mesh( geometry, planeMaterial );
	ground.position.set( 0, -100, 0 );
	ground.rotation.x = - Math.PI / 2;
	ground.scale.set( 100, 100, 100 );
	ground.castShadow = false;
	ground.receiveShadow = true;
	scene.add( ground );

	audioManager.init(camera);
	textManager.init(scene);

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
	var drumData = [
		{type: 'conga', position: [-150, -30,  -28], sound: 'conga1'},
		{type: 'conga', position: [ -58,  30, -100], sound: 'conga2'},
		{type: 'conga', position: [  58,  30, -100], sound: 'conga3'},
		{type: 'conga', position: [ 150, -30,  -28], sound: 'conga4'},
		{type: 'bongo', position: [   0, 100,   40], sound: ['bongo1', 'bongo2']},
	];


	var pLight = new THREE.SpotLight(0xffffff);
	pLight.position.set(0, 1000, 0);
	pLight.castShadow = true;
	pLight.shadow.camera.fov = 30;
	pLight.shadow.camera.far = 6000;
	pLight.shadow.mapSize.width = 2048;
	pLight.shadow.mapSize.height = 2048;
	scene.add(pLight);

	var aLight = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( aLight );

	// Create congas
	var congaMesh = preloaded_data['conga'];
	congaMesh.scale.set(50*scale, 50*scale, 50*scale);
	congaMesh.traverse(function(child) {
		if (child instanceof THREE.Mesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});

	for (var i = 0; i < drumData.length; i++) {
		var data = drumData[i];
		if (data.type == 'conga') {
			var pos = arrayToVector(data.position);
			pos.multiplyScalar(scale);

			var drum = new Drum(scene, i);
			drum.mesh = congaMesh.clone();
			drum.mesh.position.copy(pos);
			scene.add(drum.mesh);
			drums.push(drum)

			var area = new HitArea(scene, data.sound, 56*scale);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 198*scale;
			hitAreas.push(area);
			drum.addHitArea(area);
		}
	}

	// Create bongos
	var bongoMesh = preloaded_data['bongos'];
	bongoMesh.scale.set(50*scale, 50*scale, 50*scale);
	bongoMesh.traverse(function(child) {
		if (child instanceof THREE.Mesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});

	for (var i = 0; i < drumData.length; i++) {
		var data = drumData[i];
		if (data.type == 'bongo') {
			var pos = arrayToVector(data.position);
			pos.multiplyScalar(scale);

			var drum = new Drum(scene, i);
			drum.mesh = bongoMesh.clone();
			drum.mesh.position.copy(pos);
			scene.add(drum.mesh);
			drums.push(drum)

			var area = new HitArea(scene, data.sound[0], 53*scale);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 55*scale;
			area.mesh.position.x -= 59*scale;
			hitAreas.push(area);
			drum.addHitArea(area);

			var area = new HitArea(scene, data.sound[1], 43*scale);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 55*scale;
			area.mesh.position.x += 65*scale;
			hitAreas.push(area);
			drum.addHitArea(area);
		}
	}

	noteManager = new NoteManager(scene);
	noteManager.loadSong('assets/notedata/testsong');

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function addMesh(meshes) {
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshLambertMaterial({color: 0xe59482});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	meshes.push(mesh);

	material.transparent = true;
	material.opacity = 0.4;

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
}

function step(timestamp) {
	/* Update drums */

	if (audioManager.getBar() != audioManager.lastBar && audioManager.getBar() >= 0) {
		audioManager.lastBar = audioManager.getBar();

		for (var i = 0; i < drums.length; i++) {
			drums[i].hit(0.02);
		}
	}

	for (var i = 0; i < drums.length; i++) {
		drums[i].update();
	}

	if (audioManager) {
		audioManager.update();
	}
	if (noteManager) {
		noteManager.update(audioManager.getElapsed());
	}

	renderer.render(scene, camera);
	controls.update();
	stats.update();

	window.requestAnimationFrame(step);
}
