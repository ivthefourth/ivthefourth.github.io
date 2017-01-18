/*
***
***  Controllers
***
*/


//arg refers to Parameter and EarTrainingParameter
function BipolarVerticalSlider(parameter){
	this.polarity = 'bipolar';
	this.setLevelRange(parameter.ID);


	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){
			var mouseY = e.clientY;
			//console.log(mouseY);
			var levelRange = that.levelRange;
			var top = levelRange.bottom - levelRange.height * parameter.max;
			var bottom = levelRange.bottom - levelRange.height * parameter.min;
			var sCount = parameter.stepCount;
			var step = Math.floor((bottom - mouseY)/(bottom - top)*(sCount + 1));

			if( top < mouseY 
			&& mouseY < bottom 
			&& step != parameter.user 
			&& parameter.testMode !== 'reference'
			&& parameter.isActive){
				parameter.user = step;
				//console.log(step);
			}
		}
		/*var touchHandler = function(e){
			var mouseY = e.clientY;
			var levelRange = that.levelRange;
			var top = levelRange.bottom - levelRange.height * parameter.max;
			var bottom = levelRange.bottom - levelRange.height * parameter.min;
			var sCount = parameter.stepCount;
			var step = Math.floor((bottom - mouseY)/(bottom - top)*(sCount + 1));

			if( top < mouseY 
			&& mouseY < bottom 
			&& step != parameter.user 
			&& parameter.testMode !== 'reference'){
				parameter.user = step;
				//console.log(step);
			}
		}*/
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});

}
BipolarVerticalSlider.prototype.setLevelRange = function(id){
	//console.log(id);
	var levelRange = {};
	levelRange.height = $(id).height();
	levelRange.top = $(id).offset().top - $(document).scrollTop();
	levelRange.bottom = levelRange.top + levelRange.height;
	levelRange.center = (levelRange.top + levelRange.bottom)/2;
	this.levelRange = levelRange;
}
BipolarVerticalSlider.prototype.updateInterface = function(id, ratio){
	var slider = $(id + ' .range');
	var height = this.levelRange.height;
	if(ratio < 0){
		slider.css({'top': '50%', 'bottom': 'auto'});
		slider.css('height', - height * ratio / 2);
	}
	else{
		slider.css({'bottom': '50%', 'top': 'auto'});
		slider.css('height', height * ratio / 2);
	}
	$(id + ' .handle').css('transform', 'translateY(' + -(ratio + 1)*height/2 + 'px)');
	//console.log(transform);
	//console.log(levelRange.center);
	//transform = transform + (levelRange.bottom - levelRange.center);
	//$(id + ' .range').css('transform', 'scaleY(' + transform + ')');
}



function UnipolarHorizontalSlider(parameter){
	this.polarity = 'unipolar';
	this.setLevelRange(parameter.ID);

	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){;}
	}
	else if(parameter instanceof Parameter){
		var levelHandler = function(e){
			var mouseX = e.clientX;
			var levelRange = that.levelRange;
			var left = levelRange.left;
			var right = levelRange.right;
			var width = levelRange.width;
			var maxLeft = left + width * parameter.min;
			var maxRight = left + width * parameter.max;
			var step = (mouseX - left)/width;
			//console.log(mouseX, maxLeft, maxRight, left, right, width);

			if( maxLeft < mouseX 
			&& mouseX < maxRight 
			&& step != parameter.user 
			&& parameter.isActive){
				parameter.user = step;
				//console.log(mouseX + ', ' + currentMouseY);
			}
		}
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		that.setLevelRange(parameter.ID);
		levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});
}
UnipolarHorizontalSlider.prototype.setLevelRange = function(id){
	//console.log(id);
	var levelRange = {};
	levelRange.left = $(id).offset().left - $(document).scrollLeft();
	levelRange.width = $(id).width();
	levelRange.right = levelRange.left + levelRange.width;
	this.levelRange = levelRange;
}
UnipolarHorizontalSlider.prototype.updateInterface = function(id, ratio){
	var levelRange = this.levelRange;
	//console.log(ratio);
	var transform =  ratio * levelRange.width;
	$(id + ' .handle').css('transform', 'translateX(' + transform + 'px)');
	$(id + ' .range').css('width', transform + 'px');
}




function UnipolarKnob(parameter){
	this.polarity = 'unipolar';


	var that = this;
	if( parameter instanceof EarTrainingParameter){
		var levelHandler = function(e){
			var mouseY = e.clientY;
			//maybe change vvv
			var step = parameter.user + Math.floor(((waClickY - mouseY)/20) + 0.5);
			if( 0 <= step && step <= parameter.stepCount 
			&& step !== parameter.user && parameter.testMode !== 'reference'
			&& parameter.isActive){
				waClickY = mouseY;
				parameter.user = step;
				//console.log(step);
			}
		}
	}


	$(parameter.ID).mousedown(function(e){
		e.preventDefault();
		waClickY = e.clientY;
		//levelHandler(e);
		$(document).mousemove(levelHandler);
		$(document).mouseup(function(){
			$(this).off('mouseup mousemove');
		});
	});

	$(parameter.ID).on('touchstart', function(e){
		e.preventDefault();
		waClickY = e.originalEvent.touches[0].clientY;
		//levelHandler(e.originalEvent.touches[0]);
		$(document).on('touchmove', function(e){
			e.preventDefault();
			//console.log(e.originalEvent.touches[0].pageY);
			levelHandler(e.originalEvent.touches[0]);
		});
		$(document).on('touchend touchcancel', function(){
			$(this).off('touchend touchcancel touchmove');
		});
	});
}
UnipolarKnob.prototype.updateInterface = function(id, ratio){
	$(id).css('transform', 'rotate(' + (ratio * 270 - 135) + 'deg)');
}


function ClickToggle(parameter){
	this.polarity = 'selection';
	this.classList = [];
	if( parameter instanceof EarTrainingParameter){
		var typeItem;
		var selections = parameter.node.user[parameter.paramString].selections;
		for( typeItem in selections){
			this.classList.push('controller-' + selections[typeItem]);
		}
		var clickHandler = function(e){
			e.preventDefault();
			if(parameter.testMode !== 'reference'
			&& parameter.isActive){
				parameter.user = ((parameter.user + 1 )%(parameter.stepCount + 1));
				//console.log(param.user);
			};
		}
	}

	//this.currentClass = this.classList[0];
	$(parameter.ID).on('mousedown touchstart', clickHandler);

}
ClickToggle.prototype.updateInterface = function(id, ratio){
	$(id).removeClass(this.currentClass);
	this.currentClass = this.classList[ratio];
	$(id).addClass(this.currentClass);
}
