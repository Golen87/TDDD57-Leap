
function NoteManager(scene) {
	this.loadedSong = [];
	this.notes = [];
	this.scene = scene;
}

NoteManager.prototype.loadSong = function(filename) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', filename, true);
	xmlhttp.onload = function() {
		noteManager.loadedSong = parseSong(xmlhttp.responseText);
		noteManager.createNotes();
	};
	xmlhttp.send();
};

function parseSong(fileData) {
	var lines = fileData.split(/\n/);
	var notes = [];
	for (let l of lines) {
		if (l != '') {
			var area, time;
			[area, time] = l.split(' ');
			notes.push({ area: parseFloat(area), time: parseFloat(time) });
		}
	}
	return notes;
};

NoteManager.prototype.createNotes = function() {
	this.notes = [];
	for (let nd of this.loadedSong) {
		var note = new Note(scene, nd.area, nd.time);
		this.notes.push(note);
	}

	this.life = 50;
	this.combo = 0;
	this.maxCombo = 0;

	this.hitCount = {};
	for (let acc in accChart['rank']) {
		this.hitCount[acc] = 0;
	}
};

NoteManager.prototype.update = function(elapsed) {
	for (let note of this.notes) {
		note.update(elapsed);
	}
};

NoteManager.prototype.hit = function(areaIndex, elapsed, bpm) {
	var record = null;
	for (let note of this.notes) {
		if (note.area == areaIndex) {
			var acc = this.getAccuracy(note.time, elapsed, bpm);
			if (acc == "ignore")
				continue;
			if (record == null || accChart['rank'][acc] > record[0]) {
				record = [accChart['rank'][acc], note];
			}
		}
	}

	if (record) {
		var note = record[1];
		var acc = this.getAccuracy(note.time, elapsed, bpm);
		console.log(acc);
		this.hitCount[acc] += 1;
		this.life += accChart['life'][acc];
		this.life = clamp(this.life, 0, 100);
	
		if (accChart['combo'][acc] > 0) {
			this.combo += 1;
			this.maxCombo = Math.max(this.maxCombo, this.combo);
		} else {
			this.combo = 0;
		}

		note.destroy();
		this.notes.splice(this.notes.indexOf(note), 1);

		return acc;
	}
};

NoteManager.prototype.getAccuracy = function(pos, elapsed, bpm) {
	var diff = (pos - elapsed) * 60 / bpm;
	if (Math.abs(diff) > 1) {
		return "ignore";
	}
	for (let acc of ["perfect", "good", "ok", "boo"]) {
		if (Math.abs(diff) < accChart['time'][acc]) {
			return acc;
		}
	}
	if (diff < 0) {
		return "miss";
	}
	return "ignore";
};


accChart = {
	'time': {
		'perfect': 2*0.04,
		'good': 2*0.08,
		'ok': 2*0.13,
		'boo': 2*0.22
	},
	'score': {
		'perfect': 300,
		'good': 200,
		'ok': 100,
		'boo': 0,
		'miss': 0
	},
	'rank': {
		'perfect': 2,
		'good': 1,
		'ok': 0,
		'boo': -4,
		'miss': -8
	},
	'life': {
		'perfect': 1,
		'good': 1,
		'ok': 0,
		'boo': -3,
		'miss': -4
	},
	'color': {
		'perfect': 0x4CAF50,
		'good': 0x8BC34A,
		'ok': 0xCDDC39,
		'boo': 0xFFEB3B,
		'miss': 0xFF5722,
		'ignore': 0x777777,
	},
	'size': {
		'perfect': 2,
		'good': 1.7,
		'ok': 1.3,
		'boo': 1.0,
		'miss': 0.5,
		'ignore': 1.0,
	},
	'combo': {
		'perfect': 1,
		'good': 1,
		'ok': 0,
		'boo': 0,
		'miss': 0,
		'ignore': 0,
	},
}
