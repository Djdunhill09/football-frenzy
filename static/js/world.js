// The current level's data, filled in once main.js has fetched it from the server.
const world = {
  number: 1,
  name: "",
  sky: "day", // "day" or "night"
  ground: [{ x: 0, width: 800 }], // field segments; anywhere outside them is a gap
  platforms: [], // each: { x, y, width, height } in canvas pixels
  start: null, // { x, y } where Blitz begins and respawns, or null to use the default
  hazards: [], // each: { x, y, width, height } in canvas pixels
  goal: null, // { x, y, width, height } in canvas pixels, or null if the level has none
};

function loadLevel(levelData) {
  world.number = levelData.number;
  world.name = levelData.name;
  world.sky = levelData.sky || "day";
  world.ground = levelData.ground || [{ x: 0, width: 800 }];
  world.platforms = levelData.platforms;
  world.start = levelData.start || null;
  world.hazards = levelData.hazards || [];
  world.goal = levelData.goal || null;
}
