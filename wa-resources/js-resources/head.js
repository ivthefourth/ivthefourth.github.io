//Resources for Beat School WebAudio Applications

/*
NOTE: if trying to associate parameters, audioparams, or controllers of different
	  POLARITY, throw error. 
NOTE: Parallel/Double objects should have the same methods as the singular ones
	  and call those mehtods on each of ref and user
	  Parallel/Double objects should only work with other parallel/double or crossfade
NOTE: Use getters and setters when appropriate 





Ear Training Parameter = {
	function to update canvas???
	
}


Double Source Nodes( contain two buffers ){
	need play, pause, and stop(atTime) methods... which call same methods on children
	contains two source nodes ^^
	if connecting to something with "isParallel" false, throw error
	
}


MiltipleSourceApp (possibly just called mixer) {
	app with multiple "source nodes" or "double source node"
}
MixerTrack{
	
}
eartrainingmixertrack{
	has crossfader
}


PROTOTYPES FOR AUDIO/SETTINGS/CONTROLS/ETC. (anything reusable)




*/



/*

NOTES:

AudioNode.disconnect(AudioNode) disconnects ALL connections in firefox;




*/

dragDropTest = function() {
	var div = document.createElement('div');
	return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) 
			&& 'FormData' in window && 'FileReader' in window;
};

var CANDRAGDROP = dragDropTest();
//console.log('Can drag drop: ' + CANDRAGDROP);


var WACTX = window.AudioContext || window.webkitAudioContext;
var audioCtx;
var waClickY;
var waClickX;

if( WACTX ){
audioCtx = new WACTX;
