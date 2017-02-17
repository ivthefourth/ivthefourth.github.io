var collectedData = {
	categories: {
		list: [],
		loaded: false,
	},
	currentCategory: null,
	currentVideo: null,
	currentComment: null,
	currentlyLoading: true,
	clientLoaded: false,
	youtubeApiLoaded: false,
};

var tweetBtn = document.getElementById('tweet');
var newQuoteBtn = document.getElementById('new-quote');
var loadIcon = document.getElementById('load-icon');
var commentP = document.getElementById('quote');

function makeUrl(){
	var url = location.origin + location.pathname +
		     '?cid=' + collectedData.currentComment +
		     '&vid=' + collectedData.currentVideo;
	return url;
}


/*This returns a random number from 0 to (max-1), because it
  is intended for use with arrays where max is array.length.*/
function randInt(max) {
    return Math.floor( Math.random() * (max));
}


function setTweet(text){
	tweetBtn.setAttribute('href', ('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text)));

}

function commentError(){
	collectedData.currentlyLoading = false;
	commentP.innerHTML = '<i class="fa fa-exclamation-triangle"></i> ' + 'Failed to retrieve comment. Please try again.';
	commentP.classList.add('error')
	commentP.classList.remove('loading');
	loadIcon.classList.remove('animate-loader');
	setTweet('Why are you trying to tweet this? You know that was an error message and not a comment, right?');
}

function noConnectionError(canTryAgain){
	commentP.innerHTML = '<i class="fa fa-exclamation-triangle"></i> ' + 'Cannot find internet connection.';
	commentP.classList.add('error');
	commentP.classList.remove('loading');
	loadIcon.classList.remove('animate-loader');
	collectedData.currentlyLoading = !canTryAgain;	
	setTweet('Why are you trying to tweet this? You know that was an error message and not a comment, right?');
}

function displayComment(commentText){
	collectedData.currentlyLoading = false;
	var html = commentText + ' <span><a href="https://www.youtube.com/watch?v=' + 
			   collectedData.currentVideo + '&lc=' + 
			   collectedData.currentComment + '" rel="nofollow" target="_blank">View on YouTube</a></span>';
	commentP.innerHTML = html;
	commentP.classList.remove('loading');
	loadIcon.classList.remove('animate-loader');
	setTweet(makeUrl());
}

function getComment(){
	var categoryId = collectedData.currentCategory;
	var vidId = collectedData.currentVideo;
	var commentArr = collectedData.categories[categoryId][vidId].list;
	if (commentArr.length < 1){
		getCommentThread(collectedData.categories[categoryId][vidId].next);
	}
	else{
		var index = randInt(commentArr.length);
		var text = commentArr[index].snippet.topLevelComment.snippet.textDisplay;
		collectedData.currentComment = commentArr[index].id;
		if (text){
			displayComment(text);
		}
		else{
			commentError();
		}
		commentArr.splice(index, 1);
	}
}

function getCommentThread(next){
	if( next === undefined){
		var categoryId = collectedData.currentCategory;
		var index = randInt(collectedData.categories[categoryId].list.length);
		var vidId = collectedData.currentVideo = collectedData.categories[categoryId].list[index].id;
	}
	else{
		var vidId = collectedData.currentVideo;
		var categoryId = collectedData.currentCategory;
	}

	if( collectedData.categories[categoryId][vidId].loaded && next === undefined){
		getComment();
	}
	else if( next === 'none'){
		collectedData.categories[categoryId][vidId].loaded = false;
		collectedData.categories[categoryId][vidId].next = undefined;
		getVideosByPopular();
	}
	else{
		var reqObj = {
			part: 'snippet',
			maxResults: 100,
			videoId: vidId,
			textFormat: 'plaintext',
		};

		if( next !== undefined ){
			reqObj.pageToken = next;	
		}
		var request = gapi.client.youtube.commentThreads.list(reqObj);
		request.execute( function(response){
			if( response.code == -1 ){
				noConnectionError(true);
			}
			else{
				if (response.items && response.items.length >= 1){
					for (var i = 0; i < response.items.length; i++){
						collectedData.categories[categoryId][vidId].list.push(response.items[i]);
					}
					collectedData.categories[categoryId][vidId].loaded = true;
					collectedData.categories[categoryId][vidId].next = response.nextPageToken || 'none';
					getComment();
				}
				else if ( collectedData.categories[categoryId][vidId].loaded ){
					collectedData.categories[categoryId][vidId].loaded = false;
					collectedData.categories[categoryId][vidId].next = undefined;
					commentError();
				}
				else{
					removeIndex(collectedData.categories[categoryId], index);
					getVideosByPopular();
				}
			}
		});
	}
}

function getVideosByPopular(){
	var index = randInt(collectedData.categories.list.length);
	var categoryId = collectedData.currentCategory = collectedData.categories.list[index].id;
	if( collectedData.categories[categoryId].loaded ){
		getCommentThread();
	}
	else{
		var request = gapi.client.youtube.videos.list({
		    part: 'id',
		    chart: 'mostPopular',
		    videoCategoryId: categoryId,
		    maxResults: 50,

		});
		request.execute( function(response){
			if( response.code == -1 ){
				noConnectionError(true);
			}
			else{
				if (response.items && response.items.length >= 1){
					for (var i = 0; i < response.items.length; i++){
						collectedData.categories[categoryId].list.push(response.items[i]);
						collectedData.categories[categoryId][response.items[i].id] = {list: [], loaded: false};
					}
					collectedData.categories[categoryId].loaded = true;
					getCommentThread();
				}
				else{
					removeIndex(collectedData.categories, index);
					getVideosByPopular();
				}
			}
		});
	}
}
function removeIndex(destination, index){
	var arr = destination.list.splice(index, 1);
	delete destination[arr[0].id];
}


function getQuote(){
	collectedData.currentlyLoading = true;
	loadIcon.classList.add('animate-loader');
	commentP.classList.add('loading')
	commentP.classList.remove('error');
	getVideosByPopular();
	
}

function getCategories(setText){
	var request = gapi.client.youtube.videoCategories.list({
		part: 'snippet',
		regionCode: 'US',
	});
	request.execute( function(response){
		if( response.code == -1 ){
			noConnectionError(false);
		}
		else{
			if( setText ){
				commentP.textContent = 'Read random comments from YouTube. Click the "New" button to get started!';
				commentP.classList.remove('loading');
				loadIcon.classList.remove('animate-loader');
			}
			collectedData.currentlyLoading = false;
			collectedData.categories.loaded = true;
			for (var i=0; i<response.items.length ; i++){
				if (response.items[i].snippet.assignable === true){
					collectedData.categories.list.push(response.items[i]);
					collectedData.categories[response.items[i].id] = {list: [], loaded: false};
				}
			}
		}
	});
}



function onClientLoad() {
	collectedData.clientLoaded = true;
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}
function onYouTubeApiLoad() {
	collectedData.youtubeApiLoaded = true;
    gapi.client.setApiKey('AIzaSyA6S05idU4SdBSFc3F3lWfkwsGX7kfSa0c');
    if(location.search){
    	getCommentFromSearch();
    	getCategories(false);
    }
    else{
    	getCategories(true);
    }
}
function getCommentFromSearch(){
	var arr = location.search.slice(5).split('&vid=');
	var commentId = collectedData.currentComment = arr[0];
	var request = gapi.client.youtube.commentThreads.list({
		part: 'snippet',
		id: commentId,
		textFormat: 'plaintext',
	});
	request.execute( function(response){
		if( response.code == -1 ){
			noConnectionError(true);
		}
		else{
			var text;
			if( response.items.length > 0){
				console.log(response);
				text = response.items[0].snippet.topLevelComment.snippet.textDisplay;
				collectedData.currentVideo = response.items[0].snippet.videoId;
			}

			if (text){
				displayComment(text);
			}
			else{
				commentError();
			}
		}
	});
}

newQuoteBtn.onclick =  function newQuote(e){
	e.preventDefault();
	if ( !collectedData.currentlyLoading ){
		getQuote();
	}
};

