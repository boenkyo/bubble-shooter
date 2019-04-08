import Game from './game';


const canvas = document.getElementById('my-canvas');
const scaled = scaleAndGetContext(canvas);

const ctx         = scaled.ctx;
const GAME_WIDTH  = scaled.gameWidth;
const GAME_HEIGHT = scaled.gameHeight;

const game = new Game(canvas, GAME_WIDTH, GAME_HEIGHT);

// game loop

let tLast = 0;

function gameLoop(tCurrent) {
  const dt = tCurrent - tLast;
  tLast = tCurrent;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update(dt);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


function scaleAndGetContext(canvas) {
  const pr = window.devicePixelRatio;
  canvas.width *= pr;
  canvas.height *= pr;
  canvas.style.width = `${canvas.width/pr}px`;
  canvas.style.height = `${canvas.height/pr}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(pr, pr);

  const gameWidth = parseFloat(canvas.style.width);
  const gameHeight = parseFloat(canvas.style.height);

  return { ctx, gameWidth, gameHeight };
}
