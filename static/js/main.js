const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

async function init() {
  try {
    const response = await fetch("/api/levels/1");
    if (!response.ok) throw new Error(`Level request failed: ${response.status}`);
    loadLevel(await response.json());
  } catch (error) {
    // Still start the game (field only) if the level can't be loaded.
    console.error(error);
  }
  startGame(canvas, ctx);
}

init();
