
var baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
var armMeshes = [];
var boneMeshes = [];
var drums = [];
var hitAreas = [];

var particleSystems = [];

var pMaterial = new THREE.PointsMaterial({
	color: 0xFFFFFF,
	size: 20,
	map: new THREE.TextureLoader().load(
		"assets/textures/particle.png"
	),
	blending: THREE.AdditiveBlending,
	transparent: true
});

var audioManager = new AudioManager();
var textManager = new TextManager();
var noteManager = null;

var stats, renderer, scene, camera, controls;

var startText = null;
var stillTimer = -1;
var lockTimer = 0;
var stillTrigger = 70;

var controller = Leap.loop({background: true}, leapAnimate);
controller.connect();

window.requestAnimationFrame(step);

var files_to_preload = [
	{ type: 'mesh', name: 'conga' },
	{ type: 'mesh', name: 'bongos' },
	{ type: 'font', name: 'Super Mario 256_Regular.json' },
];

for (var name in musicFiles) {
	files_to_preload.push({type: 'music', name: name});
}
for (var name in soundFiles) {
	files_to_preload.push({type: 'sound', name: name});
}

pre_init();

function pre_init() {
	renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.setClearColor(0xFFFFFF);

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

	audioManager.init(camera, preloaded_data);
	textManager.init(scene, preloaded_data['Super Mario 256_Regular.json']);

	var text = textManager.addText("TDDD57", 80, 20);
	text.position.set(0, 450, -250);

	startText = textManager.addText("Hold both hands to start", 25, 5);
	startText.position.set(0, 370, -220);
	startText.rotation.x = -Math.PI/8;

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
		{type: 'conga', position: [-150, -40,  -28], sound: 'conga1'},
		{type: 'conga', position: [ -58,  20, -100], sound: 'conga2'},
		{type: 'conga', position: [  58,  20, -100], sound: 'conga3'},
		{type: 'conga', position: [ 150, -40,  -28], sound: 'conga4'},
		{type: 'bongo', position: [   0,  90,   40], sound: ['bongo2', 'bongo1']},
		//{type: 'bongo', position: [   0, 200,   40], sound: ['bongo3', 'bongo4']},
	];


	var pLight = new THREE.SpotLight(0xffffff);
	pLight.position.set(0.0001, 1000, 0.0001);
	pLight.castShadow = true;
	pLight.shadow.camera.fov = 30;
	pLight.shadow.camera.far = 6000;
	pLight.shadow.mapSize.width = 2048;
	pLight.shadow.mapSize.height = 2048;
	scene.add(pLight);

	var aLight = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( aLight );


	var onHitCallback = function(hitArea, hitPoint) {
		if (audioManager.currentSong) {
			var acc = noteManager.hit(hitAreas.indexOf(hitArea), audioManager.getElapsed(), musicFiles[audioManager.currentSong].bpm);
			if (acc) {
				spawnParticles(hitArea.mesh.position, hitArea.radius, 200, accChart['color'][acc], accChart['size'][acc]);
			} else {
				spawnParticles(hitArea.mesh.position, hitArea.radius, 200, 0x777777);
			}
		} else {
			spawnParticles(hitArea.mesh.position, hitArea.radius, 200, 0x777777);
		}
	};


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

			var area = new HitArea(scene, data.sound, 56*scale, onHitCallback);
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

			var area = new HitArea(scene, data.sound[0], 53*scale, onHitCallback);
			area.mesh.position.copy(pos);
			area.mesh.position.y += 55*scale;
			area.mesh.position.x -= 59*scale;
			hitAreas.push(area);
			drum.addHitArea(area);

			var area = new HitArea(scene, data.sound[1], 43*scale, onHitCallback);
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
	//mesh.receiveShadow = true;
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

	if (frame.hands.length == 2) {
		var x = 0;
		for (var hand of frame.hands) {
			x += arrayToVector(hand.palmVelocity).length();
			if (hand.grabStrength < 0.5)
				x += 999;
		}
		var still = x < 400;

		if (still) {
			if (stillTimer < 0) {
				stillTimer = stillTrigger;
			}
			stillTimer -= 1;
			if (stillTimer == 0) {
				if (startText) {
					scene.remove(startText);
					startText.geometry.dispose();
					startText.material.dispose();
					startText = undefined;
				}
				lockTimer = 200;
				if (!audioManager.currentSong) {
					audioManager.startMusic("Piranha Creeper Cove");
				} else {
					audioManager.stopMusic();
				}
			}
		} else {
			stillTimer = -1;
		}
		if (lockTimer > 0) {
			stillTimer = 0;
		}
		lockTimer -= 1;

		var fac = Math.min(2, Math.max(1 , 3*(stillTrigger-stillTimer)/stillTrigger ))/3;
		armMeshes.forEach(function(item) {
			item.material.opacity = 0.5;
			if (still && stillTimer > 0) {
				item.material.opacity = 0.5 - 0.333 + fac;
			}
			//item.material.color = new THREE.Color(pickHex([0,255,0], [255,0,0], x));
		});
		boneMeshes.forEach(function(item) {
			item.material.opacity = 0.5;
			if (still && stillTimer > 0) {
				item.material.opacity = 0.5 - 0.333 + fac;
			}
		});
	}
}

function spawnParticles(pos, radius, amount, color=0xFFFFFF, scale=1.0) {
	var particles = new THREE.Geometry();
	amount *= scale;
	for (var p = 0; p < amount; p++) {
		var pAngle = (p/amount) * 2 * Math.PI,
			speed = scale*(90 + 30*Math.random()),
			vX = Math.cos(pAngle) * speed,
			vY = 0,
			vZ = Math.sin(pAngle) * speed,
			particle = new THREE.Vector3(
				pos.x + Math.cos(pAngle) * radius,
				pos.y + 1,
				pos.z + Math.sin(pAngle) * radius
			),
			xvel = vX * 0.05,
			yvel = 0,
			zvel = vZ * 0.05;

		particle.velocity = new THREE.Vector3(xvel, yvel, zvel);
		particles.vertices.push(particle);
	}

	var mat = pMaterial.clone();
	mat.color = new THREE.Color(color);
	mat.depthWrite = false;
	var particleSystem = new THREE.Points(particles, mat);
	particleSystem.sortParticles = false;
	scene.add(particleSystem);
	particleSystems.push(particleSystem);
}

function updateParticles() {
	for (let particleSystem of particleSystems) {
		for (let particle of particleSystem.geometry.vertices) {
			particle.add(particle.velocity);
			particle.velocity.multiplyScalar(0.9);

			var len = particle.velocity.lengthSq();
			particleSystem.material.opacity = Math.min(0.2, len*0.1);

			if (len < 0.01) {
				scene.remove(particleSystem);
				particleSystems.splice(particleSystems.indexOf(particleSystem), 1);
				particleSystem.geometry.dispose();
				particleSystem.material.dispose();
				return;
			}
		}

		particleSystem.geometry.verticesNeedUpdate = true;
	}
}

function step(timestamp) {
	/* Update drums */

	if (audioManager.getBar() != audioManager.lastBar && audioManager.getBar() >= 0) {
		audioManager.lastBar = audioManager.getBar();

		for (var i = 0; i < drums.length; i++) {
			drums[i].hit(0.03);
		}
	}

	for (var i = 0; i < drums.length; i++) {
		drums[i].update();
	}

	updateParticles();

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
