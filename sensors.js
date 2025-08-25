class subModule{
  constructor(name){
    this.name = name;    
    this.makeGui();
  }
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name;
     this.gui.div.append(this.gui.displayVal);
  }
}


class Orientation{
  constructor(){
    this.name = "Orientation"
    this.pitch =0;
    this.roll=0;
    this.yaw = 0;
    this.running = false;
    
    //this.addRemoveOrientationEventListener();
 
    this.makeGui(); 
    this.setRunning(true);
  }
  
  addRemoveOrientationEventListener(){
  
    if (window.DeviceOrientationEvent && this.running === true) {      
      window.addEventListener(
     "deviceorientation",
     (event) => {
      const yaw = event.alpha; // alpha: rotation around z-axis
      const roll = event.gamma; // gamma: left to right
      const pitch = event.beta; // beta: front back motion 

      this.handleOrientationEvent(pitch, yaw, roll);
      },
      true,
      );
    }
    
    else{window.removeEventListener("deviceorientation", this.handleOrientationEvent)}
  }
  
  handleOrientationEvent(pitch, yaw, roll){
    
    /*const yaw = event.alpha; // alpha: rotation around z-axis
    const roll = event.gamma; // gamma: left to right
    const pitch = event.beta; // beta: front back motion
    this.gui.displayVal.innerHTML = event.beta;*/
    
    this.pitch = pitch;
    this.roll = roll;
    if(yaw>180){yaw = yaw-360;}
    this.yaw = yaw;///180*Math.PI;
    
    this.yaw = this.gymbolLockCorrection(this.roll, this.yaw);
    
    this.gui.displayVal.innerHTML =  this.name + "//   pitch: "+ Math.round(this.pitch) + " yaw: "+ Math.round(this.yaw) + " roll: " + Math.round(this.roll);

  };
  
   setRunning(boolean){
    if(boolean === true){
      this.running = true;
      this.addRemoveOrientationEventListener();
    }
    else{
      this.running = false;
      this.addRemoveOrientationEventListener();
    }
    this.gui.checkbox.checked = this.running;
    
  }
  
  gymbolLockCorrection(rollDegrees, yawDegrees){
    var rotationDegrees;
    if(rollDegrees < 0 && yawDegrees < 0) // This is the condition where simply
                                          // summing yawDegrees with rollDegrees
                                          // wouldn't work.
                                          // Suppose yaw = -177 and pitch = -165. 
                                          // rotationDegrees would then be -342, 
                                          // making your rotation angle jump all
                                          // the way around the circle.
    { 
      rotationDegrees = 360 - (-1 * (yawDegrees + rollDegrees));
    }
    else
    {
      rotationDegrees = yawDegrees + rollDegrees;
    }
    return rotationDegrees;
  }
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.checkbox = document.createElement("input");
     this.gui.checkbox.type = "checkbox";
     this.gui.div.append(this.gui.checkbox);
     this.gui.checkbox.addEventListener("change", function(e){this.setRunning(e.target.checked)}.bind(this));
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name + "//   pitch: "+ Math.round(this.pitch) + " yaw: "+ Math.round(this.yaw) + " roll: " + Math.round(this.roll);
     this.gui.div.append(this.gui.displayVal);
  }
  
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////








class RobotGyro{
  constructor(params){//{ frequency: 60 }
    this.name = "gyroscope";
    this.gyroscope = new Gyroscope(params);
    this.x;
    this.y; 
    this.z;
    this.yaw = 0;
    this.running = false;
    
    this.gyroscope.addEventListener("reading", (e) => {
      this.x = this.gyroscope.x;
      this.y = this.gyroscope.y;
      this.z = this.gyroscope.z;
      
      this.gui.displayVal.innerHTML =  this.name + "//   x: "+ Math.round(this.x) + " y: "+ Math.round(this.y) + " z: " + Math.round(this.z);
 
    });
    
    this.makeGui();
  }
  
  
  
  
  setRunning(boolean){
    if(boolean === true){
      this.gyroscope.start();
      this.running = true;
      //this.addRemoveOrientationEventListener();
    }
    else{
      this.running = false;
      this.gyroscope.stop();
    }
    this.gui.checkbox.checked = this.running;
    
  }
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.checkbox = document.createElement("input");
     this.gui.checkbox.type = "checkbox";
     this.gui.div.append(this.gui.checkbox);
     this.gui.checkbox.addEventListener("change", function(e){this.setRunning(e.target.checked)}.bind(this));
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name + "//   x: "+ Math.round(this.x) + " y: "+ Math.round(this.y) + " z: " + Math.round(this.z);
     this.gui.div.append(this.gui.displayVal);
     
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





class DeviceMotion{
  constructor(){
    this.name = "device motion"
    this.xVelocity = 0;
    this.rotationRate.y= 0;
    this.rotationRate.x= 0;
    this.lastTimeStamp;
    window.addEventListener('devicemotion', function(event) {
     // this.gui.displayVal.innerHTML =  "motion";
       if (this.lastTimeStamp === undefined) {
         this.lastTimeStamp = Date.now();
         return; //ignore first call, we need a reference time
       }
       //  m/s²  * (miliseconds - miliseconds)/1000 => m/s
       this.xVelocity += event.acceleration.z  * ((Date.now() - this.lastTimeStamp)/1000);
       this.gui.displayVal.innerHTML =  this.name + "//   x velocity: "+ (this.xVelocity);
       this.lastTimeStamp = Date.now();
    }.bind(this))
    
    this.makeGui();
  }
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name + "//   x velocity: "+ Math.round(this.xVelocity);
     this.gui.div.append(this.gui.displayVal);
  }
}


















class Video{
  constructor(){
    this.name = "video";
    this.streamConstraints = {
      audio: false,
      //video: { width: 100, height: 100 },
      video: { width: 300, height: 300 },
    };
    
    this.makeGui();
    this.init();
  }
  
  init(){
    
    var videoElement = this.gui.videoElement;
    /*navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia );*/
    
    navigator.mediaDevices
    .getUserMedia(this.streamConstraints)
    .then(gotStream)
    .catch(function (e) {
        if (confirm("An error with camera occured:(" + e.name + ") Do you want to reload?")) {
            location.reload();
        }
    });
    
    function gotStream(stream) {
      videoElement.srcObject = stream 
      videoElement.play()
    }  
  }
  
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name;
     this.gui.div.append(this.gui.displayVal);
     this.gui.videoElement = document.createElement("video");
     this.gui.videoElement.style.display = "block";
     this.gui.videoElement.width = this.streamConstraints.video.width;
     this.gui.videoElement.height = this.streamConstraints.video.height;
     this.gui.div.append(this.gui.videoElement);
    
     this.gui.videoElement.style.cssText = "-moz-transform: scale(-1, 1); \
     -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); \
     transform: scale(-1, 1); filter: FlipH;";    
  }
}








