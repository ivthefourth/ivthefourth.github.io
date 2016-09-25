

function searchWiki(query, successCallback, errorCallback){
	var request = new XMLHttpRequest();
	var url = 'https://en.wikipedia.org/w/api.php' + 
		'?action=query&titles=' + encodeURIComponent(query) +
		 '&prop=revisions&rvprop=content&format=json';
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			callback(JSON.parse(request.responseText));
		} else {
			errorCallback();
		}
	};

	request.onerror = function() {
			errorCallback();
	};


	request.send();
}



searchWiki('cow poop', function(response){console.log(response)});
