// The current level's data, filled in once main.js has fetched it from the server.
const world = {
  name: "",
  platforms: [], // each: { x, y, width, height } in canvas pixels
  start: null, // { x, y } where Blitz begins and respawns, or null to use the default
  hazards: [], // each: { x, y, width, height } in canvas pixels
  goal: null, // { x, y, width, height } in canvas pixels, or null if the level has none
};

function loadLevel(levelData) {
  world.name = levelData.name;
  world.platforms = levelData.platforms;
  world.start = levelData.start || null;
  world.hazards = levelData.hazards || [];
  world.goal = levelData.goal || null;
}
