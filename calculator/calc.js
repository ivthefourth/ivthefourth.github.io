//(function(){

	var state = {

		//user interface
		isFocused: false,   //True when a button has been clicked/touched and not released 
		focusType: null     //Mouse or touch? Which touch?

		//calculator 
	}

	var buttons = document.getElementsByTagName('button');
	//var calculator = document.getElementById('calculator');

	//adds event listeners to node list (nodes arg), events arg is array
	function addListenerToList(nodes, events, callback){
		Array.prototype.forEach.call(nodes, (n) => {
			events.forEach( (e) => { n.addEventListener(e, callback)});
		});
	}



	/*****************
	   Mouse Events
	******************/
	function handleMouseDown(e){
		if( !state.isFocused ){
			e.currentTarget.classList.add('focused');
			state.isFocused = true;
			state.focusType = 'mouse';
		}
	}
	function handleMouseEnter(e){
		if( state.isFocused && state.focusType === 'mouse'){
			e.currentTarget.classList.add('focused');
		}
	}
	function handleMouseLeave(e){
		if( state.isFocused && state.focusType === 'mouse'){
			e.currentTarget.classList.remove('focused');
		}
	}
	function handleMouseUp(e){
		e.stopPropagation(); //don't run this from document after a button runs it
		if( state.isFocused && state.focusType === 'mouse'){
			state.isFocused = false;
			state.focusType = null;
			var target = e.currentTarget;
			if(target !== document){
				target.classList.remove('focused');
				useButton(target);
			}
		}
	}
	addListenerToList(buttons, ['mousedown'], handleMouseDown);
	addListenerToList(buttons, ['mouseenter'], handleMouseEnter);
	addListenerToList(buttons, ['mouseleave'], handleMouseLeave);
	addListenerToList(buttons, ['mouseup'], handleMouseUp);
	document.addEventListener('mouseup', handleMouseUp);



	/*****************
	   Touch Events
	******************/
	console.warn('still need to do touch events')




	function useButton(button){
		console.log(button);
	}


//})();

