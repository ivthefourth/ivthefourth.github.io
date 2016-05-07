//****
//header nav functions
//****

// lock scroll position, but retain settings for later
function lockScroll(){
	var scrollPosition = [
  		self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
  		self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
	];

	$('body').data('scroll-position', scrollPosition);
	$('body').data('previous-overflow', $('body').css('overflow'));
	$('body').css('width', $('body').css('width')).css('overflow', 'hidden');
	window.scrollTo(scrollPosition[0], scrollPosition[1]);
}

//unlock scroll
function unlockScroll(){
	var scrollPosition = $('body').data('scroll-position');
	$('body').css('overflow', $('body').data('previous-overflow')).css('width', 'auto').css('height', 'auto');
	window.scrollTo(scrollPosition[0], scrollPosition[1])
}


//big nav toggle
function bigNav(toggle){
	if (toggle === false){
		$('#menu-icon').css('background-color', '#009688');
		$('#big-drop-nav').html($('#foot-nav').html()).addClass('bg-nav-extend').attr("aria-hidden","false");
		lockScroll();
		toggle = true;
	}
	else{
		$('#menu-icon').css('background-color', '#1E2720');
		$('#big-drop-nav').removeClass('bg-nav-extend').html('').attr("aria-hidden","true");
		unlockScroll();
		toggle = false;// un-lock scroll position
	};
	return toggle;
};

//small nav toggle
function closeSmallNav(){
			$('.dropdown.show-nav').css('background-color', '#1E2720').removeClass('show-nav').siblings().removeClass('show-sm-nav').html('')
}

function smallNav(thisVar){
	if(thisVar.hasClass('show-nav')){
		thisVar.css('background-color', '#1E2720').removeClass('show-nav').siblings().removeClass('show-sm-nav').html('');
		return false;
	}
	else{
		closeSmallNav();
		thisVar.css('background-color', '#009688').addClass('show-nav').siblings().html($('.foot-' + thisVar.attr('id') + ' ul').html()).addClass('show-sm-nav');
		return true;
	}
}


//****
//document ready
//****
$(document).ready(function(){
	$('#big-drop-nav').bind('scroll click', function(e){
		e.stopPropagation();
	)};

	//******
	//header navigation
	//******
	var navToggle = false;

	//click, enter toggle big nav
	$('#menu-icon').click( function(e){
		e.preventDefault();
		navToggle = bigNav(navToggle);
	}).keydown(function(e){
		if(e.keyCode == 13) {
			e.preventDefault();
			navToggle = bigNav(navToggle);
		}
	});

	//recover hover and focus color change for bignav
	$('#menu-icon').bind('mouseenter focus', function(){
		if(navToggle===false){
			$(this).css('background-color', '#009688');
		};
	}).bind('mouseleave focusout', function(){
		if(navToggle===false){
			$(this).css('background-color', '#1E2720');
		};
	});

	//small dropdowns
	//
	var smallNavToggle = false;

	//click, enter toggle dropdowns
	$('.dropdown').click( function(e){
		e.preventDefault();
		smallNavToggle = smallNav($(this));
	}).keydown(function(e){
		if(e.keyCode == 13) {
			e.preventDefault();
			smallNavToggle = smallNav($(this));
		}
	});

	//recover hover and focus color change for navbar
	$('.dropdown').bind('mouseenter focus', function(){
		if(!($(this).hasClass('show-nav'))){
			$(this).css('background-color', '#009688')
		};
	}).bind('mouseleave focusout', function(){
		if(!($(this).hasClass('show-nav'))){
			$(this).css('background-color', '#1E2720')
		};
	});


	//escape closes open navs (big and small)
	$('html').keydown(function(e){
		if(e.keyCode == 27 && navToggle) {
			e.preventDefault();
			navToggle = bigNav(navToggle);
		}
		else if(e.keyCode == 27 && smallNavToggle){
			closeSmallNav();
			smallNavToggle = false;
		}
	});

	//window resize closes open navs (big and small)
	var width = $(window).width();
	console.log(width);
	$(window).resize( function(){
		if(navToggle &&  !($(window).width()==width)){
			navToggle = bigNav(navToggle);
			width = $(window).width();}
		else if(smallNavToggle){
			closeSmallNav();
			smallNavToggle = false;
			width = $(window).width();
		}
		else{
		width = $(window).width();
		}
	});	

	//click off closes small nav
	$('html').click( function(e){
		if(smallNavToggle && !($(e.target).hasClass('dropdown') || $(e.target).parent().parent().hasClass('show-sm-nav'))){;
			closeSmallNav();
			smallNavToggle = false;
		}
	})

});

//on mobile zoom, make nav position absolute
