function makePage(response, errMsg){
	if( response ){
		console.log(response);
		document.getElementById('content').innerHTML = JSON.stringify(response);
	}
	else{
		console.log('boo');
		document.getElementById('content').innerHTML = errMsg;
	}
}

function storePosition (pos) {
	var key = '43af6625c5ef2c20e13fd4fe7d20e7df';
	var coords = pos.coords;
	var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
			   coords.latitude + '&lon=' + coords.longitude + '&appid=' + key;
	console.log(url);
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			makePage(JSON.parse(request.responseText), null);
		} else {
			var errMsg = 'There was a problem connecting to the weather service';
			makePage(null, errMsg);
		}
	};

	request.onerror = function() {
		var errMsg = 'There was a problem connecting to the weather service';
		makePage(null, errMsg);
	};

	request.send();
}

function geoError(err){
	var errMsg = err.message;
	makePage(null, errMsg);
}



if ("geolocation" in navigator) {
	/* geolocation is available */
	navigator.geolocation.getCurrentPosition(storePosition, geoError);
} else {
	/* geolocation IS NOT available */
	var errMsg = 'Your browser or device does not support geolocation.';
	makePage(null, errMsg);
}



