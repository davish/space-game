var keyboard = {
  'left': 37,
  'right': 39,
  'up': 38,
  'space': 32,
  'w': 87,
  'a': 65,
  's': 83,
  'd': 68,
  'c': 67
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
  else if (e.which == keyboard['space']) {
    bullets.push(new Bullet(Ship));
  }
  else if (e.which == keyboard['w']) {
    other.thrust = true;
  }
  else if (e.which == keyboard['a']) {
    other.rotation = "left";
  }
  else if (e.which == keyboard['d']) {
    other.rotation = "right";
  }
  else if (e.which == keyboard['c']) {
    bullets.push(new Bullet(other));
  }
  else {
    return;
  }
  e.preventDefault();
}
window.onkeyup = function(e) {
  if (e.which == keyboard['left'] || e.which == keyboard['right']) {
    Ship.rotation = "null";
  }
  else if (e.which == keyboard['up']) {
    Ship.thrust = false;
  }
  else if (e.which == keyboard['a'] || e.which == keyboard['d']) {
    other.rotation = "null";
  }
  else if (e.which == keyboard['w']) {
    other.thrust = false;
  }
}

function step() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  var graveyard = [];

  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i].age > 100) {
      graveyard.push(bullets[i]);
    }
  }

  /*
    Collision Detection
  */
  for (var i = 0; i < Asteroid.all.length; i++) {
    var ast = Asteroid.all[i];
    for (var j = 0; j < bullets.length; j++) {
      if (graveyard.indexOf(bullets[j]) > -1)
        continue;
      if (ast && ctx.isPointInPath(ast.getPath(), bullets[j].coords.x, bullets[j].coords.y)) {
        if (ast.size > 1)
          for (var k = 0; k < 3; k++)
            new Asteroid(ast.size-1, ast.coords)

        bullets[j].owner.score += 30/ast.size;
        graveyard.push(bullets[j]);
        graveyard.push(ast);
      }
    }
  }

  for (var i = 0; i < Spaceship.all.length; i++) {
    var s = Spaceship.all[i];
    s.anchorTo = null;
    var points = s.getRawPath();

    for (var j = 0; j < bullets.length; j++) {
      if (s && ctx.isPointInPath(s.getPath(), bullets[j].coords.x, bullets[j].coords.y)) {
        if (bullets[j].owner != s) {
          graveyard.push(bullets[j]);
          graveyard.push(s);
        }
      }
    }

    for (var j = 0; j < Asteroid.all.length; j++) {
      var a = Asteroid.all[j];
      var asteroidPath = a.getPath()
      if (s) {
        if (ctx.isPointInPath(asteroidPath, s.anchorEnd.x, s.anchorEnd.y) && Math.abs(s.velocity.theta - a.velocity.theta) < Math.PI && Math.abs(s.velocity.magnitude - a.velocity.magnitude) < 10) {
          s.velocity = a.velocity;
          s.anchorTo = a;
        }
        for (var k = 0; k < points.length; k++)
          if (ctx.isPointInPath(asteroidPath, points[k].x, points[k].y)) {
            graveyard.push(s);
          }
      }
    }
  }

  ctx.font = "10px Monaco";
  ctx.fillText(Ship.score, 10.5, 50);

  // despawn sprites in the graveyard
  for (var i = 0; i < graveyard.length; i++)
    graveyard[i].despawn();

  /*
    Draw Sprites
  */
  for (var i = 0; i < Sprite.all.length; i++) {
    Sprite.all[i].move();
    Sprite.all[i].draw(ctx);
  }
  // draw stars
  for (var i=0; i < stars.length; i++)
    stars[i].draw(ctx);

  requestID = window.requestAnimationFrame(step);
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var Ship;
// Ship.velocity = new Vector(0, 3);

var other;

var stars = [];
var bullets = [];

var requestID;

function start() {
  if (requestID) {
    stars = [];
    bullets = [];
    Sprite.all = [];
    Spaceship.all = [];
    Asteroid.all = [];

    window.cancelAnimationFrame(requestID);
  }
  Ship = new Spaceship(new Point(300, 200));
  other = new Spaceship(new Point(100, 100));
  var num = document.getElementById('numStars').value;
  var interval = 2*Math.PI/num;
  var v = new Vector(0, 100);
  var center = new Point(canvas.width/2, canvas.height/2);

  for (var i = 0; i < num; i++) {
    var starLoc = Point.add(center, v.components());
    stars.push(new Star(starLoc, 100, 10));
    v.theta += interval;
  }
  if (num == 1)
    stars[0].coords = center;

  var a = document.getElementById('numAsteroids').value;
  for (var i = 0; i < a; i++)
    new Asteroid(3);

  requestID = window.requestAnimationFrame(step);
}

