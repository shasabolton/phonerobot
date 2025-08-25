class PID{ //{setpoint, mixer, mixerPropertyName}
  constructor(params){//{"kp": 1, "ki":0, "kd": 0, "freq":60, servo: servo0, sign: 1, sensor:sencor, sensorProperty:y , setpoint: setpointFoo}
     this.name = params.name;
     this.sensor = params.sensor;    //actual setpoint value sensed ie position
     this.sensorProperty = params.sensorProperty; 
     this.s;
     this.setpoint = params.setpoint;
     this.sDes; //desired setpoint value
     this.e = 0; //error
     this.prevE = 0; //previouse error
    
     this.f=0;
    // this.v;// velocity
     //this.a; //acceleration
    
     this.dt; //change in time
     this.kp = params.kp;
     this.ki = params.ki;
     this.kd = params.kd;
     this.freq = params.freq;
     this.mixer = params.mixer;
     this.mixerProperty = params.mixerProperty;
    
     this.p=0;
     this.i=0;
     this.d=0;
    
     this.lastPlay = Date.now();
     this.looper;
     this.makeGui();
  }
  
  step(){
    this.s = this.sensor[this.sensorProperty];
    //console.log(this.setpoint);
    this.sDes = this.setpoint.value;
    this.dt = (Date.now() - this.lastPlay)/1000;   
    
    this.e = this.sDes - this.s;
    
    this.p = this.e*this.kp;    
    this.i += this.ki*this.e*this.dt;   
    this.d = this.kd*(this.e - this.prevE)/this.dt;
     
    this.prevE= this.e;
    this.f = this.p + this.i + this.d;
    
    this.mixer.setInputValue(this.mixerProperty,this.f);

  }
  
  start(){
     if(Date.now()-this.lastPlay > 1000/this.freq){
        if(this.sensor[this.sensorProperty]){
          this.step();
          this.lastPlay = Date.now();
          //infoDiv.innerHTML = Math.round(this.e);//Math.round(this.s*100)/100;
        }
        
     }
     this.looper = requestAnimationFrame(()=>this.start());
  }
  
  toggleLooper(run){
    console.log(run);
    if(run === true){this.start();}
    else{window.cancelAnimationFrame(this.looper);}
  }
  
  makeGui(){
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
  }
 
  
}