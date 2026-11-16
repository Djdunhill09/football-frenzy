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

function drawScene(ctx, canvas, player) {
  drawSky(ctx, canvas);
  drawField(ctx, canvas);
  drawPlatforms(ctx, world.platforms);
  drawPlayer(ctx, player);
}
