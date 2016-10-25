
var source = new WaBufferSourceNode();
var split = audioCtx.createChannelSplitter(2);
var merge = audioCtx.createChannelMerger(2);
source.connect(split);
var left = audioCtx.createAnalyser();
var right = audioCtx.createAnalyser();
split.connect(left, 0);
split.connect(right, 1);
left.connect(merge, 0, 0);
right.connect(merge, 0, 1);
merge.connect(audioCtx.destination);
var leftArr = new Float32Array(1024);
var rightArr = new Float32Array(1024);


source.loadFromURL('stereo.wav', function(){
	source.play(0);
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


function drawCanvas(){
	canvasContext.fillStyle = 'rgb(0, 0, 0)';
	canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
	canvasContext.fillStyle = 'rgba(0, 255, 0, 0.5)';
	drawVectorscope(canvasContext, left, right);


	canvas2Context.fillStyle = 'rgb(0, 0, 0)';
	canvas2Context.fillRect(0, 0, canvas2Width, canvas2Height);
	canvas2Context.fillStyle = 'rgb(0, 255, 0)';
	drawPeak(canvas2Context, left, right);

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

	drawCanvas();


});

