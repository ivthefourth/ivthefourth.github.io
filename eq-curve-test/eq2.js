var eqPresets = {
	defaultPreset: {
		gain: { testMode: 'test', stepCount: 10, min: 0, max: 1 },
		detune: { testMode: 'test', stepCount: 150, min: 0, max: 1 },
		Q: { testMode: 'test', stepCount: 10, min: 0, max: 1 },
		type: { testMode: 'test', stepCount: 6, min: 0, max: 6 },
		gain2: { testMode: 'test', stepCount: 10, min: 0, max: 1 },
		detune2: { testMode: 'test', stepCount: 150, min: 0, max: 1 },
		Q2: { testMode: 'test', stepCount: 10, min: 0, max: 1 },
		type2: { testMode: 'test', stepCount: 6, min: 0, max: 6 }
	},

	frequencyEasy: {
		gain: { testMode: 'test', stepCount: 4, min: 0.1, max: 1 },
		detune: { testMode: 'test', stepCount: 4, min: 0.2, max: 1 },
		Q: { testMode: 'test', stepCount: 4, min: 0.3, max: 1 },
		type: { testMode: 'test', stepCount: 6, min: 0, max: 6 }
	}
}

var eqAudiofiles = {
	defaultAudio: 'audio/audio.mp3',
	pinkNoise: 'audio/pinkaudio.mp3'
}

var eqForm = {
	type: {title: 'Filter Type', testMode: true, stepCount: false, 
		min: false, max: false, defaultRatio: false, maxSteps: 2 },
	gain: {title: 'Gain', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	detune: {title: 'Frequency', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 150 },
	Q: {title: 'BW (Q)', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	type2: {title: 'Filter Type', testMode: true, stepCount: false, 
		min: false, max: false, defaultRatio: false, maxSteps: 2 },
	gain2: {title: 'Gain', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	detune2: {title: 'Frequency', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 150 },
	Q2: {title: 'BW (Q)', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 }
}





var eq = new EarTrainingApp('#eq', [eqAudiofiles, eqPresets, eqForm], 'defaultPreset');

eq.tracks.push( new EarTrainingTrack('#track0', eq) );
eq.tracks[0].filter = new WaParallelNode(WaFilterNode, 
	{type: { 
		func: WaSelectionParam, args: [['peaking', 'lowpass', 'highpass', 'notch', 'bandpass', 'lowshelf', 'highshelf']]}, 
		gain: { func: WaDecibelGain, args: ['bipolar',18]}
	});
eq.tracks[0].filter2 = new WaParallelNode(WaFilterNode, 
	{type: { 
		func: WaSelectionParam, args: [['peaking', 'lowpass', 'highpass', 'notch', 'bandpass', 'lowshelf', 'highshelf']]}, 
		gain: { func: WaDecibelGain, args: ['bipolar',18]}
	});

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.95;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);

eq.tracks[0].sourceNode.connect(eq.tracks[0].filter);
eq.tracks[0].filter.connect(eq.tracks[0].filter2);
eq.tracks[0].filter2.connect(eq.tracks[0].crossfader);
eq.tracks[0].filter2.user.node.connect(analyser);
eq.tracks[0].crossfader.connect(eq.volume);
eq.volume.connect(audioCtx.destination);

//change later to load from default audio url
eq.updateLoader('increment');
eq.tracks[0].sourceNode.loadFromURL(eqAudiofiles.pinkNoise, function(){
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


eq.tracks[0].parameters.gain2 = 
new EarTrainingParameter('#level2', 0, BipolarVerticalSlider, eq.tracks[0].filter2, 'gain');

eq.tracks[0].parameters.detune2 = 
new EarTrainingParameter('#frequency2', 0.5, UnipolarKnob, eq.tracks[0].filter2, 'detune');

eq.tracks[0].parameters.Q2 = 
new EarTrainingParameter('#bandwidth2', 0.5, UnipolarKnob, eq.tracks[0].filter2, 'Q');

eq.tracks[0].parameters.type2 = 
new EarTrainingParameter('#filter-type2', 0, ClickToggle, eq.tracks[0].filter2, 'type');



eq.tracks[0].checkAnswer = function(){
	var parameters = this.parameters;
	if( parameters.type.reference !== 0){//if reference is not peaking
		parameters.type.checkAnswer();
		parameters.Q.checkAnswer();
		parameters.detune.checkAnswer();
		//don't check for level b/c lp & hp have no level
	}
	else if(parameters.gain.getRatio('reference') === 0){
		parameters.gain.checkAnswer();
		parameters.type.checkAnswer();
	}
	else{
		var param
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
var crap = new WaBufferSourceNode();
crap.connect(eq.tracks[0].filter);
function crapCallback(){
	crap.play(0);
	eq.toggleReference();
	eq.toggleReference();
	eq.mute();
	eq.mute();
	eq.updateLoader('decrement');
	eq.tracks[0].filter.user.frequency.value = 20;
	eq.tracks[0].filter.reference.frequency.value = 20;
	eq.tracks[0].filter.user.detune.max = 10*12;
	eq.tracks[0].filter.reference.detune.max = 10*12;
	eq.tracks[0].filter2.user.frequency.value = 20;
	eq.tracks[0].filter2.reference.frequency.value = 20;
	eq.tracks[0].filter2.user.detune.max = 10*12;
	eq.tracks[0].filter2.reference.detune.max = 10*12;
	eq.resetGame();
}

eq.updateLoader('increment');
crap.loadFromURL('silence.wav', crapCallback);
//ENDCRAP


/*
function addTrack(num){

	eq.tracks.push( new EarTrainingTrack('#track' + num, eq) );
	eq.tracks[num].filter = new WaParallelNode(WaFilterNode, 
		{type: { 
			func: WaSelectionParam, args: [['peaking', 'lowpass', 'highpass']]}, 
			gain: { func: WaDecibelGain, args: ['bipolar',12]}
		});

	eq.tracks[num].sourceNode.connect(eq.tracks[num].filter);
	eq.tracks[num].filter.connect(eq.tracks[num].crossfader);
	eq.tracks[num].crossfader.connect(eq.volume);
	eq.volume.connect(audioCtx.destination);

	//change later to load from default audio url
	eq.tracks[num].sourceNode.loadFromURL('ffmb.mp3');



	eq.tracks[num].parameters.gain = 
	new EarTrainingParameter('#level', 0, BipolarVerticalSlider, eq.tracks[num].filter, 'gain');

	eq.tracks[num].parameters.detune = 
	new EarTrainingParameter('#frequency', 0.5, UnipolarKnob, eq.tracks[num].filter, 'detune');

	eq.tracks[num].parameters.Q = 
	new EarTrainingParameter('#bandwidth', 0.5, UnipolarKnob, eq.tracks[num].filter, 'Q');

	eq.tracks[num].parameters.type = 
	new EarTrainingParameter('#filter-type', 0, ClickToggle, eq.tracks[num].filter, 'type');
	if (num % 2 === 1 )
		eq.tracks[num].sourceNode.node.gain.value = -1;


	eq.tracks[num].checkAnswer = function(){
		parameters = this.parameters;
		if( parameters.type.reference !== 0){//if reference is not peaking
			parameters.type.checkAnswer();
			parameters.Q.checkAnswer();
			parameters.detune.checkAnswer();
			//don't check for level b/c lp & hp have no level
		}
		else if(parameters.gain.getRatio('reference') === 0){
			parameters.gain.checkAnswer();
			parameters.type.checkAnswer();
		}
		else{
			for( var param in parameters){
				param = parameters[param];
				param.checkAnswer();	
			}
		}
	}

}

for( var i = 1; i < 16; i++)
	addTrack(i);
*/



//Fs is audioContext.sampleRate


var sampleRate = audioCtx.sampleRate;
var filterArray = [eq.tracks[0].filter.user, eq.tracks[0].filter2.user];
var doSpectrum = true;
function drawCanvas(){
	canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	if(eq.crossfadeMonitor === 'user'){
		canvasContext.fillStyle = 'rgb(0, 225, 0)';
		canvasContext.strokeStyle = '#eee';
		analyser.getFloatFrequencyData(dataArray);
	}
	else{
		canvasContext.fillStyle = '#555';
		canvasContext.strokeStyle = '#444';
	}

	if( doSpectrum) 
		drawSpectrum(canvasContext, canvasWidth, canvasHeight, 
			-78, 0, 3, bufferLength, dataArray, sampleRate);
	else
		canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	drawCurve(canvasContext, canvasWidth, canvasHeight, sampleRate, -78, 0, filterArray);
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

