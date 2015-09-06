window.onkeydown = function(e) {
  if (e.which == 37) {
    Ship.rotation = "left";
  }
  else if (e.which == 39) {
    Ship.rotation = "right";
  }
  else if (e.which == 38) {
    Ship.thrust = "on";
  }
  else if (e.which == 32 && bullets.length < 6) {
    bullets.push(new Bullet(Ship));
  }
}
window.onkeyup = function(e) {
  if (e.which == 37 || e.which == 39) {
    Ship.rotation = "null";
  }
  if (e.which == 38) {
    Ship.thrust = "off";
  }
}

function step() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (Ship.rotation === "left")
    Ship.rotate(Math.PI/180*ROTATION_RATE);
  else if (Ship.rotation === "right")
    Ship.rotate(-Math.PI/180*ROTATION_RATE);
  
  if (Ship.thrust === "on")
    Ship.velocity = Vector.add(Ship.velocity, new Vector(Ship.theta, .1));

  // collision detection
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i] instanceof Bullet && bullets[i].age > 100) {
      bullets[i].despawn();
      i--;
    }
  }

  for (var i = 0; i < Asteroid.all.length; i++) {
    for (var j = 0; j < bullets.length; j++) {
      if (Asteroid.all[i] && ctx.isPointInPath(Asteroid.all[i].getPath(), bullets[j].coords.x, bullets[j].coords.y)) {
        if (Asteroid.all[i].size > 1)
          for (var k = 0; k < 3; k++)
            new Asteroid(Asteroid.all[i].size-1, Asteroid.all[i].coords)
        bullets[j].despawn();
        Asteroid.all[i].despawn();
        i--;
      }
    }
  }

  for (var i = 0; i < Spaceship.all.length; i++) {
    var points = Spaceship.all[i].getRawPath();
    for (var j = 0; j < Asteroid.all.length; j++) {
      for (var k = 0; k < points.length; k++)
        if (ctx.isPointInPath(Asteroid.all[j].getPath(), points[k].x, points[k].y)) {
          Spaceship.all[i].despawn();
          i--;
        }
    }
  }

  for (var i = 0; i < Sprite.all.length; i++) {
    Sprite.all[i].move();
    Sprite.all[i].draw(ctx);
  }

  for (var i=0; i < stars.length; i++)
    stars[i].draw(ctx);

  window.requestAnimationFrame(step);
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var Ship = new Spaceship(new Point(canvas.width/6 * 5, canvas.height/6 * 5));
var stars = [
  // new Star(new Point(canvas.width/2, canvas.height/2), 150, 10), 
  // new Star(new Point(canvas.width/4*3, canvas.height/2), 150, 20)
];
var bullets = [];
new Asteroid(3);
new Asteroid(3);
new Asteroid(3);
window.requestAnimationFrame(step);
