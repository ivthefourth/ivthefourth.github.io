/*
***
***  Visualization Functions
***
*/



function drawSpectrum(canvasContext, canvasWidth, 
	canvasHeight, minDB, maxDB, slope, bufferLength, dataArray, sampleRate){
	var barWidth;
	var barHeight;
	var x = 0;         //pixel on x-axis of canvas
	var startFreq = 0; //start of current band's frequency range
	var stopFreq;      //end of current band's frequency range

	for(var i = 0; i < bufferLength; i++) {
		barHeight =  canvasHeight * 1/(maxDB - minDB)*((dataArray[i]+ slope*Math.log2(i + 1)) - minDB);

		stopFreq = startFreq + sampleRate / (2 * bufferLength);

		if( startFreq === 0 )
			x = 0;
		else
			x = canvasWidth * Math.log2(startFreq/20) / 10 - 1; //20hz to 20480hz

		barWidth = canvasWidth * Math.log2(stopFreq/20) / 10 - x + 1;
		canvasContext.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
		startFreq = stopFreq;

	}
}


//resources:
//http://rs-met.com/documents/dsp/BasicDigitalFilters.pdf
// #18 in above link
//normalize coefficients so that a0 is = 1. 
//divide all coefficients by a0
//http://dsp.stackexchange.com/questions/3091/plotting-the-magnitude-response-of-a-biquad-filter
//https://www.w3.org/TR/webaudio/#filters-characteristics
//note aB equation is WRONG for LP and HP in w3 spec see edits to sB in switch
//https://github.com/WebAudio/web-audio-api/issues/769
function drawCurve(canvasContext, canvasWidth, canvasHeight, Fs, minDB, maxDB, filterArr){
	canvasContext.beginPath();

	var canvasMidHeight = canvasHeight / 2;
	for( var i = -10; i < canvasWidth + 10; i++){// draw beyond canvas so curve looks nicer
		var dBMagnitude = 1;

		//frequencies from 20 to 20480 are drawn across length of canvas
		var wi = 20 * Math.pow(2, (i / canvasWidth)*10) * 2 * Math.PI / Fs;
		for( var j = 0; j < filterArr.length; j++){
			var currentFilter = filterArr[j];
			var A = Math.pow(10, currentFilter.gain.value / 40);
			var w0 = Math.PI * 2 * currentFilter.getComputedFrequency() / Fs;
			var aQ = Math.sin(w0) / ( 2 * currentFilter.Q.value );
			var aB = Math.sin(w0) / 2 * Math.sqrt( 
				(4 - Math.sqrt(16 - 16 / Math.pow(currentFilter.gain.value, 2))) / 2 );
			var S = 1;
			var aS = Math.sin(w0) / 2 * Math.sqrt( 
				(A + 1 / A) * (1 / S - 1) + 2); //could just be sqrt(2)
			var a0, a1, a2, b0, b1, b2;
			switch(currentFilter.type.value){
				case 'peaking':
					b0 = 1 + aQ * A;
					b1 = -2 * Math.cos(w0);
					b2 = 1 - aQ * A;
					a0 = 1 + aQ / A;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ / A;
					break;
				case 'lowpass':
					var G = Math.pow(10, 0.05 * currentFilter.Q.value);
					aB = Math.sin(w0) / 2 * Math.sqrt( 
						(4 - Math.sqrt(16 - 16 / Math.pow(G, 2))) / 2 );
					b0 = (1 - Math.cos(w0)) / 2;
					b1 = 1 - Math.cos(w0);
					b2 = (1 - Math.cos(w0)) / 2;
					a0 = 1 + aB;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aB;
					break;
				case 'highpass':
					var G = Math.pow(10, 0.05 * currentFilter.Q.value);
					aB = Math.sin(w0) / 2 * Math.sqrt( 
						(4 - Math.sqrt(16 - 16 / Math.pow(G, 2))) / 2 );
					b0 = (1 + Math.cos(w0)) / 2;
					b1 = -(1 + Math.cos(w0));
					b2 = (1 + Math.cos(w0)) / 2;
					a0 = 1 + aB;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aB;
					break;
				case 'lowshelf':
					b0 = A * ((A + 1) - (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A));
					b1 = 2 * A * ((A - 1) - (A + 1) * Math.cos(w0));
					b2 = A * ((A + 1) - (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A));;
					a0 = (A + 1) + (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A);
					a1 = -2 * ((A - 1) + (A + 1) * Math.cos(w0));
					a2 = (A + 1) + (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A);
					break;
				case 'highshelf':
					b0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A));
					b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0));
					b2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A));;
					a0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * aS * Math.sqrt(A);
					a1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0));
					a2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * aS * Math.sqrt(A);
					break;
				case 'bandpass':
					b0 = aQ;
					b1 = 0;
					b2 = -aQ;
					a0 = 1 + aQ;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ;
					break;
				case 'notch':
					b0 = 1;
					b1 = -2 * Math.cos(w0);
					b2 = 1;
					a0 = 1 + aQ;
					a1 = -2 * Math.cos(w0);
					a2 = 1 - aQ;
					break;
			}
			b0 /= a0;
			b1 /= a0;
			b2 /= a0;
			a1 /= a0;
			a2 /= a0;
			a0 = 1;

			var numerator = b0*b0 + b1*b1 + b2*b2 + 2*(b0*b1 + b1*b2)*Math.cos(wi) + 2*b0*b2*Math.cos(2*wi);
			var denominator = 1 + a1*a1 + a2*a2 + 2*(a1 + a1*a2)*Math.cos(wi) + 2*a2*Math.cos(2*wi);
			dBMagnitude *= Math.sqrt(numerator / denominator);
		}
		dBMagnitude = 20 * Math.log10(dBMagnitude);
		if( i === -10)
			canvasContext.moveTo(i, canvasMidHeight - dBMagnitude / (maxDB - minDB) * canvasHeight);
		else
			canvasContext.lineTo(i, canvasMidHeight - dBMagnitude / (maxDB - minDB) * canvasHeight);
	}

	canvasContext.stroke();
}
