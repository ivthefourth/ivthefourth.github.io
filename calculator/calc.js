//(function(){

	var state = {

		//user interface
		isFocused: false,       //True when a button has been clicked/touched and not released 
		focusType: null,        //Mouse or touch? Which touch?

		//calculator 
		input: [0],             //array of digits input by user
		inputLength: 1,         //Number of digits input by user, limit=9
		displayValue: 0,        //Numerical value of user input OR result
		displayType: 'input',   //Does the display show user input or result?
		isDecimal: false,       //User input has a decimal
		isNegative: false,      //User input is negative 
		newInput: true,         //pushing number button starts new input 
		clearType: 'all',       //Clear display or everything?
		chainEquals: false,     //Repeat previous operation

		operatorActive: false,  //When an operator is selected (using negative will put 0 as input)

		currentValue: null,     //stored from displayValue after a single operation
		currentOperator: null,  

		storedValue: null,      //stored from currentValue when respecting order of operations
		storedOperator: null,
	}

	var buttons = document.getElementsByTagName('button');
	var display = document.getElementById('result');
	var clear = getButtonFromData(buttons, 'btnType', 'clear');
	var operators = {};
	operators.add = getButtonFromData(buttons, 'btnValue', 'add');
	operators.subtract = getButtonFromData(buttons, 'btnValue', 'subtract');
	operators.multiply = getButtonFromData(buttons, 'btnValue', 'multiply');
	operators.divide = getButtonFromData(buttons, 'btnValue', 'divide');
	//var calculator = document.getElementById('calculator');

	//adds event listeners to node list (nodes arg), events arg is array
	function addListenerToList(nodes, events, callback){
		Array.prototype.forEach.call(nodes, function(n){
			events.forEach( function(e) { n.addEventListener(e, callback)});
		});
	}

	function getButtonFromData(nodes, dataAttr, value){
		var match;
		Array.prototype.forEach.call(nodes, function(n){
			if (n.dataset[dataAttr] === value){
				match = n;
			}
		})
		return match;
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
	console.warn('still need to do touch events');





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
			case 'equals':
				useEquals();
				break;
			default:
				throw new Error('Bad value for data-btn-type.');
		}
	}

	function useNumber(num){
		if (state.newInput){
			state.displayType = 'input';
			state.input = [num];
			state.inputLength = 1;
			if (num !== '0'){
				state.newInput = false;
				setClear('display');
			}
			if (state.currentOperator !== null){
				deactivateOperator();
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
			setClear('display');
			if (state.currentOperator !== null){
				deactivateOperator();
			}
			updateInputValue();
		}
		else if (state.inputLength < 9 && !state.isDecimal){
			state.input.push('.');
			state.isDecimal = true;
			updateInputValue();
		}
	}

	function useNegative(){
		if (state.displayType === 'input'){
			state.isNegative = !state.isNegative;
			updateInputValue();
		}
		else if (state.operatorActive || state.displayValue === 'Error'){
			state.displayType = 'input';
			state.isNegative = !state.isNegative;
			updateInputValue();
		}
		else {
			var val = -state.displayValue;
			inputEvaluated();
			updateResultValue(val);
		}
	}

	function usePercent(){
		if ((state.displayType === 'input' || state.operatorActive) && (
			state.currentOperator === 'add' || state.currentOperator === 'subtract')
			){
			var val = state.displayValue * state.currentValue / 100;
		}
		else{	
			val = state.displayValue / 100;
		}
		inputEvaluated();
		updateResultValue(val);
	}

	function useClear(){
		if (state.clearType === 'all'){ 
			if (state.currentOperator !== null){
				deactivateOperator();
			}
			state.currentValue= null;
			state.currentOperator= null;
			state.storedValue= null;
			state.storedOperator= null;
			state.chainEquals = false;
		}
		else if (state.currentOperator !== null && state.chainEquals === false){
			activateOperator();
		}
		state.input = [0];
		state.inputLength = 1;
		state.displayValue = 0;
		state.displayType = 'input';
		state.isDecimal = false;
		state.isNegative = false;
		state.newInput = true;
		updateInputValue();
		setClear('all');
	}

	function useOperator(type){
		if (state.currentOperator === null || state.chainEquals){
			state.currentOperator = type;
			state.currentValue = state.displayValue;
			inputEvaluated();
			activateOperator();
		}
		else if (state.operatorActive){
			//if changing from multiply to add with a stored value
			if (state.storedValue !== null && (type === 'add' || type === 'subtract')){
				var result = operate(state.storedValue, state.storedOperator, state.currentValue);
				state.storedValue = null;
				state.storedOperator = null;
				updateResultValue(result);
				state.currentValue = result;
				inputEvaluated();

			}
			deactivateOperator();
			state.currentOperator = type;
			activateOperator();
			
		}
		else{
			if (type === 'add' || type === 'subtract'){
				if (state.storedValue !== null){
					var result = operate(state.currentValue, state.currentOperator, state.displayValue);
					result = operate(state.storedValue, state.storedOperator, result);
					state.storedValue = null;
					state.storedOperator = null;

					//function this VV
					updateResultValue(result);
					state.currentOperator = type;
					state.currentValue = result;
					inputEvaluated();
					activateOperator();

				}
				else{
					var result = operate(state.currentValue, state.currentOperator, state.displayValue);

					//function this VV
					updateResultValue(result);
					state.currentOperator = type;
					state.currentValue = result;
					inputEvaluated();
					activateOperator();
				}
			}
			else{
				if (state.currentOperator === 'add' || state.currentOperator === 'subtract'){
					state.storedValue = state.currentValue;
					state.storedOperator = state.currentOperator;
					state.currentOperator = type;
					state.currentValue = state.displayValue;
					inputEvaluated();
					activateOperator();
				}
				else{
					var result = operate(state.currentValue, state.currentOperator, state.displayValue);

					//function this VV
					updateResultValue(result);
					state.currentOperator = type;
					state.currentValue = result;
					inputEvaluated();
					activateOperator();
				}
			}
		}
		state.chainEquals = false;
	}

	function useEquals(){
		if (state.storedValue !== null){
			var result = operate(state.currentValue, state.currentOperator, state.displayValue);
			result = operate(state.storedValue, state.storedOperator, result);
			state.storedValue = null;
			state.storedOperator = null;

			//function this VV
			state.currentValue = state.displayValue;
			updateResultValue(result);
			inputEvaluated();
			deactivateOperator();
		}
		else if (state.currentValue !== null) {

			//function this VV
			if (!state.chainEquals){
				var result = operate(state.currentValue, state.currentOperator, state.displayValue);
				state.currentValue = state.displayValue;
			}
			else{
				var result = operate(state.displayValue, state.currentOperator, state.currentValue);
			}
			updateResultValue(result);
			inputEvaluated();
			deactivateOperator();
			state.chainEquals = true;
		}
	}

	function updateResultValue(val){
		state.displayValue = val;
		//process numper, remove trailing 0s after decimal, restrict to 9 sig figs, etc
		//err @ 1e<-100 and 1e>160
		if (
			val !== val || val === 'Error' || val > 1e160 || val < -1e160 || 
			val < 1e-100 && val > 0 || val > -1e-100 && val <0
		   ){
			val = 'Error';
			state.displayValue = val;
		}
		else if (
			     val >= 1e9 || val <= -1e9 ||
		         val < 1e-8 && val > 0 || val > -1e-8 && val < 0
		        ){
			val = val.toExponential().split('');
			var digit = val.splice(0, val.indexOf('e') );
			var exponent = val.splice(1);
			digit = Number(digit.join('')).toFixed(8 - exponent.length);
			digit = digit.replace(/\.?0+$/,"");
			exponent = parseInt(exponent.join('')).toString();
			val = digit + 'e' + exponent;
		}
		else{
			var decimal = val.toString().split('').indexOf('.');
			if (decimal === -1){
				val = val.toFixed(0);
			}
			else{
				val = val.toFixed(9 - decimal).replace(/\.?0+$/,"");
			}
			val = addComas(val.split(''));
		}
		updateDisplayValue(val);
	}

	function updateInputValue(){
		var val = state.input.slice(0); //clone input
		if (state.isNegative){
			val.unshift('-');
		}
		state.displayValue = Number( val.join(''));
		val = addComas(val);
		updateDisplayValue(val);
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

	function operate(a, operator, b){
		if (a === 'Error' || b === 'Error'){
			return 'Error';
		}
		switch(operator){
			case 'add':
				return a + b;
			case 'subtract':
				return a - b;
			case 'multiply':
				return a * b;
			case 'divide':
				return a / b;
		}
	}

	function inputEvaluated(){
		state.input = [0];
		state.inputLength = 1;
		state.displayType = 'result';
		state.isDecimal = false;
		state.isNegative = false; 
		state.newInput = true;
	}

	function activateOperator(){
		state.operatorActive = true;
		operators[state.currentOperator].classList.add('selected');
	}

	function deactivateOperator(){
		state.operatorActive = false;
		operators[state.currentOperator].classList.remove('selected');
	}

	function setClear(type){
		if (type !== 'display' && type !== 'all'){
			throw new Error('Invalid value for clear: ' + type);
		}
		state.clearType = type;
		updateClearButton(type);
	}

	function updateClearButton(type){
		if (type === 'all'){
			clear.innerText = 'AC';
		}
		else{
			clear.innerText = 'C';
		}
	}
	function updateDisplayValue(val){
		display.innerText = val;
	}


//})();

