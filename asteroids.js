var keyboard = {
  'left': 37,
  'right': 39,
  'up': 38,
  'space': 32,
  'w': 87
}

window.onkeydown = function(e) {
  if (e.which == keyboard['left']) {
    Ship.rotation = "left";
  }
  else if (e.which == keyboard['right']) {
    Ship.rotation = "right";
  }
  else if (e.which == keyboard['up']) {
    Ship.thrust = true;
  }
  else if (e.which == keyboard['space'] && bullets.length < 6) {
    bullets.push(new Bullet(Ship));
  }
  else if (e.which == keyboard['w']) {
    Ship.anchor = true;
  }
}
window.onkeyup = function(e) {
  if (e.which == keyboard['left'] || e.which == keyboard['right']) {
    Ship.rotation = "null";
  }
  else if (e.which == keyboard['up']) {
    Ship.thrust = false;
  }
  else if (e.which == keyboard['w']) {
    Ship.anchor = false;
  }
}

function step() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i] instanceof Bullet && bullets[i].age > 100) {
      bullets[i].despawn();
      i--;
    }
  }

  /*
    Collision Detection
  */
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
    var s = Spaceship.all[i];
    var points = s.getRawPath();
    for (var j = 0; j < Asteroid.all.length; j++) {
      var a = Asteroid.all[j];
      var asteroidPath = a.getPath()
      if (s) {
        if (ctx.isPointInPath(asteroidPath, s.anchorEnd.x, s.anchorEnd.y) && Math.abs(s.velocity.theta - a.velocity.theta) < Math.PI && Math.abs(s.velocity.magnitude - a.velocity.magnitude) < 10) {
          s.velocity = a.velocity;
          s.anchorTo = a;
          s.anchorLock = s.theta - a.theta;
        }
        else {
          s.anchorLock = false;
          s.ancorTo = null;
        }
        for (var k = 0; k < points.length; k++)
          if (ctx.isPointInPath(asteroidPath, points[k].x, points[k].y)) {
            s.despawn();
            i--;
          }
      }
    }
  }

  /*
    Draw Sprites
  */
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
