var mouseX, mouseY;
var projectTarget = null;
var projectTop, projectLeft, projectWidth, projectHeight;
var drawCanvas = false;
var homeCtx, hiddenCtx;
var canvasWidth, canvasHeight;
var fillChange = 0;



//OPEN NAV ON HOVER??
//SET NAV WIDTH USING JS??

function menuSetup(){
	var nav = $('#top-nav');
	var closeNav = function(){
		var navHeight = $('#mobile-menu').outerHeight();
		nav.removeClass('open').height(navHeight);
	}
	var openNav = function(){
		var navHeight = $('#nav-wrap').outerHeight();
		nav.addClass('open').height(navHeight);
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

	$('.nav-link').click(function(e){
		e.preventDefault();
		var id = $(this).attr('href');
		var scrollTo = $(id).offset().top;
		var distance = Math.abs(scrollTo - $(document).scrollTop()) / $('#home').height();
		//console.log(distance);

		//console.log(scrollTo);
		closeNav();
	    $('html, body').animate({
	      scrollTop: scrollTo
	    }, distance * 500);
	});

	//$('#top-nav').focusin(openNav).focusout(closeNav)
}




function projectSetup(){
	var project = $('.project');
	var hoverHandler = function(e){
		//var doc = $(document);
		mouseX = e.pageX;// - doc.scrollLeft();
		mouseY = e.pageY;// - doc.scrollTop();
		//console.log(mouseX, mouseY);
	}
	project.mouseenter(function(){
		var that = $(this);
		projectTarget = that.children('.project-background');
		projectTop = that.offset().top;
		projectLeft = that.offset().left;
		projectHeight = that.height();
		projectWidth = that.width();
		//console.log(projectTop, projectLeft, projectHeight, projectWidth)
	});
	project.mouseleave(function(){
		projectTarget = null;
	});
	project.mousemove( hoverHandler );
}




function animateProject(){
	if( projectTarget ){
		var originString = 100 * (mouseX - projectLeft) / projectWidth + '% ';
		originString += 100 * (mouseY - projectTop) / projectHeight + '%';
		//console.log(originString);
		projectTarget.css('transform-origin', originString);
	}
}


function scaleCanvas(){
	var canvas = $('#canvas-home');
	canvasHeight = canvas.height();
	canvasWidth = canvas.width();
	canvas.attr('height', canvasHeight);
	canvas.attr('width', canvasWidth);
	var canvas = $('#canvas-hidden');
	canvas.attr('height', canvas.height());
	canvas.attr('width', canvas.width());

	var r = Math.floor(256 * Math.random());
	var g = Math.floor(256 * Math.random());
	var b = Math.floor(256 * Math.random()); 
	homeCtx.fillStyle = 'rgb(' + r + ',' + g +',' + b + ')'
}

function canvasSetup(){
	homeCtx = $('#canvas-home')[0].getContext('2d');
	hiddenCtx = $('#canvas-hidden')[0].getContext('2d');
	var resizeHandler = function(){
		scaleCanvas();
	}
	$( window ).resize(resizeHandler);
	scaleCanvas();


	var hoverHandler = function(e){
		//var doc = $(document);
		mouseX = e.pageX;// - doc.scrollLeft();
		mouseY = e.pageY;// - doc.scrollTop();
		//console.log(mouseX, mouseY);
	}

	var home = $('#home');
	home.mouseenter(function(){
		drawCanvas = true;
	});
	home.mouseleave(function(){
		drawCanvas = false;
	});
	home.mousedown(function(e){
		e.preventDefault();
		fillChange = true;
		$(document).mouseup(function(){
			fillChange = false;
			console.log('off');
			$(this).off('mouseup');

		});
	});
	home.mousemove( hoverHandler );


	homeCtx.fillStyle = 'rebeccapurple';

}

function animateCanvas(){
	var speed = 2;
	var hidden = $('#canvas-hidden')[0];
	var canvas = $('#canvas-home')[0];
	hiddenCtx.clearRect(0,0,canvasWidth,canvasHeight);
	hiddenCtx.drawImage(canvas, 0, speed, canvasWidth, canvasHeight);
	homeCtx.clearRect(0,0,canvasWidth,canvasHeight);
	homeCtx.drawImage(hidden, 0,0,canvasWidth,canvasHeight);

	if( drawCanvas ){
		if( fillChange ){
			var r = Math.floor(256 * Math.random());
			var g = Math.floor(256 * Math.random());
			var b = Math.floor(256 * Math.random()); 
			homeCtx.fillStyle = 'rgb(' + r + ',' + g +',' + b + ')'
		}
		var x = mouseX + 50*Math.random() - 25;
		var y = mouseY + 50*Math.random() - 25;
		homeCtx.fillRect(x - 5, y - 5, 10, 10);
		//console.log(x, y);
	}
}

function animate(){
	animateProject();
	animateCanvas();
	window.requestAnimationFrame(animate);
}


$(document).ready(function(){
	menuSetup();
	projectSetup();
	canvasSetup();

	animate();
});