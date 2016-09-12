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
	defaultAudio: 'audio/audio.mp3',
	pinkNoise: 'audio/pinkaudio.mp3'
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




function drawSpectrum(){
	canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	//var dataArray = eq.audio.dataArray;
	//var bufferLength = eq.audio.bufferLength;



	var barWidth; //= width / bufferLength;
	  var barHeight;
	  var x = 0;

	  // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
	  // before drawing. This is the scale factor
	  var heightScale = canvasHeight/128;

	  for(var i = 0; i < bufferLength; i++) {
	    barHeight =  canvasHeight * 1/(40)*((dataArray[i]+ 3*Math.log2(i + 1)) + 78);
	    x = canvasWidth * Math.log2(i+1)/10;//if 1024 then 10 should be 9
	    barWidth = canvasWidth * Math.log2(i+2)/10 - x +1;


	    canvasContext.fillRect(x, canvasHeight-barHeight/2, barWidth, barHeight/2);

	    // 2 is the number of pixels between bars
	    //x += barWidth;
	  }


}

var doSpectrum = true;
function drawCanvas(){

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
		drawSpectrum();
	else
		canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

	drawCurve();
	requestAnimationFrame(drawCanvas);
}



var canvasDetune = eq.tracks[0].parameters.detune;
var canvasGain = eq.tracks[0].parameters.gain;
var canvasQ = eq.tracks[0].parameters.Q;
var canvasType = eq.tracks[0].parameters.type;

function drawCurve(){
	//canvasContext.clearRect(0, 0, width, height);
	//var freq = ;
	var freqPos = canvasWidth *( 0.065 + (0.946 - 0.065) * canvasDetune.getRatio('user'));

	canvasContext.beginPath();

	if(canvasType.getRatio('user') === 0){
		//var level = eq.tracks[0].parameters.gain;
		//console.log(level.user);
		var levelPos = canvasMidHeight - canvasHeight * 0.35*canvasGain.getRatio('user'); // 0.5 - 0.9 * level.user/(2 * level.stepCount));

		//var q = eq.tracks[0].parameters.Q;
		var qWidth = 0.04 * canvasWidth * Math.pow(25, canvasQ.getRatio('user'));
		canvasContext.moveTo(0, canvasMidHeight);
		canvasContext.lineTo(freqPos - qWidth, canvasMidHeight);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), canvasMidHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), canvasMidHeight, freqPos + qWidth, canvasMidHeight);

		canvasContext.lineTo(canvasWidth, canvasMidHeight);
	}
	else if (canvasType.getRatio('user') === 1){
		var qWidth = 0.1 * canvasWidth;
		//var q = eq.tracks[0].parameters.Q;
		var levelPos = canvasHeight * (0.5 - 0.1 * ( 1 - canvasQ.getRatio('user')));

		canvasContext.moveTo(0, canvasMidHeight);
		canvasContext.lineTo(freqPos - qWidth, canvasMidHeight);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), canvasMidHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), canvasMidHeight, freqPos + canvasWidth/2, 1.5* canvasHeight);

	}
	else{
		var qWidth = 0.1 * canvasWidth;
		//var q = eq.tracks[0].parameters.Q;
		var levelPos = canvasHeight * (0.5 - 0.1 * ( 1 - canvasQ.getRatio('user')));

		canvasContext.moveTo(freqPos - canvasWidth/2, 1.5*canvasHeight);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), canvasMidHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), canvasMidHeight, freqPos + qWidth, canvasMidHeight);
		canvasContext.lineTo(canvasWidth, canvasMidHeight);

	
	}





	canvasContext.stroke();
	//canvasContext.stroke();
	//canvasContext.stroke();
};


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
    $('#spectrum').click(function(e){
    	e.preventDefault();
    	doSpectrum = !doSpectrum;
    });

	drawCanvas();

	waBindKeys(eq);

});

