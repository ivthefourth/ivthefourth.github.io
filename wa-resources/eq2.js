

var eq = new EarTrainingApp('#eq');
eq.tracks.push( new EarTrainingTrack('#track0') );
eq.tracks[0].filter = new WaParallelNode(WaFilterNode, 
	{type: { 
		func: WaSelectionParam, args: [['peaking', 'lowpass', 'highpass']]}, 
		gain: { func: WaDecibelGain, args: ['bipolar',12]}
	});

eq.tracks[0].sourceNode.connect(eq.tracks[0].filter);
eq.tracks[0].filter.connect(eq.tracks[0].crossfader);
eq.tracks[0].crossfader.connect(eq.volume);
eq.volume.connect(audioCtx.destination);

//change later to load from default audio url
eq.tracks[0].sourceNode.loadFromURL('ffmb.mp3');



eq.tracks[0].parameters.gain = 
new EarTrainingParameter('#level', 0, BipolarVerticalSlider, eq.tracks[0].filter, 'gain');

eq.tracks[0].parameters.detune = 
new EarTrainingParameter('#frequency', 0.5, UnipolarKnob, eq.tracks[0].filter, 'detune');

eq.tracks[0].parameters.Q = 
new EarTrainingParameter('#bandwidth', 0.5, UnipolarKnob, eq.tracks[0].filter, 'Q');

eq.tracks[0].parameters.type = 
new EarTrainingParameter('#filter-type', 0, ClickToggle, eq.tracks[0].filter, 'type');

/*
function addTrack(num){

	eq.tracks.push( new EarTrainingTrack('#track' + num) );
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

}

for( var i = 1; i < 16; i++)
	addTrack(i);
*/

