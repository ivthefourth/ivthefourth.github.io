
function toC(kelvin){
	return Math.round(kelvin - 273.15);
}

function toF(kelvin){
	return Math.round(kelvin * 9 / 5 - 459.67);
}

function showDiv(id){
	var div = document.getElementById(id);
	div.style.display = 'block';
	setTimeout(function(){
		div.style.opacity = '1';
	}, 500);
}

function makePage(response, errMsg){
	if( response ){
		var temperature = response.main.temp;
		var units = 'f';
		document.getElementById('location').innerHTML = 
			response.name + ', ' + response.sys.country;
		document.getElementById('temperature').innerHTML = 
			toF(temperature) + '°F';
		document.getElementById('weather').innerHTML = 
			response.weather[0].description;
		document.getElementById('icon').innerHTML = 
			'<img src="http://openweathermap.org/img/w/' + response.weather[0].icon + '.png">';
		
		var tempToggle = function(){
			if( units === 'c'){
				units = 'f';
				document.getElementById('temperature').innerHTML = 
					toF(temperature) + '°F';
				}
			else{
				units = 'c';
				document.getElementById('temperature').innerHTML = 
					toC(temperature) + '°C';
				}
		}
		document.getElementById('f-c-toggle').addEventListener(
			'click', tempToggle, false);

		showDiv('wrapper');
	}
	else{
		document.getElementById('err-msg').innerHTML = errMsg;
		showDiv('err-wrapper');
	}
}

function sendWeatherRequest(ispInfo) {
	var key = '43af6625c5ef2c20e13fd4fe7d20e7df';
	var url = 'http://api.openweathermap.org/data/2.5/weather?q='+
				ispInfo.city + ',' + ispInfo.country + '&appid=' + key;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	var errMsg = 'There was a problem connecting to the weather service';

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			makePage(JSON.parse(request.responseText), null);
		} else {
			makePage(null, errMsg);
		}
	};

	request.onerror = function() {
		makePage(null, errMsg);
	};

	request.send();
}


function getLocationFromIP(callback){
	var request = new XMLHttpRequest();
	request.open('GET', 'http://ipinfo.io/json', true);
	var errMsg = 'There was a problem obtaining your location';

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			callback(JSON.parse(request.responseText));
		} else {
			makePage(null, errMsg);
		}
	};

	request.onerror = function() {
		makePage(null, errMsg);
	};

	request.send();
}


getLocationFromIP(sendWeatherRequest);
