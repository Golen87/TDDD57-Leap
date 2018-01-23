var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

var latestFrameData = null;

Leap.loop(controllerOptions, function(frame) {
    latestFrameData = frame;
})

function animate() {
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;

    let frame = latestFrameData;
    if (frame != null && frame.hands.length > 0) {
        let hand = frame.hands[0]
        cube.rotation.x = hand.direction[1];
        cube.rotation.y = -hand.direction[0];
        cube.position.x = hand.palmPosition[0] / 100;
        cube.position.y = hand.palmPosition[1] / 100 - 5;
        cube.position.z = hand.palmPosition[2] / 100;
        //cube.rotation.z = hand.direction[2];
    }

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();
