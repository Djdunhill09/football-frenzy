const STATUS_PLAYING = "playing";
const STATUS_LEVEL_COMPLETE = "levelComplete";
const STATUS_LOADING = "loading"; // waiting for the next level to arrive from the server
const STATUS_WON = "won";
const STATUS_GAME_OVER = "gameOver";

const STARTING_DOWNS = 3;

let gameStatus = STATUS_PLAYING;
let downs = STARTING_DOWNS;
let currentLevel = 1;

// Bumped on every level load request so a slow, outdated response can be ignored.
let levelRequestId = 0;

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

// Fetch /api/levels/<n> and load it into world. Returns "ok", "missing" (404, no such
// level) or "error" (network or server problem).
async function loadLevelFromServer(levelNumber) {
  try {
    const response = await fetch(`/api/levels/${levelNumber}`);
    if (response.status === 404) return "missing";
    if (!response.ok) throw new Error(`Level request failed: ${response.status}`);
    loadLevel(await response.json());
    currentLevel = levelNumber;
    return "ok";
  } catch (error) {
    console.error(error);
    return "error";
  }
}

function placePlayerAtStart(canvas) {
  resetHazards(); // moving defenders restart their patrols with every respawn
  resetPlatforms(); // and moving platforms go back to their starting spot
  if (world.start) resetPlayer(world.start);
  else standPlayerOnField(canvas.height, FIELD_HEIGHT);
}

// Back to Level 1 with full downs, whatever the current status was.
async function restartGame(canvas) {
  const id = ++levelRequestId;
  if (currentLevel !== 1) {
    const result = await loadLevelFromServer(1);
    if (id !== levelRequestId || result !== "ok") return; // superseded, or load failed
  }
  placePlayerAtStart(canvas);
  downs = STARTING_DOWNS;
  gameStatus = STATUS_PLAYING;
}

// After a touchdown: load the next level (keeping downs), or win if there is none.
async function advanceLevel(canvas) {
  const id = ++levelRequestId;
  const result = await loadLevelFromServer(currentLevel + 1);
  if (id !== levelRequestId) return; // R was pressed meanwhile
  if (result === "missing") {
    gameStatus = STATUS_WON;
  } else if (result === "ok") {
    placePlayerAtStart(canvas);
    gameStatus = STATUS_PLAYING;
  } else {
    // Network problem: back to the touchdown screen so Enter can be tried again.
    gameStatus = STATUS_LEVEL_COMPLETE;
  }
}

// A hit or a fall costs one down and sends Blitz back to the start.
function loseDown(canvas) {
  downs -= 1;
  placePlayerAtStart(canvas);
  if (downs <= 0) gameStatus = STATUS_GAME_OVER;
}

function startGame(canvas, ctx) {
  placePlayerAtStart(canvas);

  let lastTime = performance.now();

  function loop(now) {
    // Seconds since the previous frame, capped so a background tab can't cause a huge jump.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (input.restartPressed) restartGame(canvas);
    input.restartPressed = false; // consume the press so it restarts only once

    // Enter only does something on the touchdown screen. Switching to "loading" while
    // the request runs stops a second press from starting another request.
    if (input.nextPressed && gameStatus === STATUS_LEVEL_COMPLETE) {
      gameStatus = STATUS_LOADING;
      advanceLevel(canvas);
    }
    input.nextPressed = false;

    if (gameStatus === STATUS_PLAYING) {
      updateHazards(dt);
      updatePlatforms(dt); // platforms first, so the player sees their new positions
      updatePlayer(dt, canvas.width, canvas.height);

      // Falling into a gap: his top has dropped below the bottom edge of the canvas.
      if (player.y > canvas.height) {
        loseDown(canvas);
      } else {
        // The hit sends Blitz back to the start, which ends the overlap immediately,
        // so the same hazard can't take another down next frame.
        for (const hazard of world.hazards) {
          if (rectsOverlap(player, hazard)) {
            loseDown(canvas);
            break;
          }
        }
      }
      if (gameStatus === STATUS_PLAYING && world.goal && rectsOverlap(player, world.goal)) {
        gameStatus = STATUS_LEVEL_COMPLETE;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player, gameStatus, downs, currentLevel);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
