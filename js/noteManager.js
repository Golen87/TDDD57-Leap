
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
		if (l != '') {
			var area, time;
			[area, time] = l.split(' ');
			notes.push({ area: parseFloat(area), time: parseFloat(time) });
		}
	}
	return notes;
}

NoteManager.prototype.createNotes = function() {
	this.notes = [];
	for (let nd of this.loadedSong) {
		var note = new Note(scene, nd.area, nd.time);
		this.notes.push(note);
	}
}

NoteManager.prototype.update = function(elapsed) {
	for (let note of this.notes) {
		note.update(elapsed);
	}
}
