// The current level's data, filled in once main.js has fetched it from the server.
const world = {
  number: 1,
  name: "",
  sky: "day", // "day" or "night"
  ground: [{ x: 0, width: 800 }], // field segments; anywhere outside them is a gap
  platforms: [], // each: { x, y, width, height } in canvas pixels
  start: null, // { x, y } where Blitz begins and respawns, or null to use the default
  hazards: [], // each: { x, y, width, height } in canvas pixels
  mud: [], // each: { x, y, width, height }; slows Blitz while he overlaps one
  weather: null, // "rain" or null
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
  world.mud = levelData.mud || [];
  world.weather = levelData.weather || null;
  resetHazards();
}

// Put every moving defender back at its starting spot, heading right.
// Hazards without minX/maxX/speed are untouched by this and never move.
function resetHazards() {
  for (const h of world.hazards) {
    if (h.startX === undefined) h.startX = h.x;
    h.x = h.startX;
    h.dir = 1;
  }
}

// Move patrolling defenders back and forth between minX and maxX. dt is in seconds.
function updateHazards(dt) {
  for (const h of world.hazards) {
    if (h.kind !== "defender" || !h.speed || h.minX === undefined || h.maxX === undefined) continue;
    h.x += h.dir * h.speed * dt;
    if (h.x >= h.maxX) {
      h.x = h.maxX;
      h.dir = -1;
    } else if (h.x <= h.minX) {
      h.x = h.minX;
      h.dir = 1;
    }
  }
}
