const FIELD_HEIGHT = 56;

const SKY_COLOR = "#87CEEB";
const FIELD_COLOR = "#2E8B57";
const HELMET_COLOR = "#C8102E";
const HELMET_STRIPE = "#000000";
const MASK_GRAY = "#6B7280";
const EAR_HOLE = "#1A1A1A";

function drawSky(ctx, canvas) {
  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawField(ctx, canvas) {
  ctx.fillStyle = FIELD_COLOR;
  ctx.fillRect(0, canvas.height - FIELD_HEIGHT, canvas.width, FIELD_HEIGHT);
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
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  const barOffsets = [-6, 0, 6];
  const maskTip = cx + dir * (radius + 13);

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
  drawPlayer(ctx, player);
}
