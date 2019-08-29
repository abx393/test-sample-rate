var gumStream;

//stream from getUserMedia() 
var rec; //Recorder.js object 

var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("start");
var stopButton = document.getElementById("stop");

var osc; //oscillator- later used to play tone
var freq = 10000;
const volume = 0.5; //volume of tone
const type = 'sine'; //type of tone
var audioCtx;
var startTime=0;
var endTime=0;

function startTone(){
	audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
	
	osc = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    
	osc.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	gainNode.gain.value = volume;
	osc.frequency.value = freq;
	osc.type = type;

	if (osc.noteOn) osc.noteOn(0); //old browsers
	if (osc.start) osc.start(); //new browsers
}

function stopTone() {
	if (osc.noteOff) osc.noteOff(0); //old browsers
        if (osc.stop) osc.stop(); //new browsers
}

function startRecording() {
	
	startTone(); //start playing a tone
	console.log("start button clicked");
	
	
	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
	var constraints = { audio: true, video:false }

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();
		
		//  assign to gumStream for later use  
		gumStream = stream;
		
		// use the stream 
		input = audioContext.createMediaStreamSource(stream);
		 
		//Create the Recorder object and configure to record mono sound (1 channel)
		rec = new Recorder(input,{numChannels:1})
		//start the recording process
		rec.record()
		console.log("Recording started");
        startTime = new Date().getTime()/1000;
        document.getElementById('starttime').innerHTML = "Start time: " + startTime;
	}).catch(function(err) {
    		console.log(err);
	});
}

function stopRecording() {
	console.log("stopButton clicked");
    endTime = new Date().getTime()/1000;
    document.getElementById('endtime').innerHTML = "End time: " + endTime;
	//tell the recorder to stop the recording
	rec.stop(); //stop microphone access
	stopTone();
	
	gumStream.getAudioTracks()[0].stop();
    
	//create the wav blob, callback function: classifyPressListener, which creates an event listener for "Classify" button press
	rec.exportWAV(readBlob);
}

function readBlob(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.addEventListener("loadend", countSamples);
}
function countSamples() {
    var buffer = this.result;
    document.getElementById('buffer').innerHTML = "Buffer length: " + buffer.byteLength;
    document.getElementById('rate').innerHTML = "Sample rate: " + buffer.byteLength/(endTime-startTime);
    
    
}

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);