function all_loaded(files_to_load, loaded_files) {
	for (let file of files_to_load) {
		if (!(file.name in loaded_files)) {
			return false;
		}
	}
	return true;
}

function preload_files(files_to_load) {
	return new Promise(function(resolve, reject) {
		let loaded_files = {};
		let resolve_if_complete = function(name, new_data) {
			loaded_files[name] = new_data;
			console.log("loaded " + name);

			if (all_loaded(files_to_load, loaded_files)) {
				console.log("All files loaded");
				resolve(loaded_files);
			}
		};

		for (let file of files_to_load) {
			let callback = function(data) {
				resolve_if_complete(file.name, data)
			};

			switch (file.type) {
				case "mesh":
					preload_mesh(file.name, callback);
					break;
				case "music":
					preload_music(file.name, callback);
					break;
				case "sound":
					preload_sound(file.name, callback);
					break;
				case "font":
					preload_font(file.name, callback);
					break;
				default:
					break;
			}
		}
	});
}

function preload_mesh(name, on_complete) {
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setTexturePath('assets/textures/');
	mtlLoader.load('assets/models/' + name + '.mtl', function(materials) {
		materials.preload();
		let objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load('assets/models/' + name + '.obj', on_complete);
	});
}

function preload_music(name, on_complete) {
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load('/assets/music/' + name + '.mp3', on_complete);
}

function preload_sound(name, on_complete) {
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load('/assets/sounds/' + name + '.wav', on_complete);
}

function preload_font(name, on_complete) {
	var loader = new THREE.FontLoader();
	loader.load( 'assets/fonts/' + name, on_complete );
}
