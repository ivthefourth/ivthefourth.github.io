/*
***
***  Parameters
***
*/

function Parameter(ID, defaultRatio, controllerType, node, paramString){
	this.isActive = true;
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



function EarTrainingParameter(ID, defaultRatio, controllerType, node, paramString, callback){
	this.isActive = true;
	this.ID = ID;
	this.defaultRatio = defaultRatio;
	this.testMode = 'test'; // test, user, reference
	this.node = node;
	this.paramString = paramString;
	this.controller = new controllerType(this);
	this.polarity = this.controller.polarity;
	this.callback = callback; 
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
			if( this.callback )
				this.callback();
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

	if( this.testMode === 'reference'){
		$(this.ID).addClass('inactive');
	}
	else{
		$(this.ID).removeClass('inactive');
		this.isActive = true;
	}

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
EarTrainingParameter.prototype.revealAnswer = function(){
	this.controller.updateInterface(this.ID, this.getRatio('reference'));
	this.isActive = false;
}
EarTrainingParameter.prototype.hideAnswer = function(){
	this.controller.updateInterface(this.ID, this.getRatio('user'));
	this.isActive = true;
}
