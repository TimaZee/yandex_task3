/**
*
* Create by Zhussupov Temirlan
* ***** zhusupovta@gmail.com *****
*
* Audio Player with Web Audio API.
*
*/


var mouseX = 0, mouseY = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, container;
var source;
var analyser;
var buffer;
var audioBuffer;
var audioContext;
var started = false;
var please;
var array;
var trigger = false;
var bufferLength;
var fileName = null;
var managerBut = null;
var ctx = null,
	canva = null;
$(document).ready(function() {
	init();
});
//Основная функция
function init() {

	//Get an Audio Context
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new window.AudioContext();
	} catch(e) {
		//Web Audio API is not supported in this browser
		$("#prompt").html("Sorry!<br>This browser does not support the Web Audio API. <br>Please use Chrome, Safari or Firefox or Yandex.Browser.");
		return;
	}
	document.getElementById('loadFile').onchange = function(){fileName = $('#loadFile')[0].files[0];};

	$('#prompt').html('drop mp3 here');

	initCanvas(document.querySelector("#target"));

	//init audio
	analyser = audioContext.createAnalyser();
	analyser.smoothingTimeConstant = 0.1;
	analyser.fftSize = 1024;

	please = document.querySelector('input[type=file]');
	managerBut = document.querySelector('button[data-type=play]');

	container = document.createElement('div');
	document.body.appendChild(container);

	// stop the user getting a text cursor
	document.onselectStart = function() {
		return false;
	};

	//init listeners
	$("#loadFile").click(please.addEventListener('change',addFileToPlay,false));

	$(document).mousemove(onDocumentMouseMove);
	document.addEventListener('click',manager,false);
	container.addEventListener( 'touchstart', onDocumentTouchStart, false );
	container.addEventListener( 'touchmove', onDocumentTouchMove, false );

	$(window).resize(onWindowResize);
	document.addEventListener('drop', onMP3Drop, false);
	document.addEventListener('dragover', onDocumentDragOver, false);

	onWindowResize(null);

}
function manager (){
	if(trigger === true) {
		$('playManagment').click(managerBut.addEventListener('click', StopPlayButton, false));
	}
}
function addFileToPlay (evt) {
	evt.stopPropagation();
	evt.preventDefault();

	trigger = true;

	managerBut.setAttribute('data-type', 'stop');
	managerBut.innerHTML = 'stop';

	if(source)
	{
		source.stop();
		source.disconnect();
		source = !source;
	}

	var droppedFiles = evt.target.files[0] || (evt.dataTransfer.files[0] && evt.originalEvent.dataTransfer.files);
	var reader = new FileReader();
	reader.responseType = "arraybuffer";
	reader.onload = function(Event) {
		var data = Event.target.result;
		onDroppedMP3Loaded(data);
	};
	reader.readAsArrayBuffer(droppedFiles);
}

function onDroppedMP3Loaded(data) {
	audioContext.decodeAudioData(data, function(buffer) {
		audioBuffer = buffer;
		startSound();
	}, function(e) {
		$('#prompt').text("cannot decode mp3");
		console.log(e);
	});
	
}

function startSound() {
	$('#info').show();
	$('#info').text(fileName.name);

	if (source){
		source.stop(0.0);
		source.disconnect();
	}
	else{
	// Connect audio processing graph
	source = audioContext.createBufferSource();	
	source.connect(audioContext.destination);
	source.connect(analyser);
	source.buffer = audioBuffer;
	source.loop = true;
	source.start(0.0);
	// Вызов визуалайзера
	bufferLength = analyser.frequencyBinCount;
	array = new Uint8Array(bufferLength);
	analyser.getByteFrequencyData(array);
	drawSpectrum(analyser); }
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX);
	mouseY = (event.clientY - windowHalfY);
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}

function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}

function onWindowResize(event) {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
}

//Когда навели песню в окно браузера
function onDocumentDragOver(evt) {
	$('#prompt').show();
	$('#prompt').text("drop MP3 here");
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}
//Положили файл в браузер
function onMP3Drop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	$('#prompt').show();
	$('#prompt').text("loading...");

	managerBut.setAttribute('data-type', 'stop');
	managerBut.innerHTML = 'stop';
	trigger = true;
	if(source)
	{
		source.stop();
		source.disconnect();
		source = !source;
	}

	fileName = evt.dataTransfer.files[0];

	var droppedFiles = evt.dataTransfer.files;
	var reader = new FileReader();
	reader.onload = function(fileEvent) {
		var data = fileEvent.target.result;
		onDroppedMP3Loaded(data);
	};
	reader.readAsArrayBuffer(droppedFiles[0]);
}

var initCanvas = function (el) {
	el = el || document.body;
	canva = document.createElement("canvas");
	canva.setAttribute('id','canvas')
	ctx = canva.getContext("2d");
	canva.width = 1000;
	canva.height = 250;
	el.appendChild(canva);
};

function drawSpectrum (analyser) {
	var that = this,
		canva = document.getElementById('canvas'),
		cwidth = canva.width,
		cheight = canva.height - 2,
		meterWidth = 10,
		gap = 2,
		capHeight = 2,
		capStyle = '#fff',
		meterNum = 800 / (10 + 2),
		capYPositionArray = [];
	ctx = canvas.getContext('2d'),
		gradient = ctx.createLinearGradient(0, 0, 0, 300);
	gradient.addColorStop(1, '#0f0');
	gradient.addColorStop(0.5, '#ff0');
	gradient.addColorStop(0, '#f00');
	var drawMeter = function() {
		var array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		if (that.status === 0) {

			for (var i = array.length - 1; i >= 0; i--) {
				array[i] = 0;
			};
			allCapsReachBottom = true;
			for (var i = capYPositionArray.length - 1; i >= 0; i--) {
				allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
			};
			if (allCapsReachBottom) {
				cancelAnimationFrame(that.animationId);
				return;
			};
		};
		var step = Math.round(array.length / meterNum); //sample limited data from the total array
		ctx.clearRect(0, 0, cwidth, cheight);
		for (var i = 0; i < meterNum; i++) {
			var value = array[i * step];
			if (capYPositionArray.length < Math.round(meterNum)) {
				capYPositionArray.push(value);
			};
			ctx.fillStyle = capStyle;
			//draw the cap, with transition effect
			if (value < capYPositionArray[i]) {
				ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
			} else {
				ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
				capYPositionArray[i] = value;
			};
			ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
			ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
		}
		that.animationId = requestAnimationFrame(drawMeter);
	}
	this.animationId = requestAnimationFrame(drawMeter);
}
//Кнопки остановки и воспроизведениея
function StopPlayButton () {
	var type = this.getAttribute('data-type');

	switch (type) {
		case "stop":
			this.setAttribute('data-type', 'play');
			this.innerHTML = 'play';
			startSound();
			break;
		case "play":
			source = !source;
			this.setAttribute('data-type', 'stop');
			this.innerHTML = 'stop';
			startSound();
			break;
	}
}