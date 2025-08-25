class AudioRecorder{
  constructor(params){
    try{
      this.audioCtx = params.audioCtx;
    }
    catch{
      this.audioCtx;
    }
    
    this.name = "mp3 voice";
    this.micArmed = false;
    this.recording = false;
    this.playing = false;
    this.analyserNode;//mic in level
    this.volumeOutAnalizer;
    this.mediaRecorder;
    this.audio;
    this.audioChunks = [];
    this.audioBlob;
    this.audioBuffer;
    this.envelopeArray = [];
    this.voiceTrim = 0;
    this.eyesTrim = 0.3;
    this.invert = -1;
    this.mouthSync = 0;
    this.samplesPerMillisecond;
    this.textMessages = "hello. I am an animatronic head. My brain is in your phone";
    this.textMessageIndex = 0;
    this.file;
    this.audioBuffers = [];
    this.files = [];
    this.fileIndex = 1;
    
   // this.init();
    this.count = 0;
    this.lastPlay = Date.now();
    this.freq = 50;
    this.spikeChannel = 0;
    this.voiceChannel = 1;
    this.channelNames = ["L","R"];
    this.updateChannelNames();
    this.spikeThreshold = 0;
    this.spikeGain = 3;
    this.volumeMeterValue;
    this.initiated = false;
    this.gui = {};
    this.makeGui();
    //this.init(); called on first rec or setAudioBuffer as mic analyzer doesnt seem to connect
  }
  
  updateChannelNames(){
    this.channelNames[this.spikeChannel] = "spikes";
    this.channelNames[this.voiceChannel] = "voice";
  }
  
  async init(){
      if(this.initiated === false){
        this.initiated = true;
        console.log("init");
        if(this.audioCtx === undefined){
           this.audioCtx = new AudioContext();
        } 
        this.analyserNode = await this.audioCtx.createAnalyser();     
        this.pcmData = new Float32Array(this.analyserNode.fftSize); 
        this.samplesPerMillisecond = this.audioCtx.sampleRate/1000;
        //this.analyserNode.connect(this.audioCtx.destination);
        this.analize();
      }
  }
    
  
  toggleMic(){
    if(this.micArmed === false){
      
      
      this.armMic();
    }
    else{
       this.disarmMic();
    }
  }
  
  disarmMic(){
     this.micArmed = false;
      this.gui.micButton.innerHTML = "arm mic"
      this.stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'audio') {
            track.stop();
        }
    });    
  }
  
  async armMic(){ 
    this.micArmed = true;
    this.gui.micButton.innerHTML = "disarm mic"
    this.init();
    //this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    //text to speach record
    var stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    const track = stream.getAudioTracks()[0];
    if(!track){
      throw "System audio not available";
    }
    else{
      stream.getVideoTracks().forEach(track => track.stop());
      this.stream = new MediaStream();
      this.stream.addTrack(track);
    }        
    
    
    
    
    this.mediaStreamAudioSourceNode = this.audioCtx.createMediaStreamSource(this.stream);
    this.mediaStreamAudioSourceNode.connect(this.analyserNode);
    //this.analize();
  }
  
  
  async analize(){
    if(Date.now() - this.lastPlay > 1000/this.freq){
      this.analyserNode.getFloatTimeDomainData(this.pcmData);
      let sumSquares = 0.0;
      for (const amplitude of this.pcmData) { sumSquares += amplitude*amplitude; }
      var rms = Math.sqrt(sumSquares / this.pcmData.length);
      if(rms >= this.spikeThreshold){
        this.volumeMeterValue = Math.round(rms*this.spikeGain*100)/100;
        if(this.volumeMeterValue >1){this.volumeMeterValue =1;}
      }
      else{
        this.volumeMeterValue = 0;
      }
      //this.gui.volumeMeterEl.value = this.volumeMeterValue;
      this.gui.volumeMeterEl.style.height =  this.volumeMeterValue *100 + "%";
      this.gui.volumeDiv.innerHTML = this.volumeMeterValue;
      this.count++;
      this.lastPlay = Date.now();
    }
    
    requestAnimationFrame(this.analize.bind(this));
};
  
  
  
  toggleRecord(){
    if(this.recording === false){
      this.record();
    }
    else if(this.recording === true){
      this.stopRecording();
    }
  }
  
  async record(){ 
          this.clearAudioChunks();
          await this.armMic();
          this.recording = true;
          this.gui.recordButton.style.backgroundColor = "red";
          this.mediaRecorder = new MediaRecorder(this.stream);
          this.mediaRecorder.start();
          this.mediaRecorder.addEventListener("dataavailable", event => {
            this.audioChunks.push(event.data);          
          });

          this.mediaRecorder.addEventListener("stop", () => {            
            this.audioBlob = new Blob(this.audioChunks);
            //this.setAudio(this.audioBlob); 
            this.setAudioBuffer(this.audioBlob); 
          })     
   } 
  
  
  
  clearAudioChunks(){
    this.audioChunks = [];
  }
  
  
  
  stopRecording(){
        this.disarmMic();
        this.recording = false;
        this.gui.recordButton.style.backgroundColor = "white";
        this.mediaRecorder.stop();  
      } 
  
  
  

                                           
  
  
   play(){
     
     if(this.micArmed === true){
        this.disarmMic();
     }
   
    this.gui.playButton.innerHTML = "STOP";
    this.playing = true; 
     
    if(this.audioBuffer!= undefined){
 
      this.source = this.audioCtx.createBufferSource();
      this.source.connect(this.analyserNode);
      this.source.connect(this.audioCtx.destination);
      this.source.buffer = this.audioBuffer;
           

      this.source.start();
      this.source.addEventListener("ended",function(){
        this.gui.playButton.innerHTML = "PLAY";
        this.playing = false;
        //load next file
        if(this.audioBuffers.length>0){
           this.nextAudio();      
        }
          
      }.bind(this));
  
    }
     
     else{
       this.speakMessage(this.textMessages[this.textMessageIndex]);
       this.textMessageIndex++;
       if(this.textMessageIndex>=this.textMessages.length){
         this.textMessageIndex = 0;
       }
       //this.gui.playButton.innerHTML = "PLAY";
       //this.playing = false;
     }
       
   }
      
  
  
  stop(){
    if(this.source!= undefined){
      this.source.stop();
    }
  }
  
  
  togglePlay(permission){
    if(permission===true || permission===undefined){
      console.log("togglePlay playing: ",this.playing);
      if(this.playing === false){
       // this.gui.playButton.innerHTML = "STOP";
       // this.playing = true;
        this.play();
      }
      else if(this.playing === true){
        //this.gui.playButton.innerHTML = "PLAY";
        //this.playing = false;
        this.stop();
      }
    }
  }
  
  
  async setAudioBuffer(audioBlob){//or file
    this.loadingMessasge("setting audio, please wait...");
    this.init();
    this.audioBuffer =  await this.audioCtx.decodeAudioData(await audioBlob.arrayBuffer());
    if(this.audioBuffer.numberOfChannels === 1){
       this.moveAllToVoice();
     }
    else{//two channels
      if (confirm("move both tracks to voice?") === true) {
        this.moveAllToVoice();
      }
      else{
        this.addToAudioBuffers(this.audioBuffer);
        //this.plotAudioBuffer();
      }
    this.loadingMessasge("");
   }
  }
  

  
  
  async moveAllToVoice(){
    this.loadingMessasge("processing audio, please wait...");
    var samples = this.audioBuffer.length;
    
    //make new empty stereo array buffer
    var arrayBuffer = this.audioCtx.createBuffer(2, samples, this.audioCtx.sampleRate);
    const dataSpikes = arrayBuffer.getChannelData(this.spikeChannel);
    const dataVoice = arrayBuffer.getChannelData(this.voiceChannel);    
    for(var i = 0; i< dataVoice.length; i++ ){
       dataSpikes[i]=0;
       dataVoice[i]=0;
    }
    
    //add all channels to voice
    for(var channel =0; channel < this.audioBuffer.numberOfChannels; channel++ ){
       var channelData =  await this.audioBuffer.getChannelData(channel);
       for(var i = 0; i< dataVoice.length; i++ ){
         dataVoice[i] = (dataVoice[i]+channelData[i])/this.audioBuffer.numberOfChannels;//averages to avoid clipping
       }
    }  
    //replace this audioBuffer with the new one  
    this.addToAudioBuffers(arrayBuffer);

  }
  
  
  addToAudioBuffers(arrayBuffer){
    this.audioBuffers.push(arrayBuffer);
    this.fileIndex = this.audioBuffers.length-1;
    this.audioBuffer = this.audioBuffers[this.fileIndex];
    this.plotAudioBuffer();
    this.loadingMessasge("");
  }
  
  nextAudio(){
    this.fileIndex++;
    if(this.fileIndex>=this.audioBuffers.length){this.fileIndex=0;}
    this.audioBuffer = this.audioBuffers[this.fileIndex];
    this.plotAudioBuffer();
  }
  
  toggleInvert(){
    this.invert*=-1;
    alert("eyes and mouth motors will be swapped next time you click Generate spikes")
  }
  
  
  
  
  generateSpikes(){
    this.loadingMessasge("generating spikes, please wait...");
    
    
    this.envelopeArray = [];
   // var audioArray =  this.audioBuffer.getChannelData(0);
    var audioArray =  this.audioBuffer.getChannelData(this.voiceChannel);
    var maxLength = Math.min(48000*30, audioArray.length);
    
    setTimeout(function(){//allows loading message to be drawn first
        var movingWindow = [];
        var movingAvg = 0;
        var sum = 0;
        var avgRange = this.audioBuffer.sampleRate * 0.05;//0.05 of a second

        //get starting window into an araay
        for(var i = 0 ; i< avgRange; i++){
          movingWindow.push(Math.abs(audioArray[i]));
        }

        for(var i = 0 ; i< maxLength; i++){
          //shift moving window
          if(i != 0){
            //take off first element
            movingWindow.shift();
            //add next element
            movingWindow.push(Math.abs(audioArray[i]));        
          }

          //calc average of moving window
          movingAvg = 0;
          for(var j = 0; j < movingWindow.length; j++){
            movingAvg += movingWindow[j]/avgRange;    
          }
          
          //adjust gain and threshold on envelope
          if(movingAvg > this.spikeThreshold){
            movingAvg = movingAvg*this.spikeGain;
            if(movingAvg > 1){
              movingAvg = 1;
            }
          }
          else{
            movingAvg = 0;
          }
          this.envelopeArray.push(movingAvg);
        }

        //make empty samples to shift mouth sync
        var mouthSyncNumSamples = this.samplesPerMillisecond*Math.abs(this.mouthSync);
        if(this.mouthSync > 0){
          for(var i = 0; i<mouthSyncNumSamples; i++){
            this.envelopeArray.unshift(0);
            this.envelopeArray.pop();
          }
        }
        else{
          for(var i = 0; i<mouthSyncNumSamples; i++){
            this.envelopeArray.push(0);
            this.envelopeArray.shift();
          }
        }
        
      
        this.envelopToSpikeChannel(0.5, 2, this.gui.thresholdInput.value, this.gui.servoGainInput.value);//(servoMin, servoMax, threshold, gain)
        this.loadingMessasge("");
    }.bind(this),1000);
  }
  
  async plotAudioBuffer(){
    this.gui.audioLeftCanvasCtx.clearRect(0,0,this.gui.audioLeftCanvas.width, this.gui.audioLeftCanvas.height);
    this.gui.audioRightCanvasCtx.clearRect(0,0,this.gui.audioRightCanvas.width, this.gui.audioRightCanvas.height);
    var leftArray = await this.audioBuffer.getChannelData(0);
    this.plotArrayData(leftArray, "black", this.gui.audioLeftCanvas);
    
    if(this.audioBuffer.numberOfChannels === 2){
      var rightArray = await this.audioBuffer.getChannelData(1);
      this.plotArrayData(rightArray, "black", this.gui.audioRightCanvas);
    }
    
    this.plotArrayData(this.envelopeArray, "red", this.gui.leftRightCanvases[this.voiceChannel]);
    
  }
  
  
  plotArrayData(array, color, canvas){
   var maxLength = Math.min(48000*30, array.length);
    if(array.length<maxLength){maxLength = array.length;}
    var xScale = canvas.width/maxLength;
    var scale = 100;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for(var i = 0; i<maxLength; i++){
     // ctx.fillRect(i,this.bufferArray[i], 1, 1);
      ctx.lineTo(i*xScale,array[i]*scale+100);
    }
    ctx.stroke();
    
  }
  
  //make file from a buffer
  async envelopToSpikeChannel(servoMin, servoMax, threshold, gain){//could delete
    this.samplesPerMillisecond = this.audioCtx.sampleRate/1000;
    
    var vocalsArray = await this.audioBuffer.getChannelData(this.voiceChannel);
    var pulseArray = await this.audioBuffer.getChannelData(this.spikeChannel);
    //var duration = this.audioBuffer.duration;
    //var samples = this.audioBuffer.length;
    //var millisMin = servoMin;//this.data.servos["left"].min;
    //var millisMax = servoMax;//this.servos[0].max;
    var samplesMin = this.samplesPerMillisecond * servoMin;
    var samplesMax = this.samplesPerMillisecond * servoMax;
    var samplesPerPeriod = 20*this.samplesPerMillisecond;
    //var numPulses =  Math.floor(samples/samplesPerPeriod);
    
   // var arrayBuffer = this.audioCtx.createBuffer(2, samples, this.audioCtx.sampleRate); //(channels,length in samples, sample rate

     // const dataLeft = arrayBuffer.getChannelData(0);
     // const dataRight = arrayBuffer.getChannelData(1);
      var samplesInVoicePulse;
      var samplesInEyesPulse;
      var eyeProportion = 0.5;//this.eyeProportion;
      for(var i = 0; i< vocalsArray.length; i++){
                
        //calc pulse width from envelope
        if(i%samplesPerPeriod === 0){//new pulse
          samplesInVoicePulse = (this.envelopeArray[i]+ this.voiceTrim)*(samplesMax - samplesMin) + samplesMin;
          if(Math.random()>0.98){
            eyeProportion = this.randomGauss();
          }
          samplesInEyesPulse  = (eyeProportion+this.eyesTrim)*(samplesMax - samplesMin) + samplesMin;//this.eyesTrim;
        }
        
        //eyes
        if(i%samplesPerPeriod > (samplesPerPeriod - samplesInEyesPulse)){
          pulseArray[i] = -1*this.invert;
          //console.log("eyes");
        }
        //gap
        else if(i%samplesPerPeriod > (samplesPerPeriod - samplesInEyesPulse-10*this.samplesPerMillisecond)){
          pulseArray[i] = 0;
        }
        //voice
        else if(i%samplesPerPeriod > (samplesPerPeriod - samplesInEyesPulse - samplesInVoicePulse -10*this.samplesPerMillisecond)){
          pulseArray[i] = 1*this.invert;//1;
          //console.log("voice");
        }
        else{
          pulseArray[i] = 0;
        }
      }
 
      
      //this.audioBuffer = arrayBuffer;
      this.plotAudioBuffer();

    }
  
  
    randomGauss(){
        const theta = 2 * Math.PI * Math.random();
        const rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
        return (rho * Math.cos(theta)) / 10.0 + 0.5;
    };  
  
    loadingMessasge(message){    
      if(this.gui.loadingDiv.style.display === "none"){
        this.gui.loadingDiv.style.display = "block";
      }
      else{this.gui.loadingDiv.style.display = "none"}
      
      this.gui.loadingDiv.innerHTML = ""+ message;
     } 
  
    
     setSpikeThreshold(val){
       this.spikeThreshold = val;
       this.gui.thresholdLabel.innerHTML = "mouth threshold: " + this.spikeThreshold;
     }
  
    setSpikeGain(val){
       this.spikeGain = val;
       this.gui.servoGainLabel.innerHTML = "mouth wideness: " + this.spikeGain;
     }
  
    setEyesTrim(val){
       this.eyesTrim = parseFloat(val);
       this.gui.eyesTrimLabel.innerHTML = "eyes trim: " + this.eyesTrim;
      console.log(val);
     }
  
    setMouthSync(val){
       this.mouthSync = parseFloat(val);
       this.gui.mouthSyncLabel.innerHTML = "mouth sync milis: " + this.mouthSync;
     }
  
  
  
    speakMessage(text){
      speechSynthesis.getVoices().forEach(function(voice) {
        console.log(voice.name, voice.default ? voice.default :'');
      });
      var voices = window.speechSynthesis.getVoices(); 
      var msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.voice = voices[3];
      msg.rate = 0.6; // From 0.1 to 10
      msg.pitch = 0.4; // From 0 to 2
      window.speechSynthesis.speak(msg);
      msg.addEventListener("end", (event) => {
        this.gui.playButton.innerHTML = "PLAY";
        this.playing = false;
      });

    }  
  
   /*reccordUtterance(text){
     this.toggleRecord();
     const utterance = new SpeechSynthesisUtterance(text);
     utterance.onend = () => this.toggleRecord();
     window.speechSynthesis.speak(utterance);
   }*/
  
  async reccordUtterance(text) {


const blob = await new Promise(async resolve => {
    console.log("picking system audio");
    const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
    const track = stream.getAudioTracks()[0];
    if(!track)
        throw "System audio not available";
    
    stream.getVideoTracks().forEach(track => track.stop());
    
    const mediaStream = new MediaStream();
    mediaStream.addTrack(track);
    
    const chunks = [];
    const mediaRecorder = new MediaRecorder(mediaStream, {bitsPerSecond:128000});
    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0)
            chunks.push(event.data);
    }
    mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        mediaStream.removeTrack(track);
        resolve(new Blob(chunks));
    }
    mediaRecorder.start();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // From 0.1 to 10
    utterance.pitch = 2; // From 0 to 2
    utterance.onend = () => mediaRecorder.stop();
    window.speechSynthesis.speak(utterance);
    console.log("speaking...");
});
console.log("audio available", blob);
this.setAudioBuffer(blob);

}
  
   makeGui(){
     
     this.gui.div = document.createElement("div");
     this.gui.div.style.position = "relative";
     
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name;
     this.gui.div.append(this.gui.displayVal);
     
     this.gui.input = document.createElement("input");
     this.gui.input.type = "file";
     //this.gui.input.multiple="multiple";
     this.gui.div.append(this.gui.input);
     this.gui.input.style.display = "block";   
     this.gui.input.onchange = function(evt){
       
       
       
       //this.files.push(evt.target.files[0])
      // console.log("this,files: ", this.files);
    /* this.files = new FormData();
      // Append each selected file to the FormData object
     for (let i = 0; i < evt.target.files.length; i++) {
        this.files.append("files[]", evt.target.files[i]);
     }*/
       
       //this.file = this.files[0];
       //this.fileIndex = this.audioBuffers.length-1;
       this.setAudioBuffer(evt.target.files[0]);
     }.bind(this);
     
     
     this.gui.micButton = document.createElement("button");
     this.gui.micButton.innerHTML = "arm mic";
     this.gui.micButton.addEventListener("click",function(){this.toggleMic()}.bind(this));
     this.gui.micButton.style.display = "none";
     this.gui.div.append(this.gui.micButton);
     
     this.gui.volumeDiv = document.createElement("span");
     this.gui.volumeDiv.innerHTML = "no volume";
     this.gui.volumeDiv.style.display = "none";
     this.gui.div.append(this.gui.volumeDiv);

     this.gui.textArea = document.createElement("textarea");
     this.gui.div.append(this.gui.textArea);
     this.gui.textArea.style.boxSizing = "border-box";
     this.gui.textArea.style.maxWidth = "500px";
     this.gui.textArea.style.width = "95vw";
     this.gui.textArea.onchange = function(event){
      this.reccordUtterance(event.target.value);
       //var string = event.target.value;
       //this.textMessages = string.split(/\r?\n|\r|\n/g);
     }.bind(this);
     
     this.gui.buttonContainer1 = document.createElement("div");
     this.gui.buttonContainer1.style.boxSizing = "border-box";
     this.gui.div.append(this.gui.buttonContainer1);
     this.gui.buttonContainer1.style.maxWidth = "500px";
     this.gui.buttonContainer1.style.width = "95vw";
     this.gui.buttonContainer1.style.border = "1px solid black";   
     this.gui.buttonContainer1.style.display ="flex";
     this.gui.buttonContainer1.style.alignItems ="center";
     this.gui.buttonContainer1.style.justifyContent ="center";
     this.gui.buttonContainer1.style.marginTop = "10px";
     this.gui.buttonContainer1.style.marginBottom = "10px";
     
     
     this.gui.volumeMeterContainer = document.createElement("div");;
     this.gui.volumeMeterContainer.style.display = "inline-block";
     this.gui.volumeMeterContainer.style.width = "10%";
     this.gui.volumeMeterContainer.style.aspectRatio = "0.34";
     //this.gui.volumeMeterContainer.style.flexGrow = "1 1";
     this.gui.volumeMeterContainer.style.border = "1px solid black";
     this.gui.volumeMeterContainer.style.position = "relative";
     this.gui.volumeMeterContainer.style.margin = "10px";
     this.gui.buttonContainer1.append(this.gui.volumeMeterContainer);
     
     this.gui.volumeMeterEl = document.createElement("div");;
     this.gui.volumeMeterEl.style.width = "100%";
     this.gui.volumeMeterEl.style.height = "0%";
     this.gui.volumeMeterEl.style.position = "absolute";
     this.gui.volumeMeterEl.style.bottom = "0px";
     this.gui.volumeMeterEl.style.backgroundColor = "green";
     this.gui.volumeMeterContainer.append(this.gui.volumeMeterEl);
        
     this.gui.recordButton = document.createElement("button");
     this.gui.recordButton.innerHTML = "record";
     this.gui.recordButton.style.aspectRatio=1;
     this.gui.recordButton.style.borderRadius = "50%";
     this.gui.recordButton.style.width = "30%";
     this.gui.recordButton.style.display = "inline-block";
     this.gui.recordButton.style.margin = "10px";
     //this.gui.recordButton.style.verticalAlign = "middle";
     this.gui.recordButton.addEventListener("click",function(){this.toggleRecord()}.bind(this));
     this.gui.buttonContainer1.append(this.gui.recordButton);
     
     this.gui.playButton = document.createElement("button");
     this.gui.playButton.innerHTML = "play";
     this.gui.playButton.style.aspectRatio=1;
     this.gui.playButton.style.width = "30%";
     this.gui.playButton.style.margin = "10px";
     this.gui.playButton.addEventListener("click",function(){this.togglePlay()}.bind(this));
     this.gui.buttonContainer1.append(this.gui.playButton);
     
     this.gui.generateSpikesButton = document.createElement("button");
     this.gui.generateSpikesButton.innerHTML = "generate spikes";
     this.gui.generateSpikesButton.style.aspectRatio=1;
     this.gui.generateSpikesButton.style.width = "30%";
     this.gui.generateSpikesButton.style.margin = "10px";
     this.gui.generateSpikesButton.addEventListener("click",this.generateSpikes.bind(this));
     this.gui.buttonContainer1.append(this.gui.generateSpikesButton);
     
     this.gui.stereoToMonoButton = document.createElement("button");
     this.gui.stereoToMonoButton.innerHTML = "move all to Voice";
     this.gui.stereoToMonoButton.addEventListener("click",function(){this.moveAllToVoice()}.bind(this));
     this.gui.div.append(this.gui.stereoToMonoButton);
     
     this.gui.invertButton = document.createElement("button");
     this.gui.invertButton.innerHTML = "swap motors";
     this.gui.invertButton.addEventListener("click",function(){this.toggleInvert()}.bind(this));
     this.gui.div.append(this.gui.invertButton);
     
     
     
     this.gui.thresholdLabel = document.createElement("div");
     this.gui.thresholdLabel.innerHTML = "mouth threshold: "+ this.spikeThreshold;
     this.gui.div.append(this.gui.thresholdLabel);
     this.gui.thresholdLabel.style = "block";
     
     this.gui.thresholdInput = document.createElement("input");
     this.gui.thresholdInput.type = "range";
     this.gui.thresholdInput.style.width = "95vw";
     this.gui.div.append(this.gui.thresholdInput);
     this.gui.thresholdInput.min = 0;
     this.gui.thresholdInput.max = 1;
     this.gui.thresholdInput.step = 0.01;
     this.gui.thresholdInput.value = this.spikeThreshold;
     this.gui.thresholdInput.style.display = "inline_block";
     this.gui.thresholdInput.addEventListener("input", function(e){
       this.setSpikeThreshold(e.target.value);
     }.bind(this));

     
     this.gui.servoGainLabel = document.createElement("div");
     this.gui.servoGainLabel.innerHTML = "mouth wideness: " + this.spikeGain;
     this.gui.div.append(this.gui.servoGainLabel);
     this.gui.servoGainLabel.style = "block";
     
     this.gui.servoGainInput = document.createElement("input");
     this.gui.servoGainInput.type = "range";
     this.gui.servoGainInput.style.width = "95vw";
     this.gui.div.append(this.gui.servoGainInput);
     this.gui.servoGainInput.min = 0;
     this.gui.servoGainInput.max = 10;
     this.gui.servoGainInput.step = 0.1;
     this.gui.servoGainInput.value = this.spikeGain;
     this.gui.servoGainInput.style.display = "inline_block";
     this.gui.servoGainInput.addEventListener("input", function(e){
       this.setSpikeGain(e.target.value);
     }.bind(this));

     
     this.gui.mouthSyncLabel = document.createElement("div");
     this.gui.mouthSyncLabel.innerHTML = "mouth sync milis: "+ this.mouthSync;
     this.gui.div.append(this.gui.mouthSyncLabel);
     this.gui.mouthSyncLabel.style = "block";
     
     this.gui.mouthSyncInput = document.createElement("input");
     this.gui.mouthSyncInput.type = "range";
     this.gui.mouthSyncInput.style.width = "95vw";
     this.gui.div.append(this.gui.mouthSyncInput);
     this.gui.mouthSyncInput.min = -200;
     this.gui.mouthSyncInput.max = 200;
     this.gui.mouthSyncInput.step = 10;
     this.gui.mouthSyncInput.value = this.mouthSync;
     this.gui.mouthSyncInput.style.display = "inline_block";
     this.gui.mouthSyncInput.addEventListener("input", function(e){
       this.setMouthSync(e.target.value);
     }.bind(this));
     
     this.gui.eyesTrimLabel = document.createElement("div");
     this.gui.eyesTrimLabel.innerHTML = "eyes trim: "+ this.eyesTrim;
     this.gui.div.append(this.gui.eyesTrimLabel);
     this.gui.eyesTrimLabel.style = "block";
     
     this.gui.eyesTrimInput = document.createElement("input");
     this.gui.eyesTrimInput.type = "range";
     this.gui.eyesTrimInput.style.width = "95vw";
     this.gui.div.append(this.gui.eyesTrimInput);
     this.gui.eyesTrimInput.min = -0.5;
     this.gui.eyesTrimInput.max = 0.5;
     this.gui.eyesTrimInput.step = 0.01;
     this.gui.eyesTrimInput.value = this.eyesTrim;
     this.gui.eyesTrimInput.style.display = "inline_block";
     this.gui.eyesTrimInput.addEventListener("input", function(e){
       this.setEyesTrim(e.target.value);
     }.bind(this));
     
     
     
     this.gui.WaveContainer = document.createElement("div");
     this.gui.WaveContainer.style.boxSizing = "border-box";
     this.gui.div.append(this.gui.WaveContainer);
     this.gui.WaveContainer.style.maxWidth = "500px";
     this.gui.WaveContainer.style.width = "95vw";
     this.gui.WaveContainer.style.border = "1px solid black";   
     this.gui.WaveContainer.style.overflow = "scroll";
     //this.gui.WaveContainer.style.display ="flex";
     //this.gui.WaveContainer.style.alignItems ="center";
     //this.gui.WaveContainer.style.justifyContent ="center";
     this.gui.WaveContainer.style.marginTop = "10px";
     this.gui.WaveContainer.style.marginBottom = "10px";
     
     this.gui.rightCanvasLabel = document.createElement("div");
     this.gui.rightCanvasLabel.innerHTML = "right: " + this.channelNames[1];
     this.gui.WaveContainer.append(this.gui.rightCanvasLabel);
     this.gui.rightCanvasLabel.style = "block";
         
     this.gui.audioRightCanvas = document.createElement("canvas");
     this.gui.audioRightCanvas.width = 800;//array.length;
     this.gui.audioRightCanvas.height = 200;
     this.gui.WaveContainer.append(this.gui.audioRightCanvas);
     this.gui.audioRightCanvasCtx = this.gui.audioRightCanvas.getContext("2d");
     
     this.gui.leftCanvasLabel = document.createElement("div");
     this.gui.leftCanvasLabel.innerHTML = "left: " + this.channelNames[0];
     this.gui.WaveContainer.append(this.gui.leftCanvasLabel);
     this.gui.leftCanvasLabel.style = "block";
          
     this.gui.audioLeftCanvas = document.createElement("canvas");
     this.gui.audioLeftCanvas.width = 800;//array.length;
     this.gui.audioLeftCanvas.height = 200;
     this.gui.WaveContainer.append(this.gui.audioLeftCanvas);
     this.gui.audioLeftCanvasCtx = this.gui.audioLeftCanvas.getContext("2d");
     this.gui.audioLeftCanvas.style.position = "relative";
     
     this.gui.leftRightCanvases = [this.gui.audioLeftCanvas, this.gui.audioRightCanvas];
     
     this.gui.loadingDiv = document.createElement("div");
     this.gui.div.append(this.gui.loadingDiv);
     this.gui.loadingDiv.innerHTML = "loading...";
     this.gui.loadingDiv.style.position = "absolute";
     this.gui.loadingDiv.style.top = "0px";
     this.gui.loadingDiv.style.left = "0px";
     this.gui.loadingDiv.style.fontSize= "20px"
     this.gui.loadingDiv.style.width = "95%";
     this.gui.loadingDiv.style.backgroundColor = "red";
     this.gui.loadingDiv.style.display = "none";
     
   }  
}