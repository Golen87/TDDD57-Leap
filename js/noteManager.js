
function NoteManager(scene) {
	this.loadedSong = [];
	this.notes = [];
	this.scene = scene;
}

NoteManager.prototype.loadSong = function(filename) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', filename, true);
	var notemanager = this;
	xmlhttp.onload = function() {
		notemanager.loadedSong = parseSong(xmlhttp.responseText);
		notemanager.createNotes();
	};
	xmlhttp.send();
};

function parseSong(fileData) {
	var lines = fileData.split(/\n/);
	var notes = [];
	for (let l of lines) {
		[track, time] = l.split(' ');
		notes.push({ track: track, time: time });
	}
	return notes;
}

NoteManager.prototype.createNotes = function() {
	this.notes = [];
	for (let nd of this.loadedSong) {
		this.notes.push(new Note(scene, 40, nd.track, nd.time));
	}
}

NoteManager.prototype.update = function() {
	for (let note of this.notes) {
		note.update();
	}
}
