const ROTATION_RATE = 5;
const SPEED_LIMIT = 15;
const NUM_CHILD_ASTEROIDS = 3;
const SCALE_FACTOR = 1;
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
}

Sprite.all = [];

Sprite.prototype.draw = function(ctx, path) {
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

  ctx.stroke(path ? path : this.getPath());
}

Sprite.prototype.getPath = function(pts) {
  /*
    returns Path2D object for drawing on to the canvas. 
    only works in Chrome and Firefox.
  */
  var path = new Path2D();
  var points = pts ? pts : this.getRawPath();

  path.moveTo(points[0].x, points[0].y);
  for (var i=1; i < this.vertices.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  path.closePath();

  return path;
}

Sprite.prototype.getRawPath = function(src, t, c) {
  /*
    returns array of Points translated and rotated into the correct position on the canvas.
  */
  var source = src ? src : this.vertices;
  var angle = t ? t : this.theta;
  var coords = c ? c : this.coords;

  var p = [];
  for (var i = 0; i < source.length; i++) {
    translated = Point.add(Point.multiply(Point.rotation(source[i], angle), SCALE_FACTOR), coords);
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
  
  this.thrust = false;
  this.rotation = "null";
  this.anchor = false;
  this.anchorAge = 0;
  this.anchorEnd = this.getRawPath()[1];
  this.anchorTo = null;

  this.score = 0;

  this.thruster = new Sprite([new Point(-3, -12), new Point(0, -20), new Point(3, -12)]);
  Spaceship.all.push(this);
}
Spaceship.prototype = new Sprite();
Spaceship.all = [];

Spaceship.prototype.despawn = function() {
  Spaceship.all.splice(Spaceship.all.indexOf(this), 1);
  Sprite.prototype.despawn.call(this);
}

Spaceship.prototype.move = function() {
  if (this.rotation === "left")
    this.rotate(Math.PI/180*ROTATION_RATE);
  else if (this.rotation === "right")
    this.rotate(-Math.PI/180*ROTATION_RATE);
  
  if (this.thrust)
    this.velocity = Vector.add(this.velocity, new Vector(this.theta, .1));

  if (this.anchorTo) {
    this.rotate(this.anchorTo.rotation);
    this.coords = Point.add(
      this.anchorTo.coords, 
      Point.rotation(Point.subtract(this.coords, this.anchorTo.coords), this.anchorTo.rotation));
  }

  Sprite.prototype.move.call(this);
}

Spaceship.prototype.draw = function(ctx) {
  if (this.thrust) {
    this.thruster.coords = this.coords;
    this.thruster.theta = this.theta;
    this.thruster.draw(ctx);
  }

  // Calculate and draw anchor.
  var tip = this.getRawPath()[1];
  var end;
  if (this.anchor) {
    this.anchorAge = Math.min(++this.anchorAge, 60)
    if (this.anchorTo)
      this.anchorAge = this.length + 1;
    else
      this.length = this.anchorAge;
  }
  else 
    this.anchorAge = Math.max(--this.anchorAge, 0);
  
  end = Point.add(new Vector(this.theta, this.anchorAge).components(), tip);
  this.anchorEnd = end;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  Sprite.prototype.draw.call(this, ctx);
}

function Bullet(owner) {
  Sprite.call(this, 
    [new Point(0,0), new Point(0,1), new Point(1,1), new Point(1,0)], new Point(owner.coords.x, owner.coords.y))
  this.theta = owner.theta;
  this.speedLimit = owner.speedLimit + 5;
  this.owner = owner;
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
    ], new Point(Math.round(Math.random()) * 300, Math.round(Math.random() * 300)), scale);
  this.velocity = velocity ? velocity : new Vector(Math.random() * Math.PI*2, Math.random() * 2);
  this.coords = start ? start : this.coords;
  this.rotation = rotation != null ? rotation : Math.PI/180 * (Math.random() > .5 ? -1 : 1);

  Asteroid.all.push(this);
}
Asteroid.prototype = new Sprite();

Asteroid.all = [];

Asteroid.prototype.move = function() {
  this.rotate(this.rotation);
  Sprite.prototype.move.call(this);
}
Asteroid.prototype.draw = function(ctx) {
  Sprite.prototype.draw.call(this, ctx);
  // ctx.fill(this.getPath())
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