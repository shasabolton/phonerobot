function makeDrivingRobot(){
  

      
      var robot= new Robot({name:"Phone Segway"});
      robot.servos["left"] = new AudioServo({name:"left",channel:0,home:1.5});//AudioServo({name:"left",channel:0,home:1.06});
      //robot.servos["right"] = new AudioServo({name:"right",channel:1,home:1.5});//AudioServo({name:"right",channel:1,home:1.07});
      robot.servos["leftInv"] = new AudioServo({name:"leftInv",channel:2,home:1.5});
      //robot.servos["rightInv"] = new AudioServo({name:"rightInv",channel:3,home:1.5});
      robot.output = new AudioServoControler(robot.servos);



      robot.mixers["sameAndOpposite"] = new Mixer(
         {
          inputs:{
                  same:{name:"left right same", min:-1, max:1, step:0.01, value:0},
                  opposite:{name:"left right opposite", min:-1,max:1, step:0.01, value:0}
                 }, 
          servos:[
                  {servo:robot.servos["left"], mixingFunction: function(inputs){return -1*inputs.same.value -1*inputs.opposite.value}},
                  {servo:robot.servos["right"], mixingFunction: function(inputs){return -1*inputs.same.value +1*inputs.opposite.value}}
                 ]
         }
      )


      /*
      robot.mixers["remoteDrive"] = new Mixer(
         {
          inputs:{
                  same:{name:"lefts same", min:-1, max:1, step:0.01, value:0},
                  opposite:{name:"lefts opposite", min:-1,max:1, step:0.01, value:0}
                 }, 
          servos:[
                  {servo:robot.servos["left"], mixingFunction: function(inputs){
                      var deadband = 0.1;
                      var slope = 0.3;// 1/(1-deadband);
                      var same = 0;
                      var opposite = 0;
                      if(inputs.same.value>deadband){
                        same = (inputs.same.value - deadband)*slope;
                      }
                      else if(inputs.same.value<-1*deadband){
                        same = (inputs.same.value + deadband)*slope;
                      }
                      if(inputs.opposite.value>deadband){
                        opposite = (inputs.opposite.value - deadband)*slope;
                      }
                      else if(inputs.opposite.value<-1*deadband){
                        opposite = (inputs.opposite.value + deadband)*slope;
                      }

                      //return Math.sign(opposite)*-1*same -1*opposite;
                      return   1*same -1*opposite;
                    }
                  },
                  {servo:robot.servos["leftInv"], mixingFunction: function(inputs){
                      var deadband = 0.1;
                      var slope = 0.3//1/(1-deadband);
                      var same = 0;
                      var opposite = 0;
                      if(inputs.same.value>deadband){
                        same = (inputs.same.value - deadband)*slope;
                      }
                      else if(inputs.same.value<-1*deadband){
                        same = (inputs.same.value + deadband)*slope;
                      }
                      if(inputs.opposite.value>deadband){
                        opposite = (inputs.opposite.value - deadband)*slope;
                      }
                      else if(inputs.opposite.value<-1*deadband){
                        opposite = (inputs.opposite.value + deadband)*slope;
                      }

                    //return Math.sign(opposite)*-1*same +1*opposite;
                    return 1*same +1*opposite;
                    }
                  }
                 ],
                 joystick:{x:"same", y:"opposite"}
         }
      )
      */




      robot.setpoints["yaw"] = new Setpoint({
        name: "yaw",
        min:-180,
        max:180,
        value:0,
        step:0.1,
      });

      robot.setpoints["yawVelocity"] = new Setpoint({
        name: "yaw velocity",
        min:-3.14,
        max:3.14,
        value:0,
        step:0.01,
      });

      robot.setpoints["pitch"] = new Setpoint({
        name: "pitch",
        min:-180,
        max:180,
        value:-83,
        step:0.01,
      });

      robot.setpoints["velocity"] = new Setpoint({
        name: "velocity",
        min:-180,
        max:180,
        value:-88,
        step:0.01,
      });




      robot.sensors["orientation"] = new Orientation();
      robot.controlers["PIDPitch"] = new PID({name: "balance", "kp": 0.02, "ki":0.0, "kd": 0.0013, "freq":60, sensor:robot.sensors["orientation"] , sensorProperty:"pitch", setpoint: robot.setpoints["pitch"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "opposite"});

      robot.sensors["gyro"] = new RobotGyro({ frequency: 60 });//Gyroscope({ frequency: 60 });
      robot.sensors["gyro"].setRunning(true);
      robot.controlers["PIDYawVelocity"] = new PID({name: "yaw velocity", "kp": 0, "ki":0.3, "kd": 0, "freq":60, sensor:robot.sensors["gyro"] , sensorProperty:"y", setpoint: robot.setpoints["yawVelocity"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "same"});

      robot.controlers["PIDYaw"] = new PID({name:"yaw angle", "kp": -0.005, "ki":0, "kd": -0.0002, "freq":60, sensor:robot.sensors["orientation"] , sensorProperty:"yaw", setpoint: robot.setpoints["yaw"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "same"});


      robot.sensors["video"] = new Video();
      robot.sensors["computerVision"] = new ComputerVision(robot.sensors["video"],["trackFace"]);

      //robot.controlers["PIDFaceTrackX"] = new PID({name:"face track x", "kp": -0.0022, "ki":0, "kd": -0.00014, "freq":60, sensor:robot.sensors["computerVision"] , sensorProperty:"trackedX", setpoint: robot.setpoints["yaw"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "same"});
      //robot.controlers["PIDFaceTrackY"] = new PID({name:"face track y", "kp": -0.004, "ki":0, "kd": -0.000, "freq":60, sensor:robot.sensors["computerVision"] , sensorProperty:"trackedY", setpoint: robot.setpoints["yaw"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "opposite"});
      robot.controlers["PIDFaceTrackX"] = new PID({name:"face track x", "kp": 0.0022, "ki":0, "kd": 0.00014, "freq":60, sensor:robot.sensors["computerVision"] , sensorProperty:"trackedX", setpoint: robot.setpoints["yaw"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "same"});
      robot.controlers["PIDFaceTrackY"] = new PID({name:"face track y", "kp": 0.004, "ki":0, "kd": 0.000, "freq":60, sensor:robot.sensors["computerVision"] , sensorProperty:"trackedY", setpoint: robot.setpoints["yaw"] , mixer: robot.mixers["sameAndOpposite"], mixerProperty: "opposite"});


     /* robot.stateSpaces["basic"] = new StateSpace(
        {name:"basic", stateVariables:{
              yaw:new StateVariable("yaw", this.robot.sensors["orientation"], "yaw"),
              timer:new StateVariable("timer", Date, "now"),
           }
        }


        );*/


      robot.decisionMakers["moveStop"] = new MoveStop();


      robot.decisionMakers["square"] = new Sequence(
         { name:"square",
           sequence: [               
                      //forward for one second
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0.5},
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0},

                      //turn 2      
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:0, param1:1.57},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:1000, param1:0},

                      //forward for one second
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0.5},
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0},

                       //turn 3      
                     // {functionRef:robot.setpoints["yaw"].setValue.bind(robot.setpoints["yaw"]),delay:0, param1:180},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:0, param1:1.57},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:1000, param1:0},

                      //forward for one second
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0.5},
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0},

                       //turn 4      
                      //{functionRef:robot.setpoints["yaw"].setValue.bind(robot.setpoints["yaw"]),delay:0, param1:-90},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:0, param1:1.57},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:1000, param1:0},

                      //forward for one second
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0.5},
                      {functionRef:robot.mixers["sameAndOpposite"].setInputValue.bind(robot.mixers["sameAndOpposite"]),delay:1000, param1:"opposite", param2: 0},

                      //turn
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:0, param1:1.57},
                      {functionRef:robot.setpoints["yawVelocity"].setValue.bind(robot.setpoints["yawVelocity"]),delay:1000, param1:0},
            ]
         }
      );                                  

      robot.makeGui();
      return robot;
        
}