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



/*
***
***  WEB AUDIO PARAMETER WRAPPERS
***
*/

function WaSelectionParam(selectionArray, node, paramString){
	//E.G. for filter type, and oscillator type, and custom thing types. 
	this.polarity = 'selection';
	this.node = node;
	this.param = paramString;
	this.selections = selectionArray;
}//vvv disable ratio checks for deploy
WaSelectionParam.prototype.setValueFromRatio = function(ratio){
	if( ratio != Math.floor(ratio))
		throw 'Type Error: For selection params, "ratio" must be an integer'
	else if(ratio < 0 || ratio > this.selections.length - 1)
		throw 'Index Out of Bounds Error (WaSelectionParam)';
	this.value = this.selections[ratio];
}
Object.defineProperties(WaSelectionParam.prototype,{
	value:{
		get: function(){ 
			return this.node[this.param]; 
		},
		set: function(input){ 
			this.node[this.param] = input;
		},
	}
});



function WaParam(param, polarity, declick){
	//Give methods like linearramptovalue...
	//and save the end time for curves
	//when changing the value, check the end time
	//if end time is less than "now", set value to value and then ramp
	//otherwise just ramp... check documentation to be sure this works

	if( polarity && polarity !== 'unipolar' && polarity !== 'bipolar')
		throw 'Polarity Error: Polarity value for WaParams must be "unipolar" or "bipolar"';
	this.polarity = polarity;
	this.param = param;
	this.declick = declick;
	this.automationEndTime = 0;

}
WaParam.prototype.setValueFromRatio = function(ratio){
	//validate ratio against polarity... disable tests for deploy
	if( this.polarity === 'unipolar' && (ratio < 0 || ratio > 1))
		throw 'Invalid Ratio: For unipolar, 0 <= ratio <=1';
	else if ( this.polarity === 'bipolar' && (ratio < -1 || ratio > 1))
		throw 'Invalid Ratio: For bipolar, -1 <= ratio <=1';
	this.value = this.law(ratio);
}
Object.defineProperties(WaParam.prototype,{
	value:{
		get: function(){ return this.val; },
		set: function(input){
			var now = audioCtx.currentTime;
			if( this.declick ){
				//use slope
				if( now > this.automationEndTime )
					this.param.setValueAtTime( this.val, now );
				this.param.linearRampToValueAtTime( input, now + 0.02);
			}
			else{
				//don't use slope
				this.param.setValueAtTime( input, now );
			}
			this.val = input;
			this.automationEndTime = now + 0.02;
		}
	}
});



function WaPowerGain(param, polarity, max){
	WaParam.call(this, param, polarity, true);

	this.max = max;
	this.val = 1; //default value for gain node
}
WaPowerGain.prototype = Object.create(WaParam.prototype);
WaPowerGain.prototype.constructor = WaPowerGain;
WaPowerGain.prototype.law = function(input){
	return input * Math.abs(input) * this.max;
}



function WaDetune(param, polarity, maxSemitones){
	WaParam.call(this, param, polarity, true); //maybe change true to false?
	this.max = maxSemitones;
	this.val = 0; //default value for detune parameters
}
WaDetune.prototype = Object.create(WaParam.prototype);
WaDetune.prototype.constructor = WaDetune;
WaDetune.prototype.law = function(input){
	return input * this.max * 100; //100 cents per semitone
}



//gain param for decibel based gains... NOT for gain nodes
function WaDecibelGain(param, polarity, maxdB){
	WaParam.call(this, param, polarity, true);
	this.max = maxdB;
	this.val = 0; //default value for biquad filter gain
}
WaDecibelGain.prototype = Object.create(WaParam.prototype);
WaDecibelGain.prototype.constructor = WaDecibelGain;
WaDecibelGain.prototype.law = function(input){
	return input * this.max;
}



function WaQ(param, min, max){
	WaParam.call(this, param, 'unipolar', true);
	this.min = min;
	this.max = max;
	this.val = 1; //default value for Q
}
WaQ.prototype = Object.create(WaParam.prototype);
WaQ.prototype.constructor = WaQ;
WaQ.prototype.law = function(input){
	var ratio = 1 - input;
	return this.min * Math.pow(this.max/this.min, ratio);
}



function WaLinearFrequency(param, min, max){
	WaParam.call(this, param, 'unipolar', true);
	this.min = min;
	this.max = max;
	this.val = 350; //default for filter freq... osc default is 440
}
WaLinearFrequency.prototype = Object.create(WaParam.prototype);
WaLinearFrequency.prototype.constructor = WaLinearFrequency;
WaLinearFrequency.prototype.law = function(input){
	return this.min + (this.max - this.min) * input;
}






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




/*
***
***  Controllers
***
*/


//arg refers to Parameter and EarTrainingParameter
function BipolarVerticalSlider(parameter){
	this.polarity = 'bipolar';
	this.setLevelRange(parameter.ID);


	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){
			var mouseY = e.clientY;
			//console.log(mouseY);
			var levelRange = that.levelRange;
			var top = levelRange.bottom - levelRange.height * parameter.max;
			var bottom = levelRange.bottom - levelRange.height * parameter.min;
			var sCount = parameter.stepCount;
			var step = Math.floor((bottom - mouseY)/(bottom - top)*(sCount + 1));

			if( top < mouseY 
			&& mouseY < bottom 
			&& step != parameter.user 
			&& parameter.testMode !== 'reference'){
				parameter.user = step;
				//console.log(step);
			}
		}
		/*var touchHandler = function(e){
			var mouseY = e.clientY;
			var levelRange = that.levelRange;
			var top = levelRange.bottom - levelRange.height * parameter.max;
			var bottom = levelRange.bottom - levelRange.height * parameter.min;
			var sCount = parameter.stepCount;
			var step = Math.floor((bottom - mouseY)/(bottom - top)*(sCount + 1));

			if( top < mouseY 
			&& mouseY < bottom 
			&& step != parameter.user 
			&& parameter.testMode !== 'reference'){
				parameter.user = step;
				//console.log(step);
			}
		}*/
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});

}
BipolarVerticalSlider.prototype.setLevelRange = function(id){
	//console.log(id);
	var levelRange = {};
	levelRange.height = $(id).height()
	levelRange.top = $(id).offset().top - $(document).scrollTop();
	levelRange.bottom = levelRange.top + levelRange.height;
	levelRange.center = (levelRange.top + levelRange.bottom)/2;
	this.levelRange = levelRange;
}
BipolarVerticalSlider.prototype.updateInterface = function(id, ratio){
	var slider = $(id + ' .range');
	var height = this.levelRange.height;
	if(ratio < 0){
		slider.css({'top': '50%', 'bottom': 'auto'});
		slider.css('height', - height * ratio / 2);
	}
	else{
		slider.css({'bottom': '50%', 'top': 'auto'});
		slider.css('height', height * ratio / 2);
	}
	$(id + ' .handle').css('transform', 'translateY(' + -(ratio + 1)*height/2 + 'px)');
	//console.log(transform);
	//console.log(levelRange.center);
	//transform = transform + (levelRange.bottom - levelRange.center);
	//$(id + ' .range').css('transform', 'scaleY(' + transform + ')');
}



function UnipolarHorizontalSlider(parameter){
	this.polarity = 'unipolar';
	this.setLevelRange(parameter.ID);

	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){;}
	}
	else if(parameter instanceof Parameter){
		var levelHandler = function(e){
			var mouseX = e.clientX;
			var levelRange = that.levelRange;
			var left = levelRange.left;
			var right = levelRange.right;
			var width = levelRange.width;
			var maxLeft = left + width * parameter.min;
			var maxRight = left + width * parameter.max;
			var step = (mouseX - left)/width;
			//console.log(mouseX, maxLeft, maxRight, left, right, width);

			if( maxLeft < mouseX 
			&& mouseX < maxRight 
			&& step != parameter.user ){
				parameter.user = step;
				//console.log(mouseX + ', ' + currentMouseY);
			}
		}
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});
}
UnipolarHorizontalSlider.prototype.setLevelRange = function(id){
	//console.log(id);
	var levelRange = {};
	levelRange.left = $(id).offset().left - $(document).scrollLeft();
	levelRange.width = $(id).width();
	levelRange.right = levelRange.left + levelRange.width;
	this.levelRange = levelRange;
}
UnipolarHorizontalSlider.prototype.updateInterface = function(id, ratio){
	var levelRange = this.levelRange;
	//console.log(ratio);
	var transform =  ratio * levelRange.width;
	$(id + ' .handle').css('transform', 'translateX(' + transform + 'px)');
	$(id + ' .range').css('width', transform + 'px');
}




function UnipolarKnob(parameter){
	this.polarity = 'unipolar';


	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){
			var mouseY = e.clientY;
			//maybe change vvv
			var step = parameter.user + Math.floor(((waClickY - mouseY)/20) + 0.5);
			if( 0 <= step && step <= parameter.stepCount 
			&& step !== parameter.user && parameter.testMode !== 'reference'){
				waClickY = mouseY;
				parameter.user = step;
				//console.log(step);
			}
		}
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		waClickY = e.clientY;
		//levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		waClickY = e.originalEvent.touches[0].clientY;
		//levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});
}
UnipolarKnob.prototype.updateInterface = function(id, ratio){
	$(id).css('transform', 'rotate(' + (ratio * 270 - 135) + 'deg)');
}


function ClickToggle(parameter){
	this.polarity = 'selection';
	this.classList = [];
	if( parameter instanceof EarTrainingParameter){
		var typeItem;
		var selections = parameter.node.user[parameter.paramString].selections;
		for( typeItem in selections){
			this.classList.push('controller-' + selections[typeItem]);
		}
		var clickHandler = function(e){
			e.preventDefault;
			if(parameter.testMode !== 'reference'){
				parameter.user = ((parameter.user + 1 )%(parameter.stepCount + 1));
				//console.log(param.user);
			};
		}
	}

	//this.currentClass = this.classList[0];
	$(parameter.ID).mousedown(clickHandler);
	$(parameter.ID).on('touchstart', clickHandler);

}
ClickToggle.prototype.updateInterface = function(id, ratio){
	$(id).removeClass(this.currentClass);
	this.currentClass = this.classList[ratio];
	$(id).addClass(this.currentClass);
}



/*
***
***  Parameters
***
*/

function Parameter(ID, defaultRatio, controllerType, node, paramString){
	this.ID = ID;
	this.defaultRatio = defaultRatio;
	this.node = node;
	this.paramString = paramString;
	this.controller = new controllerType(this);
	this.polarity = this.controller.polarity;
	if( this.polarity !== node[paramString].polarity)
		throw "Polarity Error: Controller polarity must match parameter polarity.";

	if(this.polarity === 'selection'){
		var len = this.controller.classList.length - 1;
		this.stepCount = len;
		this.min = 0;
		this.max = len;
	}
	else if(this.polarity === 'unipolar' || this.polarity === 'bipolar'){
		//this.stepCount = 2;
		this.min = 0;
		this.max = 1;
	}
	else{
		throw 'Polarity Error: Controller for param "' + this.ID + 
		      '"" has invalid polarity value.'
	}

	this.setRatio(defaultRatio);
}
Object.defineProperties(Parameter.prototype,{
	user:{
		get: function(){ 
			return this.u; 
		},
		set: function(step){ 
			this.u = step;
			var ratio = this.getRatio();
			this.node[this.paramString].setValueFromRatio(ratio);
			this.controller.updateInterface(this.ID, ratio);
		}
	}
});
Parameter.prototype.getRatio = function(){
	if(this.polarity === 'selection'){
		return this.user + this.min;
	}
	else if(this.polarity === 'unipolar'){
		return this.user;
	}
	else{ //bipolar
		return this.user * 2 - 1;
	}
}
Parameter.prototype.setRatio = function(ratio){
	if(this.polarity === 'selection'){
		if(ratio < this.min)
			this.user = 0;
		else if(ratio > this.max)
			this.user = this.stepCount;
		else
			this.user = ratio - this.min;
	}
	else if(this.polarity === 'unipolar'){
		if(ratio < this.min)
			this.user = this.min;
		else if(ratio > this.max)
			this.user = this.max;
		else
			this.user = ratio;
	}
	else{ //bipolar
		ratio = (ratio + 1) / 2;
		if(ratio < this.min)
			this.user = this.min;
		else if(ratio > this.max)
			this.user = this.max;
		else
			this.user = ratio;
	}
}



function EarTrainingParameter(ID, defaultRatio, controllerType, node, paramString){
	this.ID = ID;
	this.defaultRatio = defaultRatio;
	this.testMode = 'test'; // test, user, reference
	this.node = node;
	this.paramString = paramString;
	this.controller = new controllerType(this);
	this.polarity = this.controller.polarity;
	if( this.polarity !== node.user[paramString].polarity)
		throw "Polarity Error: Controller polarity must match parameter polarity.";

	if(this.polarity === 'selection'){
		var len = this.controller.classList.length - 1;
		this.stepCount = len;
		this.min = 0;
		this.max = len;
	}
	else if(this.polarity === 'unipolar' || this.polarity === 'bipolar'){
		this.stepCount = 2;
		this.min = 0;
		this.max = 1;
	}
	else{
		throw 'Polarity Error: Controller for param "' + this.ID + 
		      '"" has invalid polarity value.'
	}




	this.setRatio('user', defaultRatio);
	this.setRatio('reference', defaultRatio);
	
}
Object.defineProperties(EarTrainingParameter.prototype,{
	user:{
		get: function(){ 
			return this.u; 
		},
		set: function(step){ 
			this.u = step;
			if( this.testMode === 'user')
				this.reference = step;
			var ratio = this.getRatio('user');
			this.node.user[this.paramString].setValueFromRatio(ratio);
			this.controller.updateInterface(this.ID, ratio);
		}
	},

	reference:{
		get: function(){ 
			return this.r; 
		},
		set: function(step){ 
			this.r = step;
			if( this.testMode === 'reference')
				this.user = step;
			var ratio = this.getRatio('reference');
			this.node.reference[this.paramString].setValueFromRatio(ratio);
		}
	}
});
EarTrainingParameter.prototype.getRatio = function(userOrRef){
	if(this.polarity === 'selection'){
		return this[userOrRef] + this.min;
	}
	else if(this.polarity === 'unipolar'){
		return (this.min + (this.max - this.min) * this[userOrRef] / this.stepCount);
	}
	else{ //bipolar
		return (this.min + (this.max - this.min) * this[userOrRef] / this.stepCount) * 2 - 1;
	}
}
EarTrainingParameter.prototype.setRatio = function(userOrRef, ratio){
	if(this.polarity === 'selection'){
		if(ratio < this.min)
			this[userOrRef] = 0;
		else if(ratio > this.max)
			this[userOrRef] = this.stepCount;
		else
			this[userOrRef] = ratio - this.min;
	}
	else if(this.polarity === 'unipolar'){
		if(ratio < this.min)
			this[userOrRef] = 0;
		else if(ratio > this.max)
			this[userOrRef] = this.stepCount;
		else
			this[userOrRef] = (this.max !== this.min) ? Math.round(this.stepCount * (ratio - this.min) / 
				              (this.max - this.min)) : 0;
	}
	else{ //bipolar
		ratio = (ratio + 1) / 2;
		if(ratio < this.min)
			this[userOrRef] = 0;
		else if(ratio > this.max)
			this[userOrRef] = this.stepCount;
		else
			this[userOrRef] = (this.max !== this.min) ? Math.round(this.stepCount * (ratio - this.min) / 
				              (this.max - this.min)) : 0;
	}
}
EarTrainingParameter.prototype.randomize = function(){
	if(this.testMode === 'reference'){
		this.reference = Math.floor(Math.random()*(this.stepCount + 1));
	}
	else if( this.testMode === 'test'){
		this.reference = Math.floor(Math.random()*(this.stepCount + 1));
		this.setRatio('user', this.defaultRatio);
	}//if this.testMode is 'user' don't change values, because that would annoy
	$(this.ID).removeClass('wrong-answer correct-answer');
}
EarTrainingParameter.prototype.updateSettings = function(steps, mode, min, max, defaultRatio){
	//handle bad inputs?
	if( defaultRatio || defaultRatio === 0)
		this.defaultRatio = defaultRatio;

	this.min = min;
	this.max = max;
	//for selection... steps = controller.classList.length - 1 - (max - min)
	this.stepCount = steps;
	this.testMode = mode;

	//add class for parameters that are 'reference' testModes

	if(this.testMode === 'user')
		this.setRatio('user', this.defaultRatio);

	this.randomize();
}
EarTrainingParameter.prototype.checkAnswer = function(){
	if( this.testMode === 'test' && this.min < this.max){
		if( this.user === this.reference)
			$(this.ID).addClass('correct-answer').removeClass('wrong-answer');
		else
			$(this.ID).addClass('wrong-answer').removeClass('correct-answer');
	}
}




/*
***
***  Larger Objects, e.g., aps
***
*/

function WaAppSettings(audioFiles, presets, formObj){
	this.audioFiles = audioFiles;
	this.presets = presets;
	this.formObj = formObj;
}
WaAppSettings.prototype.fillHtmlSelect = function(object, elementID){
	var html = '';
	var k;
	function keyToText(key){
		key = key.replace(/[A-Z]/g, function(x){return ' ' + x;});
		key = key.charAt(0).toUpperCase() + key.slice(1);
		return key;
		//console.log(key);
	};
	for( k in object){
		html += '<option value="';
		html += k;
		html += '">'
		html += keyToText(k);
		html += '</option>'
	}
	$(elementID).html(html);
}



function EarTrainingTrack(ID, app){
	this.ID = ID;
	this.app = app;
	this.isActive = true;
	this.parameters = {};
	this.crossfader = new WaCrossfader();
	this.sourceNode = new WaBufferSourceNode();
	this.customAudio = null;


	var that = this;
	//set up event listeners 
	$(this.ID + '-audio-file').change( function(){
		that.validateAudio( $(this)[0].files[0] );
	});

	$(this.ID + '-load-included-audio').click(function(e){
		e.preventDefault();
		var newAudio = $(that.ID + '-audio-files').val();
		that.app.updateLoader('increment');
		that.sourceNode.loadFromURL(that.app.settings.audioFiles[newAudio], function(){
			that.app.updateLoader('decrement');
		});
	});

	$(this.ID + '-load-custom-audio').click(function(e){
		e.preventDefault();
		if( that.customAudio ){
			that.app.updateLoader('increment');
			that.sourceNode.loadFromFile(that.customAudio, function(){
				that.app.updateLoader('decrement');
			});
		}
	});

	if( CANDRAGDROP ){
		$(this.ID + '-drag-drop').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
			e.preventDefault();
			e.stopPropagation();
		})
		.on('dragover dragenter', function() {
			$(this).addClass('is-dragover');
		})
		.on('dragleave dragend drop', function() {
			$(this).removeClass('is-dragover');
		})
		.on('drop', function(e) {
			that.validateAudio( e.originalEvent.dataTransfer.files[0] );
		});
	}
	else{
		$(this.ID + '-dd-text').html('<b>Click</b> to select a custom <i>.wav</i> or <i>.mp3</i> audio file')
	}

	$('.menu-item').click(function(e){
		e.preventDefault();
		var id = $(this).attr('href');
		$('.menu-item').removeClass('shown');
		$(this).addClass('shown');
		$('.settings-container').removeClass('shown');
		$(id).addClass('shown');
	});
	$('.menu-item').on('touchstart', function(e){
		e.preventDefault();
		var id = $(this).attr('href');
		$('.menu-item').removeClass('shown');
		$(this).addClass('shown');
		$('.settings-container').removeClass('shown');
		$(id).addClass('shown');
	});
}
EarTrainingTrack.prototype.validateAudio = function(file){
	if(!file){
		this.customAudio = null;
		if( CANDRAGDROP)
			var msg = '<b>Drag and Drop</b> or <b>Click</b> to select a custom <i>.wav</i> or <i>.mp3</i> audio file';
		else
			var msg = '<b>Click</b> to select a custom <i>.wav</i> or <i>.mp3</i> audio file';
		$(this.ID + '-dd-text').html(msg);
		$(this.ID + '-drag-drop').removeClass('error');
		$(this.ID + '-load-custom-audio').removeClass('active');
	}
	else if(file.type === 'audio/wav' 
	|| file.type === 'audio/mp3' 
	|| file.type === 'audio/mpeg'){
		this.audioIsValid = true;
		$(this.ID + '-dd-text').html('<b>' + file.name + '</b>');
		$(this.ID + '-drag-drop').removeClass('error');
		$(this.ID + '-load-custom-audio').addClass('active');
		this.customAudio = file;
	}
	else{
		this.customAudio = null;
		var errMsg = 'Invalid file type selected. Please choose an <b>Mp3</b> or <b>Wav</b> file.'
		$(this.ID + '-dd-text').html(errMsg);
		$(this.ID + '-drag-drop').addClass('error');
		$(this.ID + '-load-custom-audio').removeClass('active');
	}
}
EarTrainingTrack.prototype.randomize = function(){
	var param;
	for( param in this.parameters)
		this.parameters[param].randomize();
}
EarTrainingTrack.prototype.checkAnswer = function(){
	var param;
	for( param in this.parameters)
		this.parameters[param].checkAnswer();
	//check answer on all parameters... maybe can overwrite per ap
}



function EarTrainingApp(ID, settingsArgs){
	this.ID = ID;
	this.settings = new WaAppSettings();
	WaAppSettings.apply(this.settings, settingsArgs);
	this.volume = new WaGainNode();
	this.volumeCtrl = new Parameter(ID + '-volume', 0.75, UnipolarHorizontalSlider, this.volume, 'gain');
	this.muteVol = this.volumeCtrl.getRatio();
	this.isPlaying = false;
	this.crossfadeMonitor = 'user';
	this.tracks = [];
	this.resourcesToLoad = 0;
	this.settingsOpen = false;
	this.savedSettings = JSON.parse(JSON.stringify(this.settings.presets.defaultPreset));


	//set up event listeners 
	var that = this
	$(this.ID + '-play').click(function(e){
		e.preventDefault();
		that.playPause();
	});
	$(this.ID + '-play').on('touchstart', function(e){
		e.preventDefault();
		that.playPause();
	});

	$(this.ID + '-stop').click(function(e){
		e.preventDefault();
		that.stop();
	});
	$(this.ID + '-stop').on('touchstart', function(e){
		e.preventDefault();
		that.stop();
	});

	$(this.ID + '-reference-toggle').click(function(e){
		e.preventDefault();
		that.toggleReference();
	});
	$(this.ID + '-reference-toggle').on('touchstart', function(e){
		e.preventDefault();
		that.toggleReference();
	});

	$(this.ID + '-mute').click(function(e){
		e.preventDefault();
		that.mute();
	});
	$(this.ID + '-mute').on('touchstart', function(e){
		e.preventDefault();
		that.mute();
	});

	$(this.ID + '-settings-btn').click(function(e){
		e.preventDefault();
		that.showSettings();
	});
	$(this.ID + '-settings-btn').on('touchstart', function(e){
		e.preventDefault();
		that.showSettings();
	});

	$(this.ID + '-check-answer').click(function(e){
		e.preventDefault();
		that.checkAnswer();
	});
	$(this.ID + '-check-answer').on('touchstart', function(e){
		e.preventDefault();
		that.checkAnswer();
	});

	$(this.ID + '-reset-game').click(function(e){
		e.preventDefault();
		that.resetGame();
	});
	$(this.ID + '-reset-game').on('touchstart', function(e){
		e.preventDefault();
		that.resetGame();
	});

	$(this.ID + '-close-settings').click(function(e){
		e.preventDefault();
		that.hideSettings();
		that.fillFormFromObject(that.savedSettings);
	});

	$(this.ID + '-load-preset').click(function(e){
		e.preventDefault();
		var val = $(that.ID + '-presets').find(':selected').val();
		that.loadPreset(val);
	});


	$(this.ID + '-preset-form').submit(function(e){
		e.preventDefault();
		that.savePreset();
		//console.log('chicken');
	});

}
EarTrainingApp.prototype.resetGame = function(){
	var i;
	var trackList = this.tracks;
	for( i = 0; i < trackList.length; i++){
		if( trackList[i].isActive)
			trackList[i].randomize();
	}
}
EarTrainingApp.prototype.checkAnswer = function(){
	var i;
	var trackList = this.tracks;
	for( i = 0; i < trackList.length; i++){
		if( trackList[i].isActive)
			trackList[i].checkAnswer();
	}
}
EarTrainingApp.prototype.toggleReference = function(){
	var i;
	var trackList = this.tracks;
	if( this.crossfadeMonitor === 'user' ){
		//change class
		$(this.ID + '-reference-toggle').addClass('active');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive)
				trackList[i].crossfader.listenToReference();
		}
		this.crossfadeMonitor = 'reference';
	}
	else{
		//change class
		$(this.ID + '-reference-toggle').removeClass('active');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive)
				trackList[i].crossfader.listenToUser();
		}
		this.crossfadeMonitor = 'user';
	}
}
EarTrainingApp.prototype.playPause = function(){
	var now = audioCtx.currentTime;
	var i;
	var trackList = this.tracks;
	var play = !this.isPlaying;
	if( play ){
		//change class
		$(this.ID + '-play').addClass('playing');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive)
				trackList[i].sourceNode.play(now + 0.1);
		}
	}
	else{
		//change class
		$(this.ID + '-play').removeClass('playing');
		for( i = 0; i < trackList.length; i++){
			if( trackList[i].isActive)
				trackList[i].sourceNode.pause(now + 0.1);
		}
	}
	this.isPlaying = play;
}
EarTrainingApp.prototype.stop = function(){
	if( this.isPlaying )//change class
		$(this.ID + '-play').removeClass('playing');
	this.isPlaying = false;
	var now = audioCtx.currentTime;
	var i;
	var trackList = this.tracks;
	for( i = 0; i < trackList.length; i++){
		if( trackList[i].isActive)
			trackList[i].sourceNode.stop(now + 0.1);
	}
}
EarTrainingApp.prototype.mute = function(){
	var currentVol = this.volumeCtrl.getRatio();
	if( currentVol === 0){
		//unmute
		this.volumeCtrl.setRatio(this.muteVol);
	}
	else{
		//mute
		this.muteVol = currentVol;
		this.volumeCtrl.setRatio(0);
	}
}
EarTrainingApp.prototype.showSettings = function(){
	this.stop();
	$(this.ID + '-settings').addClass('shown');
	this.settingsOpen = true;
}
EarTrainingApp.prototype.hideSettings = function(){
	$(this.ID + '-settings').removeClass('shown');
	this.settingsOpen = false;
}
EarTrainingApp.prototype.updateLoader = function(updateType){
	if( updateType === 'increment'){
		if( this.resourcesToLoad === 0 )
			$(this.ID + '-loading-overlay').addClass('shown');
		this.resourcesToLoad += 1;
	}
	else
		if( this.resourcesToLoad > 0)
			this.resourcesToLoad -= 1;
		if( this.resourcesToLoad === 0)
			$(this.ID + '-loading-overlay').removeClass('shown');
		
}
EarTrainingApp.prototype.savePreset = function(){
	var param;
	var form =  this.settings.formObj;
	var newId;
	var saved = this.savedSettings;
	var i;
	var trackList = this.tracks;
	var formVal;
	var overlayID = this.ID + '-saved-overlay';
	if( this.resourcesToLoad === 0){
		$(overlayID).addClass('shown');
		setTimeout(function(){$(overlayID).removeClass('shown');}, 500);
	}
	for( param in form){
		if( form[param].stepCount){
			newId = this.ID + '-' + param + '-steps';
			newId = newId.toLowerCase();
			formVal = parseInt($(newId).val(), 10);
			if( 1 <= formVal && formVal <= form[param].maxSteps){
				saved[param].stepCount = formVal;
			}
			else{
				alert( form[param].title + ' "Steps" must be between 1 and ' + form[param].maxSteps);
				return;
			}
		}

		if( form[param].testMode){
			newId = this.ID + '-' + param + '-mode';
			newId = newId.toLowerCase();
			saved[param].testMode = $(newId).val();
		}

		if( form[param].min){
			newId = this.ID + '-' + param + '-min';
			newId = newId.toLowerCase();
			formVal = parseFloat($(newId).val());
			if( 0 <= formVal && formVal <= 1){
				saved[param].min = formVal;
			}
			else{
				alert( form[param].title + ' "Min" must be between 0 and 1');
				return;
			}
		}

		if( form[param].max){
			newId = this.ID + '-' + param + '-max';
			newId = newId.toLowerCase();
			formVal = parseFloat($(newId).val());
			if( saved[param].min <= formVal && formVal <= 1){
				saved[param].max = formVal;
			}
			else{
				alert( form[param].title + ' "Max" must be between its "Min" value and 1');
				saved[param].max = 1;
				return;
			}
		}
		for( i = 0; i < trackList.length; i++){
			trackList[i].parameters[param].updateSettings(
				saved[param].stepCount, saved[param].testMode, saved[param].min, saved[param].max);
		}
	}
}
EarTrainingApp.prototype.fillFormFromObject = function(obj){
	//console.log(obj);
	var param;
	var form =  this.settings.formObj;
	var newId;
	for( param in form){
		if( form[param].stepCount){
			newId = this.ID + '-' + param + '-steps';
			newId = newId.toLowerCase();
			$(newId).val(obj[param].stepCount);
		}

		if( form[param].testMode){
			newId = this.ID + '-' + param + '-mode';
			newId = newId.toLowerCase();
			$(newId).val(obj[param].testMode);
		}

		if( form[param].min){
			newId = this.ID + '-' + param + '-min';
			newId = newId.toLowerCase();
			$(newId).val(obj[param].min);
		}

		if( form[param].max){
			newId = this.ID + '-' + param + '-max';
			newId = newId.toLowerCase();
			$(newId).val(obj[param].max);
		}
	}
}
EarTrainingApp.prototype.loadPreset = function(presetName){
	this.fillFormFromObject(this.settings.presets[presetName]);
	this.savePreset();
}
EarTrainingApp.prototype.makeForm = function(){
	var html = '<thead><tr><th>Parameter</th><th>Steps</th><th>Mode</th>' +
				'<th>Min</th><th>Max</th></tr></thead><tbody>';
	var param;
	var emptyCell = '<td class="null"></td>';
	var form =  this.settings.formObj;
	var newId;
	var label;
	for( param in form){
		html += '<tr><td class="form-param-title">' + form[param].title + '</td>';
		if( form[param].stepCount){
			newId = this.ID + '-' + param + '-steps';
			newId = newId.slice(1).toLowerCase();
			label = '<label for="' + newId + '">Steps</label>';
			html += '<td>' + label +'<input id="' + newId + 
			 '" type="number" min="1" max="' + form[param].maxSteps + '" required></td>';
			}
		else{
			html += emptyCell;
		}

		if( form[param].testMode){
			newId = this.ID + '-' + param + '-mode';
			newId = newId.slice(1).toLowerCase();
			label = '<label for="' + newId + '">Mode</label>';
			html += '<td>' + label +'<select id="' + newId + '">' +
						'<option value="test">Test</option>' +
						'<option value="user">User</option>' +
						'<option value="reference">Reference</option>' +
	 				'</select></td>';

		}
		else{
			html += emptyCell;
		}

		if( form[param].min){
			newId = this.ID + '-' + param + '-min';
			newId = newId.slice(1).toLowerCase();
			label = '<label for="' + newId + '">Min</label>';
			html += '<td>' + label +'<input id="' + newId + 
			 '" type="number" min="0" max="1" step="0.01" required></td>';
			

		}
		else{
			html += emptyCell;
		}

		if( form[param].max){
			newId = this.ID + '-' + param + '-max';
			newId = newId.slice(1).toLowerCase();
			label = '<label for="' + newId + '">Max</label>';
			html += '<td>' + label +'<input id="' + newId + 
			 '" type="number" min="0" max="1" step="0.01" required></td>';

		}
		else{
			html += emptyCell;
		}
		html += '</tr>'
	}
	html += '</tbody>';
	$(this.ID + '-preset-table').html(html);

	for( param in form){
		if(form[param].min && form[param].max){
			var bindMinMax = function(id){	
				$(id + '-min')[0].oninput = function(){
					var val = $(id + '-min').val();
					$(id + '-max').attr('min', val);
				};
			}
			newId = this.ID + '-' + param;
			newId = newId.toLowerCase();
			bindMinMax(newId);
		}
	}
}
EarTrainingApp.prototype.printJSONpreset = function(){
	console.log(JSON.stringify(eq.savedSettings));
}





}//end if (WACTX)
else
	$('.app-no-wa-overlay').addClass('shown');



/*
***
***  Helper Functions
***
*/

function waBindKeys(app){
	$(document).keydown(function(e){
		if( !(app.resourcesToLoad > 0 || app.settingsOpen) ){
			switch(e.which){
				case 32: //space
					e.preventDefault();
					app.playPause();
					break;
				case 83: //s
					//e.preventDefault();
					app.stop();
					break;
				case 88: //x
					//e.preventDefault();
					app.toggleReference();
					break;
				case 77:
					//e.preventDefault();
					app.mute();
					break;
				case 82: //r
					//e.preventDefault();
					app.resetGame();
					break;
				case 86: //v
					//e.preventDefault();
					app.checkAnswer();
					break;
			}
		}
	});
}


function drawSpectrum(canvasContext, canvasWidth, 
	canvasHeight, minDB, maxDB, slope, bufferLength, dataArray, sampleRate){
	var barWidth;
	var barHeight;
	var x = 0;         //pixel on x-axis of canvas
	var startFreq = 0; //start of current band's frequency range
	var stopFreq;      //end of current band's frequency range

	for(var i = 0; i < bufferLength; i++) {
		barHeight =  canvasHeight * 1/(maxDB - minDB)*((dataArray[i]+ slope*Math.log2(i + 1)) - minDB);

		stopFreq = startFreq + sampleRate / (2 * bufferLength);

		if( startFreq === 0 )
			x = 0;
		else
			x = canvasWidth * Math.log2(startFreq/20) / 10 - 1; //20hz to 20480hz

		barWidth = canvasWidth * Math.log2(stopFreq/20) / 10 - x + 1;
		canvasContext.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
		startFreq = stopFreq;

	}
}


//resources:
//http://rs-met.com/documents/dsp/BasicDigitalFilters.pdf
// #18 in above link
//normalize coefficients so that a0 is = 1. 
//divide all coefficients by a0
//http://dsp.stackexchange.com/questions/3091/plotting-the-magnitude-response-of-a-biquad-filter
//https://www.w3.org/TR/webaudio/#filters-characteristics
//note aB equation is WRONG for LP and HP in w3 spec see edits to sB in switch
//https://github.com/WebAudio/web-audio-api/issues/769
function drawCurve(canvasContext, canvasWidth, canvasHeight, Fs, minDB, maxDB, filterArr){
	canvasContext.beginPath();

	var canvasMidHeight = canvasHeight / 2;
	for( var i = -10; i < canvasWidth + 10; i++){// draw beyond canvas so curve looks nicer
		var dBMagnitude = 1;

		//frequencies from 20 to 20480 are drawn across length of canvas
		var wi = 20 * Math.pow(2, (i / canvasWidth)*10) * 2 * Math.PI / Fs;
		for( var j = 0; j < filterArr.length; j++){
			var currentFilter = filterArr[j];
			var A = Math.pow(10, currentFilter.gain.value / 40);
			var w0 = Math.PI * 2 * currentFilter.getComputedFrequency() / Fs;
			var aQ = Math.sin(w0) / ( 2 * currentFilter.Q.value );
			var aB = Math.sin(w0) / 2 * Math.sqrt( 
				(4 - Math.sqrt(16 - 16 / Math.pow(currentFilter.gain.value, 2))) / 2 );
			var S = 1;
			var aS = Math.sin(w0) / 2 * Math.sqrt( 
				(A + 1 / A) * (1 / S - 1) + 2); //could just be sqrt(2)
			var a0, a1, a2, b0, b1, b2;
			switch(currentFilter.type.value){
				case 'peaking':
					b0 = 1 + aQ * A;
					b1 = -2 * Math.cos(w0);
					b2 = 1 - aQ * A;
					a0 = 1 + aQ / A;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ / A;
					break;
				case 'lowpass':
					var G = Math.pow(10, 0.05 * currentFilter.Q.value);
					aB = Math.sin(w0) / 2 * Math.sqrt( 
						(4 - Math.sqrt(16 - 16 / Math.pow(G, 2))) / 2 );
					b0 = (1 - Math.cos(w0)) / 2;
					b1 = 1 - Math.cos(w0);
					b2 = (1 - Math.cos(w0)) / 2;
					a0 = 1 + aB;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aB;
					break;
				case 'highpass':
					var G = Math.pow(10, 0.05 * currentFilter.Q.value);
					aB = Math.sin(w0) / 2 * Math.sqrt( 
						(4 - Math.sqrt(16 - 16 / Math.pow(G, 2))) / 2 );
					b0 = (1 + Math.cos(w0)) / 2;
					b1 = -(1 + Math.cos(w0));
					b2 = (1 + Math.cos(w0)) / 2;
					a0 = 1 + aB;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aB;
					break;
				case 'lowshelf':
					b0 = A * ((A + 1) - (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A));
					b1 = 2 * A * ((A - 1) - (A + 1) * Math.cos(w0));
					b2 = A * ((A + 1) - (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A));;
					a0 = (A + 1) + (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A);
					a1 = -2 * ((A - 1) + (A + 1) * Math.cos(w0));
					a2 = (A + 1) + (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A);
					break;
				case 'highshelf':
					b0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A));
					b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0));
					b2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A));;
					a0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A);
					a1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0));
					a2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A);
					break;
				case 'bandpass':
					b0 = aQ;
					b1 = 0;
					b2 = -aQ;
					a0 = 1 + aQ;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ;
					break;
				case 'notch':
					b0 = 1;
					b1 = -2 * Math.cos(w0);
					b2 = 1;
					a0 = 1 + aQ;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ;
					break;
			}
			b0 /= a0;
			b1 /= a0;
			b2 /= a0;
			a1 /= a0;
			a2 /= a0;
			a0 = 1;

			var numerator = b0*b0 + b1*b1 + b2*b2 + 2*(b0*b1 + b1*b2)*Math.cos(wi) + 2*b0*b2*Math.cos(2*wi);
			var denominator = 1 + a1*a1 + a2*a2 + 2*(a1 + a1*a2)*Math.cos(wi) + 2*a2*Math.cos(2*wi);
			dBMagnitude *= Math.sqrt(numerator / denominator);
		}
		dBMagnitude = 20 * Math.log10(dBMagnitude);
		if( i === -10)
			canvasContext.moveTo(i, canvasMidHeight - dBMagnitude / (maxDB - minDB) * canvasHeight);
		else
			canvasContext.lineTo(i, canvasMidHeight - dBMagnitude / (maxDB - minDB) * canvasHeight);
	}

	canvasContext.stroke();
}