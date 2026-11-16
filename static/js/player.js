const player = {
  x: 180,
  y: 0,
  width: 40,
  height: 40,
  facing: "right",
};

// Canvas y grows downward, so the top of the field is canvasHeight - fieldHeight.
// Subtracting the helmet height puts the bottom of the helmet on that line.
function standPlayerOnField(canvasHeight, fieldHeight) {
  player.y = canvasHeight - fieldHeight - player.height;
}
