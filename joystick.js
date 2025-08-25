    function Joystick(name, slave, xProperty, yProperty){
      this.name=name;
      this.min=0;
      this.max=1;
      this.xHome=1;
      this.yHome=1;
      this.x=0.5;
      this.y=0.5;
      this.width = 200;
      this.height = 200;
      this.slave = slave; 
      this.xProperty = xProperty;
      this.yProperty = yProperty;
      this.identifier;
     
      
     
      this.container=document.createElement("div");
      this.container.classList.add("joystickContainer");
      this.container.classList.add(this.name);
      //slave.gui.div.append(this.container);
     
      this.div=document.createElement("div");
      this.div.classList.add("joystick");
      //this.div.style.width = this.width + "px";
      //this.div.style.height = this.height +"px";
      this.container.append(this.div);
     
     
      this.txtEl=document.createElement("div");
      this.txtEl.classList.add("joystickTxt");
      this.container.append(this.txtEl);
     
      this.xHair=document.createElement("div");
      this.xHair.classList.add("xHair");
      this.div.append(this.xHair);
     
      this.yHair=document.createElement("div");
      this.yHair.classList.add("yHair");
      this.div.append(this.yHair);
     
      this.render=function(){
      var width= parseInt(getComputedStyle(this.div).width);
      this.xHair.style.left=this.x*(width)/(this.max-this.min)+"px";
      this.yHair.style.top= this.y*(width)/(this.max-this.min)+"px";
      this.txtEl.innerHTML=this.name+": "+this.x+" "+ this.y;        
      try{
        this.slave.setInputValueFromProportion(this.xProperty, this.x);
        this.slave.setInputValueFromProportion(this.yProperty, this.y);
      }
      catch{}
      }
      
      this.render();
     
     
      this.setHome=function(){
         this.xHome =this.x;
         this.yHome=this.y;
      }
      
      this.home=function(){
        this.x =this.xHome;
        this.y=this.yHome;
        this.render();
      }
     /*
      this.setHomeButton=document.createElement("button");
      this.setHomeButton.innerHTML="setHome";
      this.container.append(this.setHomeButton);
      this.setHomeButton.onclick=function(){
         this.xHome =this.x;
         this.yHome=this.y;
       }.bind(this);
       
      
       this.homeButton=document.createElement("button");
       this.homeButton.innerHTML="home";
       this.container.append(this.homeButton);
       this.homeButton.onclick=function(){
       this.x =this.xHome;
       this.y=this.yHome;
       this.render();
       }.bind(this);
       
      */
     
      
     
     
     
     
      this.div.addEventListener("touchstart",function(e){
        const touches = e.changedTouches;
        this.identifier=touches[touches.length-1].identifier;
        this.render();
        console.log(this.name,this.identifier);
      }.bind(this));
     
      this.div.addEventListener("touchmove",function(e){
        e.preventDefault();
        const touches = e.changedTouches;
        var x =e.touches[this.identifier].clientX;
        var y =e.touches[this.identifier].clientY;
        let rect = e.target.getBoundingClientRect();
        this.x= this.min + Math.round((x-rect.x)/rect.width*(this.max-this.min)*100)/100;
        this.y= this.min+ Math.round((y-rect.y)/rect.height*(this.max-this.min)*100)/100;
       
        if(this.x<this.min){this.x=this.min;}
        else if(this.x>this.max){this.x=this.max;}
        if(this.y<this.min){this.y=this.min;}
        else if(this.y>this.max){this.y=this.max;}
       
       
        this.render();
      }.bind(this));
     
     
      this.div.addEventListener("touchend",function(e){
        this.identifier=null;
        this.render();
      }.bind(this));
    }