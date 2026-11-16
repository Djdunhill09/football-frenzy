const GRAVITY = 2000; // pixels per second squared
const JUMP_SPEED = 750; // initial upward speed in pixels per second
const MUD_SPEED_FACTOR = 0.5; // horizontal speed multiplier while in mud
// The field height (FIELD_HEIGHT) is defined in renderer.js and passed in below.

const player = {
  vy: 0, // vertical velocity in pixels per second (positive = falling)
  onGround: true,
  x: 180,
  y: 0,
  width: 40,
  height: 40,
  facing: "right",
  vx: 0,
  speed: 300, // pixels per second
};

// Canvas y grows downward, so the top of the field is canvasHeight - fieldHeight.
// Subtracting the helmet height puts the bottom of the helmet on that line.
function standPlayerOnField(canvasHeight, fieldHeight) {
  player.y = canvasHeight - fieldHeight - player.height;
}

// Put Blitz at a { x, y } start position and clear all motion.
function resetPlayer(start) {
  player.x = start.x;
  player.y = start.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.facing = "right";
}

// dt is the time since the last frame, in seconds.
function updatePlayer(dt, canvasWidth, canvasHeight) {
  // Jump only from the ground, and only on a fresh key press.
  if (input.jumpPressed && player.onGround) {
    player.vy = -JUMP_SPEED; // negative = upward on the canvas
    player.onGround = false;
  }
  input.jumpPressed = false; // consume the press so it can't fire later in mid-air

  // Gravity changes velocity; velocity changes position.
  const prevBottom = player.y + player.height; // where his feet were last frame
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  const bottom = player.y + player.height; // where his feet are now

  // Find the highest surface his feet crossed this frame (platforms or the field).
  let landingY = null;
  const fieldTop = canvasHeight - FIELD_HEIGHT;
  // The field only counts where there is turf under him (not in a gap), and like the
  // platforms it only catches his feet if they were above it last frame.
  const overGround = world.ground.some(
    (g) => player.x + player.width > g.x && player.x < g.x + g.width
  );
  if (overGround && prevBottom <= fieldTop && bottom >= fieldTop) landingY = fieldTop;

  // One-way platforms: only count them while falling (vy >= 0), and only if his
  // feet were at or above the top last frame, so he passes up through from below.
  if (player.vy >= 0) {
    for (const p of world.platforms) {
      const overlapsX = player.x + player.width > p.x && player.x < p.x + p.width;
      const crossedTop = prevBottom <= p.y && bottom >= p.y;
      if (overlapsX && crossedTop && (landingY === null || p.y < landingY)) {
        landingY = p.y;
      }
    }
  }

  if (landingY !== null) {
    player.y = landingY - player.height;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Mud only scales horizontal speed; GRAVITY and JUMP_SPEED are untouched.
  const inMud = world.mud.some((m) => rectsOverlap(player, m));
  const speed = inMud ? player.speed * MUD_SPEED_FACTOR : player.speed;
  player.vx = 0;
  if (input.left) player.vx -= speed;
  if (input.right) player.vx += speed;

  if (player.vx < 0) player.facing = "left";
  else if (player.vx > 0) player.facing = "right";

  player.x += player.vx * dt;

  // Keep the whole helmet, including the face mask, inside the canvas.
  // The mask sticks out on the side Blitz faces, so that side needs extra room.
  // Derived from renderer.js (read here at call time, since renderer.js loads later).
  const maskReach = MASK_TIP_OFFSET + MASK_LINE_WIDTH / 2;
  const minX = player.facing === "left" ? maskReach : 0;
  const maxX = canvasWidth - player.width - (player.facing === "right" ? maskReach : 0);
  player.x = Math.max(minX, Math.min(player.x, maxX));
}
