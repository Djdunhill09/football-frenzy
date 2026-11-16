const STATUS_PLAYING = "playing";
const STATUS_LEVEL_COMPLETE = "levelComplete";

let gameStatus = STATUS_PLAYING;

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

function startGame(canvas, ctx) {
  standPlayerOnField(canvas.height, FIELD_HEIGHT);

  let lastTime = performance.now();

  function loop(now) {
    // Seconds since the previous frame, capped so a background tab can't cause a huge jump.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (gameStatus === STATUS_PLAYING) {
      updatePlayer(dt, canvas.width, canvas.height);
      if (world.goal && rectsOverlap(player, world.goal)) {
        gameStatus = STATUS_LEVEL_COMPLETE;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player, gameStatus);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
