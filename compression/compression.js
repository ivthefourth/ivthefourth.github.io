var eqPresets = {
	defaultPreset: {
		gain: { testMode: 'test', stepCount: 4, min: 0, max: 1 },
		detune: { testMode: 'test', stepCount: 10, min: 0, max: 1 },
		Q: { testMode: 'test', stepCount: 1, min: 0, max: 1 },
		type: { testMode: 'test', stepCount: 2, min: 0, max: 2 }
	},

	frequencyEasy: {
		gain: { testMode: 'test', stepCount: 4, min: 0.1, max: 1 },
		detune: { testMode: 'test', stepCount: 4, min: 0.2, max: 1 },
		Q: { testMode: 'test', stepCount: 4, min: 0.3, max: 1 },
		type: { testMode: 'test', stepCount: 2, min: 0, max: 2 }
	}
}

var eqAudiofiles = {
	defaultAudio: '../wa-resources/audio/audio.mp3',
	pinkNoise: '../wa-resources/audio/pinkaudio.mp3'
}

var eqForm = {
	type: {title: 'Filter Type', testMode: true, stepCount: false, 
		min: false, max: false, defaultRatio: false, maxSteps: 2 },
	gain: {title: 'Gain', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	detune: {title: 'Frequency', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	Q: {title: 'BW (Q)', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 }
}





var eq = new EarTrainingApp('#eq', [eqAudiofiles, eqPresets, eqForm]);

eq.tracks.push( new EarTrainingTrack('#track0', eq) );
eq.tracks[0].filter = new WaParallelNode(WaFilterNode, 
	{type: { 
		func: WaSelectionParam, args: [['peaking', 'lowpass', 'highpass']]}, 
		gain: { func: WaDecibelGain, args: ['bipolar',12]}
	});

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.95;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);

eq.tracks[0].sourceNode.connect(eq.tracks[0].filter);
eq.tracks[0].filter.connect(eq.tracks[0].crossfader);
eq.tracks[0].filter.user.node.connect(analyser);
eq.tracks[0].crossfader.connect(eq.volume);
eq.volume.connect(audioCtx.destination);

//change later to load from default audio url
eq.updateLoader('increment');
eq.tracks[0].sourceNode.loadFromURL(eqAudiofiles.defaultAudio, function(){
	eq.updateLoader('decrement');
});



eq.tracks[0].parameters.gain = 
new EarTrainingParameter('#level', 0, BipolarVerticalSlider, eq.tracks[0].filter, 'gain');

eq.tracks[0].parameters.detune = 
new EarTrainingParameter('#frequency', 0.5, UnipolarKnob, eq.tracks[0].filter, 'detune');

eq.tracks[0].parameters.Q = 
new EarTrainingParameter('#bandwidth', 0.5, UnipolarKnob, eq.tracks[0].filter, 'Q');

eq.tracks[0].parameters.type = 
new EarTrainingParameter('#filter-type', 0, ClickToggle, eq.tracks[0].filter, 'type');

eq.tracks[0].checkAnswer = function(){
	var parameters = this.parameters;
	var param;
	for( param in parameters){
		$(parameters[param].ID).removeClass('wrong-answer correct-answer');
	}
	if( parameters.type.user !== 0){//if reference is not peaking
		parameters.type.checkAnswer();
		parameters.Q.checkAnswer();
		parameters.detune.checkAnswer();
		//don't check for level b/c lp & hp have no level
	}
	else if(parameters.gain.getRatio('user') === 0){
		parameters.gain.checkAnswer();
		parameters.type.checkAnswer();
	}
	else{
		for( param in parameters){
			parameters[param].checkAnswer();	
		}
	}
}

eq.makeForm();
eq.loadPreset('defaultPreset');
eq.settings.fillHtmlSelect(eqAudiofiles, '#track0-audio-files');
eq.settings.fillHtmlSelect(eqPresets, '#eq-presets');

//CRAP BECAUSE CHROME BROKE THIS:

var emptyBuffer = audioCtx.createBuffer(2, 22050, 44100);
var sourceNode = audioCtx.createBufferSource();
sourceNode.loop = true; 
sourceNode.buffer = emptyBuffer;
sourceNode.connect(eq.tracks[0].filter.user.node);
sourceNode.connect(eq.tracks[0].filter.reference.node);
sourceNode.start(audioCtx.currentTime);
eq.toggleReference();
eq.toggleReference();
eq.mute();
eq.mute();
eq.tracks[0].filter.user.frequency.value = 32;
eq.tracks[0].filter.reference.frequency.value = 32;
eq.resetGame();
//ENDCRAP



function drawLevelGraph(ctx, cWidth, cHeight, dataArray, canvas){
	var max;

	for (var i = 0; i < dataArray.length; i++) {
		if( i === 0 ){
			max = Math.abs(dataArray[i]);
		}
		else{
			max = Math.abs(dataArray[i]) > max ? Math.abs(dataArray[i]) : max;
		}
	}
	ctx.drawImage(canvas, 0, 0, cWidth, cHeight, -1, 0, cWidth, cHeight);
	ctx.fillStyle = '#0e1315';
	ctx.fillRect(cWidth - 1, 0, 1, cHeight);
	ctx.fillStyle = 'rgb(0, 255, 0)';
	ctx.fillRect(cWidth - 1, cHeight * (1 - max), 1, cHeight * max);
}



var doSpectrum = true;
var filterArray = [eq.tracks[0].filter.user];
var sampleRate = audioCtx.sampleRate;
function drawCanvas(){

	if(eq.crossfadeMonitor === 'user'){
		canvasContext.fillStyle = 'rgb(0, 225, 0)';
		canvasContext.strokeStyle = '#eee';
		analyser.getFloatTimeDomainData(dataArray);
	}
	else{
		canvasContext.fillStyle = '#555';
		canvasContext.strokeStyle = '#444';
	}

	if( doSpectrum) 
		drawLevelGraph(canvasContext, canvasWidth, canvasHeight, dataArray, canvas);
	else
		canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	requestAnimationFrame(drawCanvas);
}



var canvasDetune = eq.tracks[0].parameters.detune;
var canvasGain = eq.tracks[0].parameters.gain;
var canvasQ = eq.tracks[0].parameters.Q;
var canvasType = eq.tracks[0].parameters.type;

var canvas;
var canvasWidth;
var canvasHeight;
var canvasMidHeight;
var canvasContext;

$(document).ready(function(){
	canvas = $('#spectrum')[0];
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasMidHeight = canvasHeight/2;
	canvasContext = canvas.getContext('2d');
	canvasContext.fillStyle = 'rgb(0,' + 225 + ',0)';
    canvasContext.lineWidth = 5;
    canvasContext.lineJoin = 'round';
    $('#spectrum').click(function(e){
    	e.preventDefault();
    	doSpectrum = !doSpectrum;
    });

	drawCanvas();

	waBindKeys(eq);

});

