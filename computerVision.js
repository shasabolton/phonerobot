class ComputerVision{
  constructor(videoSensor, functions){
    this.name = "computerVision";
    this.functions = functions;
    this.videoSensor = videoSensor;
    this.videoCtx;
    this.videoCopyCanvas;//only needed if models cant use video
    this.videoCopyCtx;//only needed if models cant use video
    this.prevRGBSum=[];
    this.freq = 20;
    this.lastPlay = Date.now();
    this.run = false;
    this.looper;
    this.trackedX;
    this.trackedY;
    this.trackingResults = {x:0, y:0, xProportion:0,yProportion:0, widthProportion:0, heightProportion:0};
    this.results={};
    this.bodyPoseDetector;
    App.addLoopFunction(this.loop.bind(this));
    this.makeGui();
  }
  
  setFreq(value){
    this.freq = value;
    this.gui.slider.value = value;
    this.gui.displayVal.innerHTML =  this.name + " frequency: " + this.freq +"Hz";
  } 
  
  getTrackedX(){
    return this.trackedX;
  } 
  
  getTrackingResults(){
    return this.trackingResults;
  } 
  
  drawVideoToCanvas(){
    this.videoCtx.drawImage(this.videoSensor.gui.videoElement, 0, 0, this.gui.videoCanvas.width, this.gui.videoCanvas.height);
  }
  
  
  
  
  loop(){
    if(this.run === true){
      if(Date.now()-this.lastPlay > 1000/this.freq){
       if(this.functions.includes("trackFace") === true){
         this.trackFace();
       }
       
       if(this.functions.includes("trackHands") === true){
         this.trackHands();
       }
       
       if(this.functions.includes("trackObjects") === true){
         this.trackObjects();
       }
       
       if(this.functions.includes("motionTrack") === true){
         this.motionTrack();
       }
       
        if(this.functions.includes("bodyTrack") === true){
         this.trackBody();
          try{
            //alert(this.normResult[0]["x"]);
          }
          catch{}
          
       }
       
       
       this.lastPlay = Date.now();
     }
    }
     
     //this.looper = requestAnimationFrame(()=>this.start());
  }
  
  
  
  
  toggleLooper(run){
    //if(run === true){this.start();}
    //else{window.cancelAnimationFrame(this.looper);}
    this.run = run;
  }
  
  
  
  
  
  
  
  
  
  
  async trackFace()
			{

				// load blazeface model
        if(this.faceTrackingModel === undefined){         
          this.faceTrackingModel = await blazeface.load();
        }
				
				const frame = this.videoSensor.gui.videoElement;
				// prepare canvas
				const canvas = this.gui.videoCanvas;
				const ctx = this.videoCtx;

           
					// track face position
					const result = await this.faceTrackingModel.estimateFaces(frame, false);
          this.drawVideoToCanvas();

					// check if face is detected
					if(result.length > 0)
					{
						
						     for (let i = 0; i < result.length; i++) {
							      const start = result[i].topLeft;
							      const end = result[i].bottomRight;
							      const size = [end[0] - start[0], end[1] - start[1]];
                    this.trackedX = (start[0] + size[0]/2)-frame.width/2;
                    this.trackedY = (start[1] + size[1]/2) - frame.height/2;
                    this.trackingResults.xProportion = Math.round(this.trackedX/(this.videoSensor.streamConstraints.video.width/2)*100)/100;
                    this.trackingResults.yProportion = Math.round(this.trackedY/(this.videoSensor.streamConstraints.video.height/2)*100)/100;
							      // Render a rectangle over each detected face.
                   ctx.strokeStyle = "red";
                   ctx.fillStyle = "red";
                   ctx.strokeRect(start[0], start[1], size[0], size[1]);
                   ctx.fillRect(this.trackedX + frame.width/2, this.trackedY + frame.height/2, 5, 5);
							    }
   						 
					}

			}
  
     
  
  
  
     async trackBody()
			{

          // load movenet model
          if(this.bodyTrackingModel === undefined){         
            this.bodyTrackingModel = poseDetection.SupportedModels.MoveNet;
            this.bodyPoseDetector = await poseDetection.createDetector(this.bodyTrackingModel);
          }

          const frame = this.videoSensor.gui.videoElement;
          // prepare canvas
          const canvas = this.gui.videoCanvas;
          const ctx = this.videoCtx;

           
					// track face position
					const result =  await this.bodyPoseDetector.estimatePoses(frame);
          this.drawVideoToCanvas();

					// draw and save results
					if(result.length > 0){
              
          
              for(var i = 0; i<result.length; i++){
                var body = result[i];
                var keypoints = body.keypoints;
                this.results.normResult = poseDetection.calculators.keypointsToNormalizedKeypoints(keypoints, {width:frame.width,height:frame.height});
                for(var j = 0;j<keypoints.length; j++){
                  var x = keypoints[j].x;
                  var y = keypoints[j].y;
                  ctx.fillStyle = "red";
                  ctx.fillRect(x, y, 5, 5);
                  //ctx.fillText(keypoints[j].name, x, y);

                  if(keypoints[j].name === "left_wrist"){
                  //  wristX = x;
                  //  wristY = y;
                    this.trackedX = x-this.videoSensor.gui.videoElement.width/2;
                    this.trackedY = y - this.videoSensor.gui.videoElement.height/2;
                    ctx.fillStyle = "red";
                   // ctx.fillRect(x, y, 10, 10);
                  }
                }

                this.trackingResults.xProportion = Math.round(this.trackedX/(this.videoSensor.streamConstraints.video.width/2)*100)/100;
                this.trackingResults.yProportion = Math.round(this.trackedY/(this.videoSensor.streamConstraints.video.height/2)*100)/100;
                //forarmLength = Math.sqrt(Math.pow(wristX-elbowX,2) + Math.pow(wristY-elbowY,2));
              }
   						 
			    }
        else{this.results.normResult = null;}
        
        
   /*     function drawBoundingBox(predictions){
          var elbowX;
          var elbowY;
          var wristX;
          var wristY;
          var forarmLength;
          
          for(var i = 0; i<predictions.length; i++){
            var body = predictions[i];
            var keypoints = body.keypoints;
            for(var j = 0;j<keypoints.length; j++){
              var x = keypoints[j].x;
              var y = keypoints[j].y;
              ctx.fillStyle = "red";
              ctx.fillRect(x, y, 1, 1);
              //ctx.fillText(keypoints[j].name, x, y);
              
            /*  if(keypoints[j].name === "left_wrist"){
                elbowX = x;
    
              }
              
              else if(keypoints[j].name === "right_elbow"){
                elbowX = x;
                elbowY = y;
              }
              
              if(j === 10){//keypoints[j].name === "right_wrist"){
              //  wristX = x;
              //  wristY = y;
                this.trackedX = x-this.videoSensor.gui.videoElement.width/2;
                this.trackedY = y - this.videoSensor.gui.videoElement.height/2;
                ctx.fillStyle = "red";
                ctx.fillRect(x, y, 10, 10);
              }
            }
          }
          
          this.trackingResults.xProportion = Math.round(this.trackedX/(this.videoSensor.streamConstraints.video.width/2)*100)/100;
          this.trackingResults.yProportion = Math.round(this.trackedY/(this.videoSensor.streamConstraints.video.height/2)*100)/100;
          //forarmLength = Math.sqrt(Math.pow(wristX-elbowX,2) + Math.pow(wristY-elbowY,2));
          
        }*/


			}
  
  
  
  
      async trackHands()
			{

				// load blazeface model
        if(this.handTrackingModel === undefined){         
          this.handTrackingModel = await handTrack.load();
        }
				
				const frame = this.videoSensor.gui.videoElement;
				// prepare canvas
				const canvas = this.gui.videoCanvas;
				const ctx = this.videoCtx;

           
					// track face position
					const result = await this.handTrackingModel.detect(frame);
          this.drawVideoToCanvas();

					// check if face is detected
					if(result.length > 0)
					{
						
            
             for(var i = 0; i< result.length; i++){
                var hand = result[i];
                var x = hand.bbox[0];
                var y = hand.bbox[1];
                var w = hand.bbox[2];
                var h = hand.bbox[3];
                ctx.strokeStyle = "red";
                ctx.strokeRect(x, y, w, h);
                //alert(x,y,w,h);
              }

						     for (let i = 0; i < result.length; i++) {
                    var hand = result[i];
                    var x = hand.bbox[0];
                    var y = hand.bbox[1];
                    var w = hand.bbox[2];
                    var h = hand.bbox[3];
							      const start = [x,y];
                    const size = [w,h];
                    this.trackedX = (start[0] + size[0]/2)-frame.width/2;
                    this.trackedY = (start[1] + size[1]/2) - frame.height/2;
                    this.trackingResults.xProportion = Math.round(this.trackedX/(this.videoSensor.streamConstraints.video.width/2)*100)/100;
                    this.trackingResults.yProportion = Math.round(this.trackedY/(this.videoSensor.streamConstraints.video.height/2)*100)/100;
							      // Render a rectangle over each detected face.
                   ctx.strokeStyle = "red";
                   ctx.fillStyle = "red";
                   ctx.strokeRect(start[0], start[1], size[0], size[1]);
                   ctx.fillRect(this.trackedX + frame.width/2, this.trackedY + frame.height/2, 5, 5);
							    }
   						 
					}

			}
  
  
  
  
  async trackObjects()
			{

				// load coco-ssd model
        if(this.objectTrackingModel === undefined){         
          this.objectTrackingModel =  await cocoSsd.load();
        }
				
				const frame = this.videoSensor.gui.videoElement;
				// prepare canvas
				const canvas = this.gui.videoCanvas;
				const ctx = this.videoCtx;

           
					// track face position
					const result = await this.objectTrackingModel.detect(frame);
          this.drawVideoToCanvas();

					// check if face is detected
					if(result.length > 0)
					{
						
						     for (let i = 0; i < result.length; i++) {
							      const start = [result[i].bbox[0],result[i].bbox[1]];
							      //const end = result[i].bottomRight;
							      const size = [result[i].bbox[2],result[i].bbox[3]];
                   // this.trackedX = (start[0] + size[0]/2)-frame.width/2;
                   // this.trackedY = (start[1] + size[1]/2) - frame.height/2;
							      // Render a rectangle over each detected face.
                   ctx.strokeStyle = "red";
                   ctx.fillStyle = "red";
                   ctx.strokeRect(start[0], start[1], size[0], size[1]);
                   //ctx.fillRect(this.trackedX + frame.width/2, this.trackedY + frame.height/2, 5, 5);
                   ctx.font = "20px serif";
                   ctx.fillText(result[i].class, start[0], start[1]);
							    }
   						 
					}

			}
  
  
  
  
  motionTrack(){
    
  //draw video to raw canvas
    if(this.videoCopyCanvas === undefined){
       this.videoCopyCanvas = document.createElement("canvas");
       this.videoCopyCanvas.width=this.videoSensor.streamConstraints.video.width;
       this.videoCopyCanvas.height=this.videoSensor.streamConstraints.video.height;
       this.videoCopyCanvas.style.width = "20%";
       this.videoCopyCanvas.style.aspectRatio = this.videoSensor.streamConstraints.video.width/this.videoSensor.streamConstraints.video.height +"";
       this.gui.div.append(this.videoCopyCanvas);
       this.videoCopyCtx = this.videoCopyCanvas.getContext('2d',{ alpha: false });
    }
  
    const videoelement = this.videoSensor.gui.videoElement;
    const videoCanvas = this.videoCopyCanvas;
    const videoCtx = this.videoCopyCtx;
    const videoCanvasFX = this.gui.videoCanvas;
		const videoCtxFX = this.videoCtx;
    
    videoCtx.drawImage(videoelement, 0, 0, videoCanvas.width, videoCanvas.height);
   
    //console.log("videoCtx: ",videoCtx);
    
    var centroid={x:0,y:0, numPix:0, xSum:0, ySum:0, minX:videoCanvasFX.width, minY:videoCanvas.height, maxX:0, maxY:0};
    videoCtxFX.clearRect(0,0,videoCanvasFX.width,videoCanvasFX.height);
    //get video raw data from canvas
    var data = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height).data; 
 
   for(var i=0;i<data.length/4;i++){
     videoCtxFX.fillStyle="white";

     //find difference from prev
     var RGBSum = data[i*4]+data[i*4+1]+data[i*4+2];

     try{
      var change= RGBSum-this.prevRGBSum[i];
      this.prevRGBSum[i]=RGBSum;
      //draw pixel on blank canvas if it is different from last time step
      if(change>50){

        var x=i%videoCanvasFX.width;
        var y=Math.floor(i/videoCanvasFX.width);
        videoCtxFX.fillRect(x,y,1,1);
        centroid.numPix++;
        centroid.xSum+=x;
        centroid.ySum+=y;
        if(centroid.minX>x){
          centroid.minX = x;
        }
        if(centroid.minY>y){
          centroid.minY = y;
        }
        if(centroid.maxX<x){
          centroid.maxX = x;
        }
        if(centroid.maxY<y){
          centroid.maxY = y;
        }

      }
     }
      catch{
       this.prevRGBSum.push(RGBSum);
      }

    }



    if(centroid.numPix/(videoCanvasFX.width*videoCanvasFX.height)>0.0){//500 only update eyes if lots of motion
       centroid.x=centroid.xSum/centroid.numPix;
       centroid.y=centroid.ySum/centroid.numPix;
       videoCtxFX.fillStyle="red";
       videoCtxFX.fillRect(centroid.x,centroid.y,10,10);
       videoCtxFX.strokeStyle="red";
       videoCtxFX.strokeRect(centroid.minX, centroid.minY,centroid.maxX - centroid.minX, centroid.maxY - centroid.minY);
      
      
       this.trackedX = centroid.x-videoCanvasFX.width/2;
       this.trackedY = centroid.y - videoCanvasFX.height/2;
       this.trackingResults.xProportion = Math.round(this.trackedX/(this.videoSensor.streamConstraints.video.width/2)*100)/100;
       this.trackingResults.yProportion = Math.round(this.trackedY/(this.videoSensor.streamConstraints.video.height/2)*100)/100;
       this.trackingResults.widthProportion = (centroid.maxX - centroid.minX)/this.videoSensor.streamConstraints.video.width;
       this.trackingResults.heightProportion = (centroid.maxY - centroid.minY)/this.videoSensor.streamConstraints.video.height;
							     
     }
  }
  
  
  
  makeGui(){
     this.gui = {};
     this.gui.div = document.createElement("div");
     this.gui.div.classList.add("subModule"); 
     this.gui.displayVal = document.createElement("span");
     this.gui.displayVal.innerHTML =  this.name + " frequency: " + this.freq+"Hz";
     this.gui.div.append(this.gui.displayVal);
    
     this.gui.checkbox = document.createElement("input");
     this.gui.checkbox.type = "checkbox";
     this.gui.div.append(this.gui.checkbox);
     this.gui.checkbox.addEventListener("change", function(e){this.toggleLooper(e.target.checked)}.bind(this));
    
     this.gui.div.append(document.createElement("BR"));    
     
     //freq slider
      this.gui.slider = document.createElement("input");
      this.gui.slider.type = "range";
      this.gui.slider.min = 1;
      this.gui.slider.max = 20;
      this.gui.slider.step = 1;
      this.gui.slider.value = this.freq;
      this.gui.div.append(this.gui.slider);
      this.gui.slider.style.width = "95%";
      this.gui.slider.addEventListener("input", function(e){
        this.setFreq(e.target.value);
      }.bind(this))
    
     this.gui.videoCanvas = document.createElement("canvas");
     this.gui.videoCanvas.width=this.videoSensor.streamConstraints.video.width;
     this.gui.videoCanvas.height=this.videoSensor.streamConstraints.video.height;
     this.gui.videoCanvas.style.width = "100%";;//"100%";
     this.gui.videoCanvas.style.aspectRatio = this.videoSensor.streamConstraints.video.width/this.videoSensor.streamConstraints.video.height +"";
     this.gui.div.append(this.gui.videoCanvas);
     this.videoCtx = this.gui.videoCanvas.getContext('2d', { alpha: false });
     this.gui.videoCanvas.style.cssText = "-moz-transform: scale(-1, 1); \
     -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); \
     transform: scale(-1, 1); filter: FlipH; width:100%; aspectRatio:1";    
     //this.videoCtx.scale(-1, 1);
     
  }
  
}