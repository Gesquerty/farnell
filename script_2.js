document.addEventListener("DOMContentLoaded", async function(event) {
    //Variable Initialization
    //var audioCtx; //= new (window.AudioContext || window.webkitAudioContext)();
    //audioCtx = new (window.AudioContext || window.webkitAudioContext);
    var brookGain;
    var brookPlaying = false;
    
    
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    
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
    //brookGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.03);
    //brookPlaying = true;
    
    //Babbling brook button handeling
    var brookButton = document.getElementById("brookbutton");
    
    brookButton.addEventListener('click', function () {
        audioCtx.resume()
        /*if (!audioCtx) {
            initAudio_brook();
            return;
        }*/
        if (brookPlaying) {
            // Fade out then suspend
            brookGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
            brookPlaying = false;
        } else {
            // Resume and fade in
            //audioCtx.resume();
            brookGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.03);
            brookPlaying = true;
        }
    
    }, false);
    
    //Bell Sound -------------------------------------------------------------------------
    
    var bellGain;
    var bellPlaying = false;
    
    var dim1 = 0.9; //Tunes fm modulator
    var dim2 = 3; //Tunes square wave frequency
    
    //Bell sound parameters
    var bellgain = 0.4;
    
    var attackBell = 0.01;
    var decayBell = 2.5;
    var sustainBell = 1.0;
    var releaseBell = 1;
    
    var freq1 = 440;
    var attack1 = 0.01;
    var decay1 = 1.0;
    var sustain1 = 0.001;
    var release1 = 0.3;
    
    var freq1fm = 440*dim1; //dim 1
    var gain1fm = 100;
    var attack1fm = 0.01;
    var decay1fm = 1.5;
    var sustain1fm = 0.75;
    var release1fm = 1.5;
    
    var freq2 = 440*dim2;
    var attack2 = 0.01;
    var decay2 = 0.05;
    var sustain2 = 0.0;
    var release2 = 1;
    var gain2 = 0.5;
    var lpf2 = 440*1;
    
    /*
    var freq2fm = 440;
    var gain2fm = 100;
    var attack2fm = 0.01;
    var decay2fm = 0.5;
    var sustain2fm = 0.2;
    var release2fm = 1.5;
    */
    
    // Master gain: start silent and fade in to avoid click on first play
    bellGain = audioCtx.createGain();
    bellGain.gain.value = 0;
    bellGain.connect(audioCtx.destination);
    
    
    //Oscillator 1
    osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, audioCtx.currentTime);
    osc1.start();
    
    osc1Gain = audioCtx.createGain();
    osc1Gain.gain.value = 1;
    osc1.connect(osc1Gain);
    osc1Gain.connect(bellGain);
    
    //Oscillator 1 FM
    osc1fm = audioCtx.createOscillator();
    osc1fm.type = 'sine';
    osc1fm.frequency.setValueAtTime(freq1fm, audioCtx.currentTime);
    osc1fm.start();
    
    osc1fmGain = audioCtx.createGain();
    osc1fmGain.gain.value = gain1fm;
    osc1fm.connect(osc1fmGain);
    osc1fmGain.connect(osc1.frequency);
    
    //Square wave oscillator 2
    osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq2, audioCtx.currentTime);
    osc2.start();
    
    var osc2Filter = audioCtx.createBiquadFilter();
    osc2Filter.type = "lowpass";
    osc2Filter.Q.value = 1;
    osc2Filter.frequency.value = lpf2; 
    
    osc2Gain = audioCtx.createGain();
    osc2Gain.gain.value = gain2;
    osc2.connect(osc2Filter);
    osc2Filter.connect(osc2Gain);
    osc2Gain.connect(bellGain);
    
    //Oscillator 2 FM
    
    
    //Bell Hitting Functions
    
    var bellhitTime = 0;
    
    
    function hitBellForward() {
        bellhitTime = audioCtx.currentTime;
    
        gainRn = osc1fmGain.gain.value;
        osc1fmGain.gain.setTargetAtTime(gain1fm, audioCtx.currentTime, attack1fm*Math.min(Math.max(1-gainRn/gain1fm, 0.01), 1));
        osc1fmGain.gain.setTargetAtTime(gain1fm * sustain1fm, audioCtx.currentTime + attack1fm, decay1fm);
        osc1fmGain.gain.setTargetAtTime(0, audioCtx.currentTime + attack1fm + decay1fm, release1fm);
    
        gainRn = osc1Gain.gain.value;
        osc1Gain.gain.setTargetAtTime(1, audioCtx.currentTime, attack1*Math.min(Math.max(1-gainRn, 0.01), 1));
        osc1Gain.gain.setTargetAtTime(1 * sustain1, audioCtx.currentTime + attack1, decay1);
        osc1Gain.gain.setTargetAtTime(0, audioCtx.currentTime + attack1 + decay1, release1);
    
        gainRn = osc2Gain.gain.value;
        osc2Gain.gain.setTargetAtTime(gain2, audioCtx.currentTime, attack2*Math.min(Math.max(1-gainRn/gain2, 0.01), 1));
        osc2Gain.gain.setTargetAtTime(gain2 * sustain2, audioCtx.currentTime + attack2, decay2);
        osc2Gain.gain.setTargetAtTime(0, audioCtx.currentTime + attack2 + decay2, release2);
    
        gainRn = bellGain.gain.value;
        bellGain.gain.setTargetAtTime(bellgain, audioCtx.currentTime, attackBell*Math.min(Math.max(1-gainRn/bellgain, 0.01), 1));
        bellGain.gain.setTargetAtTime(bellgain * sustainBell, audioCtx.currentTime + attackBell, decayBell);
        bellGain.gain.setTargetAtTime(0, audioCtx.currentTime + attackBell + decayBell, releaseBell);
    }
    
    /*
    function hitBellBackward() {
    
    
        gainRn = osc1fmGain.gain.value;
        osc1fmGain.gain.setTargetAtTime(gain1fm, audioCtx.currentTime, attack1fm*Math.min(Math.max(1-gainRn/gain1fm, 0.01), 1));
        osc1fmGain.gain.setTargetAtTime(gain1fm * sustain1fm, audioCtx.currentTime + attack1fm, decay1fm);
        osc1fmGain.gain.setTargetAtTime(0, audioCtx.currentTime + attack1fm + decay1fm, release1fm);
    
        gainRn = osc1Gain.gain.value;
        osc1Gain.gain.setTargetAtTime(1, audioCtx.currentTime, attack1*Math.min(Math.max(1-gainRn, 0.01), 1));
        osc1Gain.gain.setTargetAtTime(1 * sustain1, audioCtx.currentTime + attack1, decay1);
        osc1Gain.gain.setTargetAtTime(0, audioCtx.currentTime + attack1 + decay1, release1);
    
        gainRn = osc2Gain.gain.value;
        osc2Gain.gain.setTargetAtTime(gain2, audioCtx.currentTime, attack2*Math.min(Math.max(1-gainRn/gain2, 0.01), 1));
        osc2Gain.gain.setTargetAtTime(gain2 * sustain2, audioCtx.currentTime + attack2, decay2);
        osc2Gain.gain.setTargetAtTime(0, audioCtx.currentTime + attack2 + decay2, release2);
    
        gainRn = bellGain.gain.value;
        bellGain.gain.setTargetAtTime(bellgain, audioCtx.currentTime, attackBell*Math.min(Math.max(1-gainRn/bellgain, 0.01), 1));
        bellGain.gain.setTargetAtTime(bellgain * sustainBell, audioCtx.currentTime + attackBell, decayBell);
        bellGain.gain.setTargetAtTime(0, audioCtx.currentTime + attackBell + decayBell, releaseBell);
    }*/
    
    
    //Bell pad handling
    
    function xToDim1(r) {
        return 0.5*Math.pow(8, r);//-0.5); //+ 0.1;
    }
    
    function yToDim2(r) {
        return Math.pow(4, r);
    }
    
    
    var bellPad = document.getElementById("bellpad");
    
    function renderBellPad(shading) {
        var ctx = bellPad.getContext("2d");
        var w = bellPad.width;
        var h = bellPad.height;
        var imageData = ctx.createImageData(w, h);
        var data = imageData.data;
        //var shading = document.getElementById("shadingToggle").checked;
    
        for (var py = 0; py < h; py++) {
            for (var px = 0; px < w; px++) {
                var brightness;
                if (shading) {
                    var d1 = xToDim1(px / w);
                    var d2 = yToDim2(py / h);
                    var frac1 = Math.abs(d1 - Math.round(d1));
                    var frac2 = Math.abs(d2 - Math.round(d2));
                    //var closeness = (1 - 2 * frac1) * (1 - 2 * frac2);
                    //brightness = Math.round((Math.min(Math.max(0, closeness), 1)**2) * 255);
                    var closeness  = (frac1-0.5)**2 + (frac2-0.5)**2;
                    brightness = Math.round(2*closeness * 255);
                } else {
                    brightness = 170; //170 plain grey (#aaa)
                }
    
                var idx = (py * w + px) * 4;
                data[idx]     = brightness;
                data[idx + 1] = brightness;
                data[idx + 2] = brightness;
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
    
    renderBellPad(false);
    
    //document.getElementById("shadingToggle").addEventListener("change", renderBellPad);
    
    bellPad.addEventListener('mousedown', function (e) {
        audioCtx.resume()
        
        renderBellPad(true);
        
        var rect = bellPad.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        onBellPadClick(x, y);
    });
    
    bellPad.addEventListener('mouseup', function () {
        renderBellPad(false);
    });
    
    bellPad.addEventListener('click', function (e) {
        var rect = bellPad.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        //onBellPadClick(x, y);
    });
    
    function onBellPadClick(x, y) {
        console.log("Bell pad clicked at x=" + x + ", y=" + y);
    
    
        dim1 = xToDim1(x / bellPad.clientWidth);
        dim2 = yToDim2(y / bellPad.clientHeight);
    
        freq1fm = 440*dim1;
        freq2 = 440*dim2;
    
        osc1fm.frequency.setValueAtTime(freq1fm, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(freq2, audioCtx.currentTime);
    
        hitBellForward();
    }
    
    var bellPadMouseX = 0;
    var bellPadMouseY = 0;
    
    bellPad.addEventListener('mousemove', function (e) {
        var rect = bellPad.getBoundingClientRect();
        bellPadMouseX = e.clientX - rect.left;
        bellPadMouseY = e.clientY - rect.top;
        onBellPadMouseMove(bellPadMouseX, bellPadMouseY);
    });
    
    function onBellPadMouseMove(x, y) {
        var vel = 0.001;
    
        dim1 = (x / bellPad.clientWidth)+0.5; 
        dim2 = 4*(y / bellPad.clientHeight)+1; 
    
        freq1fm = (1-vel)*freq1fm+ vel*440*dim1;
        freq2 = (1-vel)*freq2+ vel*440*dim2;
    
        //osc1fm.frequency.setValueAtTime(freq1fm, audioCtx.currentTime+0.01);
        //osc2.frequency.setValueAtTime(freq2, audioCtx.currentTime+0.01);
    
    }
    
    /*
    //Bell button handeling
    var bellButtonForward = document.getElementById("bellbutton1");
    
    bellButtonForward.addEventListener('click', function () {
    
        hitBellForward();
        
    
    }, false);
    */
    /*
    var bellButtonBackward = document.getElementById("bellbutton2");
    
    bellButtonBackward.addEventListener('click', function () {
    
        hitBellBackward();
        
    
    }, false);*/
});

// One-liner to resume playback when user interacted with the page.
document.querySelector('button').addEventListener('click', function() {
  audioCtx.resume().then(() => {
    console.log('Playback resumed successfully');
  });
});
