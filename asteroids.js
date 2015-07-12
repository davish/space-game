var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
const ROTATION_RATE = 25;

var Ship = new Sprite([new Point(-10, -12), new Point(0, 20), new Point(10, -12)], new Point(canvas.width/2, canvas.height/2));
var Thruster = new Sprite([new Point(-7, -15), new Point(0, -23), new Point(7, -15)], new Point(Ship.coords.x, Ship.coords.y));

function Sprite(pts, start) {
  this.vertices = pts; // array of Points that define the polygon of the sprite.
  this.coords = start; // point of the center of the Sprite
  this.theta = -Math.PI/2; // angle of where the Sprite is pointing

  this.velocity = new Vector(0, 0); // set velocity to 0 to start.
}

Sprite.prototype.draw = function(ctx) {
  var rotation = [];
  for (var i=0; i < this.vertices.length; i++) {
    rotation.push(Point.rotation(this.vertices[i], this.theta));
  }
  
  // wraparound code
  if (this.coords.x > canvas.width)
    this.coords.x = 0;
  else if (this.coords.x < 0)
    this.coords.x = canvas.width;
  if (this.coords.y > canvas.height)
    this.coords.y = 0;
  else if (this.coords.y < 0)
    this.coords.y = canvas.height;

  ctx.beginPath();
  var nP1 = Point.add(rotation[0], this.coords);
  ctx.moveTo(.5 + nP1.x, .5+nP1.y);
  for (var i=1; i < rotation.length; i++) {
    var translated = Point.add(rotation[i], this.coords);
    ctx.lineTo(.5 + translated.x, .5 + translated.y);
  }
  ctx.closePath();
  ctx.stroke();
}

Sprite.prototype.rotate = function(theta) {
  this.theta = (this.theta + theta) % (Math.PI * 2);
}

Sprite.prototype.move = function() {
  /*
    Add velocity vector to the current location.
  */
  this.coords = Point.add(this.coords, this.velocity.components());
  if (this.velocity.magnitude > 15)
    this.velocity.magnitude = 15;
}

window.onkeydown = function(e) {
  if (e.which == 37) {
    Ship.rotation = "left";
  }
  else if (e.which == 39) {
    Ship.rotation = "right";
  }
  else if (e.which == 38) {
    Ship.thruster = "on";
  }
}
window.onkeyup = function(e) {
  if (e.which == 37 || e.which == 39) {
    Ship.rotation = "nope";
  }
  if (e.which == 38) {
    Ship.thruster = "off";
  }
}

function step() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (Ship.rotation === "left")
    Ship.rotate(Math.PI/ROTATION_RATE);
  else if (Ship.rotation === "right")
    Ship.rotate(-Math.PI/ROTATION_RATE);

  if (Ship.thruster === "on") {
    var v = new Vector(Ship.theta, 1);
    Ship.velocity = Vector.add(Ship.velocity, v);
    Thruster.draw(ctx);
  }
  Ship.move();
  Thruster.coords = Ship.coords;
  Thruster.theta = Ship.theta;


  Ship.draw(ctx);
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
