export const GAME = {
  width: 800,
  height: 500,
  gravity: 900,
  debug: false,
};

export const ASSET_PREFIX = '';

export const LEVEL = {
  tileSize: 32,
  worldWidth: 6400,
  worldHeight: 600,
};

export const PLAYER = {
  speed: 190,
  jumpVelocity: -530,
  startX: 80,
  startY: 420,
};

// Death y — must be BELOW worldHeight so world bounds don't block it
export const DEATH_Y = 560;
