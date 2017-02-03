var rotateY = [null, 60, 120, 180, 240, 300, 0];
var transform = 1;
var sides = [];
for( var i = 1; i <= 6; i++){
  sides[i] = document.getElementById('side' + i);
}

var animate = function(){
  for( var i = 1; i <= 6; i++){
    rotateY[i] = (rotateY[i] + 1)%360;
    var str = "rotateY(" + rotateY[i] + "deg)";
    sides[i].style.transform = str;
    if( rotateY[i] >= 90 && rotateY[i] <= 270)
      sides[i].style.zIndex = '1';
    else
      sides[i].style.zIndex = '2';

  }
  requestAnimationFrame(animate);
}

animate();
