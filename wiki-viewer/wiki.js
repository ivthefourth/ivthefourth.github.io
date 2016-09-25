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
		console.log(result);
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
		document.getElementById('results').innerHTML = 
			'There was an error while attempting your search';
	}
	searchWiki(activeSearch, nextOffset, success, error);
	
}

function newSearch(){
	//test to make sure query has changed
	var query = document.getElementById('search-bar').value;
	if( query !== activeSearch && query !== ''){
		document.getElementById('load-more').disabled = true;
		activeSearch = query;
		console.log(query);

		var success = function(result){
			console.log(result);
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
