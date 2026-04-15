
//Variable Initialization
var audioCtx; //= new (window.AudioContext || window.webkitAudioContext)();
//audioCtx = new (window.AudioContext || window.webkitAudioContext);
var brookGain;
var brookPlaying = false;


//Babbling brook Sound
function initAudio_brook() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    
    //Init brown noise 1
    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    //Init brown noise 2
    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer3 = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output3 = noiseBuffer3.getChannelData(0);

    lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output3[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output3[i];
        output3[i] *= 3.5;
    }

    brownNoise2 = audioCtx.createBufferSource();
    brownNoise2.buffer = noiseBuffer3;
    brownNoise2.loop = true;

    //Init all ones noise
    var bufferSize2 = 10 * audioCtx.sampleRate,
    noiseBuffer2 = audioCtx.createBuffer(1, bufferSize2, audioCtx.sampleRate),
    output2 = noiseBuffer2.getChannelData(0);


    for (var i = 0; i < bufferSize2; i++) {
        output2[i] = 1;
    }

    allOnesNoise = audioCtx.createBufferSource();
    allOnesNoise.buffer = noiseBuffer2;
    allOnesNoise.loop = true;

    
    //Create first LPF
    var filter1 = audioCtx.createBiquadFilter();
    filter1.type = "lowpass"; // LOW PASS
    filter1.frequency.value = 400;

    //Create second LPF
    var filter2 = audioCtx.createBiquadFilter();
    filter2.type = "lowpass"; // LOW PASS
    filter2.frequency.value = 14;
    
    const filter2gain = audioCtx.createGain();
    filter2gain.gain.value = 1200;
    

    //Connecting up filter 1+2
    brownNoise.connect(filter1);
    brownNoise2.connect(filter2);
    filter2.connect(filter2gain);

    //Creating RHPF
    var filter3 = audioCtx.createBiquadFilter();
    filter3.type = "highpass";
    filter3.Q.value = 33.33;
    filter3.frequency.value = 0; 

    //Doing the plus 500 (DC offset via allOnesNoise * 500)
    const filter2gain2 = audioCtx.createGain();
    filter2gain2.gain.value = 500;
    allOnesNoise.connect(filter2gain2);

    filter2gain.connect(filter3.frequency);
    filter2gain2.connect(filter3.frequency);

    // Master gain: start silent and fade in to avoid click on first play
    brookGain = audioCtx.createGain();
    brookGain.gain.value = 0;

    filter1.connect(filter3);
    filter3.connect(brookGain);
    brookGain.connect(audioCtx.destination);

    allOnesNoise.start(0);
    brownNoise.start(0);
    brownNoise2.start(0);

    // Fade in (time constant ~30ms)
    brookGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.03);
    brookPlaying = true;
}

//Babbling brook button handeling
var brookButton = document.getElementById("brookbutton");

brookButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio_brook();
        return;
    }
    if (brookPlaying) {
        // Fade out then suspend
        brookGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
        brookPlaying = false;
    } else {
        // Resume and fade in
        audioCtx.resume();
        brookGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.03);
        brookPlaying = true;
    }

}, false);

//Bell Sound -------------------------------------------------------------------------

var bellGain;
var bellPlaying = false;

//Bell sound parameters
var freq = 440;

function initAudio_bell() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);

    // Master gain: start silent and fade in to avoid click on first play
    bellGain = audioCtx.createGain();
    bellGain.gain.value = 0;
    bellGain.connect(audioCtx.destination);
    
    osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc1.connect(bellGain);
    osc1.start();

    // Fade in (time constant ~30ms)
    bellGain.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.03);
    bellPlaying = true;
}

//Bell button handeling
var bellButton = document.getElementById("bellbutton");

bellButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio_bell();
        return;
    }
    if (bellPlaying) {
        // Fade out then suspend
        bellGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
        bellPlaying = false;
    } else {
        // Resume and fade in
        audioCtx.resume();
        bellGain.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.03);
        bellPlaying = true;
    }

}, false);
