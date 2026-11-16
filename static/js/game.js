const STATUS_PLAYING = "playing";
const STATUS_LEVEL_COMPLETE = "levelComplete";

const STATUS_GAME_OVER = "gameOver";
const STARTING_DOWNS = 3;

let gameStatus = STATUS_PLAYING;
let downs = STARTING_DOWNS;

// True when two { x, y, width, height } rectangles share any area. Touching edges
// only (no shared area) does not count. Reusable for goals now and hazards later.
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Back to the level's start with full downs, whatever the current status was.
function restartGame(canvas) {
  if (world.start) resetPlayer(world.start);
  else standPlayerOnField(canvas.height, FIELD_HEIGHT);
  downs = STARTING_DOWNS;
  gameStatus = STATUS_PLAYING;
}

function startGame(canvas, ctx) {
  restartGame(canvas);

  let lastTime = performance.now();

  function loop(now) {
    // Seconds since the previous frame, capped so a background tab can't cause a huge jump.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (input.restartPressed) restartGame(canvas);
    input.restartPressed = false; // consume the press so it restarts only once

    if (gameStatus === STATUS_PLAYING) {
      updatePlayer(dt, canvas.width, canvas.height);

      // A hit costs one down and sends Blitz back to the start, which ends the overlap
      // immediately, so the same sled can't take another down next frame.
      for (const hazard of world.hazards) {
        if (rectsOverlap(player, hazard)) {
          downs -= 1;
          if (world.start) resetPlayer(world.start);
          else standPlayerOnField(canvas.height, FIELD_HEIGHT);
          if (downs <= 0) gameStatus = STATUS_GAME_OVER;
          break;
        }
      }
      if (gameStatus === STATUS_PLAYING && world.goal && rectsOverlap(player, world.goal)) {
        gameStatus = STATUS_LEVEL_COMPLETE;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player, gameStatus, downs);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
