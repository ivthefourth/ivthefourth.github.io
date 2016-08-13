

function menuSetUp(){
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
}



$(document).ready(function(){
	menuSetUp();
});