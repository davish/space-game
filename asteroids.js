var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
const ROTATION_RATE = 10;
const SPEED_LIMIT = 10;

var Ship = new Sprite([new Point(-6, -10), new Point(0, 14), new Point(6, -10)], new Point(canvas.width/2, canvas.height/2));
var Thruster = new Sprite([new Point(-3, -12), new Point(0, -20), new Point(3, -12)], new Point(Ship.coords.x, Ship.coords.y));

var bullets = [];

function Sprite(pts, start) {
  this.vertices = pts; // array of Points that define the polygon of the sprite.
  this.coords = start; // point of the center of the Sprite
  
  this.theta = -Math.PI/2; // angle of where the Sprite is pointing
  this.velocity = new Vector(0, 0); // set velocity to 0 to start.
  this.speedLimit = SPEED_LIMIT;
  
  this.age = 0;

  this.debug = false; // debug velocity vector

}

Sprite.prototype.draw = function(ctx) {
  this.age++;

  var rotation = [];

  // wraparound
  if (this.coords.x > canvas.width)
    this.coords.x = 0;
  else if (this.coords.x < 0)
    this.coords.x = canvas.width;
  if (this.coords.y > canvas.height)
    this.coords.y = 0;
  else if (this.coords.y < 0)
    this.coords.y = canvas.height;

  ctx.beginPath();
  var startingPoint = Point.add(Point.rotation(this.vertices[0], this.theta), this.coords);
  ctx.moveTo(.5 + startingPoint.x, .5+startingPoint.y);
  for (var i=1; i < this.vertices.length; i++) {
    var translated = Point.add(Point.rotation(this.vertices[i], this.theta), this.coords);
    ctx.lineTo(.5 + translated.x, .5 + translated.y);
  }
  ctx.closePath();
  ctx.stroke();

  if (this.debug) {
    ctx.beginPath();
    var v = this.velocity.components();
    ctx.moveTo(.5 + this.coords.x, .5 + this.coords.y);
    var p = Point.add(v, this.coords);
    ctx.lineTo(.5 + p.x, .5 + p.y);
    ctx.stroke();
  }
}

Sprite.prototype.rotate = function(theta) {
  this.theta = (this.theta + theta) % (Math.PI * 2);
}

Sprite.prototype.move = function() {
  /*
    Add velocity vector to the current location.
  */
  this.velocity.magnitude = Math.min(this.velocity.magnitude, this.speedLimit);
  this.coords = Point.add(this.coords, this.velocity.components());
}

function Bullet(owner) {
  Sprite.call(this, [new Point(0,0), new Point(0,1), new Point(1,1), new Point(1,0)])
  this.coords = owner.coords
  this.theta = owner.theta;
  this.speedLimit = owner.speedLimit + 5;

  this.velocity = Vector.add(owner.velocity, new Vector(owner.theta, 5));
}
Bullet.prototype = new Sprite()

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
  else if (e.which == 32 && bullets.length < 5) {
    bullets.push(new Bullet(Ship));
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
    Ship.rotate(Math.PI/180*ROTATION_RATE);
  else if (Ship.rotation === "right")
    Ship.rotate(-Math.PI/180*ROTATION_RATE);
  
  Ship.move();
  Thruster.coords = Ship.coords;
  Thruster.theta = Ship.theta;

  if (Ship.thruster === "on") {
    var v = new Vector(Ship.theta, .5);
    Ship.velocity = Vector.add(Ship.velocity, v);
    Thruster.draw(ctx);
  }
  
  Ship.draw(ctx);
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].move()
    bullets[i].draw(ctx)
    console.log(bullets[i].age)
    if (bullets[i].age > 100) {
      bullets.splice(i, 1);
      i--;
    }
  }
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
