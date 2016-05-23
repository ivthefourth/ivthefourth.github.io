categoryList = [0]

function getRandomInt(max) {
	/*This returns a random number from 0 to (max-1), because it
	  is intended for use with arrays where max is array.length.*/
    return Math.floor( Math.random() * (max));
}

function displayComment(comments){
	var commentIndex = getRandomInt(comments.items.length);
	if (comments.items[commentIndex].snippet.topLevelComment.snippet.textDisplay){
		$('#quote').text(comments.items[commentIndex].snippet.topLevelComment.snippet.textDisplay);
			$('#tweet').attr('href', ('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Random YT Comment: ' + comments.items[commentIndex].snippet.topLevelComment.snippet.textDisplay.slice(0, 120))));
	}
	else{
		$('#quote').text('Failed to retrieve comment. Please try again.');
			$('#tweet').attr('href', ('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Why are you trying to tweet this? You know that was an error message and not a comment, right?')));
	}
}

function getComment(videos){
	var vidIndex = getRandomInt(videos.items.length);
	var request = gapi.client.youtube.commentThreads.list({
		part: 'snippet',
		maxResults: 50,
		videoId: videos.items[vidIndex].id,
		textFormat: 'plaintext',
	});
	request.execute( function(response){
		if (response.items && response.items.length >= 1){
			displayComment(response);
		}
		else{
			$('#quote').text('Failed to retrieve comment. Please try again.');
			$('#tweet').attr('href', ('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Why are you trying to tweet this? You know that was an error message and not a comment, right?')));
		}
	});
}

function getVideoByPopular(){
	var categoryIndex = getRandomInt(categoryList.length);
	var request = gapi.client.youtube.videos.list({
	    part: 'id',
	    chart: 'mostPopular',
	    videoCategoryId: categoryList[categoryIndex].id,
	    maxResults: 50,

	});
	request.execute( function(response){
		if (response.items && response.items.length >= 1){
			getComment(response);
		}
		else{
			getVideoByPopular();
		}
	});
}

/*function getVideoByID(){
	maybe I will make this later, but the results are pretty good as is
};*/

function getQuote(e){
	e.preventDefault();
	$('#quote').text('Please wait. Your comment is loading.')
	getVideoByPopular();
}

function getCategories(){
	var request = gapi.client.youtube.videoCategories.list({
		part: 'snippet',
		regionCode: 'US',
	});
	request.execute( function(response){
		for (var i=0; i<response.items.length ; i++){
			if (response.items[i].snippet.assignable === true){
				categoryList.push(response.items[i]);
			}
		}
	})
}

function onReady(){
	$('#new-quote').click( function(e){
		getQuote(e);
	});
}
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}
function onYouTubeApiLoad() {
    gapi.client.setApiKey('AIzaSyA6S05idU4SdBSFc3F3lWfkwsGX7kfSa0c');
    getCategories();
}
$(document).ready(onReady);
