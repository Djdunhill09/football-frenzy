const player = {
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

// dt is the time since the last frame, in seconds.
function updatePlayer(dt, canvasWidth) {
  player.vx = 0;
  if (input.left) player.vx -= player.speed;
  if (input.right) player.vx += player.speed;

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
