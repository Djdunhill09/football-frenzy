const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

async function init() {
  loadScoreBoard(); // show the high scores right away; does not wait for the level
  // If Level 1 can't be loaded, the game still starts with the default full-width field.
  await loadLevelFromServer(1);
  startGame(canvas, ctx);
}

init();
