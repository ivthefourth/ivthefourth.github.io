var activeSearch;
var nextOffset;

function titleToUrl(title){
	return 'https://en.wikipedia.org/wiki/' + 
		encodeURIComponent(title.replace(' ', '_'));
}

function resultsToHtml(array){
	var html = '';
	for( var i = 0; i < array.length; i++){
		html += '<a href="' + titleToUrl(array[i].title) + '">';
		html += '<article class="search-result">';
		html += '<h2>' + array[i].title + '</h2>';
		html += '<p>' + array[i].snippet + '</p>';
		html += '</article></a>';
	}
	return html;
}

function loadMoreResults(){
	document.getElementById('load-more').disabled = true;


	var success = function(result){
		document.getElementById('err-msg').style.display = 'none';
		if( result.query.search.length === 0){
			document.getElementById('results').innerHTML += '<p>No More Results</p>';
		}
		else{
			document.getElementById('results').innerHTML += 
				resultsToHtml(result.query.search);
			if( result['continue'] ){
				nextOffset = result['continue'].sroffset;
				document.getElementById('load-more').disabled = false;
			}
			else{
				document.getElementById('results').innerHTML += '<p>No More Results</p>';
			}
		}
	}
	var error = function(){
		document.getElementById('err-msg').style.display = 'block';
		document.getElementById('load-more').disabled = false;
	}
	searchWiki(activeSearch, nextOffset, success, error);
	
}

function newSearch(){
	//test to make sure query has changed
	var query = document.getElementById('search-bar').value;
	if( query !== activeSearch && query !== ''){
		document.getElementById('load-more').disabled = true;

		var success = function(result){
			activeSearch = query;
			if( result.query.search.length === 0){
				document.getElementById('results').innerHTML = '<p>No Results Match Your Search</p>'
			}
			else{
				document.getElementById('results').innerHTML = resultsToHtml(result.query.search);
				if( result['continue'] ){
					nextOffset = result['continue'].sroffset;
					document.getElementById('load-more').disabled = false;
				}
				else{
					document.getElementById('results').innerHTML += '<p>No More Results</p>';
				}
			}
		}
		var error = function(){
			document.getElementById('results').innerHTML = 
				'There was an error while attempting your search';
		}
		searchWiki(query, 0, success, error);
	}
}

function searchWiki(query, offset, successCallback, errorCallback){
	var request = new XMLHttpRequest();
	var url = 'https://en.wikipedia.org/w/api.php' + 
		'?action=query&list=search&srsearch=' + encodeURIComponent(query) +
		 '&format=json&origin=*&sroffset=' + offset;
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			successCallback(JSON.parse(request.responseText));
		} else {
			errorCallback();
		}
	};

	request.onerror = function() {
			errorCallback();
	};


	request.send();
}

function searchBar(e){
	if( e.keyCode == 13){
		e.preventDefault();
		newSearch();
	}	
}
document.getElementById('search-bar').addEventListener('keydown', searchBar, false);
document.getElementById('search-button').addEventListener('click', newSearch, false);
document.getElementById('load-more').addEventListener('click', loadMoreResults, false);
//
//  fun title
//

var hue = 0;

//if animate > 1, animate... hover and focus each add 1, 
//and exiting either subtracts 1
var animate = 0;

function animateLinkLetter(){
	if( animate > 0){
		//do animation
		hue = (hue + 1) % 360;
		linkLetter.style.color = 'hsl(' + hue + ', 100%, 50%)';
		requestAnimationFrame(animateLinkLetter);
	}
	else{
		//set color to black
		linkLetter.style.color = 'hsl(' + hue + ', 100%, 0%)';
	}
}

function startAnimation(){
	if(animate === 0){
		animate += 1;
		animateLinkLetter();
	}
	else{
		animate += 1;
	}
	
}

function stopAnimation(){
	animate -= 1;
	if(animate === 0){
	}
}

var mainTitle = document.getElementById('main-title');
mainTitle.addEventListener('mouseenter', startAnimation);
mainTitle.addEventListener('mouseleave', stopAnimation);

var linkLetter = document.getElementById('link-letter');
linkLetter.addEventListener('focus', startAnimation);
linkLetter.addEventListener('blur', stopAnimation);
