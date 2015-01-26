var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

//create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var updateables = [];
//we might have to get the size and calculate the scaling
//but this method should let us make it however big.
//Cool!
//TODO: Automatically scale the game to work and look good on widescreen.
canvas.width = 512;
canvas.height = 480;
ctx.scale(2,2);
document.body.appendChild(canvas);

//viewport
var vX = 0,
    vY = 0,
    vWidth = 256,
    vHeight = 240;

//load our images
resources.load([
  'sprites/player.png',
  'sprites/enemy.png',
  'sprites/tiles.png'
]);
resources.onReady(init);

//initialize
var lastTime;
function init() {
  lastTime = Date.now();
  main();
}

var player = new Mario.Player([40,192], this);
var gameTime = 0;

//set up the game loop
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimFrame(main);
}

function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt);

  checkCollisions();
}

function handleInput(dt) {
  if (input.isDown('JUMP')) {
    player.jump();
  } else {
    //we need this to handle the timing for how long you hold it
    player.noJump();
  }
  if (input.isDown('LEFT')) { // 'd' or left arrow
    player.moveLeft();
  }
  else if (input.isDown('RIGHT')) { // 'k' or right arrow
    player.moveRight();
  } else {
    player.noWalk();
  }
}

//update all the moving stuff
function updateEntities(dt) {
  player.update(dt);
  updateables.forEach (function(ent) {
    ent.update(dt);
  });
  if (player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  //update everyone else
}

//scan for collisions
function checkCollisions() {
  player.checkCollisions(statics);
  player.checkCollisions(blocks);
  //Decompose movement into x and y axes, step one at a time. For each axis:
  //Get the coordinate of the forward-facing edge.
  //Figure out which lines of tiles the bounding box intersects with.
  //This will give minimum and maximum value on the OPPOSITE axis.
  //Scan along those lines of tiles until you find the closest static obstacle
  //Then loop through every moving obstacle and determine the closest thing
  //The total movement of the player is the minimum between the distance to the
  //closest obstacle, and the amount that you wanted to move.
}

//draw the game!
function render() {
  updateables = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#7974FF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //scenery gets drawn first to get layering right.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (scenery[i][j]) {
        renderEntity(scenery[i][j]);
      }
    }
  }

  //then we draw every static object.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (statics[i][j]) {
        renderEntity(statics[i][j]);
      }
      if (blocks[i][j]) {
        renderEntity(blocks[i][j]);
        updateables.push(blocks[i][j]);
      }
    }
  }

  //then the player
  renderEntity(player);

  //and lastly, those little rope things that go in front of mario.
};

function renderEntity(entity) {
  ctx.save();
  entity.render(ctx, vX, vY);
  ctx.restore();
}