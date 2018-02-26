
function extend(base, sub) {
	// Avoid instantiating the base class just to setup inheritance
	// Also, do a recursive merge of two prototypes, so we don't overwrite 
	// the existing prototype, but still maintain the inheritance chain
	// Thanks to @ccnokes
	var origProto = sub.prototype;
	sub.prototype = Object.create(base.prototype);
	for (var key in origProto)	{
		 sub.prototype[key] = origProto[key];
	}
	// The constructor property was set wrong, let's fix it
	Object.defineProperty(sub.prototype, 'constructor', { 
		enumerable: false, 
		value: sub 
	});
}

function arrayToVector(array) {
	return new THREE.Vector3(array[0], array[1], array[2]);
}

function pickHex(color1, color2, weight) {
	var w1 = weight;
	var w2 = 1 - w1;
	var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
		Math.round(color1[1] * w1 + color2[1] * w2),
		Math.round(color1[2] * w1 + color2[2] * w2)];
	return rgb;
}

// Generalized smoothstep
function generalSmoothStep(N, x) {
  x = clamp(x, 0, 1); // x must be equal to or between 0 and 1
  var result = 0;
  for (var n = 0; n <= N; ++n)
    result += pascalTriangle(-N - 1, n) *
              pascalTriangle(2 * N + 1, N - n) *
              Math.pow(x, N + n + 1);
  return result;
}

// Returns binomial coefficient without explicit use of factorials,
// which can't be used with negative integers
function pascalTriangle(a, b) {
  var result = 1; 
  for(var i = 0; i < b; ++i)
    result *= (a - i) / (i + 1);
  return result;
}

function clamp(x, lowerlimit, upperlimit) {
  if (x < lowerlimit)
    x = lowerlimit;
  if (x > upperlimit)
    x = upperlimit;
  return x;
}

Array.prototype.choice = function() {
	return this[Math.floor(Math.random()*this.length)];
};
