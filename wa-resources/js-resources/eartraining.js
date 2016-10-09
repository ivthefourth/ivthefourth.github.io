/*
***
***  Ear Training Tracks and Apps
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

	$('.menu-item').on('click touchstart', function(e){
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
	$(this.ID + '-play').on('click touchstart', function(e){
		e.preventDefault();
		that.playPause();
	});

	$(this.ID + '-stop').on('click touchstart', function(e){
		e.preventDefault();
		that.stop();
	});

	$(this.ID + '-reference-toggle').on('click touchstart', function(e){
		e.preventDefault();
		that.toggleReference();
	});

	$(this.ID + '-mute').on('click touchstart', function(e){
		e.preventDefault();
		that.mute();
	});

	$(this.ID + '-settings-btn').on('click touchstart', function(e){
		e.preventDefault();
		that.showSettings();
	});

	$(this.ID + '-check-answer').on('click touchstart', function(e){
		e.preventDefault();
		that.checkAnswer();
	});

	$(this.ID + '-reset-game').on('click touchstart', function(e){
		e.preventDefault();
		that.resetGame();
	});

	$(this.ID + '-close-settings').on('click touchstart', function(e){
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
	var overlayID = this.ID + '-saved-overlay';
	if( this.resourcesToLoad === 0){
		$(overlayID).addClass('shown');
		setTimeout(function(){$(overlayID).removeClass('shown');}, 500);
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
