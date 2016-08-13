

function menuSetUp(){
	$('#mobile-menu').click(function(e){
		e.preventDefault();
		var nav = $('#top-nav');
		if( nav.hasClass('open') ){
			var navHeight = $('#mobile-menu').outerHeight();
			nav.removeClass('open').height(navHeight);
		}
		else{
			var navHeight = $('#nav-wrap').outerHeight();
			nav.addClass('open').height(navHeight);
		}	
	});
}

$(document).ready(function(){
	menuSetUp();
});