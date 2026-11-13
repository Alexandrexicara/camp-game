import * as Phaser from 'phaser';
import { BaseScene } from '@/kit/BaseScene';
import { useGameStore } from '@/store/useGameStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Frog } from '../entities/Frog';
import { Jaguar } from '../entities/Jaguar';
import { Eagle } from '../entities/Eagle';
import { Snake } from '../entities/Snake';
import { Caiman } from '../entities/Caiman';
import { Archer } from '../entities/Archer';
import { Boomerang } from '../entities/Boomerang';
import { Arrow } from '../entities/Arrow';
import { LEVEL, DEATH_Y } from '../config';
import { showInterstitial } from '@/lib/minijogo-sdk';

// ─── Level data types ──────────────────────────────────────────────────────

type GroundSeg  = { x: number; y: number; w: number };   // x/w in tiles
type FloatPlat  = { x: number; y: number; w: number };   // x in px
type AcornPos   = { x: number; y: number };
type CampfirePos= { x: number; y: number };

type EnemyDef =
  | { kind: 'frog';   x: number; y: number; pl: number; pr: number; hop?: number }
  | { kind: 'jaguar'; x: number; y: number; pl: number; pr: number; speed?: number }
  | { kind: 'eagle';  x: number; y: number; pl: number; pr: number; speed?: number }
  | { kind: 'snake';  x: number; y: number; pl: number; pr: number; speed?: number }
  | { kind: 'caiman'; x: number; y: number; pl: number; pr: number; speed?: number }
  | { kind: 'archer'; x: number; y: number; interval?: number };

interface LevelDef {
  worldWidth: number;
  ground: GroundSeg[];
  floats: FloatPlat[];
  enemies: EnemyDef[];
  acorns: AcornPos[];
  campfires: CampfirePos[];
  goalX: number;
  bgTint?: number; // sky tint per level
}

// ─── 5 level layouts ──────────────────────────────────────────────────────

const T = LEVEL.tileSize; // 32
const GY = 468;            // main ground y

function groundRow(startTile: number, tiles: number): GroundSeg {
  return { x: startTile, y: GY, w: tiles };
}

const LEVELS: LevelDef[] = [
  // ── FASE 1 — Floresta suave ────────────────────────────────────────────
  {
    worldWidth: 4800,
    ground: [
      groundRow(0, 24),              // big starting ground
      groundRow(26, 18),
      groundRow(46, 22),
      groundRow(70, 30),
      groundRow(102, 18),
      groundRow(122, 28),
    ],
    floats: [
      { x:380, y:380, w:3 }, { x:550, y:340, w:3 }, { x:720, y:300, w:3 },
      { x:900, y:360, w:4 }, { x:1100,y:320, w:3 }, { x:1300,y:280, w:4 },
      { x:1500,y:340, w:3 }, { x:1700,y:380, w:4 }, { x:1900,y:300, w:3 },
      { x:2100,y:360, w:4 }, { x:2300,y:320, w:3 }, { x:2500,y:280, w:4 },
      { x:2700,y:340, w:3 }, { x:2900,y:380, w:4 }, { x:3100,y:300, w:3 },
      { x:3300,y:360, w:4 }, { x:3500,y:320, w:3 }, { x:3700,y:280, w:4 },
      { x:3900,y:340, w:3 }, { x:4100,y:400, w:5 },
    ],
    enemies: [
      { kind:'frog',   x:300,  y:440, pl:200,  pr:450  },
      { kind:'frog',   x:700,  y:440, pl:600,  pr:850  },
      { kind:'frog',   x:1100, y:440, pl:1000, pr:1250 },
      { kind:'frog',   x:1500, y:440, pl:1400, pr:1650 },
      { kind:'frog',   x:1900, y:440, pl:1800, pr:2050 },
      { kind:'frog',   x:2300, y:440, pl:2200, pr:2450 },
      { kind:'frog',   x:2700, y:440, pl:2600, pr:2850 },
      { kind:'frog',   x:3100, y:440, pl:3000, pr:3250 },
      { kind:'frog',   x:3500, y:440, pl:3400, pr:3650 },
      { kind:'frog',   x:3900, y:440, pl:3800, pr:4050 },
      { kind:'frog',   x:4300, y:440, pl:4200, pr:4500 },
      { kind:'frog',   x:4600, y:440, pl:4500, pr:4700 },
    ],
    acorns: [
      {x:300,y:420},{x:450,y:420},{x:600,y:380},{x:800,y:420},
      {x:1000,y:360},{x:1200,y:420},{x:1500,y:360},{x:1700,y:420},
      {x:2000,y:380},{x:2200,y:420},{x:2500,y:360},{x:2800,y:420},
      {x:3000,y:380},{x:3300,y:420},{x:3600,y:360},{x:3900,y:420},
    ],
    campfires: [{x:800,y:452},{x:1800,y:452},{x:2800,y:452},{x:3700,y:452}],
    goalX: 4650,
    bgTint: 0x87ceeb,
  },

  // ── FASE 2 — Selva com jaguares ───────────────────────────────────────
  {
    worldWidth: 5400,
    ground: [
      groundRow(0,  20),   // 0–640
      groundRow(22, 16),   // 704–1216
      groundRow(40, 20),   // 1280–1920
      groundRow(62, 16),   // 1984–2496
      groundRow(80, 18),   // 2560–3136
      groundRow(100,20),   // 3200–3840
      groundRow(122,24),   // 3904–4672
      groundRow(148,22),   // 4736–5408  ← extends to cover goalX 5150
    ],
    floats: [
      { x:340, y:360, w:3 }, { x:530, y:320, w:3 }, { x:700, y:280, w:3 },
      { x:880, y:340, w:4 }, { x:1060,y:300, w:3 }, { x:1240,y:260, w:4 },
      { x:1440,y:320, w:3 }, { x:1640,y:360, w:4 }, { x:1840,y:280, w:3 },
      { x:2040,y:340, w:4 }, { x:2240,y:300, w:3 }, { x:2440,y:260, w:4 },
      { x:2640,y:320, w:3 }, { x:2840,y:360, w:4 }, { x:3040,y:280, w:3 },
      { x:3240,y:340, w:4 }, { x:3440,y:300, w:3 }, { x:3640,y:260, w:4 },
      { x:3840,y:340, w:3 }, { x:4040,y:400, w:4 }, { x:4240,y:360, w:5 },
      { x:4500,y:320, w:4 }, { x:4700,y:360, w:4 },
    ],
    enemies: [
      { kind:'frog',   x:400,  y:440, pl:300,  pr:550   },
      { kind:'jaguar', x:750,  y:440, pl:600,  pr:900,  speed:120 },
      { kind:'frog',   x:1050, y:440, pl:900,  pr:1200  },
      { kind:'snake',  x:1350, y:455, pl:1200, pr:1550  },
      { kind:'jaguar', x:1650, y:440, pl:1500, pr:1850, speed:130 },
      { kind:'archer', x:1500, y:272                    },
      { kind:'frog',   x:1950, y:440, pl:1800, pr:2100  },
      { kind:'snake',  x:2250, y:455, pl:2100, pr:2450  },
      { kind:'jaguar', x:2600, y:440, pl:2450, pr:2800, speed:140 },
      { kind:'archer', x:2700, y:252                    },
      { kind:'frog',   x:2950, y:440, pl:2800, pr:3100  },
      { kind:'caiman', x:3200, y:452, pl:3050, pr:3400  },
      { kind:'jaguar', x:3550, y:440, pl:3400, pr:3750, speed:145 },
      { kind:'archer', x:3450, y:272                    },
      { kind:'snake',  x:3800, y:455, pl:3650, pr:3980  },
      { kind:'frog',   x:4100, y:440, pl:3950, pr:4250  },
      { kind:'caiman', x:4400, y:452, pl:4250, pr:4600  },
      { kind:'eagle',  x:4700, y:220, pl:4550, pr:4950  },
      { kind:'archer', x:4850, y:252                    },
      { kind:'jaguar', x:5000, y:440, pl:4850, pr:5200, speed:150 },
    ],
    acorns: [
      {x:300,y:420},{x:480,y:380},{x:650,y:360},{x:850,y:420},
      {x:1050,y:380},{x:1250,y:360},{x:1450,y:420},{x:1650,y:380},
      {x:1850,y:360},{x:2050,y:420},{x:2250,y:380},{x:2450,y:360},
      {x:2650,y:420},{x:2850,y:380},{x:3050,y:360},{x:3300,y:420},
      {x:3550,y:380},{x:3750,y:360},{x:3950,y:420},{x:4150,y:380},
      {x:4350,y:360},{x:4600,y:420},{x:4800,y:380},{x:5000,y:420},
    ],
    campfires: [{x:700,y:452},{x:1500,y:452},{x:2500,y:452},{x:3500,y:452},{x:4500,y:452}],
    goalX: 5150,
    bgTint: 0x5a9e3a,
  },

  // ── FASE 3 — Floresta densa com cobras e águias ───────────────────────
  {
    worldWidth: 5600,
    ground: [
      groundRow(0, 18),
      groundRow(20, 14),
      groundRow(36, 18),
      groundRow(56, 14),
      groundRow(72, 18),
      groundRow(92, 14),
      groundRow(108, 20),
      groundRow(130, 22),
      groundRow(152, 20),   // 4864–5504 — cobre goalX 5450
    ],
    floats: [
      { x:300, y:340, w:3 }, { x:480, y:300, w:3 }, { x:660, y:260, w:3 },
      { x:820, y:320, w:4 }, { x:1000,y:280, w:3 }, { x:1180,y:240, w:4 },
      { x:1380,y:300, w:3 }, { x:1580,y:340, w:4 }, { x:1780,y:260, w:3 },
      { x:1980,y:320, w:4 }, { x:2180,y:280, w:3 }, { x:2380,y:240, w:4 },
      { x:2580,y:300, w:3 }, { x:2780,y:340, w:4 }, { x:2980,y:260, w:3 },
      { x:3180,y:320, w:4 }, { x:3380,y:280, w:3 }, { x:3580,y:240, w:4 },
      { x:3780,y:300, w:3 }, { x:3980,y:360, w:4 }, { x:4180,y:400, w:4 },
      { x:4380,y:360, w:4 }, { x:4580,y:320, w:5 },
    ],
    enemies: [
      { kind:'snake',  x:400,  y:460, pl:300,  pr:550  },
      { kind:'eagle',  x:700,  y:220, pl:600,  pr:900  },
      { kind:'archer', x:820,  y:252                   },
      { kind:'frog',   x:1000, y:440, pl:900,  pr:1100 },
      { kind:'snake',  x:1300, y:460, pl:1150, pr:1480 },
      { kind:'eagle',  x:1600, y:200, pl:1450, pr:1800 },
      { kind:'archer', x:1700, y:272                   },
      { kind:'jaguar', x:2000, y:440, pl:1850, pr:2200, speed:130 },
      { kind:'snake',  x:2400, y:460, pl:2250, pr:2600 },
      { kind:'eagle',  x:2700, y:180, pl:2550, pr:2900 },
      { kind:'archer', x:2850, y:232                   },
      { kind:'frog',   x:3000, y:440, pl:2900, pr:3150 },
      { kind:'snake',  x:3400, y:460, pl:3250, pr:3600 },
      { kind:'eagle',  x:3700, y:200, pl:3550, pr:3900 },
      { kind:'archer', x:3900, y:252, interval:1800     },
      { kind:'jaguar', x:4100, y:440, pl:3950, pr:4300, speed:150 },
      { kind:'snake',  x:4500, y:460, pl:4350, pr:4700 },
      { kind:'eagle',  x:4900, y:200, pl:4750, pr:5200 },
      { kind:'archer', x:5050, y:252, interval:1800     },
      { kind:'jaguar', x:5300, y:440, pl:5100, pr:5450, speed:155 },
    ],
    acorns: [
      {x:250,y:420},{x:430,y:380},{x:620,y:340},{x:800,y:420},
      {x:1020,y:380},{x:1220,y:360},{x:1420,y:420},{x:1620,y:380},
      {x:1820,y:360},{x:2020,y:420},{x:2220,y:380},{x:2420,y:360},
      {x:2620,y:420},{x:2820,y:380},{x:3020,y:360},{x:3220,y:420},
      {x:3420,y:380},{x:3620,y:360},{x:3820,y:420},{x:4020,y:380},
      {x:4220,y:360},{x:4420,y:420},
    ],
    campfires: [{x:600,y:452},{x:1400,y:452},{x:2200,y:452},{x:3200,y:452},{x:4200,y:452}],
    goalX: 5450,
    bgTint: 0x3a6e1e,
  },

  // ── FASE 4 — Pântano com jacarés ──────────────────────────────────────
  {
    worldWidth: 6000,
    ground: [
      groundRow(0, 16),
      groundRow(18, 12),
      groundRow(32, 16),
      groundRow(50, 12),
      groundRow(64, 16),
      groundRow(82, 12),
      groundRow(96, 16),
      groundRow(114, 14),
      groundRow(130, 18),
      groundRow(150, 20),
      groundRow(170, 16),   // 5440–5952 — cobre goalX 5850
    ],
    floats: [
      { x:280, y:330, w:3 }, { x:450, y:290, w:3 }, { x:630, y:250, w:3 },
      { x:790, y:310, w:3 }, { x:970, y:270, w:3 }, { x:1150,y:230, w:4 },
      { x:1350,y:290, w:3 }, { x:1550,y:330, w:3 }, { x:1750,y:250, w:3 },
      { x:1950,y:310, w:4 }, { x:2150,y:270, w:3 }, { x:2350,y:230, w:4 },
      { x:2550,y:290, w:3 }, { x:2750,y:330, w:3 }, { x:2950,y:250, w:3 },
      { x:3150,y:310, w:4 }, { x:3350,y:270, w:3 }, { x:3550,y:230, w:4 },
      { x:3750,y:290, w:3 }, { x:3950,y:350, w:3 }, { x:4150,y:310, w:4 },
      { x:4350,y:380, w:4 }, { x:4550,y:340, w:4 }, { x:4750,y:400, w:5 },
    ],
    enemies: [
      { kind:'caiman', x:400,  y:454, pl:280,  pr:560  },
      { kind:'eagle',  x:650,  y:200, pl:500,  pr:800  },
      { kind:'archer', x:790,  y:242                   },
      { kind:'snake',  x:900,  y:460, pl:750,  pr:1050 },
      { kind:'caiman', x:1200, y:454, pl:1050, pr:1400 },
      { kind:'jaguar', x:1550, y:440, pl:1400, pr:1750, speed:145 },
      { kind:'eagle',  x:1850, y:180, pl:1700, pr:2050 },
      { kind:'archer', x:1950, y:262, interval:2000     },
      { kind:'caiman', x:2200, y:454, pl:2050, pr:2400 },
      { kind:'snake',  x:2550, y:460, pl:2400, pr:2750 },
      { kind:'jaguar', x:2900, y:440, pl:2750, pr:3100, speed:155 },
      { kind:'archer', x:3050, y:222                   },
      { kind:'caiman', x:3250, y:454, pl:3100, pr:3500 },
      { kind:'eagle',  x:3600, y:160, pl:3450, pr:3800 },
      { kind:'snake',  x:3950, y:460, pl:3800, pr:4150 },
      { kind:'archer', x:4150, y:242, interval:1800     },
      { kind:'caiman', x:4300, y:454, pl:4150, pr:4550 },
      { kind:'jaguar', x:4700, y:440, pl:4550, pr:4900, speed:160 },
      { kind:'caiman', x:4950, y:454, pl:4800, pr:5200  },
      { kind:'eagle',  x:5300, y:180, pl:5150, pr:5500  },
      { kind:'archer', x:5450, y:242, interval:1800      },
      { kind:'jaguar', x:5650, y:440, pl:5450, pr:5850, speed:165 },
    ],
    acorns: [
      {x:220,y:420},{x:400,y:380},{x:580,y:340},{x:780,y:420},
      {x:980,y:370},{x:1180,y:350},{x:1380,y:420},{x:1580,y:380},
      {x:1780,y:350},{x:1980,y:420},{x:2180,y:380},{x:2380,y:350},
      {x:2580,y:420},{x:2780,y:380},{x:2980,y:350},{x:3180,y:420},
      {x:3380,y:380},{x:3580,y:350},{x:3780,y:420},{x:3980,y:380},
      {x:4180,y:350},{x:4380,y:420},{x:4580,y:380},
    ],
    campfires: [{x:550,y:452},{x:1350,y:452},{x:2150,y:452},{x:3050,y:452},{x:3950,y:452},{x:4750,y:452}],
    goalX: 5850,
    bgTint: 0x2a5e1a,
  },

  // ── FASE 5 — Coração da selva (todos os inimigos) ─────────────────────
  {
    worldWidth: 6400,
    ground: [
      groundRow(0, 14),
      groundRow(16, 10),
      groundRow(28, 14),
      groundRow(44, 10),
      groundRow(56, 14),
      groundRow(72, 10),
      groundRow(84, 14),
      groundRow(100, 10),
      groundRow(112, 14),
      groundRow(128, 12),
      groundRow(142, 16),
      groundRow(160, 18),
      groundRow(178, 18),   // 5696–6272 — cobre goalX 6200
    ],
    floats: [
      { x:260, y:320, w:3 }, { x:430, y:280, w:3 }, { x:610, y:240, w:3 },
      { x:770, y:300, w:3 }, { x:950, y:260, w:3 }, { x:1130,y:220, w:4 },
      { x:1330,y:280, w:3 }, { x:1530,y:320, w:3 }, { x:1730,y:240, w:3 },
      { x:1930,y:300, w:4 }, { x:2130,y:260, w:3 }, { x:2330,y:220, w:4 },
      { x:2530,y:280, w:3 }, { x:2730,y:320, w:3 }, { x:2930,y:240, w:3 },
      { x:3130,y:300, w:4 }, { x:3330,y:260, w:3 }, { x:3530,y:220, w:4 },
      { x:3730,y:280, w:3 }, { x:3930,y:340, w:3 }, { x:4130,y:300, w:4 },
      { x:4330,y:370, w:3 }, { x:4530,y:330, w:4 }, { x:4730,y:390, w:4 },
      { x:4930,y:350, w:5 }, { x:5130,y:410, w:5 },
    ],
    enemies: [
      { kind:'jaguar', x:350,  y:440, pl:220,  pr:520,  speed:160 },
      { kind:'eagle',  x:600,  y:190, pl:450,  pr:750,  speed:140 },
      { kind:'archer', x:610,  y:232                   },
      { kind:'snake',  x:850,  y:460, pl:700,  pr:1000 },
      { kind:'caiman', x:1100, y:454, pl:950,  pr:1250 },
      { kind:'frog',   x:1350, y:440, pl:1200, pr:1500, hop:1200 },
      { kind:'archer', x:1330, y:272, interval:1800     },
      { kind:'jaguar', x:1600, y:440, pl:1450, pr:1800, speed:165 },
      { kind:'eagle',  x:1900, y:170, pl:1750, pr:2100, speed:145 },
      { kind:'archer', x:1930, y:242                   },
      { kind:'snake',  x:2200, y:460, pl:2050, pr:2400 },
      { kind:'caiman', x:2550, y:454, pl:2400, pr:2750 },
      { kind:'frog',   x:2850, y:440, pl:2700, pr:3000, hop:1100 },
      { kind:'archer', x:2730, y:312, interval:1600     },
      { kind:'jaguar', x:3100, y:440, pl:2950, pr:3300, speed:170 },
      { kind:'eagle',  x:3400, y:160, pl:3250, pr:3600, speed:155 },
      { kind:'archer', x:3530, y:212                   },
      { kind:'snake',  x:3700, y:460, pl:3550, pr:3900 },
      { kind:'caiman', x:4000, y:454, pl:3850, pr:4200 },
      { kind:'jaguar', x:4350, y:440, pl:4200, pr:4550, speed:175 },
      { kind:'archer', x:4330, y:362, interval:1500     },
      { kind:'eagle',  x:4650, y:150, pl:4500, pr:4900, speed:160 },
      { kind:'snake',  x:5000, y:460, pl:4850, pr:5150 },
      { kind:'caiman', x:5300, y:454, pl:5150, pr:5500 },
      { kind:'jaguar', x:5600, y:440, pl:5450, pr:5800, speed:180 },
      { kind:'eagle',  x:5900, y:160, pl:5750, pr:6100, speed:165 },
      { kind:'archer', x:5950, y:232, interval:1500      },
      { kind:'caiman', x:6050, y:454, pl:5900, pr:6200  },
    ],
    acorns: [
      {x:200,y:420},{x:380,y:380},{x:560,y:340},{x:740,y:420},
      {x:940,y:370},{x:1140,y:340},{x:1340,y:420},{x:1540,y:380},
      {x:1740,y:340},{x:1940,y:420},{x:2140,y:380},{x:2340,y:340},
      {x:2540,y:420},{x:2740,y:380},{x:2940,y:340},{x:3140,y:420},
      {x:3340,y:380},{x:3540,y:340},{x:3740,y:420},{x:3940,y:380},
      {x:4140,y:340},{x:4340,y:420},{x:4540,y:380},{x:4740,y:340},
      {x:4940,y:420},{x:5140,y:380},
    ],
    campfires: [
      {x:500,y:452},{x:1200,y:452},{x:2000,y:452},
      {x:2800,y:452},{x:3700,y:452},{x:4600,y:452},
    ],
    goalX: 6200,
    bgTint: 0x1a3d0a,
  },
];

// ─── GameScene ─────────────────────────────────────────────────────────────

export class GameScene extends BaseScene {
  private player!: Player;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private acornsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyList: Enemy[] = [];
  private bgTile!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private currentLevel = 1;
  private levelDef!: LevelDef;
  private respawnTimer = 0;
  private respawning = false;
  private alreadyDying = false;

  // Boomerangs & Arrows
  private boomerangs: Boomerang[] = [];
  private arrows: Arrow[] = [];

  constructor() { super('GameScene'); }

  init(data: { level?: number }) {
    super.init(data);
    this.currentLevel = data?.level ?? useGameStore.getState().level;
  }

  create() {
    const idx = Math.max(0, Math.min(this.currentLevel - 1, LEVELS.length - 1));
    this.levelDef = LEVELS[idx];
    useGameStore.getState().setLevel(this.currentLevel);
    useGameStore.getState().setGameState('PLAYING');
    try { this.audio.play('round_start'); } catch { /* no-op */ }

    const worldW = this.levelDef.worldWidth;
    const worldH = LEVEL.worldHeight;
    const cam = this.cameras.main;

    // Expand world bounds BELOW the floor so the player can fall through gaps
    this.physics.world.setBounds(0, 0, worldW, worldH + 200, true, true, true, false);
    cam.setBounds(0, 0, worldW, worldH);
    cam.setZoom(typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1);

    this.alreadyDying = false;
    this.respawning = false;
    this.enemyList = [];
    this.boomerangs = [];
    this.arrows = [];

    this.createBackground(worldW, worldH);
    this.buildLevel();

    this.player = new Player(this, 80, 420);
    // Wire boomerang throw: player calls this callback when Z/Ctrl/attack button pressed
    this.player.setThrowCallback((x, y, dirX) => {
      const boom = new Boomerang(this, x, y, dirX, this.player);
      this.boomerangs.push(boom);
      try { this.audio.play('whoosh'); } catch { /* no-op */ }
    });

    const pc = this.player as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType;

    this.solidCollision(pc, this.groundGroup);
    this.solidCollision(pc, this.platformGroup);
    this.solidCollision(this.enemiesGroup, this.groundGroup);
    this.solidCollision(this.enemiesGroup, this.platformGroup);

    // Acorn collect
    this.onOverlap(pc, this.acornsGroup, (_p, acorn) => {
      (acorn as Phaser.Physics.Arcade.Sprite).destroy();
      useGameStore.getState().addScore(10);
      try { this.audio.play('coin'); } catch { /* no-op */ }
      this.popupText(this.player.x, this.player.y - 20, '+10', '#ffe066');
    });

    // Enemy collisions
    this.physics.add.overlap(pc, this.enemiesGroup, (_p, enemyObj) => {
      const enemy = enemyObj as unknown as Enemy;
      if (!enemy.isAlive()) return;
      const pb = this.player.body as Phaser.Physics.Arcade.Body;
      const caiman = enemy as any;
      // Caiman cannot be stomped
      if (caiman.cannotBeStomp) {
        if (this.player.hit()) this.triggerPlayerDeath();
        return;
      }
      // Stomp: falling + above enemy centre
      if (pb.velocity.y > 0 && this.player.y < (enemy as any).y - 10) {
        enemy.stomp();
        try { this.audio.play('stomp'); } catch { /* no-op */ }
        this.player.stomp();
        useGameStore.getState().addScore(50);
        this.popupText((enemy as any).x, (enemy as any).y - 22, '+50', '#ff8844');
      } else {
        if (this.player.hit()) this.triggerPlayerDeath();
      }
    }, undefined, this);

    cam.startFollow(this.player, true, 0.1, 0.1);
    this.drawGoalFlag(this.levelDef.goalX);
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ── Background ─────────────────────────────────────────────────────────

  private createBackground(worldW: number, worldH: number) {
    const tint = this.levelDef.bgTint ?? 0x87ceeb;
    // Sky backdrop
    this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, tint)
      .setScrollFactor(0.1).setDepth(-10);

    if (this.textures.exists('bg_forest')) {
      this.bgTile = this.add.tileSprite(0, 0, worldW, worldH, 'bg_forest')
        .setOrigin(0, 0).setScrollFactor(0.2).setDepth(-5).setAlpha(0.65);
      this.bgMid = this.add.tileSprite(0, 0, worldW, worldH, 'bg_forest')
        .setOrigin(0, 0).setScrollFactor(0.5).setDepth(-3).setAlpha(0.35);
    }

    // Procedural trees decoration
    const g = this.add.graphics().setDepth(-2);
    for (let x = 120; x < worldW - 100; x += 180 + Math.floor(Math.random() * 120)) {
      const h = 80 + Math.floor(Math.random() * 70);
      g.fillStyle(0x1a5e18, 1);
      g.fillTriangle(x, GY - h, x - 32, GY, x + 32, GY);
      g.fillTriangle(x, GY - h - 22, x - 24, GY - h + 16, x + 24, GY - h + 16);
      g.fillStyle(0x4a2210, 1);
      g.fillRect(x - 7, GY - 10, 14, 18);
    }
  }

  // ── Level building ─────────────────────────────────────────────────────

  private buildLevel() {
    this.groundGroup  = this.physics.add.staticGroup();
    this.platformGroup= this.physics.add.staticGroup();
    this.acornsGroup  = this.physics.add.staticGroup();
    this.enemiesGroup = this.physics.add.group();

    const { ground, floats, enemies, acorns, campfires } = this.levelDef;

    // Ground tiles
    for (const seg of ground) {
      for (let i = 0; i < seg.w; i++) {
        const tile = this.groundGroup.create(
          seg.x * T + i * T + T / 2, seg.y, 'tile_ground',
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(T, T).refreshBody();
      }
    }

    // Floating platforms
    for (const fp of floats) {
      for (let i = 0; i < fp.w; i++) {
        const tile = this.platformGroup.create(
          fp.x + i * T, fp.y, 'tile_platform',
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(T, 16).refreshBody();
      }
    }

    // Enemies
    for (const ed of enemies) {
      const e = this.spawnEnemy(ed);
      if (e) {
        this.enemiesGroup.add(e as unknown as Phaser.GameObjects.GameObject, true);
        this.enemyList.push(e);
      }
    }

    // Acorns — use physics.add.image (no physics body issues)
    for (const a of acorns) {
      const acorn = this.acornsGroup.create(a.x, a.y, 'acorn') as Phaser.Physics.Arcade.Sprite;
      acorn.setDisplaySize(24, 24).refreshBody();
      this.tweens.add({
        targets: acorn, y: a.y - 7, duration: 700 + Math.random() * 400,
        ease: 'Sine.InOut', yoyo: true, repeat: -1,
      });
    }

    // Campfire decorations
    for (const cf of campfires) {
      if (this.textures.exists('prop_campfire')) {
        const fire = this.add.image(cf.x, cf.y, 'prop_campfire').setDisplaySize(32, 32).setDepth(3);
        this.tweens.add({ targets: fire, scaleX: 1.06, scaleY: 0.94, duration: 180, yoyo: true, repeat: -1 });
      }
    }
  }

  /** Single entry point for all player deaths (hit by enemy OR fell into pit). */
  private triggerPlayerDeath() {
    if (this.alreadyDying) return;
    this.alreadyDying = true;
    this.respawning = true;
    this.respawnTimer = this.time.now + 900;
    useGameStore.getState().loseLife();
    try { this.audio.play('hurt'); } catch { /* no-op */ }
  }

  private spawnEnemy(def: EnemyDef): Enemy | null {
    switch (def.kind) {
      case 'frog':   return new Frog(this,   def.x, def.y, def.pl, def.pr, def.hop);
      case 'jaguar': return new Jaguar(this, def.x, def.y, def.pl, def.pr, def.speed);
      case 'eagle':  return new Eagle(this,  def.x, def.y, def.pl, def.pr, def.speed);
      case 'snake':  return new Snake(this,  def.x, def.y, def.pl, def.pr, def.speed);
      case 'caiman': return new Caiman(this, def.x, def.y, def.pl, def.pr, def.speed);
      case 'archer': return new Archer(this, def.x, def.y, (arrow) => {
        this.arrows.push(arrow);
      }, def.interval);
      default:       return null;
    }
  }

  // ── Goal flag ──────────────────────────────────────────────────────────

  private drawGoalFlag(goalX: number) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0xcccccc, 1); g.fillRect(goalX - 2, 320, 4, 148);
    g.fillStyle(0xff3333, 1); g.fillTriangle(goalX + 2, 320, goalX + 48, 337, goalX + 2, 354);
    this.add.text(goalX, 300, 'META!', {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(6);

    const sensor = this.physics.add.sprite(goalX, 430, '__DEFAULT')
      .setDisplaySize(24, 140).setAlpha(0);
    const sb = sensor.body as Phaser.Physics.Arcade.Body;
    sb.setAllowGravity(false); sb.setImmovable(true);
    this.physics.add.overlap(
      this.player as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      sensor,
      () => this.levelComplete(),
    );
  }

  // ── Level complete ─────────────────────────────────────────────────────

  private levelComplete() {
    if (useGameStore.getState().gameState !== 'PLAYING') return;
    useGameStore.getState().setGameState('VICTORY');
    useGameStore.getState().addScore(200 + this.currentLevel * 50);
    try { this.audio.play('victory'); } catch { /* no-op */ }
    this.cameras.main.fadeOut(1000, 255, 255, 180);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const goNext = () => {
        if (this.currentLevel < LEVELS.length) {
          this.scene.start('GameOverScene', { victory: true, nextLevel: this.currentLevel + 1 });
        } else {
          this.scene.start('GameOverScene', { victory: true, nextLevel: null });
        }
      };
      // Mostrar intersticial entre fases; continua mesmo se falhar
      showInterstitial().then(goNext).catch(goNext);
    });
  }

  // ── Update loop ────────────────────────────────────────────────────────

  update(time: number) {
    const { gameState } = useGameStore.getState();

    // ── Respawn / death transition — must run even when GAMEOVER ──────────
    if (this.respawning && time > this.respawnTimer) {
      this.respawning = false;
      this.alreadyDying = false;
      if (useGameStore.getState().gameState === 'GAMEOVER') {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          showInterstitial().finally(() => {
            this.scene.start('GameOverScene', { victory: false, nextLevel: null, currentLevel: this.currentLevel });
          });
        });
        return;
      } else {
        this.player.setPosition(80, 400);
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.player.setAlpha(1);
      try { this.audio.play('land'); } catch { /* no-op */ }
      }
    }

    if (gameState !== 'PLAYING') return;

    this.player.update();

    for (const e of this.enemyList) {
      if (e.active && e.isAlive()) {
        e.update(time, this.player.x, this.player.y);
      }
    }

    // ── Boomerang update & enemy collision ─────────────────────────────────
    this.boomerangs = this.boomerangs.filter(b => b.isAlive());
    for (const boom of this.boomerangs) {
      boom.update(time);
      if (!boom.isAlive()) continue;
      for (const enemy of this.enemyList) {
        if (!enemy.isAlive() || !(enemy as any).active) continue;
        const dx = boom.x - (enemy as any).x;
        const dy = boom.y - (enemy as any).y;
        if (Math.abs(dx) < 28 && Math.abs(dy) < 28) {
          const caiman = enemy as any;
          if (caiman.cannotBeStomp) {
            boom.catch();
          } else {
            enemy.stomp();
            useGameStore.getState().addScore(50);
            this.popupText((enemy as any).x, (enemy as any).y - 24, '+50', '#ffd700');
            boom.catch();
          }
          break;
        }
      }
    }

    // ── Arrow update & player collision ────────────────────────────────────
    this.arrows = this.arrows.filter(a => a.isAlive());
    for (const arrow of this.arrows) {
      arrow.update();
      if (!arrow.isAlive()) continue;
      const dx = arrow.x - this.player.x;
      const dy = arrow.y - this.player.y;
      if (Math.abs(dx) < 22 && Math.abs(dy) < 24) {
        if (this.player.hit()) this.triggerPlayerDeath();
        arrow.expire();
      }
    }

    if (this.bgTile) this.bgTile.tilePositionX = this.cameras.main.scrollX * 0.2;
    if (this.bgMid)  this.bgMid.tilePositionX  = this.cameras.main.scrollX * 0.45;

    // Fall death
    if (!this.alreadyDying && this.player.y > DEATH_Y) {
      this.triggerPlayerDeath();
    }
  }
}
