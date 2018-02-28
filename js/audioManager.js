
var musicFiles = {
	"Bonus Room Blitz": {
		"bpm": 109.0,
		"sign": 4,
		"delay": 0.74,
	},
	"Jungle Groove": {
		"bpm": 102.0,
		"sign": 4,
		"delay": 0.97,
	},
	"Piranha Creeper Cove": {
		"bpm": 144.0,
		"sign": 4,
		"delay": 0.19,
	},
};

var soundFiles = {
	'conga1': {'pitch': 1.0},
	'conga2': {'pitch': 1.0},
	'conga3': {'pitch': 1.0},
	'conga4': {'pitch': 1.0},

	'bongo1': {'pitch': 1.0},
	'bongo2': {'pitch': 1.0},
	'bongo3': {'pitch': 1.0},
	'bongo4': {'pitch': 1.0},

	'side': {'pitch': 1.0},
};


function AudioManager()
{
	this.sounds = {};

	this.currentSong = null;

	this.elapsed = null;
	this.paused = false;
	this.inputDelay = -0.12;
	this.startTime = null;
	this.beat = false;
	this.signBeat = false;
	this.lastBar = -5;
};

AudioManager.prototype.init = function(camera, preloaded_data) {
	this.listener = new THREE.AudioListener();
	camera.add( this.listener );

	for (var name in musicFiles) {
		this.loadSound(name, preloaded_data[name]);
	}

	for (var name in soundFiles) {
		this.loadSound(name, preloaded_data[name]);
	}
};

AudioManager.prototype.loadSound = function(name, buffer) {
	this.sounds[name] = new THREE.Audio( this.listener );
	var sound = this.sounds[name];

	sound.setBuffer( buffer );
};

AudioManager.prototype.play = function(name, volume=1.0, pitch=1.0) {
	if (this.sounds[name].isPlaying)
		this.sounds[name].stop();

	this.sounds[name].setVolume(volume);
	this.sounds[name].playbackRate = pitch;

	this.sounds[name].play();
};

AudioManager.prototype.stop = function(name) {
	if (this.sounds[name].isPlaying)
		this.sounds[name].stop();
};

AudioManager.prototype.startMusic = function(name) {
	this.currentSong = name;
	this.play(name, 1);
	this.startTime = Date.now();
	self.elapsed = 0;
	self.paused = false;
};

AudioManager.prototype.stopMusic = function(name) {
	this.stop(this.currentSong);
	this.currentSong = null;
	this.startTime = 0;
	self.elapsed = 0;
	self.paused = false;
};

AudioManager.prototype.timeToBar = function(elapsed, bpm) {
	return elapsed * bpm / 60;
};

AudioManager.prototype.getElapsed = function() {
	if (this.currentSong) {
		var songDelay = musicFiles[this.currentSong].delay;
		var songBpm = musicFiles[this.currentSong].bpm;
		return this.elapsed - this.inputDelay - this.timeToBar(songDelay, songBpm);
	}
	return -1;
};

AudioManager.prototype.getBar = function(delay=true) {
	e = this.getElapsed();
	if (!delay) {
		e = this.elapsed;
	}
	return Math.round(Math.floor(e));
};

AudioManager.prototype.getSignBar = function() {
	var sign = musicFiles[this.currentSong].sign;
	bar = Math.round(Math.floor(this.getElapsed() * sign)) / sign;
	var precision = 10000.0;
	bar = Math.round(bar * precision) / precision;
	return bar;
};

AudioManager.prototype.update = function() {
	if (this.currentSong) {
		var delayprebar = this.getBar();
		var prebar = this.getBar(false);
		var presignbar = this.getSignBar();
		var totalElapsed = (Date.now() - this.startTime)/1000.0;
		if (this.paused) {
			totalElapsed = 0;
		}
		this.elapsed = this.timeToBar(totalElapsed, musicFiles[this.currentSong].bpm);

		this.beat = false;
		if (delayprebar != this.getBar()) {
			this.beat = true;
		}
		this.signBeat = false;
		if (presignbar != this.getSignBar()) {
			this.signBeat = true;
		}

		if (prebar == -1 && this.getBar(false) == 0) {
			this.startTime = 0;
			this.playMusic();
		}
	}
};
