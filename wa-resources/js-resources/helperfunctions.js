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
