class Robot{
  constructor(params){
    this.name = params.name;
    this.servos={};//the motors attached
    this.output={};//signal to turn servo values into audio pluses
    this.mixers = {};//maps input values to servo values. ie yaw to servo values
    this.setpoints={};//desired velocity, yrotation etc
    this.sensors={};//gyro, camera etc
    this.controlers = {};//take setpoints and sensor readings to change servo values via PID control
    this.stateSpaces = {};//variables the robot keeps track of
    this.actionSpaces = {};// action the robot can make
    this.decisionMakers = {};
    this.storedDataPropArrays = [];
    this.mappers = {};
    
    //this.makeGui();
  }
  
  saveToLocalStorage(){
    alert("save"); 
    for(var i = 0; i< this.storedDataPropArrays.length; i++){
      this.storedDataPropArrays[i].val = getFromPropertyArray(this, this.storedDataPropArrays[i].propArray);
    }
    localStorage[this.name] = this.storedDataPropArrays;//JSON.stringify(this.storedDataPropArrays);
  }
  
  loadFromLocalStorage(){
    var stored = localStorage[this.name];
    if (stored!=undefined) {
      this.storedDataPropArrays = stored;//JSON.parse(stored);
      for(var i = 0; i< this.storedDataPropArrays.length; i++){
         setFromPropertyArray(this, this.storedDataPropArrays[i].propArray, this.storedDataPropArrays[i].val);
      }
    }
    else{ }
  }
  
  makeGuiModule(moduleName){
      var div = document.createElement("div");
      div.classList.add("module");    
      var titleTxt = document.createElement("span");
      titleTxt.classList.add("moduleTitle")
      titleTxt.innerHTML =  moduleName;
      div.append(titleTxt);
      return div;
  }
  
  makeGui(){
    console.log("making gui:");
      this.gui = {};
      this.gui.div = document.createElement("div");
      this.gui.div.classList.add("module");    
      this.gui.displayVal = document.createElement("span");
      this.gui.displayVal.innerHTML =  this.name;
      this.gui.div.append(this.gui.displayVal);
      this.gui.displayVal.classList.add("title")

      /*this.gui.saveButton = document.createElement("button");  
      this.gui.saveButton.innerHTML =  "save";
      this.gui.saveButton.onclick = this.saveToLocalStorage.bind(this);
      this.gui.div.append(this.gui.saveButton);
       
      this.gui.loadButton = document.createElement("button");  
      this.gui.loadButton.innerHTML =  "load";
      this.gui.loadButton.onclick = this.loadFromLocalStorage.bind(this);
      this.gui.div.append(this.gui.loadButton);*/
      
    
      this.gui.outputDiv = this.makeGuiModule("Outputs (listen to Servos)");
      this.gui.div.append( this.gui.outputDiv); 
      this.gui.outputDiv.append(this.output.gui.mainDiv);
    
      this.gui.servosDiv = this.makeGuiModule("Servos (listen to Mixers)");
      this.gui.div.append( this.gui.servosDiv); 
      for(var i in this.servos){
         this.gui.servosDiv.append(this.servos[i].gui.div);
      }
    
      this.gui.mixersDiv = this.makeGuiModule("Mixers (listen to controlers)");
      this.gui.div.append(  this.gui.mixersDiv); 
      for(var i in this.mixers){
         this.gui.mixersDiv.append(this.mixers[i].gui.div);
      }
    
      this.gui.sensorsDiv = this.makeGuiModule("Sensors");
      this.gui.div.append(this.gui.sensorsDiv); 
      for(var i in this.sensors){
        console.log(i)
         this.gui.sensorsDiv.append(this.sensors[i].gui.div);
      }
    
      this.gui.pidControlersDiv = this.makeGuiModule("PID Controlers (listen to setpoints)");
      this.gui.div.append(this.gui.pidControlersDiv);    
      for(var i in this.controlers){
        this.gui.pidControlersDiv.append(this.controlers[i].gui.div);
      }
    
      this.gui.setPointsDiv = this.makeGuiModule("Setpoints (listen to you)");
      this.gui.div.append( this.gui.setPointsDiv );     
      for(var i in this.setpoints){
         this.gui.setPointsDiv.append(this.setpoints[i].gui.div);
      }
     
      this.gui.stateSpacesDiv = this.makeGuiModule("State Spaces");
      this.gui.div.append( this.gui.stateSpacesDiv); 
      for(var i in this.stateSpaces){
         this.gui.stateSpacesDiv.append(this.stateSpaces[i].gui.div);
      }
    
      this.gui.decisionMakersDiv = this.makeGuiModule("Decision Makers");
      this.gui.div.append( this.gui.decisionMakersDiv); 
      for(var i in this.decisionMakers){
         try{this.gui.decisionMakersDiv.append(this.decisionMakers[i].gui.div);}
         catch{}
         
      }
    
      this.gui.mappersDiv = this.makeGuiModule("mappers");
      this.gui.div.append(this.gui.mappersDiv); 
      for(var i in this.mappers){
         try{this.gui.mappersDiv.append(this.mappers[i].gui.div);}
         catch{}
         
      }
    
      document.body.append(this.gui.div);
  }
}








class StateSpace{
  constructor(params){
    this.name = params.name;
    this.stateVariables = params.stateVariables;
    this.makeGui();
  }
  
  makeGui(){
      this.gui = {};
      this.gui.div = document.createElement("div");
      
      this.gui.displayVal = document.createElement("span");
      this.gui.displayVal.innerHTML =  this.name;
      this.gui.div.append(this.gui.displayVal);
      for(var i in this.stateVariables){
        this.gui.div.append(this.stateVariables[i].gui.div);
      }
  }
}

class StateVariable{
  constructor(name, object, property){
    this.name = name;
    this.object = object;
    this.property = property;
    this.makeGui();
  }
  
  makeGui(){
      this.gui = {};
      this.gui.div = document.createElement("div");
      
      this.gui.displayVal = document.createElement("span");
      this.gui.displayVal.innerHTML =  this.name;
      this.gui.div.append(this.gui.displayVal);
  }
}














class Mixer{
 constructor(params){//{
                     //inputs:{yaw:{name:"yaw", min:-1, max:1, step:0.1, value:0}, velocity:{name:"veocity", min:-1,max:1, step:0.1, value:0}} 
                     //servos:[{servo:left, mixingFunction: function(inputs){return -1*inputs.yaw.value -1*inputs.velocity.value}, {servo:right, mixingFunction: function(inputs){return -1*inputs.yaw.value +1*inputs.velocity.value}] }}
                    //}
   this.inputs=params.inputs;
   this.servos = params.servos;
   this.joystick;
  
    if(params.joystick!=undefined){        
      this.joystick = new Joystick("joystick", this, params.joystick.x, params.joystick.y);
    }

    this.makeGui();
 
   
 }
  setInputValue(property, value){
    //alert(property);
    if(value >= this.inputs[property].min && value <= this.inputs[property].max){
      this.inputs[property].value = Math.round(value*100)/100;
      this.gui[property].displayVal.innerHTML =  this.inputs[property].name+ ": " + this.inputs[property].value;
      this.gui[property].slider.value =  this.inputs[property].value;
      this.mapInputsToServos();
    }    
  }
  
  setInputValueFromProportion(property, proportion){
    var value = this.inputs[property].min + (this.inputs[property].max - this.inputs[property].min)*proportion;
    this.setInputValue(property, value);
  }
  
  mapInputsToServos(){
      for(var i=0; i<this.servos.length; i++){
        this.servos[i].servo.setValue(this.servos[i].servo.home + this.servos[i].mixingFunction(this.inputs));
      }
  }
  
  makeGui(){
      this.gui = {};
      this.gui.div = document.createElement("div");
      this.gui.div.classList.add("module"); 
     //console.log(this.joystick);
    if(this.joystick!= undefined){
      this.gui.div.append(this.joystick.container);
    }
     
      for(var property in this.inputs){
          this.gui[property] = {};
          this.gui[property].div = document.createElement("div");
          this.gui[property].displayVal = document.createElement("span");
          this.gui[property].displayVal.innerHTML =  this.inputs[property].name+ ": " + this.inputs[property].value;
          this.gui[property].div.append(this.gui[property].displayVal);

          this.gui[property].slider = document.createElement("input");
          this.gui[property].slider.type = "range";
          this.gui[property].slider.min = this.inputs[property].min;
          this.gui[property].slider.max = this.inputs[property].max;
          this.gui[property].slider.step = this.inputs[property].step;
          this.gui[property].slider.value = this.inputs[property].value;
          this.gui[property].div.append(this.gui[property].slider);
          this.gui[property].slider.style.width = "95%";
          this.gui[property].slider.inputProperty = property;
          this.gui.div.append(this.gui[property].div);
        
          this.gui[property].slider.addEventListener("input", function(e){
            this.setInputValue(e.target.inputProperty, e.target.value);
          }.bind(this))
      }

    
  }
  
}




class Setpoint{
    constructor(params){ 
      this.name = params.name;
      this.min = params.min;
      this.max = params.max;
      this.step = params.step;
      this.value = params.value;
      this.makeGui();
    }
  
    setValue(value){
      if(value>=this.min && value <= this.max){
        this.value = value;
        //this.mapValueToServos();
      }   
      this.gui.displayVal.innerHTML =  this.name+ ": " + this.value;
      this.gui.slider.value =  this.value;
    }
   
  
    makeGui(){
      this.gui = {};
      this.gui.div = document.createElement("div");
      
      this.gui.displayVal = document.createElement("span");
      this.gui.displayVal.innerHTML =  this.name+":" + this.value;
      this.gui.div.append(this.gui.displayVal);
      
      this.gui.slider = document.createElement("input");
      this.gui.slider.type = "range";
      this.gui.slider.min = this.min;
      this.gui.slider.max = this.max;
      this.gui.slider.step = this.step;
      this.gui.slider.value = this.value;
      this.gui.div.append(this.gui.slider);
      this.gui.slider.style.width = "100%";
      this.gui.slider.addEventListener("input", function(e){
        this.setValue(e.target.value);
      }.bind(this))
    
  }
  
}



class Mapper{
  constructor(params){
    this.name = params.name;
    this.input = params.input;
    //this.property = params.property;
    this.trackingOptions = params.trackingOptions;
    this.trackingProperty = params.trackingProperty,
    this.propertyArray = this.trackingOptions[this.trackingProperty];// params.propertyArray;
    this.output = params.output;
    this.setter = params.setter;
    this.mappingFunction = params.mappingFunction;
    this.freq = params.freq;
    this.run = false;
   
    this.lastPlay = Date.now();
    this.looper;
    App.addLoopFunction(this.loop.bind(this));
    this.makeGui();
  }
  
  step(){
    try{
      var val = this.getFromPropertyArray(this.input,JSON.parse(JSON.stringify(this.trackingOptions[this.trackingProperty]["propArray"])));
      this.output[this.setter](this.mappingFunction(val));
    }
    catch{
      //console.log("input:",this.input, "propertyArray:", this.trackingOptions[this.trackingProperty]);
    };
  }
  
  loop(){
    if(this.run === true){
     if(Date.now()-this.lastPlay > 1000/this.freq){      
          this.step();
          this.lastPlay = Date.now();
     }
     //this.looper = requestAnimationFrame(()=>this.start());
    }
  }
  
  toggleLooper(run){
    //console.log("loop",run);
    //if(run === true){this.start();}
    //else{window.cancelAnimationFrame(this.looper);}
    this.run = run;
  }
  
  
  getFromPropertyArray(obj, propArray){
    if(propArray.length===1){
      //console.log(obj[propArray[0]]);
      return obj[propArray[0]];
      
    }
    else{
      var newArray = propArray.splice(1, propArray.length-1);
      var newObj = obj[propArray[0]];
      return this.getFromPropertyArray(newObj, newArray);
    }
  }

  makeTrackingOptions(){
    for(var prop in this.trackingOptions){
      var option = document.createElement("option");
      option.text = this.trackingOptions[prop]["text"];
      option.value = prop;
      this.gui.trackingOptionsSelect.add(option);
      if(prop === this.trackingProperty){
        option.selected = true;
      }
    }
    
  }
  
  makeGui(){
    console.log("mapper gui made");
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name;
     this.gui.div.append(this.gui.displayVal);
     this.gui.checkbox = document.createElement("input");
     this.gui.checkbox.type = "checkbox";
     this.gui.div.append(this.gui.checkbox);
     this.gui.checkbox.addEventListener("change", function(e){this.toggleLooper(e.target.checked)}.bind(this));
    
     this.gui.trackingOptionsSelect = document.createElement("select");
     this.gui.div.append(this.gui.trackingOptionsSelect);
     this.gui.trackingOptionsSelect.addEventListener("change", function(event){
       this.trackingProperty = event.target.value;
       //this.propertyArray = this.trackingOptions[this.trackingProperty]["propArray"];
       //alert(this.propertyArray);
     }.bind(this))
     this.makeTrackingOptions();
  }
  
  
}








