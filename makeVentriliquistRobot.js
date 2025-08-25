

function makeVentriliquistRobot(){
  

      
      var robot= new Robot({name:"Ventriliquist"});
      robot.servos["left"] = new AudioServo({name:"left",channel:0,home:1.5});//AudioServo({name:"left",channel:0,home:1.06});
      //robot.servos["right"] = new AudioServo({name:"right",channel:1,home:1.5});//AudioServo({name:"right",channel:1,home:1.07});
      robot.servos["leftInv"] = new AudioServo({name:"leftInv",channel:2,home:1.5});
      //robot.servos["rightInv"] = new AudioServo({name:"rightInv",channel:3,home:1.5});
      robot.output = new AudioServoControler(robot.servos);
      




      robot.sensors["video"] = new Video();
      robot.sensors["computerVision"] = new ComputerVision(robot.sensors["video"],["bodyTrack"]);
      robot.sensors["audioRecorder"] = new AudioRecorder(robot.output.audioCtx);
      
      //robot.sensors["audioRecorder"].gui.recordButton.style.display = "none";
      robot.sensors["audioRecorder"].gui.generateSpikesButton.style.display = "none";
      robot.sensors["audioRecorder"].gui.invertButton.style.display = "none";
      robot.sensors["audioRecorder"].gui.mouthSyncLabel.style.display = "none";
      robot.sensors["audioRecorder"].gui.mouthSyncInput.style.display = "none";
      robot.sensors["audioRecorder"].gui.eyesTrimLabel.style.display = "none";
      robot.sensors["audioRecorder"].gui.eyesTrimInput.style.display = "none";
      
     
      
      robot.mappers["xProportion to eyes"] = new Mapper({
        name:"xProportion to eyes", 
        input: robot.sensors["computerVision"]["results"],
        trackingProperty:"noseX",
        //propertyArray: ["normResult","0","x"], //nose x
        trackingOptions:{noseX:{text:"nose x", propArray:["normResult","0","x"]},leftWristX:{text: "left wrist x", propArray:["normResult","9","x"]},rightWristX:{text:"right wrist x", propArray:["normResult","10","x"]},noseY:{text:"nose y", propArray:["normResult","0","y"]},leftWristY:{text: "left wrist y", propArray:["normResult","9","y"]},rightWristY:{text:"right wrist y", propArray:["normResult","10","y"]}}, 
        output: robot.servos["leftInv"],
        setter: "setValueFromProportionAwayFromHome", 
        mappingFunction: function(input){
          const canvas = robot.sensors["computerVision"].gui.videoCanvas;
          const ctx = robot.sensors["computerVision"].videoCtx;
          ctx.fillStyle = "red";
          ctx.fillRect(input*canvas.width, 0, 2, canvas.height);
          return input*0.3;  
         }, 
        freq:20  
      });  
  
  
  
       robot.mappers["yProportion to mouth"] = new Mapper({
        name:"yProportion to mouth", 
        input: robot.sensors["computerVision"]["results"],
        trackingProperty:"leftWristY",
        //propertyArray: ["normResult","0","y"],  //nose y
        trackingOptions:{noseX:{text:"nose x", propArray:["normResult","0","x"]},leftWristX:{text: "left wrist x", propArray:["normResult","9","x"]},rightWristX:{text:"right wrist x", propArray:["normResult","10","x"]},noseY:{text:"nose y", propArray:["normResult","0","y"]},leftWristY:{text: "left wrist y", propArray:["normResult","9","y"]},rightWristY:{text:"right wrist y", propArray:["normResult","10","y"]}},
        output: robot.servos["left"],
        setter: "setValueFromProportionOfRange", 
        mappingFunction: function(input){
          const canvas = robot.sensors["computerVision"].gui.videoCanvas;
          const ctx = robot.sensors["computerVision"].videoCtx;
          ctx.fillStyle = "red";
          ctx.fillRect(0, input*canvas.height, canvas.width, 2);
          return 1-input;
        }, 
        freq:20  
      });  
      
 
      robot.mappers["Loop"] = new Mapper({
        name:"Loop Audio", 
        input: robot.sensors["audioRecorder"],
        trackingProperty:"playing",
        trackingOptions:{playing:{text:"loop", propArray:["playing"]}},
        output: robot.sensors["audioRecorder"],
        setter: "togglePlay", 
        mappingFunction: function(input){
          //console.log(input);
          return !input;
        }, 
        freq:20  
      });  
  
      robot.mappers["face trigger audio"] = new Mapper({
        name:"face trigger audio", 
        input: robot.sensors["computerVision"]["results"],
        trackingProperty:"face",
        trackingOptions:{face:{text:"face", propArray:["normResult","0"]}},
        output: robot.sensors["audioRecorder"],
        setter: "togglePlay", 
        mappingFunction: function(input){
          var score = input.score;
          var x = input.x;
          const canvas = robot.sensors["computerVision"].gui.videoCanvas;
          const ctx = robot.sensors["computerVision"].videoCtx;
          ctx.fillStyle = "red";
          ctx.font = "10px serif";
          ctx.fillText(score,input*canvas.width,20);
          //ctx.fillRect(input*canvas.width, 0, 2, canvas.height);
          if(score>0.5 && this.output.playing === false){
            var togglePlay = true;
          }
          else{
           var togglePlay = false;
          }
          console.log("togglePlay:",togglePlay);
          return togglePlay;
        }, 
        freq:20  
      });  
      
      
      robot.storedDataPropArrays = [
                                      {propArray: ["sensors","audioRecorder","audioBuffers"], val:""}
                                   ]
      
      robot.makeGui();
      robot.gui.mixersDiv.style.display = "none";
      robot.gui.pidControlersDiv.style.display = "none";
      robot.gui.setPointsDiv.style.display = "none";
      robot.gui.stateSpacesDiv.style.display = "none";
      robot.gui.decisionMakersDiv.style.display = "none";
  
  
  
      function autoSetup(){
        
        if (confirm("Use previouseAudio?") === true) {
          //robot.sensors["audioRecorder"].audioBuffers = cache
          robot.sensors["audioRecorder"].audioBuffer = robot.sensors["audioRecorder"].audioBuffers[0];
        }
        else{
           alert("choose or record your own audio");
        }
        
        robot.mappers["volumeMeterValue to mouth"].gui.checkbox.checked = true;
        robot.mappers["volumeMeterValue to mouth"].toggleLooper(true);
        
        robot.sensors["computerVision"].gui.checkbox.checked = true;
        robot.sensors["computerVision"].toggleLooper(true);
        
        robot.mappers["xProportion to eyes"].gui.checkbox.checked = true;
        robot.mappers["xProportion to eyes"].toggleLooper(true);
        
        robot.mappers["face trigger audio"].gui.checkbox.checked = true;
        robot.mappers["face trigger audio"].toggleLooper(true);
      }
      
      //autoSetup();
  
      return robot;
        
}


//choose audio files
//check mp3 to mouth
//check computerVision
//check xproportionToEyes
//check faceTriggerAudio
//collaps all