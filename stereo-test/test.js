
var source = new WaBufferSourceNode();
var split = audioCtx.createChannelSplitter(2);
var merge = audioCtx.createChannelMerger(2);
source.connect(split);
var left = audioCtx.createAnalyser();
var right = audioCtx.createAnalyser();
left.fftSize = 8192;
right.fftSize = 8192;
split.connect(left, 0);
split.connect(right, 1);
left.connect(merge, 0, 0);
right.connect(merge, 0, 1);
merge.connect(audioCtx.destination);
var leftArr = new Float32Array(left.frequencyBinCount);
var rightArr = new Float32Array(right.frequencyBinCount);
//CRAPvvv
emptySrc = new WaBufferSourceNode();
emptySrc.buffer = audioCtx.createBuffer(2, 22050, 44100);
emptySrc.connect(split);
emptySrc.play()
//CRAP^^^


source.loadFromURL('stereo.wav', function(){
	source.play();
});

document.getElementById('btn').onclick = function(){
	left.getFloatTimeDomainData(leftArr);
	right.getFloatTimeDomainData(rightArr);
	var arraysEqual = function(arr1, arr2){
		for (var i = 0; i < arr1.length; i++) {
			if( arr1[i] !== arr2[i] ){
				return false;
			}
		};
		return true;
	}
	console.log(leftArr);
	console.log(rightArr);
	console.log(arraysEqual(leftArr, rightArr));
}

var canvas = document.getElementById('content');
var canvasWidth;
var canvasHeight;
var canvasMidHeight;
var canvasContext;



var canvas2 = document.getElementById('peak');
var canvas2Width;
var canvas2Height;
var canvas2MidHeight;
var canvas2Context;


var canvas3 = document.getElementById('level');
var canvas3Width;
var canvas3Height;
var canvas3MidHeight;
var canvas3Context;



var canvas4 = document.getElementById('spectro');
var canvas4Width;
var canvas4Height;
var canvas4MidHeight;
var canvas4Context;


function drawVectorscope(ctx, left, right){
	var leftArr = new Float32Array(left.frequencyBinCount);
	var rightArr = new Float32Array(left.frequencyBinCount);
	var x, y;
	left.getFloatTimeDomainData(leftArr);
	right.getFloatTimeDomainData(rightArr);

	canvasContext.save();
	canvasContext.translate(canvasWidth/2, canvasWidth/2);
	canvasContext.rotate(- Math.PI/4);
	canvasContext.translate(-canvasWidth/2, -canvasWidth/2);

	canvasContext.beginPath();
	for (var i = 0; i < leftArr.length; i++) {
		x = canvasMidHeight + rightArr[i] * canvasMidHeight;
		y = canvasMidWidth - leftArr[i] * canvasMidWidth;
		rightArr[i];
		/* for lnes
		if(i === 0 )
			ctx.moveTo(x, y);
		else
			ctx.lineTo(x, y);
		*/
		ctx.fillRect(x, y, 2, 2);
	};
	//for lines
	//ctx.stroke();


	canvasContext.restore();
}


//note: currently draws peak amplitude as a float, not in decibels 
function drawPeak(ctx, left, right){
	var maxLeft, maxRight;
	var leftArr = new Float32Array(left.frequencyBinCount);
	var rightArr = new Float32Array(left.frequencyBinCount);
	left.getFloatTimeDomainData(leftArr);
	right.getFloatTimeDomainData(rightArr);

	for (var i = 0; i < leftArr.length; i++) {
		if( i === 0 ){
			maxLeft = Math.abs(leftArr[i]);
			maxRight = Math.abs(rightArr[i]);
		}
		else{
			maxLeft = Math.abs(leftArr[i]) > maxLeft ? Math.abs(leftArr[i]) : maxLeft;
			maxRight = Math.abs(rightArr[i]) > maxRight ? Math.abs(rightArr[i]) : maxRight; 
		}
	}
	ctx.fillRect(0, canvas2Height * (1 - maxLeft ), canvas2MidWidth, canvas2Height * (maxLeft) + 10);
	ctx.fillRect(canvas2MidWidth, canvas2Height * (1 - maxRight ), canvas2MidWidth, canvas2Height * (maxRight) + 10);
}

function drawLevelGraph(ctx, left, right){
	var maxLeft, maxRight;
	var leftArr = new Float32Array(left.frequencyBinCount);
	var rightArr = new Float32Array(left.frequencyBinCount);
	left.getFloatTimeDomainData(leftArr);
	right.getFloatTimeDomainData(rightArr);

	for (var i = 0; i < leftArr.length; i++) {
		if( i === 0 ){
			maxLeft = Math.abs(leftArr[i]);
			maxRight = Math.abs(rightArr[i]);
		}
		else{
			maxLeft = Math.abs(leftArr[i]) > maxLeft ? Math.abs(leftArr[i]) : maxLeft;
			maxRight = Math.abs(rightArr[i]) > maxRight ? Math.abs(rightArr[i]) : maxRight; 
		}
	}

	var max = Math.max(maxLeft, maxRight);
	ctx.fillRect(canvas3Width - 1, canvas3Height * (1 - max), 1, canvas3Height * max);
}

function drawSpectrogram(ctx, analyser){
	var dataArray = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(dataArray);
	var barWidth;
	var barHeight = canvas4Width;
	var colorStrength;
	var x = 0;         //pixel on x-axis of canvas
	var startFreq = 0; //start of current band's frequency range
	var stopFreq;      //end of current band's frequency range
	var minFreq = 20;
	var maxFreq = 20480;
	var bufferLength = analyser.frequencyBinCount;
	var minDB = -50;
	var maxDB = 0;
	var slope = 3;
	var sampleRate = audioCtx.sampleRate;

	for(var i = 0; i < bufferLength; i++) {
		colorStrength = 1/(maxDB - minDB)*((dataArray[i]+ slope*Math.log2(i + 1)) - minDB);

		stopFreq = startFreq + sampleRate / (2 * bufferLength);

		if( startFreq === 0 )
			x = 0;
		else
			x = canvas4Height - canvas4Height * Math.log2(startFreq/minFreq) / Math.log2(maxFreq / minFreq) - 1; //20hz to 20480hz (20*2^10)

		barWidth = canvas4Height - canvas4Height * Math.log2(stopFreq/minFreq) / Math.log2(maxFreq / minFreq) - x + 1;
		ctx.fillStyle = 'rgba(0, 255, 0, ' + colorStrength + ')';
		ctx.fillRect(canvas4Width -1, x, 1, barWidth);
		startFreq = stopFreq;

	}
}


function drawCanvas(){
	canvasContext.fillStyle = 'rgb(0, 0, 0)';
	canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
	canvasContext.fillStyle = 'rgba(0, 255, 0, 0.5)';
	drawVectorscope(canvasContext, left, right);


	canvas2Context.fillStyle = 'rgb(0, 0, 0)';
	canvas2Context.fillRect(0, 0, canvas2Width, canvas2Height);
	canvas2Context.fillStyle = 'rgb(0, 255, 0)';
	drawPeak(canvas2Context, left, right);



	canvas3Context.drawImage(canvas3, 0, 0, canvas3Width, canvas3Height, -1, 0, canvas3Width, canvas3Height);
	canvas3Context.fillStyle = 'rgb(0, 0, 0)';
	canvas3Context.fillRect(canvas3Width - 1, 0, 1, canvas3Height);
	canvas3Context.fillStyle = 'rgb(0, 255, 0)';
	drawLevelGraph(canvas3Context, left, right);


	canvas4Context.drawImage(canvas4, 0, 0, canvas4Width, canvas4Height, -1, 0, canvas4Width, canvas4Height);
	canvas4Context.fillStyle = 'rgb(0, 0, 0)';
	canvas4Context.fillRect(canvas4Width - 1, 0, 1, canvas4Height);
	canvas4Context.fillStyle = 'rgb(0, 255, 0)';
	drawSpectrogram(canvas4Context, left, right);

	requestAnimationFrame(drawCanvas);
}

$(document).ready(function(){
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasMidHeight = canvasHeight/2;
	canvasMidWidth = canvasWidth/2;
	canvasContext = canvas.getContext('2d');
    canvasContext.lineWidth = 2;
    canvasContext.lineJoin = 'round';
	canvasContext.strokeStyle = 'rgb(0, 255, 0)';



	canvas2Width = canvas2.width;
	canvas2Height = canvas2.height;
	canvas2MidHeight = canvas2Height/2;
	canvas2MidWidth = canvas2Width/2;
	canvas2Context = canvas2.getContext('2d');
    canvas2Context.lineWidth = 2;
    canvas2Context.lineJoin = 'round';
	canvas2Context.strokeStyle = 'rgb(0, 255, 0)';


	canvas3Width = canvas3.width;
	canvas3Height = canvas3.height;
	canvas3MidHeight = canvas3Height/2;
	canvas3MidWidth = canvas3Width/2;
	canvas3Context = canvas3.getContext('2d');
    canvas3Context.lineWidth = 2;
    canvas3Context.lineJoin = 'round';
	canvas3Context.strokeStyle = 'rgb(0, 255, 0)';

	canvas3Context.fillStyle = 'rgb(0, 0, 0)';
	canvas3Context.fillRect(0, 0, canvas3Width, canvas3Height);

	canvas4Width = canvas4.width;
	canvas4Height = canvas4.height;
	canvas4MidHeight = canvas4Height/2;
	canvas4MidWidth = canvas4Width/2;
	canvas4Context = canvas4.getContext('2d');
    canvas4Context.lineWidth = 2;
    canvas4Context.lineJoin = 'round';
	canvas4Context.strokeStyle = 'rgb(0, 255, 0)';

	canvas4Context.fillStyle = 'rgb(0, 0, 0)';
	canvas4Context.fillRect(0, 0, canvas4Width, canvas4Height);

	drawCanvas();


});

