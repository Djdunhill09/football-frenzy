const STATUS_TITLE = "title"; // the start screen shown when the page loads
const STATUS_PLAYING = "playing";
const STATUS_PAUSED = "paused";
const STATUS_LEVEL_COMPLETE = "levelComplete";
const STATUS_LOADING = "loading"; // waiting for the next level to arrive from the server
const STATUS_WON = "won";
const STATUS_GAME_OVER = "gameOver";

const STARTING_DOWNS = 3;
const FOOTBALL_POINTS = 100;
const TOUCHDOWN_POINTS = 500;

let gameStatus = STATUS_TITLE;
let downs = STARTING_DOWNS;
let currentLevel = 1;
let score = 0; // the only copy of the score; carries across levels, reset by R

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
  resetFootballs(); // Level 1 may not have been reloaded, so un-collect its footballs
  downs = STARTING_DOWNS;
  score = 0;
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

// Collect every uncollected football Blitz overlaps. The collected flag is what stops
// a football from being counted again on later frames or after a respawn.
function collectFootballs() {
  for (const f of world.footballs) {
    if (!f.collected && rectsOverlap(player, f)) {
      f.collected = true;
      score += FOOTBALL_POINTS;
    }
  }
}

function startGame(canvas, ctx) {
  placePlayerAtStart(canvas);

  let lastTime = performance.now();

  function loop(now) {
    // Seconds since the previous frame, capped so a background tab can't cause a huge jump.
    // lastTime is refreshed on EVERY frame, including title/paused ones, so the first
    // frame after resuming measures only one frame's worth of time, not the pause.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // R restarts from any status except the title screen, so it can't skip the title.
    if (input.restartPressed && gameStatus !== STATUS_TITLE) restartGame(canvas);
    input.restartPressed = false; // consume the press so it restarts only once

    // Enter on the title screen starts Level 1 with full downs and a score of 0.
    if (input.nextPressed && gameStatus === STATUS_TITLE) restartGame(canvas);

    // P toggles pause, but only between playing and paused. Losing window focus pauses.
    if (input.pausePressed) {
      if (gameStatus === STATUS_PLAYING) gameStatus = STATUS_PAUSED;
      else if (gameStatus === STATUS_PAUSED) gameStatus = STATUS_PLAYING;
    }
    input.pausePressed = false;
    if (input.windowBlurred && gameStatus === STATUS_PLAYING) gameStatus = STATUS_PAUSED;
    input.windowBlurred = false;

    // A jump pressed while not playing (title, pause) must not fire when play starts.
    if (gameStatus !== STATUS_PLAYING) input.jumpPressed = false;

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
      if (gameStatus === STATUS_PLAYING) collectFootballs();
      if (gameStatus === STATUS_PLAYING && world.goal && rectsOverlap(player, world.goal)) {
        gameStatus = STATUS_LEVEL_COMPLETE;
        score += TOUCHDOWN_POINTS; // only runs on the one frame the status flips
      }
    }

    updateScorePanel(gameStatus, score); // shows the name form when the game ends
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player, gameStatus, { score, downs, level: currentLevel, status: gameStatus });
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
