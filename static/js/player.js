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

  // Keep Blitz fully inside the canvas.
  player.x = Math.max(0, Math.min(player.x, canvasWidth - player.width));
}
