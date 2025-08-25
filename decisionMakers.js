class PlayAudioDecider extends subModule{
  constructor(){
    super("play audio decider");
  }
}

class MoveStop{
  constructor(){
    this.name="move stop";
    this.counter= 0;
    this.maxCount=6;
    this.interval=1000;
    this.intervalId;
    
    this.makeGui();
  }
  
  step(){
    var val;
    this.counter++;
    if(this.counter%2 === 0){val = 0.5;}
    else{ val = 0;}
    robot.mixers["sameAndOpposite"].setInputValue("opposite",val);
    console.log(val);
  }
  
  run(){
    this.intervalId = setInterval(this.step.bind(this),this.interval);
  }
  
  toggleRun(boolean){
    if(boolean === true){
      this.run();
    }
    else{
      clearInterval(this.intervalId);
    }
  }
  
  
  
  makeGui(){
    this.gui = {};
    this.gui.div = document.createElement("div");

    this.gui.displayVal = document.createElement("span");
    this.gui.displayVal.innerHTML =  this.name;
    this.gui.div.append(this.gui.displayVal);
    this.gui.checkbox = document.createElement("input");
    this.gui.checkbox.type = "checkbox";
    this.gui.div.append(this.gui.checkbox);
    this.gui.checkbox.addEventListener("change", function(e){this.toggleRun(e.target.checked)}.bind(this));
  }
}




class Sequence{
  
  constructor(params){
    this.name = params.name;
    this.sequence = params.sequence;
    this.makeGui();
    this.delay = 0;
  }
  
  
  start(){
    for(var i = 0; i<this.sequence.length; i++){
      var frame = this.sequence[i];
      this.delay+= frame.delay;
      setTimeout(frame.functionRef, this.delay, frame.param1, frame.param2);
      if(i === this.sequence.length-1){this.delay = 0};
    }
    
  }
  
  makeGui(){
    this.gui = {};
    this.gui.div = document.createElement("div");

    this.gui.displayVal = document.createElement("span");
    this.gui.displayVal.innerHTML =  this.name;
    this.gui.div.append(this.gui.displayVal);
    this.gui.checkbox = document.createElement("input");
    this.gui.checkbox.type = "checkbox";
    this.gui.div.append(this.gui.checkbox);
    this.gui.checkbox.addEventListener("change", function(e){this.start()}.bind(this));
  }
}