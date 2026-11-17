// All HUD drawing: score, downs, level and the yards-gained progress bar.
// Called from drawScene() in renderer.js, after the game world has been drawn.

const HUD_TEXT = "#FFFFFF";
const HUD_OUTLINE = "#000000";
const BAR_X = 560;
const BAR_Y = 36;
const BAR_WIDTH = 228;
const BAR_HEIGHT = 14;
const BAR_BACK = "rgba(0, 0, 0, 0.55)";
const BAR_FILL = "#FACC15";
const BAR_BORDER = "#FFFFFF";

function drawHudText(ctx, text, x, y, align) {
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = HUD_OUTLINE;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = HUD_TEXT;
  ctx.fillText(text, x, y);
}

// Progress from 0 to 1. It is measured with the FRONT of Blitz's body (his right edge)
// between where it started and the goal's left edge, so it reads 100% exactly when he
// first touches the end zone. Clamped, so falling back or overshooting stays in range.
function levelProgress(player) {
  if (!world.start || !world.goal) return 0;
  const startFront = world.start.x + player.width;
  const span = world.goal.x - startFront;
  if (span <= 0) return 0;
  const fraction = (player.x + player.width - startFront) / span;
  return Math.max(0, Math.min(1, fraction));
}

function drawHud(ctx, canvas, hud, player) {
  drawHudText(ctx, `Score: ${hud.score}`, 12, 10, "left");
  drawHudText(ctx, `Downs: ${hud.downs}   Level ${hud.level}`, 12, 34, "left");

  if (hud.status === STATUS_PLAYING) {
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3;
    ctx.strokeStyle = HUD_OUTLINE;
    ctx.strokeText("P: Pause", 12, 60);
    ctx.fillStyle = HUD_TEXT;
    ctx.fillText("P: Pause", 12, 60);
  }

  const progress = levelProgress(player);
  drawHudText(ctx, `Yards gained: ${Math.round(progress * 100)}%`, BAR_X + BAR_WIDTH, 10, "right");
  ctx.fillStyle = BAR_BACK;
  ctx.fillRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = BAR_FILL;
  ctx.fillRect(BAR_X, BAR_Y, BAR_WIDTH * progress, BAR_HEIGHT);
  ctx.strokeStyle = BAR_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
}
