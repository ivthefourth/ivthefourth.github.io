var mouseX, mouseY, x1, y1;
var projectTop, projectLeft, projectWidth, projectHeight;
var drawCanvas = true;
var homeCtx, hiddenCtx, copyCtx, pattern;
var canvasWidth, canvasHeight;
var leftMouse = false, rightMouse = 0, hue = 0;
var canvasTimeout;



//need to test canvas on HDD and maybe make changes to make it look nice
//maybe load larger img for xl screens

function menuSetup(){
	var nav = $('#top-nav');
	var closeNav = function(){
		var navHeight = $('#mobile-menu').outerHeight();
		nav.removeClass('open').height(navHeight);
		$('.nav-link').attr('tabindex', '-1');
	}
	var openNav = function(){
		var navHeight = $('#nav-wrap').outerHeight();
		nav.addClass('open').height(navHeight);
		$('.nav-link').attr('tabindex', '0');
	}

	$('#mobile-menu').click(function(e){
		e.preventDefault();
		if( nav.hasClass('open') ){
			closeNav();
		}
		else{
			openNav();
		}	
	});

	$('.nav-link').attr('tabindex', '-1');

	$('.nav-link').click(function(e){
		e.preventDefault();
		var id = $(this).attr('href');
		var scrollTo = $(id).offset().top;
		var distance = Math.abs(scrollTo - $(document).scrollTop()) / $('#home').height();
		closeNav();
	    $('html, body').animate({
	      scrollTop: scrollTo
	    }, distance * 500);
	    var fn = function(){ $(id).focus()};
	    window.setTimeout(fn, distance * 500);
	});

}

function animateCanvas(){
	var copy = $('#canvas-copy')[0];
	var canvas = $('#canvas-home')[0];
	homeCtx.drawImage(copy, 0,0,canvasWidth,canvasHeight);

	if( drawCanvas ){
		if( rightMouse === 2 ){
			hue = (hue + 1)%360;
			homeCtx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
		}
		homeCtx.beginPath();
		homeCtx.moveTo(x1, y1);
		if( x1 === mouseX && y1 === mouseY){
			homeCtx.lineTo(mouseX, mouseY-1);
		}
		else{
			homeCtx.lineTo(mouseX, mouseY);
		}
		
		x1 = mouseX;
		y1 = mouseY;
		homeCtx.stroke();
	}

	if( leftMouse ){
		copyCtx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight);	
	}
}

function animate(){
	animateCanvas();
	window.requestAnimationFrame(animate);
}


function makePattern(){
	var img = $('#img-hidden');
	var canvas = $('#canvas-hidden')[0];
	var iWidth = img.width();
	var iHeight = img.height();
	var minRatio = Math.min(iWidth/canvasWidth, iHeight/canvasHeight);
	if( minRatio < 1 ){
		iWidth = iWidth/minRatio;
		iHeight = iHeight/minRatio;
	}
	var offsetX = - Math.round((iWidth - canvasWidth)/2);
	var offsetY = - Math.round((iHeight - canvasHeight)/2);
	hiddenCtx.clearRect(0,0,canvasWidth,canvasHeight);
	hiddenCtx.drawImage(img[0], offsetX, offsetY, iWidth, iHeight);
	pattern = homeCtx.createPattern(canvas, 'no-repeat');
	homeCtx.strokeStyle = pattern;
	homeCtx.lineWidth= 100;
	homeCtx.lineCap = 'round';
	homeCtx.fillStyle= '#588c73';
	copyCtx.fillStyle = '#588c73';
	copyCtx.fillRect(0,0,canvasWidth,canvasHeight);
}

function scaleCanvas(){

	if( isIE ){
		$('.vp-box').css('height', 'auto');
		scaleDivs();
	}
	var canvas = $('#canvas-home');
	canvasHeight = canvas.height();
	canvasWidth = canvas.width();
	canvas.attr('height', canvasHeight);
	canvas.attr('width', canvasWidth);
	var canvas = $('#canvas-hidden');
	canvas.attr('height', canvasHeight);
	canvas.attr('width', canvasWidth);
	var canvas = $('#canvas-copy');
	canvas.attr('height', canvasHeight);
	canvas.attr('width', canvasWidth);

	makePattern();
}

function canvasSetup(){
	homeCtx = $('#canvas-home')[0].getContext('2d');
	hiddenCtx = $('#canvas-hidden')[0].getContext('2d');
	copyCtx = $('#canvas-copy')[0].getContext('2d');
	var resizeHandler = function(){
		if( canvasTimeout){
			clearTimeout(canvasTimeout);
		}
		canvasTimeout =  setTimeout(scaleCanvas, 250);
	}
	$( window ).resize(resizeHandler);


	scaleCanvas();


	var hoverHandler = function(e){
		mouseX = e.pageX;
		mouseY = e.pageY;
	}

	var home = $('#home');
	home.css('cursor', 'pointer');
	home.mouseenter(function(){
		drawCanvas = true;
	});
	home.mouseleave(function(){
		//drawCanvas = false;
	});
	home.mousedown(function(e){
		e.preventDefault();
		switch(e.which){
			case 2:
				var newsize = (homeCtx.lineWidth + 10) % 100;
				homeCtx.lineWidth = newsize ? newsize : 100 ;
				break;
			case 3:
				rightMouse = (rightMouse + 1) % 4;
				switch(rightMouse){
					case 0:
						homeCtx.strokeStyle = pattern;
						break;
					case 1: 
						var r = Math.floor(256 * Math.random());
						var g = Math.floor(256 * Math.random());
						var b = Math.floor(256 * Math.random()); 
						homeCtx.strokeStyle = 'rgb(' + r + ',' + g +',' + b + ')';
						break;
					case 2:
						break;
					default:
						homeCtx.strokeStyle = '#588c73';
						break;
				}
				break;
			default:
				leftMouse = true;
		}
	});
	$(document).mouseup(function(e){
		e.preventDefault();
		switch(e.which){
			case 2:
				//midMouse = false;
				break;
			case 3:
				//rightMouse = false;
				break;
			default:
				leftMouse = false;
		}
	});
	home.mousemove( hoverHandler );
	home.contextmenu(function(e){ e.preventDefault; return false;});

	animate();

	$('#img-hidden').off('load');
	$('#img-hidden').load(makePattern);


}

var isIE;
$(document).ready(function(){
	menuSetup();
	if(window.matchMedia("(min-width: 60em)").matches){
		$('#img-hidden').load(canvasSetup);
		$('#img-hidden').attr('src', 'images/pattern1920wgrad.jpg');
	}

	isIE = !!detectIE();

	if( isIE ){
		scaleDivs();
	}


});


function detectIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}
	/*
	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}
	*/

	// other browser
	return false;
}

function scaleDivs(){
		var height = $('#home').outerHeight();
		$('#home').height(height);
		height = $('#about').outerHeight();
		$('#about').height(height);
		height = $('#projects').outerHeight();
		$('#projects').height(height);
		height = $('#contact').outerHeight();
		$('#contact').height(height);
}
