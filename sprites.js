const ROTATION_RATE = 5;
const SPEED_LIMIT = 15;
const NUM_CHILD_ASTEROIDS = 3;
function Sprite(pts, start, scale) {
  this.vertices = []; // array of Points that define the polygon of the sprite.
  this.scale = scale ? scale : 1;
  pts = pts ? pts : [];
  for (var i = 0; i < pts.length; i++)
    this.vertices.push(Point.multiply(pts[i], this.scale));
  this.coords = start; // point of the center of the Sprite
  
  this.theta = -Math.PI/2; // angle of where the Sprite is pointing
  this.velocity = new Vector(0, 0); // set velocity to 0 to start.
  this.speedLimit = SPEED_LIMIT;

  this.age = 0;

  if (start)
    Sprite.all.push(this);

  this.debug = false; // debug velocity vector

}

Sprite.all = [];

Sprite.prototype.draw = function(ctx) {
  this.age++;

  // wraparound
  if (this.coords.x > canvas.width)
    this.coords.x = 0;
  else if (this.coords.x < 0)
    this.coords.x = canvas.width;
  if (this.coords.y > canvas.height)
    this.coords.y = 0;
  else if (this.coords.y < 0)
    this.coords.y = canvas.height;

  ctx.stroke(this.getPath());

  if (this.debug) {
    ctx.beginPath();
    var v = this.velocity.components();
    ctx.moveTo(.5 + this.coords.x, .5 + this.coords.y);
    var p = Point.add(v, this.coords);
    ctx.lineTo(.5 + p.x, .5 + p.y);
    ctx.stroke();
  }
}

Sprite.prototype.getPath = function() {
  var path = new Path2D();
  var points = this.getRawPath();

  path.moveTo(points[0].x, points[0].y);
  for (var i=1; i < this.vertices.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  path.closePath();

  return path;
}

Sprite.prototype.getRawPath = function() {
  var p = [];
  for (var i = 0; i < this.vertices.length; i++) {
    translated = Point.add(Point.rotation(this.vertices[i], this.theta), this.coords);
    p.push(new Point(translated.x + .5, translated.y + .5));
  }
  return p;
}

Sprite.prototype.rotate = function(theta) {
  this.theta = (this.theta + theta) % (Math.PI * 2);
}

Sprite.prototype.move = function() {
  /*
    Add velocity vector to the current location.
    Also, calculate effects of gravity.
  */

  for (var i = 0; i < stars.length; i++) {
    var dist = Point.distance(this.coords, stars[i].coords);
    var angle = Math.atan2(stars[i].coords.x - this.coords.x, stars[i].coords.y - this.coords.y)
    var force = new Vector(angle, 6.67 * (stars[i].mass/Math.pow(dist, 2)))
    this.velocity = Vector.add(this.velocity, force)
  }
  this.velocity.magnitude = Math.min(this.velocity.magnitude, this.speedLimit);
  this.coords = Point.add(this.coords, this.velocity.components());
}

Sprite.prototype.despawn = function() {
  var index = Sprite.all.indexOf(this);
  Sprite.all.splice(index, 1);

}

function Spaceship(start) {
  Sprite.call(this, [new Point(-6, -10), new Point(0, 14), new Point(6, -10)], start);
  
  this.thrust = "off";
  this.rotation = "null"
  this.thruster = new Sprite([new Point(-3, -12), new Point(0, -20), new Point(3, -12)]);
  Spaceship.all.push(this);
}
Spaceship.prototype = new Sprite();
Spaceship.all = [];

Spaceship.prototype.despawn = function() {
  Spaceship.all.splice(Spaceship.all.indexOf(this), 1);
  Sprite.prototype.despawn.call(this);
}

Spaceship.prototype.draw = function(ctx) {
  if (this.thrust == "on") {
    this.thruster.coords = this.coords;
    this.thruster.theta = this.theta;
    this.thruster.draw(ctx);
  }
  Sprite.prototype.draw.call(this, ctx);
}

function Bullet(owner) {
  Sprite.call(this, 
    [new Point(0,0), new Point(0,1), new Point(1,1), new Point(1,0)], new Point(owner.coords.x, owner.coords.y))
  this.theta = owner.theta;
  this.speedLimit = owner.speedLimit + 5;

  this.velocity = Vector.add(owner.velocity, new Vector(owner.theta, 5));
}
Bullet.prototype = new Sprite();

Bullet.prototype.despawn = function() {
  bullets.splice(bullets.indexOf(this), 1);
  Sprite.prototype.despawn.call(this);
}

function Asteroid(size, start, velocity, rotation) {
  var scale;
  this.size = size;
  switch(size) {
    case 3:
      scale = 10;
      break;
    case 2:
      scale = 5;
      break;
    case 1:
      scale = 2;
      break;
    default:
      return null;
  }
  Sprite.call(this, [
    new Point(0, 0),
    new Point(-1, -3),
    new Point(-5, -2),
    new Point(-5, 1),
    new Point(-1, 4),
    new Point(3, 4),
    new Point(3, -1)
    ], new Point(100, 100), scale);
  this.velocity = velocity ? velocity : new Vector(Math.random() * Math.PI*2, Math.random() * 2);
  this.coords = start ? start : new Point(100, 100);
  this.rotation = Math.PI/180 * (Math.random() > .5 ? -1 : 1);

  Asteroid.all.push(this);
}
Asteroid.prototype = new Sprite();

Asteroid.all = [];

Asteroid.prototype.move = function() {
  this.theta += this.rotation;
  Sprite.prototype.move.call(this);
}
Asteroid.prototype.draw = function(ctx) {
  Sprite.prototype.draw.call(this, ctx);
  ctx.fill(this.getPath())
}

Asteroid.prototype.despawn = function() {
  Asteroid.all.splice(Asteroid.all.indexOf(this), 1);
  Sprite.prototype.despawn.call(this);
}


function Star(coords, m, r) {
  this.coords = coords;
  this.mass = m;
  this.radius = r
}

Star.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.coords.x, this.coords.y, this.radius, 0, 2*Math.PI, false);
  ctx.fill();
}