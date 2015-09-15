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
    for (var j = 0; j < Asteroid.all.length; j++) {
      var a = Asteroid.all[j];
      var asteroidPath = a.getPath()
      if (s) {
        if (ctx.isPointInPath(asteroidPath, s.anchorEnd.x, s.anchorEnd.y)) {
          //  && Math.abs(s.velocity.theta - a.velocity.theta) < Math.PI && Math.abs(s.velocity.magnitude - a.velocity.magnitude) < 10
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

  window.requestAnimationFrame(step);
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var Ship = new Spaceship(new Point(300, 200));
var stars = [
  // new Star(new Point(canvas.width/2, canvas.height/2), 150, 10), 
  // new Star(new Point(canvas.width/4*3, canvas.height/2), 150, 20)
];
var bullets = [];
new Asteroid(3, new Point(100, 200), new Vector(0, 0));
new Asteroid(3, new Point(650, 200), new Vector(0, 0));
// new Asteroid(3);
window.requestAnimationFrame(step);
