function startGame(canvas, ctx) {
  standPlayerOnField(canvas.height, FIELD_HEIGHT);

  let lastTime = performance.now();

  function loop(now) {
    // Seconds since the previous frame, capped so a background tab can't cause a huge jump.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    updatePlayer(dt, canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, canvas, player);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
