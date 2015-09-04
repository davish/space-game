function Point(x, y) {
  this.x = Math.round(x*1000)/1000;
  this.y = Math.round(y*1000)/1000;
}

Point.rotation = function(p, theta) {
  return new Point(Math.cos(theta)*p.x + Math.sin(theta)*p.y, 
                  -Math.sin(theta)*p.x + Math.cos(theta)*p.y);
}

Point.add = function(a, b) {
  return new Point(a.x + b.x, a.y + b.y);
}


function Vector(angle, magnitude) {
  this.theta = angle;
  this.magnitude = magnitude;
}

Vector.prototype.components = function() {
  // basically make the magnitude point straight up and rotate it by theta to get x and y.
  var m = new Point(0, this.magnitude);
  // console.log(m);
  var p = Point.rotation(m, this.theta);
  // console.log(p)
  return p;
}

Vector.add = function(a, b) {
  var a1 = a.components();
  var b1 = b.components();
  
  var sum = Point.add(a1, b1);
  var theta = Math.atan(sum.x/sum.y); // angle of vector is asin of slope

  if (sum.x == 0) // can't divide by 0, but we still want the vector
    theta = Math.PI/2;
  if (sum.y == 0) {
    theta = Math.PI/2 * (sum.x > 0 ? 1 : -1);
  }
  if (sum.y < 0)
    theta = (theta + Math.PI) % (Math.PI * 2);

  var magnitude = Math.sqrt(Math.pow(sum.x, 2) + Math.pow(sum.y, 2)); // dist from origin
  var v = new Vector(theta, magnitude);
  return v;
}