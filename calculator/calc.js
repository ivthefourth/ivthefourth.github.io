//(function(){

	var state = {

		//user interface
		isFocused: false,       //True when a button has been clicked/touched and not released 
		focusType: null,        //Mouse or touch? Which touch?

		//calculator 
		input: [0],             //array of digits input by user
		inputLength: 1,         //Number of digits input by user, limit=9
		inputValue: 0,          //Numerical value of user input
		isDecimal: false,       //User input has a decimal
		newInput: true,         //pushing number button starts new input 
		negativeInput: false,   //Is input negative
		inputDisplayed: true,   //False when display shows result, tells negative what to modify

		currentValue: null, //Most recent 
		currentOperator: null,

		storedValue: null,
		storedOperator: null,
	}

	var buttons = document.getElementsByTagName('button');
	var display = document.getElementById('result');
	//var calculator = document.getElementById('calculator');

	//adds event listeners to node list (nodes arg), events arg is array
	function addListenerToList(nodes, events, callback){
		Array.prototype.forEach.call(nodes, function(n){
			events.forEach( function(e) { n.addEventListener(e, callback)});
		});
	}



	/*****************
	   Mouse Events
	******************/
	function handleMouseDown(e){
		e.preventDefault();
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





	/*****************
	   Calculator
	******************/
	function useButton(button){
		var btnValue = button.dataset.btnValue;
		switch(button.dataset.btnType){
			case 'number':
				useNumber(btnValue);
				break;
			case 'operator': 
				useOperator(btnValue);
				break;
			case 'decimal':
				useDecimal();
				break;
			case 'clear':
				useClear();
				break;
			case 'negative':
				useNegative();
				break;
			case 'percent':
				usePercent();
				break;
			default:
				throw new Error('Bad value for data-btn-type.');
		}
	}

	function useNumber(num){
		if (state.newInput){
			state.input = [num];
			state.inputLength = 1;
			if (num !== '0'){
				state.newInput = false;
			}
			updateInputValue();
		}
		else if (state.inputLength < 9){
			state.input.push(num);
			state.inputLength += 1;
			updateInputValue();
		}
	}

	function useDecimal(){
		if (state.newInput){
			state.input = ['0', '.'];
			state.inputLength = 1;
			state.newInput = false;
			state.isDecimal = true;
			updateInputValue();
		}
		else if (state.inputLength < 9 && !state.isDecimal){
			state.input.push('.');
			state.isDecimal = true;
			updateInputValue();
		}
	}

	function useNegative(){
		console.log('negative');
	}

	function usePercent(){
		console.log('percent');
	}

	function useClear(){
		console.log('clear');
	}

	function useOperator(num){
		console.log(num);
	}

	function updateInputValue(){
		var val = state.input.slice(0); //clone input
		if (state.negativeInput){
			val.unshift('-');
		}
		state.inputValue = Number( state.input.join(''));
		val = addComas(val);
		displayValue(val);
	}

	function addComas(val){
		var newVal = val.slice(0); //clone array
		var decimal = newVal.indexOf('.');
		if ( decimal === -1 ){
			max = newVal.length;
		}
		else{
			max = decimal;
		}

		if ( newVal.indexOf('-') === -1 ){
			var min = 0;
		}
		else{
			var min = 1;
		}

		for (i = max - 3; i > min; i -= 3){
			newVal.splice(i, 0, ',');
		}
		return newVal.join('');

	}

	function displayValue(val){
		display.innerText = val;
	}


//})();

