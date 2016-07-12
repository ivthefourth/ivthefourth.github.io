var BLOCKSIZE = 20; //number of digits for block cipher
var BIGMOD = new BigNumber(1);
BIGMOD = BIGMOD.shift(BLOCKSIZE).toString();
BigNumber.config({ MODULO_MODE: 9 });


function toNumberArray(string){
	var array = [];
	var temp;
	var i;

	for( i=0; i<string.length; i++){
		temp = string.charCodeAt(i);
		if( temp === 9 || temp === 10)
			temp = temp - 9;
		else if( temp === 13)
			temp = 1;
		else if( 32 <= temp && temp <= 126)
			temp = temp - 30;
		else if( 161 <= temp && temp <= 163)
			temp = temp - 64;
		else 
			temp = 2;

		array.push(temp);
	};
	return array;
};

function numbersToString(array){
	for( i=0; i<array.length; i++){
		if( array[i] === 0 || array [i] === 1)
			array[i] = array[i] + 9;
		else if( 2 <= array[i] && array[i] <= 96)
			array[i] = array[i] + 30
		else if( 97 <= array[i] && array[i] <= 99)
			array[i] = array[i] + 64;
		else
			alert('this shoud not happen');
		array[i] = String.fromCharCode( array[i]);
	};
	return array.join('');
};


function randInt(intLength){
	var array = [];
	for( i=0; i<intLength; i++)
		array.push( Math.floor( Math.random() * 10));
	return array.join('');
};

function getMult(multLength){
	var endings = [1,3,7,9]; //avoids prime factors 2 and 5
	var array = [];
	for( i=0; i<multLength - 1; i++)
		array.push( Math.floor( Math.random() * 10));
	array.push(endings[ Math.floor( Math.random() * 4)]);
	return array.join('');
};


function modInverse(a, b){//if b is modulus... array[1] is inverse
	//might need to make inverse positive if negative...
	var array;
	a = new BigNumber(a);
	b = new BigNumber(b);
	//http://www.csee.umbc.edu/~chang/cs203.s09/exteuclid.shtml
	
	if( b.equals(0))
		return [a.toString(), '1', '0'];
	array = modInverse(b.toString(), a.modulo(b).toString());
	d = new BigNumber( array[0] );
	s = new BigNumber( array[2] );
	t = new BigNumber( array[1] );
	t = t.minus(a.dividedToIntegerBy(b).times(s));
	return [d.toString(),s.toString(),t.toString()];
};


function cipher(array, multiple, shift, modulus){
	var i;
	var temp = [];
	for( i=0; i<array.length; i++){
		temp[i] = new BigNumber(array[i]);
		temp[i] = temp[i].times(multiple).plus(shift).modulo(modulus);
		if( modulus === 100)
			temp[i] = temp[i].toNumber();
		else
			temp[i] = temp[i].toString();
	};
	return temp;
};

function decipher(array, inverse, shift, modulus){
	var i;
	var temp = [];
	for( i=0; i<array.length; i++){
		temp[i] = new BigNumber(array[i]);
		temp[i] = temp[i].minus(shift).times(inverse).modulo(modulus);
		if( modulus === 100)
			temp[i] = temp[i].toNumber();
		else
			temp[i] = temp[i].toString();
	};
	return temp;
};


function padBlock(block){
	while( block.length < BLOCKSIZE)
		block = '0' + block;
	return block;
};

function blockToArray(block){
	var array = block.match(/[0-9]{2}/g);
	var i;
	for( i=0; i<array.length; i++){
		array[i] = parseInt(array[i], 10);
	}
	return array;
};

function arrayToBlock(array){
	var number = new BigNumber(0);
	var i;
	for( i=0; i<array.length; i++){
		number = number.shift(2);
		number = number.plus(array[i]);
	};
	return number.toString();
};

function makeHeader(bigMult, bigShift, smallMult, smallShift){
	bigMult = blockToArray(bigMult);
	bigShift = blockToArray(bigShift);
	small = [parseInt(smallMult, 10), parseInt(smallShift, 10)];
	return numbersToString(bigMult) + numbersToString(bigShift) + 
		   numbersToString(small);
};

function blockCipher(array, multiple, shift, modulus){
	var interval = BLOCKSIZE/2
	var blocks = []; 
	var temp = [];
	var i;

	for( i=0; i<array.length; i+=interval){
		temp = array.slice(i, i+interval);
		blocks.push(arrayToBlock(temp));
	};
	blocks = cipher(blocks, multiple, shift, modulus);
	for( i=0; i<blocks.length; i++){
		blocks[i] = padBlock( blocks[i]);
		blocks[i] = blockToArray( blocks[i]);
		blocks[i] = numbersToString( blocks[i]);
	};
	return blocks.join('')
};

function blockDecipher(array, inverse, shift, modulus){
	var interval = BLOCKSIZE/2
	var blocks = []; 
	var temp = [];
	var i;

	for( i=0; i<array.length; i+=interval){
		temp = array.slice(i, i+interval);
		blocks.push(arrayToBlock(temp));
	};
	blocks = decipher(blocks, inverse, shift, modulus);
	for( i=0; i<blocks.length; i++){
		blocks[i] = padBlock( blocks[i]);
		blocks[i] = blockToArray( blocks[i]);
		blocks[i] = numbersToString( blocks[i]);
	};
	return blocks.join('')
}






function encrypt(input){
	//var blockArr = [];

	var inputArr = toNumberArray(input);
	var bigMult = getMult(BLOCKSIZE);
	var bigShift = randInt(BLOCKSIZE);
	var smallMult = getMult(2);
	var smallShift = randInt(2);
	var header = makeHeader(bigMult, bigShift, smallMult, smallShift);

	while( inputArr.length%(BLOCKSIZE/2) !== 0)
		inputArr.push(2);

	inputArr = cipher(inputArr, smallMult, smallShift, 100);
	inputArr = blockCipher(inputArr, bigMult, bigShift, BIGMOD);
	return header + inputArr;
};



function decrypt(input){
	var interval = BLOCKSIZE/2
	var inputArr = toNumberArray( input.substring(interval*2+2, input.length));
	var bigMult = arrayToBlock( toNumberArray( input.substring(0,interval)));
	var bigShift = arrayToBlock( toNumberArray( input.substring(interval,interval*2)));
	var bigInverse = modInverse( bigMult, BIGMOD)[1];
	var smallMult = toNumberArray( input[interval*2])[0];
	var smallShift = toNumberArray( input[interval*2+1])[0];
	var smallInverse = modInverse( smallMult, 100)[1];

	inputArr = blockDecipher( inputArr, bigInverse, bigShift, BIGMOD);
	inputArr = decipher( toNumberArray(inputArr), smallInverse, smallShift, 100)


	return numbersToString(inputArr);
};






$(document).ready(function(){
	$('#encrypt').click(function(e){
		e.preventDefault();
		var inputText = $('#input').val();
		$('#output').val(encrypt(inputText));
	});
	$('#decrypt').click(function(e){
		e.preventDefault();
		var inputText = $('#input').val();
		$('#output').val(decrypt(inputText));
	});

	$('#copy').click(function(e){
		e.preventDefault();
		$('#output').select();
		document.execCommand('copy');
		alert('Text has been copied.')
	});
});
