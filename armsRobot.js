function makeArmsRobot(){
  
     var scoreThreshold = 0.5;
      
      var robot= new Robot({name:"Arms Robot"});
      robot.servos["left"] = new AudioServo({name:"left",channel:0,home:1.5});//AudioServo({name:"left",channel:0,home:1.06});
      robot.servos["right"] = new AudioServo({name:"right",channel:1,home:1.5});//AudioServo({name:"right",channel:1,home:1.07});
      robot.servos["leftInv"] = new AudioServo({name:"leftInv",channel:2,home:1.5});
      robot.servos["rightInv"] = new AudioServo({name:"rightInv",channel:3,home:1.5});
      robot.output = new AudioServoControler(robot.servos);
  
     /* for(var prop in robot.servos){
        robot.servos[prop].min = 0.6; //milisecond pulse
        robot.servos[prop].max = 2.4; //milisecond pulse
      }*/
      




      robot.sensors["video"] = new Video();
      robot.sensors["computerVision"] = new ComputerVision(robot.sensors["video"],["bodyTrack"]);
     
     
     
      robot.mappers["right bicep angle"] = new Mapper({
            name:"right bicep angle", 
            input: robot.sensors["computerVision"],
            trackingProperty:"results",
            trackingOptions:{results:{text:"results", propArray:["results"]}},
            output: robot.servos["right"],
            setter: "setValueFromProportionOfRange", 
            mappingFunction: function(input){
              try{
                var elbow = input.normResult[8];
                var shoulder = input.normResult[6];
                var score = Math.round((elbow.score + shoulder.score)/2*100)/100;
              }
              catch{var score = 0;}
              infoDiv.innerHTML = "score: "+ score;
              if((score)>scoreThreshold){              
                var vert = {x: shoulder.x, y:shoulder.y+1};              
                var clockwiseBendAngle = clockwiseBend(vert,shoulder,elbow);
                var proportion = (clockwiseBendAngle-Math.PI)/Math.PI;           
                return proportion;
                //infoDiv.innerHTML = "";
              }
              else if(score === 0){
                return 0.5; 
                
              }
                           
            }, 
            freq:20  
          });  
  
  robot.mappers["right forearm angle"] = new Mapper({
            name:"right forearm angle", 
            input: robot.sensors["computerVision"],
            trackingProperty:"results",
            trackingOptions:{results:{text:"results", propArray:["results"]}},
            output: robot.servos["rightInv"],
            setter: "setValueFromProportionOfRange", 
            mappingFunction: function(input){ 
              try{
              var elbow = input.normResult[8];
              var shoulder = input.normResult[6];
              var hand = input.normResult[10]; 
              var score= (elbow.score + shoulder.score + hand.score)/3;
              }
              catch{var score = 0;}
              if(score > scoreThreshold){
                var clockwiseBendAngle = clockwiseBend(shoulder,elbow,hand);
                var proportion = (clockwiseBendAngle)/Math.PI;           
                return proportion;   
              }
              //else{return 0.5;}
                        
            }, 
            freq:20  
          });  
  
  robot.mappers["left bicep angle"] = new Mapper({
            name:"left bicep angle", 
            input: robot.sensors["computerVision"],
            trackingProperty:"results",
            trackingOptions:{results:{text:"results", propArray:["results"]}},
            output: robot.servos["left"],
            setter: "setValueFromProportionOfRange", 
            mappingFunction: function(input){
              try{
                var elbow = input.normResult[7];
                var shoulder = input.normResult[5];
                var score = (elbow.score + shoulder.score)/2;
              }
              catch{
                var score = 0;
              }
              if(score>scoreThreshold){
                var vert = {x: shoulder.x, y:shoulder.y+1};              
                var clockwiseBendAngle = clockwiseBend(vert,shoulder,elbow);
                var proportion = (clockwiseBendAngle)/Math.PI;           
                return proportion; 
              }
              else if(score === 0){return 0.5;}
            }, 
            freq:20  
          });  
  
      robot.mappers["left forearm angle"] = new Mapper({
            name:"left forearm angle", 
            input: robot.sensors["computerVision"],
            trackingProperty:"results",
            trackingOptions:{results:{text:"results", propArray:["results"]}},
            output: robot.servos["leftInv"],
            setter: "setValueFromProportionOfRange", 
            mappingFunction: function(input){
              try{
                var elbow = input.normResult[7];
                var shoulder = input.normResult[5];
                var hand = input.normResult[9];   
                var score = (elbow.score + shoulder.score + hand.score)/3
              }
              catch{ score = 0;}
              if(score>scoreThreshold){
                var clockwiseBendAngle = clockwiseBend(shoulder,elbow,hand);
                var proportion = (clockwiseBendAngle-Math.PI)/Math.PI;           
                return proportion;  
              }
              //else{return 0.5;}
            }, 
            freq:20  
          });  
  
      
      
      
  
      
      
      robot.makeGui();
      robot.gui.mixersDiv.style.display = "none";
      robot.gui.pidControlersDiv.style.display = "none";
      robot.gui.setPointsDiv.style.display = "none";
      robot.gui.stateSpacesDiv.style.display = "none";
      robot.gui.decisionMakersDiv.style.display = "none";
      robot.sensors.video.gui.div.style.display = "none";
      robot.gui.servosDiv.style.display = "none";
  
  
  
      function autoSetup(){
        
        robot.sensors["computerVision"].gui.checkbox.checked = true;
        robot.sensors["computerVision"].toggleLooper(true);
        
        robot.mappers["right bicep angle"].gui.checkbox.checked = true;
        robot.mappers["right bicep angle"].toggleLooper(true);
        
        robot.mappers["right forearm angle"].gui.checkbox.checked = true;
        robot.mappers["right forearm angle"].toggleLooper(true);
        
        robot.mappers["left bicep angle"].gui.checkbox.checked = true;
        robot.mappers["left bicep angle"].toggleLooper(true);
        
        robot.mappers["left forearm angle"].gui.checkbox.checked = true;
        robot.mappers["left forearm angle"].toggleLooper(true);

        
        robot.output.toggleInvertVal();
        robot.output.gui.invertCheck.checked = true;
      }
      
      autoSetup();
  
      return robot;
  
  
  
  
        
}