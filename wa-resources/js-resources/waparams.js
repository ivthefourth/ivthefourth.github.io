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
				this.param.setValueAtTime( input, now + 0.02 );
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
