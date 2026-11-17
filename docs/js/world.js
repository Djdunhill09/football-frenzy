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
  footballs: [], // each: { x, y, collected }; size is FOOTBALL_WIDTH x FOOTBALL_HEIGHT
};

const FOOTBALL_WIDTH = 24;
const FOOTBALL_HEIGHT = 16;

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
  // Fresh objects from the server, each starting uncollected (this is the level-load reset).
  world.footballs = (levelData.footballs || []).map((f) => ({
    x: f.x,
    y: f.y,
    width: FOOTBALL_WIDTH,
    height: FOOTBALL_HEIGHT,
    collected: false,
  }));
  resetHazards();
  resetPlatforms();
}

// Make every football on this level uncollectable-again (used when R restarts Level 1).
function resetFootballs() {
  for (const f of world.footballs) f.collected = false;
}

// Put every moving platform back at its starting spot, heading right, and clear its
// per-frame movement. Platforms without minX/maxX/speed are never touched by movement.
function resetPlatforms() {
  for (const p of world.platforms) {
    if (p.startX === undefined) p.startX = p.x;
    p.x = p.startX;
    p.prevX = p.x;
    p.prevY = p.y;
    p.dx = 0;
    p.dir = 1;
  }
}

// Move platforms that have minX/maxX/speed back and forth. dt is in seconds. Every
// platform records where it was last frame (prevX/prevY) and how far it moved (dx).
// This must run BEFORE updatePlayer each frame.
function updatePlatforms(dt) {
  for (const p of world.platforms) {
    p.prevX = p.x;
    p.prevY = p.y;
    p.dx = 0;
    if (!p.speed || p.minX === undefined || p.maxX === undefined) continue;
    p.x += p.dir * p.speed * dt;
    if (p.x >= p.maxX) {
      p.x = p.maxX;
      p.dir = -1;
    } else if (p.x <= p.minX) {
      p.x = p.minX;
      p.dir = 1;
    }
    p.dx = p.x - p.prevX;
  }
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
