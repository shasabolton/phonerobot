class AudioServo{
  constructor(params){//name,channel, home){ //{name:"left wheel",channel:0-3, home: 1.5}
    this.name = params.name;
    this.channel = params.channel;
    this.inverted = false; //to get two servos on one channel you can invert one of their signals. This allows for 4 servos n 2 channel audio
    this.min = 0.5; //milisecond pulse
    this.max = 2.5; //milisecond pulse
    this.range = this.max - this.min;
    this.home = params.home;//ms
    this.value= this.home;
    this.trimValue = 0;
    this.prevValue = this.value;
    this.makeGui();
  }
  
  setTrimValue(value){    
    this.trimValue = Math.round(value*100)/100; 
    this.gui.displayTrimVal.innerHTML =  this.name+ "trim: " + this.trimValue;
    this.gui.slider.trimValue =  this.trimValue;
  }
  
  setValue(value){
    if(value>this.min && value < this.max){
      this.prevValue = this.value;
      this.value = Math.round(value*100)/100;
    }   
    this.gui.displayVal.innerHTML =  this.name+ ": " + this.value;
    this.gui.slider.value =  this.value;
  }
  
  
  setValueFromProportionOfRange(prop){
          this.setValue(this.min + (this.max - this.min)*prop);
          console.log(prop);
    }
  
  setValueFromProportionAwayFromHome(prop){
    if(Math.sign(prop>0)){
          this.setValue(this.home + (this.max - this.home)*prop);
    }
    
    else if(Math.sign(prop<0)){
         this.setValue(this.home + (this.home - this.min)*prop);
    }
  }
  
  get getValue(){
    return this.value();
  }
  
  makeGui(){
      this.gui = {};
      this.gui.div = document.createElement("div");
      
      this.gui.displayVal = document.createElement("span");
      this.gui.displayVal.innerHTML =  this.name+ ": " + this.value;
      this.gui.div.append(this.gui.displayVal);
      
      this.gui.slider = document.createElement("input");
      this.gui.slider.type = "range";
      this.gui.slider.min = this.min;
      this.gui.slider.max = this.max;
      this.gui.slider.step = 0.01;
      this.gui.slider.value = this.value;
      this.gui.div.append(this.gui.slider);
      this.gui.slider.channel = this.channel;
      this.gui.slider.style.width = "95%";
      this.gui.slider.addEventListener("input", function(e){
        this.setValue(e.target.value);
        //this.gui.displayVal.innerHTML =  this.name + ": " + this.value;
      }.bind(this))
      
      this.gui.displayTrimVal = document.createElement("span");
      this.gui.displayTrimVal.innerHTML =  this.name+ "trim: " + this.trimValue;
      this.gui.div.append(this.gui.displayTrimVal);
      
      this.gui.trimSlider = document.createElement("input");
      this.gui.trimSlider.type = "range";
      this.gui.trimSlider.min = -1;
      this.gui.trimSlider.max = 1;
      this.gui.trimSlider.step = 0.01;
      this.gui.trimSlider.value = 0;
      this.gui.div.append(this.gui.trimSlider);
      //this.gui.trimSliderlider.channel = this.channel;
      this.gui.trimSlider.style.width = "95%";
      this.gui.trimSlider.addEventListener("input", function(e){
        this.setTrimValue(e.target.value);
        //this.gui.displayVal.innerHTML =  this.name + ": " + this.value;
      }.bind(this))
    
    
  }
}













class AudioServoControler{
  
  constructor(servos){
  /*  this.data = {
      name:"phoneBot",
              
    };
    this.data.servos=servos;*/
    this.name = "Audio Servo Controller";
    this.servos = [null,null,null,null];
    for(var i in servos){
      this.servos[servos[i].channel] = servos[i];
    }
    
    this.sources = [];
    this.arrayBuffer;
    this.posativeArrayBuffer;
    this.negativeArrayBuffer;
    this.fullPulseBuffers = {"1":{},"-1":{}};
    this.fullPeriodBuffers = {};
    this.samplesPerMillisecond;
    this.motorsOn = false;
    this.lastMotorSpike = Date.now();
    this.invertVal = false;
    this.initAudio();
    //this.makeBuffer(this.invert); 
    this.makeGui();
    App.addLoopFunction(this.mainLoop.bind(this));
    //this.mainLoop();
   
  }
  
  initAudio(){
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();//{sampleRate: 96000} defaul 48000
    this.samplesPerMillisecond = this.audioCtx.sampleRate/1000;
    //main volume
    this.gainNode = this.audioCtx.createGain()
    this.gainNode.gain.value = 1; // 100 %
    this.gainNode.connect(this.audioCtx.destination);
    //left channel will get sent here
    this.panNodes=[];
    this.panNodes.push(this.audioCtx.createStereoPanner());
    this.panNodes[0].pan.value = -1;
    this.panNodes[0].connect(this.gainNode);
    //right Channel will get sent here
    this.panNodes.push(this.audioCtx.createStereoPanner());
    this.panNodes[1].pan.value = 1;
    this.panNodes[1].connect(this.gainNode);   
    
    this.makePosAndNegBuffers();

  }
  
  setGain(value){
    
    this.gainNode.gain.value = value;
    this.gui.displayGain.innerHTML = "Gain: " + Math.round(value*10)/10;
    this.gui.gainSlider.value = this.gainNode.gain.value;
  }
  
  makeBuffer(invertVal){
    //console.log("makeBuffer"+ invert);
    this.arrayBuffer = this.audioCtx.createBuffer(1, 1, this.audioCtx.sampleRate); //(channel,length in samples, sample rate
    for (let channel = 0; channel < this.arrayBuffer.numberOfChannels; channel++) {
      // This gives us the actual ArrayBuffer that contains the data which is just a single 1
      const nowBuffering = this.arrayBuffer.getChannelData(channel);
      nowBuffering[0]=1;
    }

    if(invertVal === true){invert(this.arrayBuffer);}  

    function invert(audioBuffer){
      console.log("invert" +invertVal);
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        // This gives us the actual ArrayBuffer that contains the data
        const nowBuffering = audioBuffer.getChannelData(channel);
        for (let i = 0; i < audioBuffer.length; i++) {
          if(nowBuffering[i] === 1){nowBuffering[i]=-1}
          //else{nowBuffering[i]=0;}
        }
     }
    }

  }
  
  
  
  
  makePosAndNegBuffers(){
    //console.log("makeBuffer"+ invert);
    this.positiveArrayBuffer = this.audioCtx.createBuffer(1, 1, this.audioCtx.sampleRate); //(channel,length in samples, sample rate
    this.positiveArrayBuffer.getChannelData(0)[0]=1;//this.amplitude;
    this.negativeArrayBuffer = this.audioCtx.createBuffer(1, 1, this.audioCtx.sampleRate); //(channel,length in samples, sample rate
    this.negativeArrayBuffer.getChannelData(0)[0]=-1;//*this.amplitude;
    
    //make long pulse versions that dont need rate change
    for(var millis = 0.5; millis< 2.5; millis+=0.01){
      millis = Math.round(millis*100)/100;
      //this.fullPulseBuffers["pos"][millis] = this.makeSpike(millis,1);
      //this.fullPulseBuffers["neg"][millis] = this.makeSpike(millis,-1);
      this.makeSpike(millis,-1);
      this.makeSpike(millis,1);
    }
    
    //make full period version of all types
    for(var millisPos = 0.5; millisPos< 2.5; millisPos+=0.01){
      millisPos = Math.round(millisPos*100)/100;
      this.fullPeriodBuffers[millisPos] = {};
      for(var millisNeg = 0.5; millisNeg< 2.5; millisNeg+=0.01){
         millisNeg = Math.round(millisNeg*100)/100;
         this.makePeriodBuffer(millisPos,millisNeg);      
       } 
    }
  }
  
  
  
  calcRate(servo){
     var ms = servo.value + servo.trimValue;
     if(ms>servo.max){ms = servo.max;}
     else if(ms<servo.min){ms = servo.min;}
     var samplesPerPulse = ms * this.samplesPerMillisecond
     return 1/samplesPerPulse;
  }
  
  
  
  makeAudio(servo){
   
    var millis = servo.value;
    var channel=servo.channel;
    
    if(servo.value != servo.prevValue || this.sources[channel] === undefined){
      console.log("change");
    }
   //motor One 
    this.sources[channel] = this.audioCtx.createBufferSource();

    //pos buffer conditions
    if((this.invertVal === false) && (channel === 0 || channel === 1)  || (this.invertVal === true) && (channel === 2 || channel === 3) ){
       this.sources[channel].buffer = this.positiveArrayBuffer;
       //this.sources[channel].buffer = this.fullPulseBuffers[1][millis];
    }
    //neg buffer conditions
    else if((this.invertVal === true) && (channel === 0 || channel === 1)  || (this.invertVal === false) && (channel === 2 || channel === 3) ){
       this.sources[channel].buffer = this.negativeArrayBuffer;
       //this.sources[channel].buffer = this.fullPulseBuffers[-1][millis];
    }

    var panIndex = channel;
    if(channel === 2){panIndex = 0;}
    else if(channel === 3){panIndex = 1;}
    this.sources[channel].connect(this.panNodes[panIndex]);
    this.sources[channel].playbackRate.value = this.calcRate(servo);
    this.sources[channel].start();

  }
 

  
  makeAudios(){

      if(this.servos[0] != null){this.makeAudio(this.servos[0]);}
      if(this.servos[1] != null){this.makeAudio(this.servos[1]);}
        
      if(this.servos[2] != null || this.servos[3] != null){       
        //inverted spikes must be sent about 5ms later to ensure positive spikes have been sent first
        setTimeout(function(){
            if(this.servos[2] != null){this.makeAudio(this.servos[2]);}
            if(this.servos[3] != null){this.makeAudio(this.servos[3]);}
          }.bind(this), 8)
        
        }

  }
  
 
  
   makeLoopingAudios(){
      this.makeLoopingAudio(this.servos[0], this.servos[2]);//left
      this.makeLoopingAudio(this.servos[1], this.servos[3]);//right
  }
  
  
  makeLoopingAudio(posServo, negServo){
    var millisPos = posServo.value;
    var millisNeg = negServo.value;
    var channel=posServo.channel;
    
    //if changed servo positions
    if(this.sources[channel]=== null || this.sources[channel].buffer != this.fullPeriodBuffers[millisPos][millisNeg]){
      console.log("change");
      try{
        this.sources[channel].stop();
      }catch{
        console.log("cant stop");
      };
    
      this.sources[channel] = this.audioCtx.createBufferSource();
      this.sources[channel].buffer = this.fullPeriodBuffers[millisPos][millisNeg];    
      var panIndex = channel;   
      this.sources[channel].connect(this.panNodes[panIndex]);
      this.sources[channel].playbackRate.value =1;
      this.sources[channel].loop = true;
      this.sources[channel].start();
      
    }
    

  }
  
  
  toggleMotors(){
    this.motorsOn = !this.motorsOn;
  }
  
  toggleInvertVal(){
    this.invertVal = !this.invertVal;
    //this.makeBuffer(this.invertVal); 
    //console.log(this.invert);
  }
  
  mainLoop(){  
  
    var dt = Date.now() - this.lastMotorSpike;
    if(dt >10){//10){
      //infoDiv.innerHTML = "pulse period: " + Math.round(dt);
      if(this.motorsOn === true){
          this.makeAudios();//(dt 10) makes each pulse again each time
          //this.makeLoopingAudios();//(Set dt to 20) plays pos and neg pulse on repeat until changed then make a new one
      }

      this.lastMotorSpike = Date.now();
    }

    //requestAnimationFrame(()=>this.mainLoop());
  
  }

  makeSpike(millis,val){
    //var array = [];
    var numSamples = millis*this.samplesPerMillisecond;
    this.fullPulseBuffers[val][millis] = this.audioCtx.createBuffer(1, numSamples, this.audioCtx.sampleRate);
    for(var i = 0; i< numSamples; i++){
      this.fullPulseBuffers[val][millis].getChannelData(0)[i] = val;
    }
    //return array;
  }
  
  makePeriodBuffer(millisPos,millisNeg){
    var samplesPos = millisPos*this.samplesPerMillisecond;
    var samplesNeg = millisNeg*this.samplesPerMillisecond;
    var samplesPerPeriod = 20*this.samplesPerMillisecond;
    this.fullPeriodBuffers[millisPos][millisNeg] = this.audioCtx.createBuffer(1, samplesPerPeriod, this.audioCtx.sampleRate);
    var nowBuffering = this.fullPeriodBuffers[millisPos][millisNeg].getChannelData(0);
    for(var i = 0; i< samplesPerPeriod; i++){    
        if(i<samplesPos){
          nowBuffering[i] = 1;
        }
        else if(i >= samplesPos && i < (samplesPos + samplesNeg)){
          nowBuffering[i] = -1;
        }
        else{
          nowBuffering[i] = 0;
        }
        
    }
    if(millisPos===1.5 && millisNeg === 1.5){console.log(nowBuffering);}
    //return array;
  }
  
  
 
  
  
  
  makeGui(){
    this.gui = {};
    this.gui.mainDiv = document.createElement("div");
    this.gui.mainDiv.style.width = "90vw";
    document.body.append(this.gui.mainDiv);
    
    /*//init button      
    this.gui.initButton = document.createElement("button");
    this.gui.initButton.innerHTML = "init Audio";
    this.gui.mainDiv.append(this.gui.initButton);
    this.gui.initButton.addEventListener("click", function(){
      this.initAudio();
    }.bind(this))*/
    
    //motors
    this.gui.motorsCheckLabel = document.createElement("span");
    this.gui.motorsCheckLabel.innerHTML =  "motors";
    this.gui.mainDiv.append(this.gui.motorsCheckLabel);
      
    this.gui.motorsCheck = document.createElement("input");
    this.gui.motorsCheck.type = "checkbox";
    this.gui.mainDiv.append(this.gui.motorsCheck);
    this.gui.motorsCheck.addEventListener("change", function(){
      this.toggleMotors();
    }.bind(this))
    
    
    
    //invert
    this.gui.invertCheckLabel = document.createElement("span");
    this.gui.invertCheckLabel.innerHTML =  "invert";
    this.gui.mainDiv.append(this.gui.invertCheckLabel);
      
    this.gui.invertCheck = document.createElement("input");
    this.gui.invertCheck.type = "checkbox";
    this.gui.mainDiv.append(this.gui.invertCheck);
    this.gui.invertCheck.addEventListener("change", function(){
      this.toggleInvertVal();
    }.bind(this))
    
    
    
    
    
    
    
    
    /*//gain slider
    this.gui.displayGain = document.createElement("span");
    this.gui.displayGain.innerHTML = "Volume: " + this.gainNode.gain.value;
    this.gui.mainDiv.append(this.gui.displayGain);
    this.gui.displayGain.style.display = "block";

    this.gui.gainSlider = document.createElement("input");
    this.gui.gainSlider.type = "range";
    this.gui.gainSlider.min = 0;
    this.gui.gainSlider.max = 1;
    this.gui.gainSlider.step = 0.1;
    this.gui.gainSlider.value = this.gainNode.gain.value;
    this.gui.mainDiv.append(this.gui.gainSlider);
    this.gui.gainSlider.style.width = "100%";
    this.gui.gainSlider.addEventListener("input", function(e){
      this.setGain(e.target.value);
      //this.gui.displayVal.innerHTML =  this.name + ": " + this.value;
    }.bind(this))*/
    
    
    
  }
  
}

