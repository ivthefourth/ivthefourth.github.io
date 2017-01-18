var eqPresets = {
	frequencyBeginner: {
		"gain":{"testMode":"reference","stepCount":3,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":8,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":9,"min":0.1,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	frequencyEasy: {
		"gain":{"testMode":"reference","stepCount":3,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":15,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":9,"min":0.1,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	frequencyMedium: {
		"gain":{"testMode":"reference","stepCount":3,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":9,"min":0.1,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	frequencyHard: {
		"gain":{"testMode":"reference","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.4,"max":0.95},
		"Q":{"testMode":"reference","stepCount":9,"min":0.2,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	gainBeginner: {
		"gain":{"testMode":"test","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":10,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	gainEasy: {
		"gain":{"testMode":"test","stepCount":10,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":10,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	gainMedium: {
		"gain":{"testMode":"test","stepCount":20,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":10,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	gainHard: {
		"gain":{"testMode":"test","stepCount":30,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":10,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	bandWidthBeginner: {
		"gain":{"testMode":"reference","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.1,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	bandWidthEasy: {
		"gain":{"testMode":"reference","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.1,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	bandWidthMedium: {
		"gain":{"testMode":"reference","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":8,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	bandWidthHard: {
		"gain":{"testMode":"reference","stepCount":5,"min":0,"max":1},
		"detune":{"testMode":"reference","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":12,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakCutBeginner: {
		"gain":{"testMode":"test","stepCount":2,"min":0,"max":0.5},
		"detune":{"testMode":"test","stepCount":6,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0.2,"max":0.6},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakCutEasy: {
		"gain":{"testMode":"test","stepCount":3,"min":0,"max":0.5},
		"detune":{"testMode":"test","stepCount":10,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakCutMedium: {
		"gain":{"testMode":"test","stepCount":4,"min":0,"max":0.5},
		"detune":{"testMode":"test","stepCount":20,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakCutHard: {
		"gain":{"testMode":"test","stepCount":5,"min":0,"max":0.5},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":8,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakBoostBeginner: {
		"gain":{"testMode":"test","stepCount":2,"min":0.5,"max":1},
		"detune":{"testMode":"test","stepCount":6,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0.2,"max":0.6},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakBoostEasy: {
		"gain":{"testMode":"test","stepCount":3,"min":0.5,"max":1},
		"detune":{"testMode":"test","stepCount":10,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakBoostMedium: {
		"gain":{"testMode":"test","stepCount":4,"min":0.5,"max":1},
		"detune":{"testMode":"test","stepCount":20,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakBoostHard: {
		"gain":{"testMode":"test","stepCount":5,"min":0.5,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":8,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakBeginner: {
		"gain":{"testMode":"test","stepCount":4,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":6,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0.2,"max":0.6},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakEasy: {
		"gain":{"testMode":"test","stepCount":6,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":10,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakMedium: {
		"gain":{"testMode":"test","stepCount":8,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":20,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":4,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	peakHard: {
		"gain":{"testMode":"test","stepCount":10,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":8,"min":0,"max":0.9},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	allParametersBeginner: {
		"gain":{"testMode":"test","stepCount":4,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":6,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":1,"min":0,"max":0.7},
		"type":{"testMode":"test","stepCount":2,"min":0,"max":2}
	},
	allParametersEasy: {
		"gain":{"testMode":"test","stepCount":6,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":10,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":1,"min":0,"max":0.7},
		"type":{"testMode":"test","stepCount":2,"min":0,"max":2}
	},
	allParametersMedium: {
		"gain":{"testMode":"test","stepCount":8,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":20,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0,"max":0.9},
		"type":{"testMode":"test","stepCount":2,"min":0,"max":2}
	},
	allParametersHard: {
		"gain":{"testMode":"test","stepCount":10,"min":0,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"test","stepCount":2,"min":0,"max":0.9},
		"type":{"testMode":"test","stepCount":2,"min":0,"max":2}
	},
	resonantBoostBeginner: {
		"gain":{"testMode":"reference","stepCount":4,"min":0.9,"max":1},
		"detune":{"testMode":"test","stepCount":30,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantBoostEasy: {
		"gain":{"testMode":"reference","stepCount":4,"min":0.75,"max":1},
		"detune":{"testMode":"test","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantBoostMedium: {
		"gain":{"testMode":"reference","stepCount":4,"min":0.75,"max":1},
		"detune":{"testMode":"test","stepCount":100,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantBoostHard: {
		"gain":{"testMode":"reference","stepCount":4,"min":0.66,"max":1},
		"detune":{"testMode":"test","stepCount":200,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantBoostPro: {
		"gain":{"testMode":"reference","stepCount":4,"min":0.66,"max":1},
		"detune":{"testMode":"test","stepCount":200,"min":0.4,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantCutBeginner: {
		"gain":{"testMode":"reference","stepCount":4,"min":0,"max":0.1},
		"detune":{"testMode":"test","stepCount":20,"min":0.3,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantCutEasy: {
		"gain":{"testMode":"reference","stepCount":4,"min":0,"max":0.25},
		"detune":{"testMode":"test","stepCount":30,"min":0.3,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantCutMedium: {
		"gain":{"testMode":"reference","stepCount":4,"min":0,"max":0.25},
		"detune":{"testMode":"test","stepCount":50,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantCutHard: {
		"gain":{"testMode":"reference","stepCount":4,"min":0,"max":0.25},
		"detune":{"testMode":"test","stepCount":100,"min":0.2,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
	resonantCutPro: {
		"gain":{"testMode":"reference","stepCount":4,"min":0,"max":0.34},
		"detune":{"testMode":"test","stepCount":200,"min":0.4,"max":0.95},
		"Q":{"testMode":"reference","stepCount":1,"min":0,"max":0},
		"type":{"testMode":"user","stepCount":2,"min":0,"max":2}
	},
}

var eqAudiofiles = {
	chordPad: (STATICFILEURL + 'para-eq/Chord.mp3'),
	chordPadWav: (STATICFILEURL + 'para-eq/Chord.wav'),
	chordProgression: (STATICFILEURL + 'para-eq/ChordProgression.mp3'),
	chordProgressionWav: (STATICFILEURL + 'para-eq/ChordProgression.wav'),
	chordRiff: (STATICFILEURL + 'para-eq/ChordRiff.mp3'),
	chordRiffWav: (STATICFILEURL + 'para-eq/ChordRiff.wav'),
	distortedPiano: (STATICFILEURL + 'para-eq/DistortedPiano.mp3'),
	loopOne: (STATICFILEURL + 'para-eq/Loop1.mp3'),
	loopTwo: (STATICFILEURL + 'para-eq/Loop2.mp3'),
	loopThree: (STATICFILEURL + 'para-eq/Loop3.mp3'),
	loopFour: (STATICFILEURL + 'para-eq/Loop4.mp3'),
	loopFive: (STATICFILEURL + 'para-eq/Loop5.mp3'),
	loopSix: (STATICFILEURL + 'para-eq/Loop6.mp3'),
	loopSeven: (STATICFILEURL + 'para-eq/Loop7.mp3'),
	orchestralDrums: (STATICFILEURL + 'para-eq/OrchestralDrums.mp3'),
	orchestralDrumsWav: (STATICFILEURL + 'para-eq/OrchestralDrums.wav'),
	pinkNoise: (STATICFILEURL + 'para-eq/PinkNoise.wav'),
	pinkNoiseLong: (STATICFILEURL + 'para-eq/PinkNoiseLong.wav'),
	pinkNoiseBeatOne: (STATICFILEURL + 'para-eq/PinkNoiseBeat1.mp3'),
	pinkNoiseBeatOneWav: (STATICFILEURL + 'para-eq/PinkNoiseBeat1.wav'),
	pinkNoiseBeatTwo: (STATICFILEURL + 'para-eq/PinkNoiseBeat2.mp3'),
	pinkNoiseBeatTwoWav: (STATICFILEURL + 'para-eq/PinkNoiseBeat2.wav'),
	pinkNoiseBeatThree: (STATICFILEURL + 'para-eq/PinkNoiseBeat3.mp3'),
	pinkNoiseBeatThreeWav: (STATICFILEURL + 'para-eq/PinkNoiseBeat3.wav'),
	synthRiff: (STATICFILEURL + 'para-eq/Riff.mp3'),
	synthRiffWav: (STATICFILEURL + 'para-eq/Riff.wav'),
	VoxAndBassOne: (STATICFILEURL + 'para-eq/VoxAndBass1.mp3'),
	VoxAndBassTwo: (STATICFILEURL + 'para-eq/VoxAndBass2.mp3')
}

var eqForm = {
	type: {title: 'Filter Type', testMode: true, stepCount: false, 
		min: false, max: false, defaultRatio: false, maxSteps: 2 },
	gain: {title: 'Gain', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 },
	detune: {title: 'Frequency', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 250 },
	Q: {title: 'BW (Q)', testMode: true, stepCount: true, 
		min: true, max: true, defaultRatio: false, maxSteps: 50 }
}




var eq = new EarTrainingApp('#eq', [eqAudiofiles, eqPresets, eqForm], 'allParametersBeginner');

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

var refAnalyser = audioCtx.createAnalyser();
refAnalyser.fftSize = 2048;
refAnalyser.smoothingTimeConstant = 0.95;

eq.tracks[0].sourceNode.connect(eq.tracks[0].filter);
eq.tracks[0].filter.connect(eq.tracks[0].crossfader);
eq.tracks[0].filter.user.node.connect(analyser);
eq.tracks[0].filter.reference.node.connect(refAnalyser);
eq.tracks[0].crossfader.connect(eq.volume);
eq.volume.connect(audioCtx.destination);


eq.updateLoader('increment');
eq.tracks[0].sourceNode.loadFromURL(eqAudiofiles.pinkNoise, function(){
	eq.updateLoader('decrement');
});


var typeCallback = function(){
	var gain = eq.tracks[0].parameters.gain;
	if( this.node.user.type.value === 'peaking' && gain.testMode !== 'reference'){
		gain.isActive = true;
		$(gain.ID).removeClass('inactive');
	}
	else{
		gain.isActive = false;
		$(gain.ID).addClass('inactive');
	}
}

function frequencyToString(freq){
	if( freq < 10000){
		return Math.round(freq).toString() + 'Hz';
	}
	else{
		return (freq/1000).toFixed(1) + 'kHz';
	}
}

var freqValEl = document.getElementById('freq-value');
var detuneCallback = function(){
	freqValEl.textContent = frequencyToString(eq.tracks[0].filter.user.getComputedFrequency());
}

eq.tracks[0].parameters.gain = 
new EarTrainingParameter('#level', 0, BipolarVerticalSlider, eq.tracks[0].filter, 'gain');

eq.tracks[0].parameters.detune = 
new EarTrainingParameter('#frequency', 0.5, UnipolarKnob, eq.tracks[0].filter, 'detune', detuneCallback);

eq.tracks[0].parameters.Q = 
new EarTrainingParameter('#bandwidth', 0.5, UnipolarKnob, eq.tracks[0].filter, 'Q');

eq.tracks[0].parameters.type = 
new EarTrainingParameter('#filter-type', 0, ClickToggle, eq.tracks[0].filter, 'type', typeCallback);

eq.tracks[0].checkAnswer = function(){
	var parameters = this.parameters;
	var param;
	for( param in parameters){
		$(parameters[param].ID).removeClass('wrong-answer correct-answer');
	}
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
		for( param in parameters){
			parameters[param].checkAnswer();	
		}
	}
}

eq.showAnswer = function(){
	var i, param, parameters;
	var trackList = this.tracks;
	if( this.crossfadeMonitor === 'user' ){
		//change class
		$(this.ID + '-reference-toggle').addClass('active');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive){
				trackList[i].crossfader.listenToReference();
				parameters = trackList[i].parameters;
				if( parameters.type.reference !== 0){//if reference is not peaking
					parameters.type.revealAnswer();
					parameters.Q.revealAnswer();
					parameters.detune.revealAnswer();
					//don't check for level b/c lp & hp have no level
					parameters.gain.isActive = false;
				}
				else if(parameters.gain.getRatio('reference') === 0){
					parameters.gain.revealAnswer();
					parameters.type.revealAnswer();
					parameters.Q.isActive = false;
					parameters.detune.isActive = false;
				}
				else{
					for( param in parameters){
						parameters[param].revealAnswer();	
					}
				}
			}
		}
		this.crossfadeMonitor = 'reference';
	}
	else{
		//change class
		$(this.ID + '-reference-toggle').removeClass('active');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive){
				trackList[i].crossfader.listenToUser();
				parameters = trackList[i].parameters;
				if( parameters.type.reference !== 0){//if reference is not peaking
					parameters.type.hideAnswer();
					parameters.Q.hideAnswer();
					parameters.detune.hideAnswer();
					//don't check for level b/c lp & hp have no level
					parameters.gain.isActive = true;
				}
				else if(parameters.gain.getRatio('reference') === 0){
					parameters.gain.hideAnswer();
					parameters.type.hideAnswer();
					parameters.Q.isActive = true;
					parameters.detune.isActive = true;
				}
				else{
					for( param in parameters){
						parameters[param].hideAnswer();	
					}
				}
			}
		}
		this.crossfadeMonitor = 'user';
	}
}


eq.loadPreset = function(presetName){
	EarTrainingApp.prototype.loadPreset.call(this, presetName);
	if( this.settings.presets[presetName].type.testMode === 'user'){
		$('#filter-type').addClass('inactive');
		this.tracks[0].parameters.type.isActive = false;
	}
	else{
		this.tracks[0].parameters.type.isActive = true;
	}
}

eq.makeForm();
eq.loadPreset('allParametersEasy');
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



var doSpectrum = true;
var filterArray = [eq.tracks[0].filter.user];
var filterArrayRef = [eq.tracks[0].filter.reference];
var sampleRate = audioCtx.sampleRate;
function drawCanvas(){
	canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	if(eq.crossfadeMonitor === 'user'){
		canvasContext.fillStyle = 'rgb(0, 225, 0)';
		canvasContext.strokeStyle = '#eee';
		analyser.getFloatFrequencyData(dataArray);
	}
	else if(eq.revealAnswer){
		canvasContext.fillStyle = 'rgb(0, 225, 0)';
		canvasContext.strokeStyle = '#eee';
		refAnalyser.getFloatFrequencyData(dataArray);
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

	if(eq.revealAnswer && eq.crossfadeMonitor === 'reference'){
		drawCurve(canvasContext, canvasWidth, canvasHeight, 
		sampleRate, -78, 0, filterArrayRef);
	}
	else{
		drawCurve(canvasContext, canvasWidth, canvasHeight, 
		sampleRate, -78, 0, filterArray);
	}
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


var canvasRange = {};

//ratio of canvas width at which the minimum frequency of filter is located
var canvasMinFreqRatio = Math.log2(32/20) / 10;

//ratio of canvas width at which the maximum frequency of filter is located
var canvasMaxFreqRatio = Math.log2(16384/20) / 10;

var canvasControlHandler = function(e){
	var parameters = eq.tracks[0].parameters;
	var mouseX = e.clientX;
	var detune = parameters.detune;
	var left = canvasRange.left + detune.min * (canvasRange.right - canvasRange.left);
	var right = canvasRange.left + detune.max * (canvasRange.right - canvasRange.left);

	if( left < mouseX && mouseX < right){

		var detuneStep = Math.floor((mouseX - left) / 
			            (right - left) * (detune.stepCount + 1));
		if (detuneStep != detune.user && detune.testMode !== 'reference' && detune.isActive){
			detune.user = detuneStep;
		}
	}

	var mouseY = e.clientY;
	var gain = parameters.gain;
	var top = canvasRange.bottom - gain.max * (canvasRange.bottom - canvasRange.top);
	var bottom = canvasRange.bottom - gain.min * (canvasRange.bottom - canvasRange.top);
	if( top < mouseY && mouseY < bottom && parameters.type.user === 0){


		var gainStep = Math.floor((bottom - mouseY) / 
			            (bottom - top) * (gain.stepCount + 1));
		if (gainStep != gain.user && gain.testMode !== 'reference' && gain.isActive){
			gain.user = gainStep;
		}
	}
}
function setCanvasRange(){
	var spectrum = $('#spectrum');
	var height = spectrum.height();
	var t = spectrum.offset().top - $(document).scrollTop();
	canvasRange.top = t + height * (1/2 - 12 / 78);
	canvasRange.bottom = t + height * (1/2 + 12 / 78);
	var l = spectrum.offset().left - $(document).scrollLeft();
	canvasRange.left = l + canvasMinFreqRatio * spectrum.width();
	canvasRange.right = l + canvasMaxFreqRatio * spectrum.width();
}
var doCanvasControls= true;

$(document).ready(function(){
	canvas = $('#spectrum')[0];
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasMidHeight = canvasHeight/2;
	canvasContext = canvas.getContext('2d');
	canvasContext.fillStyle = 'rgb(0,' + 225 + ',0)';
    canvasContext.lineWidth = 5;
    canvasContext.lineJoin = 'round';

    $('#spectrum').on('mousedown', function(e){
    	if (doCanvasControls){
	    	e.preventDefault();
	    	setCanvasRange();
	    	canvasControlHandler(e);
			$(document).mousemove(canvasControlHandler);
			$(document).mouseup(function(){
				$(this).off('mouseup mousemove');
			});
	    }
    });

    $('#spectrum').on('touchstart', function(e){
    	if (doCanvasControls){
	    	e.preventDefault();
	    	setCanvasRange();
	    	canvasControlHandler(e.originalEvent.touches[0]);
			$(document).on('touchmove', function(e){
				e.preventDefault();
				canvasControlHandler(e.originalEvent.touches[0]);
			});
			$(document).on('touchend touchcancel', function(){
				$(this).off('touchend touchcancel touchmove');
			});
		}
    });

    $('#toggle-spectrum').click( function(){
    	doSpectrum = !doSpectrum;
    	$(this).html( "Turn " + (doSpectrum ? "Off" : "On" ) + " Spectrum");
    });
    $('#toggle-spectrum-controls').click( function(){
    	doCanvasControls = !doCanvasControls;
    	$(this).html( "Turn " + (doCanvasControls ? "Off" : "On" ) + " Spectrum Controls");
    });

	drawCanvas();

	waBindKeys(eq);

});

