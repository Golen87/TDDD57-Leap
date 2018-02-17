var context = new AudioContext();

function Sound(url) {
	this.buffer = null;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	sound = this;

	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
			sound.buffer = buffer;
		}, function() {
			console.log("ERROR: could not load " + url);
		});
	}
	request.send();
}

Sound.prototype.play = function(detune) {
	if (this.buffer) {
		var source = context.createBufferSource();
		source.buffer = this.buffer;
		if (detune) {
			source.detune.value = detune;
		}
		source.connect(context.destination);
		source.start(0);
	}
}
