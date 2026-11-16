function startGame(canvas, ctx) {
  standPlayerOnField(canvas.height, FIELD_HEIGHT);

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
