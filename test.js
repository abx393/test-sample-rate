//webkitURL is deprecated but nevertheless 
var URL = window.URL || window.webkitURL;
var gumStream;

//stream from getUserMedia() 
var rec; //Recorder.js object 

var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var recordContext = new AudioContext;
var playContext;

var startTone = function() {
    playContext = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
    
    rec.record();
    const start = new Date();
    const volume = 10.0;
    const type = 'sine';
    const freq = 300;


    var osc = playContext.createOscillator();
    var gainNode = playContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(playContext.destination);

    gainNode.gain.value = volume;
    osc.frequency.value = freq;
    osc.type = type;

    if (osc.noteOn) osc.noteOn(0); //old browsers
    if (osc.start) osc.start(); //new browsers

    while (new Date() - start<3000) {} //wait 3000 ms

    osc.stop();
    rec.stop();
    gumStream.getAudioTracks()[0].stop();
}

function startRecording() {
	
    
	var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		
		recordContext = new AudioContext();
		
		//  assign to gumStream for later use  
		gumStream = stream;
		
		// use the stream 
		input = recordContext.createMediaStreamSource(stream);
		 
		//Create the Recorder object and configure to record mono sound (1 channel)
		rec = new Recorder(input,{numChannels:1})
		
        console.log("Recording started");
        startTone(); //start playing a tone
    
        console.log("Recording stopped.")
        
        rec.exportWAV(readBlob);
	}).catch(function(err) {
    		console.log(err);
	});
}

function readBlob(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.addEventListener("loadend", countSamples);
}
function countSamples() {
    var buffer = this.result;
    document.getElementById('buffer').innerHTML = "Buffer length: " + buffer.byteLength;
    document.getElementById('rate').innerHTML = "Sample rate: " + buffer.byteLength/3;
}
document.getElementById('start').addEventListener("click", startRecording);
