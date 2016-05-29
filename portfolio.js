/*function parallax(){
	$(window).mousemove(function( event ) {
	  var x = event.pageX / $(window).width();
	  var y = ( event.pageY - $(window).scrollTop() ) / $(window).height();

	  	$('#parallax-front').css({
			'transform' : 'translate('+ -x*3.5 +'%, '+ -y*3.5 +'%)'
		});
		$('#parallax-front-mid').css({
			'transform' : 'translate('+ -x*2.25 +'%, '+ -y*2.25 +'%)'
		});
		$('#parallax-back-mid').css({
			'transform' : 'translate('+ -x*1.25 +'%, '+ -y*1.25 +'%)'
		});
		$('#parallax').css({
			'transform' : 'translate('+ -x/1.5 +'%, '+ -y/1.5 +'%)'
		});	

	});
}*/

$(document).ready(function(){
	//parallax();
	
	$('#scene').load(function() {
		$("#overlay").fadeOut("slow");
	});

	$('#pa-one').hover(function(){
		$('#pp-one').toggleClass('pp-show');
		$('.wrap').toggleClass('pp-hide');
		$('nav').toggleClass('pp-hide');
	});


	$('a[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		  var target = $(this.hash);
		  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		  if (target.length) {
		    $('html, body').animate({
		      scrollTop: target.offset().top
		    }, 2000);
		    return false;
		  }
		}
	});

	var scene = document.getElementById('scene');
	var parallax = new Parallax(scene);


});






/*$(window).scroll(function(){
	parallax();
});*/