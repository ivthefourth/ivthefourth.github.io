
var MAXVOLUME = 100;
var volumeInput = document.getElementById('volume');
var freqInput = document.getElementById('frequency');
var playBtn = document.getElementById('play-tone');
var reference = document.getElementById('reference');
var sensitivity = document.getElementById('sensitivity');
var isPlaying = false;
var targetFrequency = 200;
var minDB;

function setVolume(ratio){
	volume.gain.value = ratio;
}

function setFrequency(hz){
	targetFrequency = hz;
	if( osc != null)
		osc.frequency.value = hz;
}

function setSensitivity(ratio){
	minDB = -100 * (ratio);
}

volumeInput.oninput = function(){
	var input = volumeInput.value;
	if(input < 0 || input > MAXVOLUME){
		input = (input < 0 ? 0 : MAXVOLUME);
		volumeInput.value = input;
	}

	setVolume(input/MAXVOLUME);
}

sensitivity.oninput = function(){
	var input = sensitivity.value;
	if(input < 0 || input > MAXVOLUME){
		input = (input < 0 ? 0 : MAXVOLUME);
		sensitivity.value = input;
	}

	setSensitivity(input/MAXVOLUME);
}

freqInput.oninput = function(){
	var input = freqInput.value;
	if(input < 0 || input > 1000){
		input = (input < 50 ? 50 : 1000);
		freqInput.value = input
	}

	setFrequency(input);
}


var ACTX = window.AudioContext || window.webkitAudioContext;
var audioCtx = new ACTX;

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);




var volume = audioCtx.createGain();
volume.connect(audioCtx.destination);

//chrome bug temp fix
var emptyBuffer = audioCtx.createBuffer(2, 22050, 44100);
var sourceNode = audioCtx.createBufferSource();
sourceNode.loop = true; 
sourceNode.buffer = emptyBuffer;
sourceNode.connect(volume);
sourceNode.start(audioCtx.currentTime);
//end chrome bug fix 

volume.gain.value = volumeInput.value/MAXVOLUME;

var osc;
function playOsc(){
	osc = audioCtx.createOscillator();
	osc.type = 'triangle';
	osc.frequency.value = targetFrequency;
	osc.connect(volume);
	osc.start();
}
function stopOsc(){
	osc.stop();
}
playBtn.onclick = function(){
	if( isPlaying ){
		stopOsc();
		playBtn.innerHTML = 'Play Tone';
	}
	else{
		playOsc();
		playBtn.innerHTML = 'Stop Tone';
	}
	isPlaying = !isPlaying;
}

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 32768;
analyser.smoothingTimeConstant = 0.50;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);

var bandSize = audioCtx.sampleRate / (2 * bufferLength);
var minThreshold = function(){ return targetFrequency * Math.pow(2, -0.5);}
var maxThreshold = function(){ return targetFrequency * Math.pow(2, 0.5);}


var canvasCtx = reference.getContext('2d');
var canvasHeight = 400;
var canvasWidth = 200;


var mic;
navigator.getUserMedia (
      // constraints: audio and video for this app
      {
         audio: {echoCancellation: false}
      },

      // Success callback
      function(stream) {
         // Create a MediaStreamAudioSourceNode
         // Feed the HTMLMediaElement into it
         mic = audioCtx.createMediaStreamSource(stream);
         mic.connect(analyser);


      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );




setSensitivity(sensitivity.value/MAXVOLUME);


//function drawSpectrum(){
//	;
//}

function drawSpectrum(canvasContext, canvasWidth, 
	canvasHeight, minDB, maxDB, slope, minFreq, maxFreq, targetFreq,
	bufferLength, dataArray, sampleRate){
	var barWidth;
	var barHeight = canvasWidth;
	var colorStrength;
	var x = 0;         //pixel on x-axis of canvas
	var startFreq = 0; //start of current band's frequency range
	var stopFreq;      //end of current band's frequency range

	for(var i = 0; i < bufferLength; i++) {
		colorStrength = 1/(maxDB - minDB)*((dataArray[i]+ slope*Math.log2(i + 1)) - minDB);

		stopFreq = startFreq + sampleRate / (2 * bufferLength);

		if( startFreq === 0 )
			x = 0;
		else
			x = canvasHeight - canvasHeight * Math.log2(startFreq/minFreq) / Math.log2(maxFreq / minFreq) - 1; //20hz to 20480hz (20*2^10)

		barWidth = canvasHeight - canvasHeight * Math.log2(stopFreq/minFreq) / Math.log2(maxFreq / minFreq) - x + 1;
		if(true || Math.floor(startFreq) > Math.floor(minFreq) && Math.ceil(startFreq) < Math.ceil(maxFreq)){
			canvasCtx.fillStyle = 'rgba(0, 255, 0, ' + colorStrength + ')';
			canvasContext.fillRect(canvasWidth * 0.1, x, canvasWidth * 0.8, barWidth);
		}
		startFreq = stopFreq;

	}
	canvasCtx.fillStyle = 'rgba(255, 255, 255, 1)';
	x = canvasHeight - canvasHeight * Math.log2(targetFreq/minFreq) / Math.log2(maxFreq / minFreq) - 1;
	canvasContext.fillRect(0, x, canvasWidth* 0.1, 2);
	canvasContext.fillRect(canvasWidth* 0.9, x, canvasWidth* 0.1, 2);
	canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	canvasContext.fillRect(canvasWidth* 0.1, x, canvasWidth* 0.8, 2);
}

function drawCanvas(){
	canvasCtx.fillStyle = '#000';
	canvasCtx.fillRect(0,0, canvasWidth, canvasHeight);
	analyser.getFloatFrequencyData(dataArray);
	drawSpectrum(canvasCtx, canvasWidth, canvasHeight, 
		minDB, minDB + 20, 3, minThreshold(), maxThreshold(), targetFrequency, bufferLength, dataArray, audioCtx.sampleRate);
	requestAnimationFrame(drawCanvas);
}
drawCanvas();
