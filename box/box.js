var sideDegrees = [null, [45, 0, 45], [315, 45, 0], 
                         [315, 315, 0], [315, 0, 45], 
                         [45, 315, 0], [45, 45, 0]];
var transform = [0, 0, 1];
var sides = [];
for( var i = 1; i <= 6; i++){
  sides[i] = document.getElementById('side' + i);
}

var animate = function(){
  for( var i = 1; i <= 6; i++){
    for( var j = 0; j < 3; j++){
      sideDegrees[i][j] = (sideDegrees[i][j] + transform[j]) % 360;
    }
    var str = "rotateX(" + sideDegrees[i][0] + 
        "deg) rotateY(" + sideDegrees[i][1]+ 
        "deg) rotateZ(" + sideDegrees[i][2]+ "deg)";
    sides[i].style.transform = str;
  }
  requestAnimationFrame(animate);
}

animate();
