
var clickMouseX = 0;
var clickMouseY = 0;
var currentMouseX = 0;
var currentMouseY = 0;
//var levelRange = {}

var canvas;
var width;
var height;
var midHeight;
var canvasContext;


/*********
***********
*************

WARNING!: firefox (and other browsers except chrome?) does not get 
computed value on calls to "AudioParam.value"
	Consider ramp to value for frequency... why was it buggy on FF??
	Seems to have not worked because FF doesn't read AudioParam.value accurately


CHANGE CANVAS SO THAT CANVAS ELEMENTS ARE UPDATED WHEN PARAMETERS ARE CHANGED AND THEN ONLY
DRAWN ON CALLS TO "DRAWCURVE()"

DECIDE ON WHETHER TO SHOW SPECTRUM AND REMOVE WHATS NECESSARY FOR DECISION

BIND SOME KEYS TO MAIN FUNCTIONS (PLAY/PAUSE STOP TOGGLE)

LOADING POP UP WHEN YOU GO TO LOAD AUDIO!!


MAYBE FIX LEVEL'S LEVEL BAR ON CHROME BY NOT USING TRANSFORM SCALEY



*************
************
**********/


/******
CONTROLLERS
******/


//maybe improve the scroll detection and offset??
function BipolarVerticalSlider(){

	this.bipolar = false;//steps are only positive despite visually being bipolar
	this.defaultStepCount = 4;

	this.setLevelRange = function(id){
		//console.log(id);
		var levelRange = {};
		levelRange.height = $(id).height()
		levelRange.top = $(id).offset().top /**/- $(document).scrollTop();
		levelRange.bottom = levelRange.top + levelRange.height;
		levelRange.center = (levelRange.top + levelRange.bottom)/2;
		this.levelRange = levelRange;
	}

	this.updateInterface = function(id, step, sCount, min, max){
		var levelRange = this.levelRange;
		var top = levelRange.bottom - levelRange.height * max/10;
		var bottom = levelRange.bottom - levelRange.height * min/10;
		var transform =  (step)*(top-bottom)/sCount - (levelRange.bottom - bottom);
		$(id + ' .handle').css('transform', 'translateY(' + transform + 'px)');
		//console.log(transform);
		//console.log(levelRange.center);
		transform = transform + (levelRange.bottom - levelRange.center);
		$(id + ' .range').css('transform', 'scaleY(' + transform + ')');
	}

	this.init = function(param){
		this.setLevelRange(param.id);
		var that = this;

		var levelHandler = function(e){
			currentMouseY = e.clientY;
			var levelRange = that.levelRange;
			var top = levelRange.bottom - levelRange.height * param.max/10;
			var bottom = levelRange.bottom - levelRange.height * param.min/10;
			var sCount = param.stepCount;
			var step = Math.floor((bottom - currentMouseY)/(bottom - top)*(sCount + 1));

			if( top < currentMouseY 
			&& currentMouseY < bottom 
			&& step != param.user 
			&& param.testMode !== 'reference'){
				param.updateUser(step);
				console.log(step);
			}
		}
		$(param.id).mousedown(function(e){
			e.preventDefault();
			that.setLevelRange(param.id);
			levelHandler(e);
			$(document).mousemove(levelHandler);
			$(document).mouseup(function(){
				$(this).off('mouseup mousemove');
			});
		});
	}
}

//Have NOT added min/max ability yet
function UnipolarHorizontalSlider(){

	this.bipolar = false;
	this.defaultStepCount = 4;

	this.setLevelRange = function(id){
		//console.log(id);
		var levelRange = {};
		levelRange.left = $(id).offset().left /**/- $(document).scrollLeft();
		levelRange.right = levelRange.left + $(id).width();
		this.levelRange = levelRange;
	}

	this.updateInterface = function(id, step, sCount, min, max){
		var levelRange = this.levelRange;
		var transform =  (step)*(levelRange.right - levelRange.left)/sCount;
		$(id + ' .handle').css('transform', 'translateX(' + transform + 'px)');
		$(id + ' .range').css('width', transform + 'px');
	}

	this.init = function(param){
		this.setLevelRange(param.id);
		var that = this;

		var levelHandler = function(e){
			currentMouseX = e.clientX;
			var levelRange = that.levelRange;
			var sCount = param.stepCount;
			var step = Math.floor(
				(currentMouseX - levelRange.left)/(levelRange.right - levelRange.left)*
				(sCount + 1));

			if( levelRange.left < currentMouseX 
			&& currentMouseX < levelRange.right 
			&& step != param.user ){
				param.updateUser(step);
				//console.log(currentMouseX + ', ' + currentMouseY);
			}
		}
		$(param.id).mousedown(function(e){
			e.preventDefault();
			that.setLevelRange(param.id);
			levelHandler(e);
			$(document).mousemove(levelHandler);
			$(document).mouseup(function(){
				$(this).off('mouseup mousemove');
			});
		});
	}
}


function UnipolarKnob(){

	this.bipolar = false;
	this.defaultStepCount = 4;
	this.knobrange = 100;

	this.updateInterface = function(id, step, sCount, min, max){
		$(id).css('transform', 'rotate(' + ((min + (max - min)*step/sCount)*27 - 135) + 'deg)');
	}

	this.init = function(param){
		var that = this;

		var  frequencyHandler = function(e){
			currentMouseY = e.clientY;
			var step = param.user + Math.floor(((clickMouseY - currentMouseY)/that.knobrange)*5 + 0.5);
			if( 0 <= step && step <= param.stepCount 
			&& step !== param.user && param.testMode !== 'reference'){
				clickMouseY = currentMouseY;
				param.updateUser(step);
				//console.log(step);
			}
		}
		$(param.id).mousedown(function(e){
			e.preventDefault();
			clickMouseY = e.clientY;
			$(document).mousemove(frequencyHandler);
			$(document).mouseup(function(){
				$(this).off('mouseup mousemove');
			});
		});
	}
}


function ClickToggle(stepCount){

	this.bipolar = false;
	this.defaultStepCount = stepCount - 1;
	this.knobrange = 100;

	this.classList = ['peak','lowpass','highpass'];

	this.updateInterface = function(id, step, sCount, min, max){
		sCount += 1; //un-zero-offst
		//$(id).removeClass(this.classList[(step - 1 + sCount)%sCount]);
		$(id).attr('class', this.classList[step]);
	}

	this.init = function(param){
		//var that = this;
		$(param.id).mousedown(function(e){
			e.preventDefault;
			if(param.testMode !== 'reference'){
				param.updateUser((param.user + 1 )%(param.stepCount + 1));
				//console.log(param.user);
			};
		});
	}
}


/******
PARAMETER
******/

function Parameter(id, defaultMode, controller, audioObj, functName){
	this.id = id;
	this.defaultMode = defaultMode; //bottom, middle, top
	this.controller = controller;
	this.bipolar = controller.bipolar;
	this.stepCount = controller.defaultStepCount;

	this.reference = 0;
	this.user = 0;
	this.defaultVal = 0;
	this.testMode = 'test'; //test, user, reference
	this.min = 0;
	this.max = 10;

	this.updateReference = function(step){
		this.reference = step;
		if( this.testMode === 'reference')
			this.updateUser(step);
		audioObj.reference[functName](step, this.stepCount, this.min, this.max);
	}

	this.updateUser = function(step){
		this.user = step;
		if( this.testMode === 'user')
			this.updateReference(step);
		this.controller.updateInterface(this.id, step, this.stepCount, this.min, this.max);
		audioObj.user[functName](step, this.stepCount, this.min, this.max);
		//console.log(step);
		//drawCurve(); //remove for other apps
	}

	this.getNewDefault = function(){
		var mode = this.defaultMode;
		var steps = this.stepCount;
		if( this.bipolar){
			if( mode === 'bottom')
				this.defaultVal = (-1 * steps);
			else if( mode === 'middle')
				this.defaultVal = 0;
			else
				this.defaultVal = steps;
		}
		else{
			if( mode === 'bottom')
				this.defaultVal = 0;
			else if( mode === 'middle')
				this.defaultVal = Math.round(steps/2);
			else
				this.defaultVal = steps;
		}
	}

	this.changeTestMode = function(mode){
		this.testMode = mode;
		if( mode === 'reference')
			this.updateUser(this.reference);
		else if( mode === 'user')
			this.updateReference(this.user);
	}

	this.changeStepCount = function(count){
		this.stepCount = count;
		this.getNewDefault();
		this.updateReference(this.defaultVal);
		this.updateUser(this.defaultVal);
	}

	this.randomize = function(){
		//random here between zero and +- this.stepCount
		if( this.testMode !== 'user'){
			var steps = this.stepCount;
			if( this.bipolar)
				this.updateReference( Math.floor(Math.random()*(steps*2 + 1)) - steps );
			else
				this.updateReference( Math.floor(Math.random()*(steps + 1)) );
		};
	}

	this.checkAnswer = function(){
		//if this.testMode === 'test' compare this.reference to this.user and change class
		if( this.testMode === 'test' && this.min < this.max){
			if( this.user === this.reference)
				$(this.id).css('box-shadow', '0 0 1em 0.5em lime');
			else
				$(this.id).css('box-shadow', '0 0 1em 0.5em red');
		}
	}

	this.clearAnswerStyle = function(){
		$(this.id).css('box-shadow', 'none');
	}

	this.init = function(){
		this.controller.init(this);
		//this.controller.updateInterface(this.id, this.user, this.stepCount);
		this.getNewDefault();
		this.updateReference(this.defaultVal);
		this.updateUser(this.defaultVal);
	}
}


/******
EQ SETUP
******/

var actx = window.AudioContext || window.webkitAudioContext;
var eq = {

	//
	audio: {
		ctx: new actx(),
		user: {
			updateFrequency: function(step, count, min, max){
				var ratio = (min + (max - min)*step/count)/10;
				var val = ratio*1200*9;
				var freq = this.filter.detune;
				var now = eq.audio.ctx.currentTime;
				freq.setValueAtTime(val, now);
				//freq.linearRampToValueAtTime(val, now + 0.1);		
			},
			updateLevel: function(step, count, min, max){
				var ratio = (min + (max - min)*step/count)/10;
				ratio = ratio*2 - 1; //make bipolar
				var val = ratio*12;   //can set to 18??
				var gain = this.filter.gain;
				var now = eq.audio.ctx.currentTime;
				gain.setValueAtTime(gain.value, now);//.value doesn't seem to work on FF?
				gain.linearRampToValueAtTime(val, now + 0.1);
			},
			updateBandwidth: function(step, count, min, max){
				var ratio = 1 - (min + (max - min)*step/count)/10;
				var qMin = 0.1;
				var val = qMin*Math.pow(50, (ratio));
				var q = this.filter.Q;
				var now = eq.audio.ctx.currentTime;
				q.setValueAtTime(q.value, now);
				q.linearRampToValueAtTime(val, now + 0.1);
			},
			updateFilterType: function(step, count, min, max){
				switch(step){
					case 0:
						this.filter.type = 'peaking';
						break;
					case 1: 
						this.filter.type = 'lowpass';
						break;
					case 2:
					this.filter.type = 'highpass';
						break;
				}
			}
		},
		reference: {
			gainValue: 0,
			updateFrequency: function(step, count, min, max){
				var ratio = (min + (max - min)*step/count)/10;
				var val = ratio*1200*9;
				var freq = this.filter.detune;
				var now = eq.audio.ctx.currentTime;
				freq.setValueAtTime(val, now);
				//freq.linearRampToValueAtTime(val, now + 0.1);
				
			},
			updateLevel: function(step, count, min, max){
				var ratio = (min + (max - min)*step/count)/10;
				ratio = ratio*2 - 1; //make bipolar
				var val = ratio*12;            //can set to 18??
				var gain = this.filter.gain;
				var now = eq.audio.ctx.currentTime;
				gain.setValueAtTime(gain.value, now);
				gain.linearRampToValueAtTime(val, now + 0.1);
				this.gainValue = val;
			},
			updateBandwidth: function(step, count, min, max){
				var ratio = 1 - (min + (max - min)*step/count)/10;
				var qMin = 0.1;
				var val = qMin*Math.pow(50, (ratio));
				var q = this.filter.Q;
				var now = eq.audio.ctx.currentTime;
				q.setValueAtTime(q.value, now);
				q.linearRampToValueAtTime(val, now + 0.1);
			},
			updateFilterType: function(step, count, min, max){
				switch(step){
					case 0:
						this.filter.type = 'peaking';
						break;
					case 1: 
						this.filter.type = 'lowpass';
						break;
					case 2:
					this.filter.type = 'highpass';
						break;
				}
			}
		},

		updateVolume: function(newVol, prevVol, steps){
			var now = this.ctx.currentTime;
			newVol = newVol/steps;
			newVol = newVol*newVol;
			prevVol = prevVol/steps;
			prevVol = prevVol*prevVol;
			this.volume.gain.setValueAtTime(prevVol, now);
			this.volume.gain.linearRampToValueAtTime( newVol , now + 0.1);
		},

		listenToRef: function(){
			var now = this.ctx.currentTime;
			var user = this.user.out.gain;
			var ref = this.reference.out.gain;
			user.setValueAtTime(1.0, now);
			user.linearRampToValueAtTime( 0.0 , now + 0.1);
			ref.setValueAtTime(0.0, now);
			ref.linearRampToValueAtTime( 1.0 , now + 0.1);
		},

		listenToUser: function(){
			var now = this.ctx.currentTime;
			var user = this.user.out.gain;
			var ref = this.reference.out.gain;
			user.setValueAtTime(0.0, now);
			user.linearRampToValueAtTime( 1.0 , now + 0.1);
			ref.setValueAtTime(1.0, now);
			ref.linearRampToValueAtTime( 0.0 , now + 0.1);
		},

		init: function(){
			var baseFreq = 32;

			this.volume = this.ctx.createGain();
			this.userToRef = this.ctx.createGain();
			//this.userToRef.gain.value = 0; 
			//this.refToRef = this.ctx.createGain(); enable if reference source is recreated
			//this.refToRef.gain.value = 0; //enable if reference source ^^
			var user = this.user;
			var ref = this.reference;

			var usersource = $('#user-audio')[0];
			user.source = this.ctx.createMediaElementSource(usersource);
			user.filter = this.ctx.createBiquadFilter();
			user.out = this.ctx.createGain();
			user.source.connect(this.userToRef);
			user.source.connect(user.filter);
			user.filter.connect(user.out);
			user.filter.frequency.value = baseFreq;
			user.out.connect(this.volume);

			//var refsource = $('#reference-audio')[0];
			//ref.source = this.ctx.createMediaElementSource(refsource);
			ref.filter = this.ctx.createBiquadFilter();
			ref.out = this.ctx.createGain();
			ref.out.gain.value = 0;
			//ref.source.connect(this.refToRef);
			//this.refToRef.connect(ref.filter);
			this.userToRef.connect(ref.filter);
			ref.filter.connect(ref.out);
			ref.filter.frequency.value = baseFreq;
			ref.out.connect(this.volume);

			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 2048;
			this.analyser.smoothingTimeConstant = 0.95;
			this.bufferLength = this.analyser.frequencyBinCount;
			this.dataArray = new Uint8Array(this.bufferLength);
			this.volume.connect(this.analyser);



			this.volume.connect(this.ctx.destination);
		}
	},

	//
	parameters: {
	},

	//
	controls: {
		monitor: 'user',

		volume: {
			id: '#volume',
			isMuted: false,
			stepCount: 20,
			unmuteVol: 15,
			user: 15,


			updateUser: function(step){
				eq.audio.updateVolume(step, this.user, this.stepCount);
				this.user = step;
				this.controller.updateInterface(this.id, step, this.stepCount, 0, 10);
				this.isMuted = false;
				//audioObj.user[functName](step, this.stepCount);
				//console.log(step);
			},

			mute: function(){
				if( this.isMuted){
					eq.audio.updateVolume(this.unmuteVol, 0, this.stepCount);
					this.user = this.unmuteVol;
					this.isMuted = false;
				}
				else{
					this.unmuteVol = this.user;
					eq.audio.updateVolume(0, this.user, this.stepCount);
					this.user = 0;
					this.isMuted = true;
				}
				this.controller.updateInterface(this.id, this.user, this.stepCount, 0, 10);
			},

			init: function(){
				this.controller.init(this);
				this.controller.updateInterface(this.id, this.user, this.stepCount, 0, 10);
				this.updateUser(this.user);
			}
		},



		resetGame: function(){
			var parameters = eq.parameters;
			for( var param in parameters){
				param = parameters[param];
				if( param.testMode !== 'reference')
					param.updateUser(param.defaultVal);
				param.randomize();
				param.clearAnswerStyle();
				//clear styles
			}
		},

		checkAnswer: function(){
			parameters = eq.parameters;
			console.log(eq.audio.reference.gainValue );
			if( parameters.filterType.reference !== 0){//if reference is not peaking
				parameters.filterType.checkAnswer();
				parameters.bandwidth.checkAnswer();
				parameters.frequency.checkAnswer();
				//don't check for level b/c lp & hp have no level
			}
			else if(eq.audio.reference.gainValue === 0){
				parameters.level.checkAnswer();
				parameters.filterType.checkAnswer();
			}
			else{
				var parameters = eq.parameters;
				for( var param in parameters){
					param = parameters[param];
					param.checkAnswer();	
				}
			}
		},

		refToggle: function(){
			$('#reference-toggle').toggleClass('active');
			if( this.monitor === 'user'){
				eq.audio.listenToRef();
				this.monitor = 'ref';
			}
			else{
				eq.audio.listenToUser();
				this.monitor = 'user';
			}
			//drawCurve(); //remove for others
		},

		init: function(){
			$('#play').click(function(e){
				e.preventDefault();
				var source = $('#user-audio')[0];
				if(source.paused){
					source.play();
					$('#play').addClass('paused');
				}
				else{
					source.pause();
					$('#play').removeClass('paused');
				}

				//CHANGE THIS TO CHECK REFERENCE MODE AND ONLY PLAY WHATS NEEDED

				/*
				source = $('#reference-audio')[0];
				if(source.paused)
					source.play();
				else
					source.pause();
				*/
			});
			$('#stop').click(function(e){
				e.preventDefault();
				$('#play').removeClass('paused');
				var source = $('#user-audio')[0];
				source.pause();
				source.currentTime = 0;

				//CHANGE THIS TO CHECK REFERENCE MODE AND ONLY PLAY WHATS NEEDED
				/*
				source = $('#reference-audio')[0];
				source.pause();
				source.currentTime = 0;
				*/
			});

			$('#reference-toggle').click(function(e){
				e.preventDefault();
				eq.controls.refToggle();
			});

			$('#reset').click(function(e){
				e.preventDefault();
				eq.controls.resetGame();
			});

			$('#check-answer').click(function(e){
				e.preventDefault();
				eq.controls.checkAnswer();
			});

			$('#settings-btn').click(function(e){
				e.preventDefault();
				$('#settings').addClass('shown');

				//stop audio
				$('#play').removeClass('paused');
				var source = $('#user-audio')[0];
				source.pause();
				source.currentTime = 0;
			});

			$('#mute').click(function(e){
				e.preventDefault();
				eq.controls.volume.mute();
			});

			this.volume.controller = new UnipolarHorizontalSlider();
			this.volume.init();
		}

	},

	//
	settings: {
		//currentSettings: {},
		audioIsValid: false,
		loadedAudio: null,

		savedSettings: {
			level: {
				testMode: 'test',
				stepCount: 4,
				min: 0,
				max: 10
			},
			frequency: {
				testMode: 'test',
				stepCount: 4,
				min: 0,
				max: 10
			},
			bandwidth: {
				testMode: 'test',
				stepCount: 4,
				min: 0,
				max: 10
			},
			filterType: {
				testMode: 'test',
				stepCount: 2
			}
		},

		presets: {
			default: {
				level: {
					testMode: 'test',
					stepCount: 4,
					min: 0,
					max: 10
				},
				frequency: {
					testMode: 'test',
					stepCount: 10,
					min: 0,
					max: 10
				},
				bandwidth: {
					testMode: 'test',
					stepCount: 1,
					min: 0,
					max: 10
				},
				filterType: {
					testMode: 'test',
					stepCount: 2
				}
			},

			frequencyEasy: {
				level: {
					testMode: 'test',
					stepCount: 4,
					min: 1,
					max: 10
				},
				frequency: {
					testMode: 'test',
					stepCount: 4,
					min: 2,
					max: 10
				},
				bandwidth: {
					testMode: 'test',
					stepCount: 4,
					min: 3,
					max: 10
				},
				filterType: {
					testMode: 'test',
					stepCount: 2
				}
			}
		},

		audiofiles: {
			default: 'audio/audio.mp3',
			pinkNoise: 'audio/pinkaudio.mp3'
		},

		save: function(){
			var tmp; 
			var obj = this.savedSettings;
			var parameters = eq.parameters;

			parameters.filterType.changeStepCount(2);//just to reset
			tmp = $('#filter-mode').find(':selected').val();
			obj.filterType.testMode = tmp;
			parameters.filterType.changeTestMode(tmp);

			tmp = $('#level-min').val();
			tmp = parseInt(tmp, 10);
			obj.level.min = tmp;
			parameters.level.min = tmp
			tmp = $('#level-max').val();
			tmp = parseInt(tmp, 10);
			obj.level.max = tmp;
			parameters.level.max = tmp//////////////////////
			tmp = $('#level-steps').val();
			tmp = parseInt(tmp, 10);
			obj.level.stepCount = tmp;
			parameters.level.changeStepCount(tmp);
			tmp = $('#level-mode').find(':selected').val();
			obj.level.testMode = tmp;
			parameters.level.changeTestMode(tmp);

			tmp = $('#frequency-min').val();
			tmp = parseInt(tmp, 10);
			obj.frequency.min = tmp;
			parameters.frequency.min = tmp;
			tmp = $('#frequency-max').val();
			tmp = parseInt(tmp, 10);///////////////////
			obj.frequency.max = tmp;
			parameters.frequency.max = tmp;
			tmp = $('#frequency-steps').val();
			tmp = parseInt(tmp, 10);
			obj.frequency.stepCount = tmp;
			parameters.frequency.changeStepCount(tmp);
			tmp = $('#frequency-mode').find(':selected').val();
			obj.frequency.testMode = tmp;
			parameters.frequency.changeTestMode(tmp);

			tmp = $('#bandwidth-min').val();
			tmp = parseInt(tmp, 10);
			obj.bandwidth.min = tmp;
			parameters.bandwidth.min = tmp;
			tmp = $('#bandwidth-max').val();
			tmp = parseInt(tmp, 10);//////////////////////
			obj.bandwidth.max = tmp;
			parameters.bandwidth.max = tmp;
			tmp = $('#bandwidth-steps').val();
			tmp = parseInt(tmp, 10);
			obj.bandwidth.stepCount = tmp;
			parameters.bandwidth.changeStepCount(tmp);
			tmp = $('#bandwidth-mode').find(':selected').val();
			obj.bandwidth.testMode = tmp;
			parameters.bandwidth.changeTestMode(tmp);

			//this.savedSettings = obj;
			//this.saveSettingsFromForm();
			//$('#settings').removeClass('shown');
			eq.controls.resetGame();
		},

		cancel: function(){
			this.fillFormFromObj(this.savedSettings);
			//$('#settings').removeClass('shown');
		},

		loadPreset: function(name){
			var preset = this.presets[name];
			this.fillFormFromObj(preset);
			this.save();
			//
			console.log(preset);
			console.log(name);
		},

		fillFormFromObj: function(obj){
			var tmp =  obj.filterType.testMode;
			$('#filter-mode').val(tmp);

			tmp =  obj.level.stepCount;
			$('#level-steps').val(tmp);
			tmp =  obj.level.testMode;
			$('#level-mode').val(tmp);
			tmp = obj.level.min;
			$('#level-min').val(tmp);
			$('#level-max').attr('min', tmp);
			tmp = obj.level.max;
			$('#level-max').val(tmp);

			tmp =  obj.frequency.stepCount;
			$('#frequency-steps').val(tmp);
			tmp =  obj.frequency.testMode;
			$('#frequency-mode').val(tmp);
			tmp = obj.frequency.min;
			$('#frequency-min').val(tmp);
			$('#frequency-max').attr('min', tmp);
			tmp = obj.frequency.max;
			$('#frequency-max').val(tmp);

			tmp =  obj.bandwidth.stepCount;
			$('#bandwidth-steps').val(tmp);
			tmp =  obj.bandwidth.testMode;
			$('#bandwidth-mode').val(tmp);
			tmp = obj.bandwidth.min;
			$('#bandwidth-min').val(tmp);
			$('#bandwidth-max').attr('min', tmp);
			tmp = obj.bandwidth.max;
			$('#bandwidth-max').val(tmp);
			//console.log(obj);
		},

		/*saveSettingsFromForm: function(){
			console.log('save');
		},*/

		fillHtmlList: function(src){
			var html = '';
			var val, text;
			function keyToText(key){
				key = key.replace(/[A-Z]/g, function(x){return ' ' + x;});
				key = key.charAt(0).toUpperCase() + key.slice(1);
				return key;
				//console.log(key);
			};
			for( key in this[src]){
				html += '<option value="';
				html += key;
				html += '">'
				html += keyToText(key);
				html += '</option>'
			}
			$('#settings-' + src).html(html);
		},

		validateAudio: function(file){
			if(!file){
				this.audioIsValid = false;
				if( this.canDragDrop)
					var msg = '<b>Drag and Drop</b> or <b>Click</b> to select custom <i>.wav</i> or <i>.mp3</i> audio file';
				else
					var msg = '<b>Click</b> to select custom <i>.wav</i> or <i>.mp3</i> audio file';
				$('#drag-drop-text').html(msg);
				$('#drag-drop').removeClass('error');
				$('#load-custom-audio').removeClass('active');
			}
			else if(file.type === 'audio/wav' 
			|| file.type === 'audio/mp3' 
			|| file.type === 'audio/mpeg'){
				this.audioIsValid = true;
				$('#drag-drop-text').html('<b>' + file.name + '</b>');
				$('#drag-drop').removeClass('error');
				$('#load-custom-audio').addClass('active');
				this.loadedAudio = file;
			}
			else{
				this.audioIsValid = false;
				var errMsg = 'Invalid file type selected. Please choose an <b>Mp3</b> or <b>Wav</b> file.'
				$('#drag-drop-text').html(errMsg);
				$('#drag-drop').addClass('error');
				$('#load-custom-audio').removeClass('active');
			}
		},

		loadCustomAudio: function(){
			if(this.audioIsValid){
				var file = this.loadedAudio;
				var reader = new FileReader();

				reader.onload = function(e){
					var src = e.target.result;
					$('#user-audio-source').attr('src', src);
					$('#user-audio').load();
					console.log('loaded');
				};

				reader.readAsDataURL(file);
			}
		},

		init: function(){
			this.loadPreset('default');
			this.fillHtmlList('presets');
			this.fillHtmlList('audiofiles');


			//
			var that = this;

			canDragDrop = function() {
				var div = document.createElement('div');
				return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) 
						&& 'FormData' in window && 'FileReader' in window;
			};
			this.canDragDrop = canDragDrop();

			if( this.canDragDrop ){
				console.log('candrop');
				$('#drag-drop').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
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
				$('#drag-drop-text').html('')
			};

			$('.menu-item').click(function(e){
				e.preventDefault();
				var id = $(this).attr('href');
				//console.log(id);
				$('.menu-item').removeClass('shown');
				$(this).addClass('shown');
				$('.settings-container').removeClass('shown');
				$(id).addClass('shown');
				//setTimeout(function(){$(id).addClass('shown')}, 1000);
			});



			$('#level-min')[0].oninput = function(){
				var val = $('#level-min').val();
				$('#level-max').attr('min', val);
			};
			$('#frequency-min')[0].oninput = function(){
				var val = $('#frequency-min').val();
				$('#frequency-max').attr('min', val);
			};
			$('#bandwidth-min')[0].oninput = function(){
				var val = $('#bandwidth-min').val();
				$('#bandwidth-max').attr('min', val);
			};
			/*$('#settings-save').click(function(e){
				e.preventDefault();
				that.save();
			});*/
			$('#settings-form').submit(function(e){
				e.preventDefault();
				that.save();
				//console.log('chicken');
			});
			/*
			$('#settings-cancel').click(function(e){
				e.preventDefault();
				that.cancel();
			});
			*/


			$('#load-settings-preset').click(function(e){
				e.preventDefault();
				var val = $('#settings-presets').find(':selected').val();
				that.loadPreset(val);
			});

			$('#load-settings-audiofiles').click(function(e){
				e.preventDefault();
				var audio = $('#settings-audiofiles').val();
				audio = that.audiofiles[audio];
				$('#user-audio-source').attr('src', audio);
				$('#user-audio').load();
			});


			$('#close-btn').click(function(e){
				e.preventDefault();
				$('#settings').removeClass('shown');
				that.cancel();
			});

			$('#audio-file').change( function(){
				that.validateAudio( $('#audio-file')[0].files[0] );
			});

			$('#load-custom-audio').click(function(e){
				e.preventDefault();
				that.loadCustomAudio();
			});
		}
	},

	//
	init: function(){
		this.audio.init();
		this.controls.init();
		
		//parameters
		this.parameters.level = new Parameter('#level', 'middle',
			new BipolarVerticalSlider, 
			this.audio, 'updateLevel'),
		this.parameters.frequency = new Parameter('#frequency', 'middle',
			new UnipolarKnob, 
			this.audio, 'updateFrequency'),
		this.parameters.bandwidth = new Parameter('#bandwidth', 'middle',
			new UnipolarKnob, 
			this.audio, 'updateBandwidth'),
		this.parameters.filterType = new Parameter('#filter-type', 'bottom',
			new ClickToggle(3), 
			this.audio, 'updateFilterType')
		for( var param in this.parameters){
			if( param != 'init')
				this.parameters[param].init();
		}
		//endparameters

		this.settings.init();
		
	}
};




	










/******
--------
******/


function drawSpectrum(){
	// clear the canvas
	canvasContext.clearRect(0, 0, width, height);

	var dataArray = eq.audio.dataArray;
	var bufferLength = eq.audio.bufferLength;

	// Or use rgba fill to give a slight blur effect
	//canvasContext.fillStyle = 'rgba(14, 19, 21, 0.1)';
	//canvasContext.fillRect(0, 0, width, height);

	// Get the analyser data
	eq.audio.analyser.getByteFrequencyData(dataArray);

	var barWidth; //= width / bufferLength;
	  var barHeight;
	  var x = 0;

	  // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
	  // before drawing. This is the scale factor
	  var heightScale = height/128;

	  for(var i = 0; i < bufferLength; i++) {
	    barHeight = dataArray[i];
	    x = width * Math.log2(i+1)/10;//if 1024 then 10 should be 9
	    barWidth = width * Math.log2(i+2)/10 - x +1;


	    barHeight *= heightScale /* (1+ Math.log2(i + 1)/10) // /*freq sensitivity -->*/ *(1024/(1300-i));
	    canvasContext.fillRect(x, height-barHeight/2, barWidth, barHeight/2);

	    // 2 is the number of pixels between bars
	    //x += barWidth;
	  }


	drawCurve();

	requestAnimationFrame(drawSpectrum);
}

function initiate(){
	drawSpectrum();
}


function drawCurve(){
	//canvasContext.clearRect(0, 0, width, height);
	var freq = eq.parameters.frequency;
	var freqPos = width *( 0.05 + 0.9 * (freq.min + (freq.max - freq.min) * freq.user/freq.stepCount)/10);

	canvasContext.beginPath();

	if(eq.parameters.filterType.user === 0){
		var level = eq.parameters.level;
		//console.log(level.user);
		var levelPos = height * (0.95 - 0.9*(level.min + 
					   (level.max - level.min)*level.user/level.stepCount)/10); // 0.5 - 0.9 * level.user/(2 * level.stepCount));

		var q = eq.parameters.bandwidth;
		var qWidth = 0.02 * width * Math.pow(25, (q.min + (q.max - q.min)*q.user/q.stepCount)/10);
		canvasContext.moveTo(0, midHeight);
		canvasContext.lineTo(freqPos - qWidth, midHeight);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), midHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), midHeight, freqPos + qWidth, midHeight);

		canvasContext.lineTo(width, midHeight);
	}
	else if (eq.parameters.filterType.user === 1){
		var qWidth = 0.1 * width;
		var q = eq.parameters.bandwidth;
		var levelPos = height * (0.5 - 0.1 * ( 1 - (q.min + (q.max - q.min)*(q.user)/q.stepCount)/10));

		canvasContext.moveTo(0, midHeight);
		canvasContext.lineTo(freqPos - qWidth, midHeight);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), midHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), midHeight, freqPos + width/2, 1.5* height);

	}
	else{
		var qWidth = 0.1 * width;
		var q = eq.parameters.bandwidth;
		var levelPos = height * (0.5 - 0.1 * ( 1 - (q.min + (q.max - q.min)*(q.user)/q.stepCount)/10));

		canvasContext.moveTo(freqPos - width/2, 1.5*height);

		var x1 = freqPos - qWidth;
		canvasContext.bezierCurveTo(x1 + 0.6*(freqPos - x1), midHeight, x1 + 0.8*(freqPos - x1), levelPos, freqPos, levelPos);
		x1 = freqPos + qWidth;
		canvasContext.bezierCurveTo(freqPos + 0.2*(x1 - freqPos), levelPos, freqPos + 0.4*(x1 - freqPos), midHeight, freqPos + qWidth, midHeight);
		canvasContext.lineTo(width, midHeight);

	
	}

	if(eq.controls.monitor === 'user')
		canvasContext.strokeStyle = '#eee';
	else
		canvasContext.strokeStyle = '#444';




	canvasContext.stroke();
	//canvasContext.stroke();
	//canvasContext.stroke();
};




$(document).ready(function(){
	canvas = $('#spectrum')[0];
	width = canvas.width;
	height = canvas.height;
	midHeight = height/2;
	canvasContext = canvas.getContext('2d');
	canvasContext.fillStyle = 'rgb(0,' + 225 + ',0)';
    canvasContext.lineWidth = 5;

	eq.init();





	initiate();


});





