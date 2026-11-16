// The current level's data, filled in once main.js has fetched it from the server.
const world = {
  name: "",
  platforms: [], // each: { x, y, width, height } in canvas pixels
};

function loadLevel(levelData) {
  world.name = levelData.name;
  world.platforms = levelData.platforms;
}
