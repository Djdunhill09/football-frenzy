const FIELD_HEIGHT = 56;

const SKY_COLOR = "#87CEEB";
const FIELD_COLOR = "#2E8B57";
const HELMET_COLOR = "#C8102E";
const HELMET_STRIPE = "#000000";
const MASK_GRAY = "#6B7280";
const EAR_HOLE = "#1A1A1A";
const PLATFORM_TOP = "#C9A66B";
const PLATFORM_BODY = "#4B5563";
const PLATFORM_LINE = "#2D3340";
const END_ZONE_COLOR = "#B91C1C";
const END_ZONE_STRIPE = "#FFFFFF";
const GOALPOST_COLOR = "#FACC15";
const SLED_PAD = "#B45309";
const SLED_FRAME = "#374151";
const SLED_RUNNER = "#9CA3AF";
const HUD_COLOR = "#FFFFFF";
const MESSAGE_COLOR = "#FFFFFF";
const MESSAGE_OUTLINE = "#000000";

// How far the face mask sticks out past the helmet circle, and how thick its bars are.
// player.js uses these to keep the whole mask on screen.
const MASK_TIP_OFFSET = 13;
const MASK_LINE_WIDTH = 2.5;

function drawSky(ctx, canvas) {
  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawField(ctx, canvas) {
  ctx.fillStyle = FIELD_COLOR;
  ctx.fillRect(0, canvas.height - FIELD_HEIGHT, canvas.width, FIELD_HEIGHT);
}

// Each platform is a raised bleacher block: a wooden plank top over a dark steel body
// with a couple of bench lines.
function drawPlatforms(ctx, platforms) {
  for (const p of platforms) {
    ctx.fillStyle = PLATFORM_BODY;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    ctx.fillStyle = PLATFORM_TOP;
    ctx.fillRect(p.x, p.y, p.width, 8);

    ctx.fillStyle = PLATFORM_LINE;
    ctx.fillRect(p.x, p.y + p.height / 2 + 2, p.width, 2);
    for (let x = p.x + 20; x < p.x + p.width - 4; x += 40) {
      ctx.fillRect(x, p.y + 8, 3, p.height - 8);
    }
  }
}

// The end zone is a painted red zone with a white goal line on its left edge and a
// yellow goalpost (a base pole, a crossbar and two uprights) standing in the middle.
function drawGoal(ctx, goal) {
  if (!goal) return;

  ctx.fillStyle = END_ZONE_COLOR;
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

  ctx.fillStyle = END_ZONE_STRIPE;
  ctx.fillRect(goal.x, goal.y, 4, goal.height);

  const postX = goal.x + goal.width / 2;
  const bottom = goal.y + goal.height;
  const crossbarY = goal.y + goal.height * 0.45;
  const uprightHalf = 16;

  ctx.strokeStyle = GOALPOST_COLOR;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(postX, bottom);
  ctx.lineTo(postX, crossbarY);
  ctx.moveTo(postX - uprightHalf, crossbarY);
  ctx.lineTo(postX + uprightHalf, crossbarY);
  ctx.moveTo(postX - uprightHalf, crossbarY);
  ctx.lineTo(postX - uprightHalf, goal.y);
  ctx.moveTo(postX + uprightHalf, crossbarY);
  ctx.lineTo(postX + uprightHalf, goal.y);
  ctx.stroke();
}

// Each tackling sled is a steel frame with a padded block on top, a gray runner
// along the bottom and two upright pads.
function drawHazards(ctx, hazards) {
  for (const h of hazards) {
    ctx.fillStyle = SLED_RUNNER;
    ctx.fillRect(h.x, h.y + h.height - 5, h.width, 5);

    ctx.fillStyle = SLED_FRAME;
    ctx.fillRect(h.x + 4, h.y + h.height - 12, h.width - 8, 8);

    ctx.fillStyle = SLED_PAD;
    ctx.fillRect(h.x + 4, h.y, 14, h.height - 10);
    ctx.fillRect(h.x + h.width - 18, h.y, 14, h.height - 10);
  }
}

function drawDowns(ctx, downs) {
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = MESSAGE_OUTLINE;
  ctx.strokeText(`Downs: ${downs}`, 12, 10);
  ctx.fillStyle = HUD_COLOR;
  ctx.fillText(`Downs: ${downs}`, 12, 10);
}

function drawMessage(ctx, canvas, text, yOffset = 0, fontSize = 64) {
  const y = canvas.height / 2 + yOffset;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 8;
  ctx.lineJoin = "round";
  ctx.strokeStyle = MESSAGE_OUTLINE;
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillStyle = MESSAGE_COLOR;
  ctx.fillText(text, canvas.width / 2, y);
}

function drawPlayer(ctx, player) {
  const radius = player.width / 2;
  const cx = player.x + radius;
  const cy = player.y + radius;
  const facingRight = player.facing !== "left";
  const dir = facingRight ? 1 : -1;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = HELMET_COLOR;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI * 0.82, -Math.PI * 0.18);
  ctx.arc(cx, cy, radius - 7, -Math.PI * 0.18, -Math.PI * 0.82, true);
  ctx.closePath();
  ctx.fillStyle = HELMET_STRIPE;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx - dir * radius * 0.18, cy + 1, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = EAR_HOLE;
  ctx.fill();

  ctx.strokeStyle = MASK_GRAY;
  ctx.lineWidth = MASK_LINE_WIDTH;
  ctx.lineCap = "round";

  const barOffsets = [-6, 0, 6];
  const maskTip = cx + dir * (radius + MASK_TIP_OFFSET);

  for (const offset of barOffsets) {
    const inside = radius * radius - offset * offset;
    const edge = cx + dir * Math.sqrt(Math.max(0, inside));
    ctx.beginPath();
    ctx.moveTo(edge, cy + offset);
    ctx.lineTo(maskTip, cy + offset);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(maskTip, cy + barOffsets[0]);
  ctx.lineTo(maskTip, cy + barOffsets[barOffsets.length - 1]);
  ctx.stroke();
}

function drawScene(ctx, canvas, player, status, downs) {
  drawSky(ctx, canvas);
  drawField(ctx, canvas);
  drawGoal(ctx, world.goal);
  drawPlatforms(ctx, world.platforms);
  drawHazards(ctx, world.hazards);
  drawPlayer(ctx, player);
  drawDowns(ctx, downs);
  if (status === STATUS_LEVEL_COMPLETE) drawMessage(ctx, canvas, "TOUCHDOWN!");
  if (status === STATUS_GAME_OVER) {
    drawMessage(ctx, canvas, "TURNOVER ON DOWNS");
    drawMessage(ctx, canvas, "Press R to restart", 50, 28);
  }
}
