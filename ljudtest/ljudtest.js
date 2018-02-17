var context = new AudioContext();
var audioFrequency = 44100;
//var audioLength = 
var congaBuffer = null;

var request = new XMLHttpRequest();

function loadSound(url) {
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
