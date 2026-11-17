const FIELD_HEIGHT = 56;

const SKY_COLOR = "#87CEEB";
const NIGHT_SKY_COLOR = "#0B1230";
const DEFENDER_COLOR = "#1D4ED8";
const DEFENDER_TRIM = "#E5E7EB";
const DEFENDER_SKIN = "#F1C27D";
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
const MUD_COLOR = "#6B4423";
const MUD_DARK = "#4A2F18";
const RAIN_COLOR = "rgba(190, 210, 255, 0.55)";
const FOOTBALL_COLOR = "#8B4513";
const FOOTBALL_LACE = "#FFFFFF";
const MESSAGE_COLOR = "#FFFFFF";
const MESSAGE_OUTLINE = "#000000";

// How far the face mask sticks out past the helmet circle, and how thick its bars are.
// player.js uses these to keep the whole mask on screen.
const MASK_TIP_OFFSET = 13;
const MASK_LINE_WIDTH = 2.5;

function drawSky(ctx, canvas) {
  ctx.fillStyle = world.sky === "night" ? NIGHT_SKY_COLOR : SKY_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawField(ctx, canvas) {
  // Only the ground segments get grass; the space between them is a gap showing the sky.
  ctx.fillStyle = FIELD_COLOR;
  for (const g of world.ground) {
    ctx.fillRect(g.x, canvas.height - FIELD_HEIGHT, g.width, FIELD_HEIGHT);
  }
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
function drawDefender(ctx, h) {
  const headR = 9;
  const cx = h.x + h.width / 2;
  // White pants, a blue jersey and a blue helmet, so he reads differently from red Blitz.
  ctx.fillStyle = DEFENDER_TRIM;
  ctx.fillRect(h.x + 4, h.y + h.height - 14, h.width - 8, 14);
  ctx.fillStyle = DEFENDER_COLOR;
  ctx.fillRect(h.x, h.y + headR * 2 - 2, h.width, h.height - headR * 2 - 12);
  ctx.beginPath();
  ctx.arc(cx, h.y + headR, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = DEFENDER_SKIN;
  ctx.fillRect(cx - 6, h.y + headR, 12, 4);
}

function drawHazards(ctx, hazards) {
  for (const h of hazards) {
    if (h.kind === "defender") {
      drawDefender(ctx, h);
      continue;
    }
    ctx.fillStyle = SLED_RUNNER;
    ctx.fillRect(h.x, h.y + h.height - 5, h.width, 5);

    ctx.fillStyle = SLED_FRAME;
    ctx.fillRect(h.x + 4, h.y + h.height - 12, h.width - 8, 8);

    ctx.fillStyle = SLED_PAD;
    ctx.fillRect(h.x + 4, h.y, 14, h.height - 10);
    ctx.fillRect(h.x + h.width - 18, h.y, 14, h.height - 10);
  }
}

function drawMud(ctx, mud) {
  for (const m of mud) {
    ctx.fillStyle = MUD_COLOR;
    ctx.beginPath();
    ctx.ellipse(m.x + m.width / 2, m.y + m.height, m.width / 2, m.height, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = MUD_DARK;
    ctx.fillRect(m.x + 6, m.y + m.height - 2, m.width - 12, 2);
  }
}

// Slanted rain streaks that fall and wrap around. Positions come from the clock, so
// nothing needs to be stored or reset.
function drawRain(ctx, canvas) {
  if (world.weather !== "rain") return;
  const t = performance.now() / 1000;
  ctx.strokeStyle = RAIN_COLOR;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < 90; i++) {
    const speed = 500 + (i % 5) * 60;
    const x0 = (i * 97) % canvas.width;
    const y = (i * 53 + t * speed) % (canvas.height + 20) - 10;
    const x = (x0 - y * 0.2 + canvas.width * 2) % canvas.width;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y + 14);
  }
  ctx.stroke();
}

function drawFootballs(ctx, footballs) {
  for (const f of footballs) {
    if (f.collected) continue;
    const cx = f.x + f.width / 2;
    const cy = f.y + f.height / 2;
    ctx.fillStyle = FOOTBALL_COLOR;
    ctx.beginPath();
    ctx.ellipse(cx, cy, f.width / 2, f.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FOOTBALL_LACE;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    for (let x = cx - 3; x <= cx + 3; x += 3) {
      ctx.moveTo(x, cy - 3);
      ctx.lineTo(x, cy + 3);
    }
    ctx.stroke();
  }
}

function drawMessage(ctx, canvas, text, yOffset = 0, fontSize = 64, outline = 8) {
  const y = canvas.height / 2 + yOffset;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = outline;
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

function drawScene(ctx, canvas, player, status, hud) {
  drawSky(ctx, canvas);
  drawField(ctx, canvas);
  drawGoal(ctx, world.goal);
  drawMud(ctx, world.mud);
  drawPlatforms(ctx, world.platforms);
  drawHazards(ctx, world.hazards);
  drawFootballs(ctx, world.footballs);
  drawPlayer(ctx, player);
  drawRain(ctx, canvas);
  if (status !== STATUS_TITLE) drawHud(ctx, canvas, hud, player);
  if (status === STATUS_TITLE) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMessage(ctx, canvas, "FOOTBALL FRENZY", -130, 56);
    drawMessage(ctx, canvas, "Get Blitz to the end zone in all 3 levels", -70, 20, 3);
    drawMessage(ctx, canvas, "without losing 3 downs.", -44, 20, 3);
    drawMessage(ctx, canvas, "Left/Right or A/D: run     Space/Up/W: jump", 8, 18, 3);
    drawMessage(ctx, canvas, "P: pause     R: restart     Enter: start or continue", 36, 18, 3);
    drawMessage(ctx, canvas, "Press Enter to start", 110, 30, 5);
  }
  if (status === STATUS_PAUSED) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMessage(ctx, canvas, "PAUSED");
    drawMessage(ctx, canvas, "Press P to resume", 50, 28);
  }
  if (status === STATUS_LEVEL_COMPLETE) {
    drawMessage(ctx, canvas, "TOUCHDOWN!");
    drawMessage(ctx, canvas, "Press Enter for the next level", 50, 28);
  }
  if (status === STATUS_WON) {
    drawMessage(ctx, canvas, "YOU WIN!");
    drawMessage(ctx, canvas, "Press R to play again", 50, 28);
  }
  if (status === STATUS_GAME_OVER) {
    drawMessage(ctx, canvas, "TURNOVER ON DOWNS");
    drawMessage(ctx, canvas, "Press R to restart", 50, 28);
  }
}
