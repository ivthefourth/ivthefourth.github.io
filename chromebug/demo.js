
var WACTX = window.AudioContext || window.webkitAudioContext;
var audioCtx = new WACTX;

function WaNode(){
	this.parallel = false;
}
WaNode.prototype.connect = function(connectTo){ //considder adding the other args
	if( connectTo instanceof(WaNode) ){
		this.node.connect(connectTo.node);
	}
	else{
		this.node.connect(connectTo);
	}
}
WaNode.prototype.disconnect = function(connectTo){ //considder adding the other args
	if( connectTo ){
		if( connectTo instanceof(WaNode) ){
			this.node.disconnect(connectTo.node);
		}
		else{
			this.node.disconnect(connectTo);
		}
	}
	else{
		this.node.disconnect();
	}
}

function WaBufferSourceNode(){
	WaNode.call(this);

	this.isPlaying = false;
	this.startedAt = 0;
	this.startOffset = 0;
	this.buffer = null;
	// so that there is a node to stay connected to this.connect(destinations)
	this.node = audioCtx.createGain();

}
WaBufferSourceNode.prototype = Object.create(WaNode.prototype);
WaBufferSourceNode.prototype.constructor = WaBufferSourceNode;
WaBufferSourceNode.prototype.play = function(atTime){
	if( !this.isPlaying ){
		this.startedAt = atTime;
		this.isPlaying = true;
		this.source = audioCtx.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.loop = true;
		this.source.connect(this.node);
		this.node.gain.setValueAtTime(0, atTime);
		this.node.gain.linearRampToValueAtTime(1, atTime + 0.02);
		this.source.start(atTime, this.startOffset );
	}
}
WaBufferSourceNode.prototype.pause = function(atTime){
	if( this.isPlaying ){
		this.isPlaying = false;
		this.node.gain.setValueAtTime(1, atTime);
		this.node.gain.linearRampToValueAtTime(0, atTime + 0.02);
		this.source.stop(atTime + 0.02);
		this.startOffset = (this.startOffset + atTime - this.startedAt) % this.buffer.duration;
	}
}
WaBufferSourceNode.prototype.loadFromURL = function(url){//maybe add a callback fn as arg
	if( this.isPlaying )
		throw 'Buffer Load Error: Cannot load buffer when audio is playing';
	var that = this;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.onload = function(){
		var audioData = request.response;
		audioCtx.decodeAudioData(audioData, function(data){
			that.buffer = data;
			that.startOffset = 0;
		});
	}
	request.send();
}


var source = new WaBufferSourceNode;
source.loadFromURL('ffmb.mp3');
var gain = audioCtx.createGain();

source.connect(gain);
gain.connect(audioCtx.destination);

function playPause(){
	var now = audioCtx.currentTime;
	if( source.isPlaying)
		source.pause(now);
	else
		source.play(now);
}

var isMuted = false;
function mute(){
	var now = audioCtx.currentTime;
	if( isMuted){
		//declick the unmute
		gain.gain.setValueAtTime(1, now);
		$('#mute-text').text('Sound Should Be On');
	}
	else{
		//declick the mute
		gain.gain.setValueAtTime(0, now);
		$('#mute-text').text('Sound Should Be Off');
	}
	isMuted = !isMuted;
}
