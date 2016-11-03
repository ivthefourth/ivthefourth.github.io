/*
***
***  WEB AUDIO NODE WRAPPERS
***
*/


function WaNode(){
	this.parallel = false;
}
WaNode.prototype.connect = function(connectTo){ //considder adding the other args
	if( connectTo instanceof(WaNode) ){
		this.node.connect(connectTo.node);
	}
	else if( connectTo instanceof(WaParallelNode) ){
		this.node.connect(connectTo.user.node);
		this.node.connect(connectTo.reference.node);
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
		else if( connectTo instanceof(WaParallelNode) ){
			this.node.disconnect(connectTo.user.node);
			this.node.disconnect(connectTo.reference.node);
		}
		else{
			this.node.disconnect(connectTo);
		}
	}
	else{
		this.node.disconnect();
	}
}


function WaParallelNode(nodeType, paramObj){
	//can only connect to other parallel nodes (or crossfade)
	this.parallel = true;
	this.user = new nodeType(paramObj);
	this.reference = new nodeType(paramObj);
}
WaParallelNode.prototype.connect = function(connectTo){
	if( connectTo instanceof(WaParallelNode) || connectTo instanceof(WaCrossfader) ){
		this.reference.connect(connectTo.reference);
		this.user.connect(connectTo.user);
	}
	else{
		throw 'Connection Error: Can only connect parallel nodes to other parallel nodes';
	}
}
WaParallelNode.prototype.disconnect = function(connectTo){
	if( connectTo ){
		if( connectTo instanceof(WaParallelNode) || connectTo instanceof(WaCrossfader) ){
			this.reference.disconnect(connectTo.reference);
			this.user.disconnect(connectTo.user);
		}
		else{
			throw 'Connection Error: Can only connect parallel nodes to other parallel nodes';
		}
	}
	else{
		this.reference.disconnect();
		this.user.disconnect();
	}
}






function WaCrossfader(){
	this.reference = new WaGainNode;
	this.reference.gain.value = 0; //Listen to user by default
	this.user = new WaGainNode;
}
WaCrossfader.prototype.listenToUser = function(){//potentially add a "time" arg
	this.reference.gain.value = 0;
	this.user.gain.value = 1;
}
WaCrossfader.prototype.listenToReference = function(){
	this.reference.gain.value = 1;
	this.user.gain.value = 0;
}
WaCrossfader.prototype.connect = function(connectTo){ //considder adding the other args
	if( connectTo instanceof(WaNode) ){
		this.user.node.connect(connectTo.node);
		this.reference.node.connect(connectTo.node);
	}
	else{
		this.user.node.connect(connectTo);
		this.reference.node.connect(connectTo);
	}
}
WaCrossfader.prototype.disconnect = function(connectTo){ //considder adding the other args
	if( connectTo ){
		if( connectTo instanceof(WaNode) ){
			this.user.node.disconnect(connectTo.node);
			this.reference.node.disconnect(connectTo.node);
		}
		else{
			this.user.node.disconnect(connectTo);
			this.reference.node.disconnect(connectTo);
		}
	}
	else{
		this.user.node.disconnect();
		this.reference.node.disconnect();
	}
}





function WaBufferSourceNode(){
	WaNode.call(this);

	this.isPlaying = false;
	this.isStopped = true;
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
		if( atTime == null)
			atTime = audioCtx.currentTime;
		this.startedAt = atTime;
		this.isPlaying = true;
		this.isStopped = false;
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
		if( atTime == null)
			atTime = audioCtx.currentTime;
		this.isPlaying = false;
		this.node.gain.setValueAtTime(1, atTime);
		this.node.gain.linearRampToValueAtTime(0, atTime + 0.02);
		this.source.stop(atTime + 0.02);
		this.startOffset = (this.startOffset + atTime - this.startedAt) % this.buffer.duration;
	}
}
WaBufferSourceNode.prototype.stop = function(atTime){

	if(!this.isStopped){
		if( this.isPlaying ){
			if( atTime == null)
				atTime = audioCtx.currentTime;
			this.isPlaying = false;
			this.node.gain.setValueAtTime(1, atTime);
			this.node.gain.linearRampToValueAtTime(0, atTime + 0.02);
			this.source.stop(atTime + 0.02);
		}
		this.isStopped = true;
		this.startOffset = 0;
	}
	
}
WaBufferSourceNode.prototype.loadFromURL = function(url, callback){//maybe add a callback fn as arg
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
			that.startOffset = 0;//maybe not... maybe call stop all when wanting to load files?
			callback();//call callback here if i decide to use it;
		});
	}
	request.send();
}
WaBufferSourceNode.prototype.loadFromFile = function(file, callback){//maybe add a callback fn as arg
	if( this.isPlaying )
		throw 'Buffer Load Error: Cannot load buffer when audio is playing';
	var that = this;
	var reader = new FileReader();
	reader.onload = function(e){
		var audioData = e.target.result;
		audioCtx.decodeAudioData(audioData, function(data){
			that.buffer = data;
			that.startOffset = 0;//maybe not... maybe call stop all when wanting to load files?
			callback();//call callback here if i decide to use it;
		});
	}
	reader.readAsArrayBuffer(file);
}





function WaGainNode(paramObj){
	WaNode.call(this);
	this.node = audioCtx.createGain();
	if( !paramObj )
		var paramObj = {};
	if( paramObj.gain ){
		var args = [];
		args = args.concat(paramObj.gain.args);
		args.unshift(this.node.gain);
		//console.log(args);
		this.gain = new paramObj.gain.func();
		paramObj.gain.func.apply(this.gain, args);
	}
	else{
		this.gain = new WaPowerGain(this.node.gain, 'unipolar', 1);
	}
}
WaGainNode.prototype = Object.create(WaNode.prototype);
WaGainNode.prototype.constructor = WaGainNode;






function WaFilterNode(paramObj){
	WaNode.call(this);
	this.node = audioCtx.createBiquadFilter();
	if( !paramObj )
		var paramObj = {};
	if( paramObj.frequency ){
		var args = [];
		args = args.concat(paramObj.frequency.args);
		args.unshift(this.node.frequency);
		//console.log(args);
		this.frequency = new paramObj.frequency.func();
		paramObj.frequency.func.apply(this.frequency, args);
	}
	else{
		this.frequency = new WaLinearFrequency(this.node.frequency, 0, 20000);
		this.frequency.value = 32;
	}
	if( paramObj.detune ){
		var args = [];
		args = args.concat(paramObj.detune.args);
		args.unshift(this.node.detune);
		//console.log(args);
		this.detune = new paramObj.detune.func();
		paramObj.detune.func.apply(this.detune, args);
	}
	else{
		this.detune = new WaDetune(this.node.detune, 'unipolar', 9*12);
	}
	if( paramObj.Q ){
		var args = [];
		args = args.concat(paramObj.Q.args);
		args.unshift(this.node.Q);
		//console.log(args);
		this.Q = new paramObj.Q.func();
		paramObj.Q.func.apply(this.Q, args);
	}
	else{
		this.Q = new WaQ(this.node.Q, 0.1, 5);
	}
	if( paramObj.gain ){
		var args = [];
		args = args.concat(paramObj.gain.args);
		args.unshift(this.node.gain);
		//console.log(args);
		this.gain = new paramObj.gain.func();
		paramObj.gain.func.apply(this.gain, args);
	}
	else{
		this.gain = new WaDecibelGain(this.node.gain, 'bipolar', 18);
	}
	if( paramObj.type ){
		var args = [];
		args = args.concat(paramObj.type.args);
		args.push(this.node);
		args.push('type');
		//console.log(args);
		this.type = new paramObj.type.func();
		paramObj.type.func.apply(this.type, args);
	}
	else{
		this.type = new WaSelectionParam(
			['peaking', 'lowpass', 'highpass', 'bandpass', 
			'lowshelf', 'highshelf', 'notch'],
			this.node, 'type');
	}
}
WaFilterNode.prototype = Object.create(WaNode.prototype);
WaFilterNode.prototype.constructor = WaFilterNode;
WaFilterNode.prototype.getComputedFrequency = function(){
	return this.frequency.value * Math.pow(2, this.detune.value / 1200);
}
