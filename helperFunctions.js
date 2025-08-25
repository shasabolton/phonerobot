function getFromPropertyArray(obj, propArray){
    if(propArray.length===1){
      //console.log(obj[propArray[0]]);
      return obj[propArray[0]];
      
    }
    else{
      var newPropArray = JSON.parse(JSON.stringify(propArray));
      newPropArray.shift();
      console.log("propArray:", propArray,"newPropArray:", newPropArray);
      var newObj = obj[propArray[0]];
      return this.getFromPropertyArray(newObj, newPropArray);
    }
  }


function setFromPropertyArray(obj, propArray, val){
  if(propArray.length >1){
    var newPropArray = JSON.parse(JSON.stringify(propArray));
    newPropArray.shift();
    setFromPropertyArray(obj[propArray[0]], newPropArray, val)
  }
  else{
    obj[propArray[0]] = val;
  }
  console.log("obj: ", obj);
  
}




function clockwiseBend(A,B,C){
                var riseAB = Math.atan2(B.y-A.y,B.x-A.x);
                var riseBC = Math.atan2(C.y-B.y,C.x-B.x);
                var clockwiseOpening = riseBC-riseAB;
                if(clockwiseOpening<0){
                  clockwiseOpening = Math.PI*2+clockwiseOpening;
                }
                var clockwiseOpeningDegrees = Math.round(clockwiseOpening*180/Math.PI);
                //infoDiv.innerHTML = "clockwiseOpeningDegrees: " + Math.round(clockwiseOpeningDegrees);
                return clockwiseOpening;
}