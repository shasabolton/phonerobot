//get angle function to work with math.js at bottom

//stopping half way through looping audio is causing shorter than required spikes when sliding
//write a setFromPercentage in mixer and use that from joystick
//make computr vision have video at screen width. (scale by screenwidth.videoElement)


//lesson plans

//construction--------

//build

//Glitch IDE
//code motors
//code code audio driver
//set motor speeds manually with slider

//code mixers
//test maually

//code sequence player and a sequence to play back
//[{time1,mixerSame, mixerOpposite},{time2,mixerSame, mixerOpposite},----)]

//code sensors
// gyro
// orientation
//rotate device wih motor off to see changes on the display 

//controllers
//simple if then. If sensor = 90 then same = 0 and difference = 0.5 (drive forward);
//if time = 2000 then same = 0.5 and difference = 0 (turn) etc

//PID controlers
//yaw with integral only (rotate mat/plate)
//get absolute angle working
//tilt balance

//obstacle avoidance
//if z acceleration < threshold then reverse and turn 90 degrees the contine forward

//computer vision
//track motion with yaw
//detect obsticals
//var joystick = new Joystick("steer");

var infoDiv = document.getElementById("infoDiv");






class App{
  static fix = "fix";
  static loopFunctions = [];
  static period = 10;//ms
  static lastLoop = Date.now();
  static robot;
  
  
  static init(){
    this.lastLoop = Date.now();
  }
  
  
  static loop(){
    if(Date.now() - this.lastLoop > this.period){
      for(var i = 0; i< this.loopFunctions.length; i++){
        this.loopFunctions[i]();
      }
      this.lastLoop = Date.now();
    }  
    requestAnimationFrame(this.loop.bind(this));
  }
  
  static addLoopFunction(func){
    this.loopFunctions.push(func);
  }
  
  static selectRobot(){
    try{document.body.removeChild(this.robot.gui.div);}
    catch{}
    
    var func = document.getElementById("robotSelect").value;
    this.robot = window[func]();
    //robot= makeArmsRobot();
  }
}


App.init();
App.loop();

//var robot = makeArmsRobot();













