var context = new AudioContext();
var congaBuffer = null;

function loadSound(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
			congaBuffer = buffer;
		});

		console.log('Conga sound loaded');
	}
	request.send();
}

loadSound('99735__menegass__conga-2.wav');

function playSound(buffer, detune) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	if (detune) {
		source.detune.value = detune;
	}
	source.connect(context.destination);
	source.start(0);
}
