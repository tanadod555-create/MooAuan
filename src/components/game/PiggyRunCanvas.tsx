import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CharacterType,
  Obstacle,
  Collectible,
  Particle,
  PlayerSkills,
} from './gameTypes';
import {
  play8BitJump,
  play8BitDoubleJump,
  play8BitSlide,
  play8BitCoin,
  play8BitPowerup,
  play8BitCrash,
  play8BitFeverJingle,
} from './gameAudio';
import { loadPiggySaveData, recordHighScore, awardCoins } from '../../services/piggyGameService';
import { Trophy, Coins, RotateCcw, Shield, Zap } from 'lucide-react';

// ──────────────────────────────────────────────
// COOKIE-RUN STYLE PHYSICS CONSTANTS
// ──────────────────────────────────────────────
const CANVAS_W = 560;
const CANVAS_H = 315;
const FLOOR_Y = 232;               // Ground level
const PLAYER_X = 80;               // Fixed X position of player

// Jump physics - Cookie Run feel: fast up, heavy down
const JUMP_VELOCITY = -14.5;       // Strong upward impulse
const DOUBLE_JUMP_VELOCITY = -12;  // Slightly weaker second jump
const GRAVITY_ASCENDING = 0.65;    // Lighter gravity going up (controllable)
const GRAVITY_DESCENDING = 1.2;    // Heavy gravity pulling down (snappy)
const MAX_FALL_SPEED = 18;         // Terminal velocity
const COYOTE_TIME = 6;             // Frames after leaving ground where jump still works

// Squash & Stretch
const SQUASH_LAND = 0.7;           // Y scale when landing
const STRETCH_JUMP = 1.3;          // Y scale when launching
const SQUASH_RECOVER_SPEED = 0.12; // How fast squash recovers

// Slide
const SLIDE_DURATION = 30;         // Frames
const SLIDE_SPEED_BOOST = 1.15;    // Slight speed increase while sliding

// Speed progression
const INITIAL_SPEED = 5.5;
const MAX_SPEED = 11;
const SPEED_INCREASE = 0.0008;

// Screen shake
const SHAKE_INTENSITY = 6;
const SHAKE_DURATION = 12;

// ──────────────────────────────────────────────
// PIXEL ART CHARACTER SPRITE DATA (8x8 grid blocks)
// Each pixel = 4x4 canvas pixels for that retro look
// ──────────────────────────────────────────────
const PX = 3; // Pixel size for character rendering

// Manow color palette
const MANOW_COLORS = {
  body: '#fbb6ce',
  bodyDark: '#f472b6',
  belly: '#fce7f3',
  bow: '#ec4899',
  eye: '#0f172a',
  eyeShine: '#ffffff',
  snout: '#f472b6',
  snoutDark: '#be185d',
  cheek: '#fb7185',
  legs: '#f472b6',
  fever: '#fde047',
  feverBelly: '#fef08a',
};

// Magnum color palette
const MAGNUM_COLORS = {
  body: '#93c5fd',
  bodyDark: '#3b82f6',
  belly: '#dbeafe',
  bow: '#ef4444', // headband
  eye: '#0f172a',
  eyeShine: '#ffffff',
  snout: '#60a5fa',
  snoutDark: '#1d4ed8',
  cheek: '#f472b6',
  legs: '#3b82f6',
  fever: '#fde047',
  feverBelly: '#fef08a',
};

// Draw a single pixel block
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = PX) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
}

// Draw multiple pixel blocks from array
function drawPixels(ctx: CanvasRenderingContext2D, pixels: [number, number, string][], size = PX) {
  for (const [x, y, color] of pixels) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
  }
}

interface PiggyRunCanvasProps {
  onOpenShop: () => void;
  character?: CharacterType;
}

export const PiggyRunCanvas: React.FC<PiggyRunCanvasProps> = ({ onOpenShop, character }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [runCoins, setRunCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isFever, setIsFever] = useState(false);
  const [feverProgress, setFeverProgress] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);

  // Sprite image refs
  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  const spriteLoadedRef = useRef(false);

  // Game state ref - all mutable game data lives here
  const gameStateRef = useRef({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    coins: 0,
    speed: INITIAL_SPEED,
    distance: 0,
    character: character || 'manow' as CharacterType,
    skills: {
      magnetLevel: 0,
      doubleJumpUnlocked: false,
      shieldLevel: 0,
      feverBoostLevel: 0,
    } as PlayerSkills,
    player: {
      x: PLAYER_X,
      y: FLOOR_Y - 42,
      width: 42,
      height: 42,
      baseY: FLOOR_Y - 42,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      jumpCount: 0,
      isSliding: false,
      slideTimer: 0,
      animFrame: 0,
      animTimer: 0,
      invulnerableTimer: 0,
      coyoteTimer: 0,
      // Squash & Stretch
      scaleX: 1,
      scaleY: 1,
      targetScaleX: 1,
      targetScaleY: 1,
      // Dust trail
      dustTimer: 0,
    },
    fever: {
      meter: 0,
      isActive: false,
      timer: 0,
    },
    magnet: {
      isActive: false,
      timer: 0,
    },
    shieldCount: 0,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    backgroundOffset: 0,
    bgLayer2Offset: 0,
    bgLayer3Offset: 0,
    nextObstacleDist: 90,
    screenShake: 0,
    frameCount: 0,
    // Score popup
    scorePopups: [] as { x: number; y: number; text: string; life: number; color: string }[],
    // Input buffer for responsive controls
    jumpBuffered: false,
    jumpBufferTimer: 0,
  });

  // Load sprite image
  useEffect(() => {
    const charName = character || 'manow';
    const img = new Image();
    img.src = `./mascots/piggy_run_${charName === 'magnum' ? 'magnum' : 'manow'}.webp`;
    img.onload = () => {
      spriteImgRef.current = img;
      spriteLoadedRef.current = true;
    };
    img.onerror = () => {
      // Fallback: try gif
      const img2 = new Image();
      img2.src = `./mascots/piggy_run_${charName === 'magnum' ? 'magnum' : 'manow'}.gif`;
      img2.onload = () => {
        spriteImgRef.current = img2;
        spriteLoadedRef.current = true;
      };
    };
  }, [character]);

  // Load High Score and skills
  useEffect(() => {
    const saved = loadPiggySaveData();
    setHighScore(saved.highScore);
    gameStateRef.current.character = character || saved.selectedCharacter || 'manow';
    gameStateRef.current.skills = saved.skills;
  }, [character]);

  const initNewGame = useCallback(() => {
    const saved = loadPiggySaveData();
    const g = gameStateRef.current;

    g.isPlaying = true;
    g.isGameOver = false;
    g.score = 0;
    g.coins = 0;
    g.speed = INITIAL_SPEED;
    g.distance = 0;
    g.character = character || saved.selectedCharacter || 'manow';
    g.skills = saved.skills;
    g.frameCount = 0;

    g.player.y = g.player.baseY;
    g.player.vy = 0;
    g.player.isGrounded = true;
    g.player.isJumping = false;
    g.player.jumpCount = 0;
    g.player.isSliding = false;
    g.player.slideTimer = 0;
    g.player.invulnerableTimer = 0;
    g.player.coyoteTimer = 0;
    g.player.scaleX = 1;
    g.player.scaleY = 1;
    g.player.targetScaleX = 1;
    g.player.targetScaleY = 1;
    g.player.dustTimer = 0;

    g.fever.meter = 0;
    g.fever.isActive = false;
    g.fever.timer = 0;

    g.magnet.isActive = false;
    g.magnet.timer = 0;

    g.shieldCount = saved.skills.shieldLevel > 0 ? 1 : 0;

    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.scorePopups = [];
    g.nextObstacleDist = 100;
    g.screenShake = 0;
    g.jumpBuffered = false;
    g.jumpBufferTimer = 0;

    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setRunCoins(0);
    setFeverProgress(0);
    setIsFever(false);
    setHasShield(g.shieldCount > 0);
    setHasMagnet(false);
  }, [character]);

  // Handle Player Jump - Cookie Run Style
  const handleJump = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) {
      initNewGame();
      return;
    }

    // Cancel slide if jumping
    g.player.isSliding = false;

    // Ground jump (or coyote time jump)
    if (g.player.isGrounded || g.player.coyoteTimer > 0) {
      g.player.vy = JUMP_VELOCITY;
      g.player.isGrounded = false;
      g.player.isJumping = true;
      g.player.jumpCount = 1;
      g.player.coyoteTimer = 0;

      // Stretch on launch
      g.player.scaleX = 0.75;
      g.player.scaleY = STRETCH_JUMP;
      g.player.targetScaleX = 1;
      g.player.targetScaleY = 1;

      // Launch dust
      for (let i = 0; i < 6; i++) {
        g.particles.push({
          x: g.player.x + 20,
          y: FLOOR_Y - 4,
          vx: (Math.random() - 0.7) * 4,
          vy: -Math.random() * 3 - 1,
          color: '#d1d5db',
          size: 3 + Math.random() * 2,
          life: 0,
          maxLife: 18 + Math.random() * 8,
        });
      }

      play8BitJump();
      g.jumpBuffered = false;
      return;
    }

    // Double Jump (if unlocked via skills)
    if (g.skills.doubleJumpUnlocked && g.player.jumpCount === 1) {
      g.player.vy = DOUBLE_JUMP_VELOCITY;
      g.player.jumpCount = 2;

      // Micro-stretch
      g.player.scaleX = 0.8;
      g.player.scaleY = 1.2;
      g.player.targetScaleX = 1;
      g.player.targetScaleY = 1;

      // Sparkle burst
      for (let i = 0; i < 10; i++) {
        g.particles.push({
          x: g.player.x + 20,
          y: g.player.y + 30,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 4 + 1,
          color: i % 2 === 0 ? '#ffd700' : '#fbbf24',
          size: 2 + Math.random() * 2,
          life: 0,
          maxLife: 20,
        });
      }

      play8BitDoubleJump();
      g.jumpBuffered = false;
      return;
    }

    // Buffer the jump input for a few frames
    g.jumpBuffered = true;
    g.jumpBufferTimer = 8;
  }, [initNewGame]);

  // Handle Player Slide
  const handleSlide = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) return;

    if (g.player.isGrounded) {
      g.player.isSliding = true;
      g.player.slideTimer = SLIDE_DURATION;

      // Squash into slide
      g.player.scaleX = 1.3;
      g.player.scaleY = 0.6;
      g.player.targetScaleX = 1.2;
      g.player.targetScaleY = 0.7;

      play8BitSlide();
    } else if (!g.player.isGrounded) {
      // Fast drop - slam down when in air (Cookie Run style)
      g.player.vy = MAX_FALL_SPEED * 0.8;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleSlide();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleJump, handleSlide]);

  // ──────────────────────────────────────────────
  // PIXEL ART DRAWING FUNCTIONS
  // ──────────────────────────────────────────────

  // Draw running piglet in pure pixel art (no arcs, no curves!)
  function drawPixelPiglet(
    ctx: CanvasRenderingContext2D,
    frame: number,
    colors: typeof MANOW_COLORS,
    isFeverMode: boolean,
    isManow: boolean
  ) {
    const c = isFeverMode
      ? { ...colors, body: colors.fever, belly: colors.feverBelly }
      : colors;

    // Body (14x10 pixel grid, each pixel = PX canvas pixels)
    // Main body blob
    for (let bx = 3; bx <= 11; bx++) {
      for (let by = 4; by <= 10; by++) {
        px(ctx, bx, by, c.body);
      }
    }
    // Wider middle
    for (let bx = 2; bx <= 12; bx++) {
      for (let by = 5; by <= 9; by++) {
        px(ctx, bx, by, c.body);
      }
    }

    // Belly highlight
    for (let bx = 5; bx <= 10; bx++) {
      for (let by = 6; by <= 9; by++) {
        px(ctx, bx, by, c.belly);
      }
    }

    // Head
    for (let hx = 8; hx <= 13; hx++) {
      for (let hy = 1; hy <= 5; hy++) {
        px(ctx, hx, hy, c.body);
      }
    }
    // Head top extra
    px(ctx, 9, 0, c.body);
    px(ctx, 10, 0, c.body);
    px(ctx, 11, 0, c.body);
    px(ctx, 12, 0, c.body);

    // Ears
    px(ctx, 8, 0, c.body);
    px(ctx, 13, 0, c.body);
    px(ctx, 8, -1, c.bodyDark);
    px(ctx, 13, -1, c.bodyDark);

    // Bow / Headband
    if (isManow) {
      // Pink bow on head
      px(ctx, 9, -1, c.bow);
      px(ctx, 10, -1, c.bow);
      px(ctx, 9, -2, c.bow);
      px(ctx, 10, -2, c.bow);
      px(ctx, 8, -1, c.bow);
      px(ctx, 11, -1, c.bow);
    } else {
      // Red headband
      for (let hx = 8; hx <= 13; hx++) {
        px(ctx, hx, 1, c.bow);
      }
    }

    // Eye
    px(ctx, 12, 2, c.eye);
    px(ctx, 12, 3, c.eye);
    // Eye shine
    px(ctx, 12, 2, c.eyeShine);

    // Snout
    px(ctx, 13, 3, c.snout);
    px(ctx, 14, 3, c.snout);
    px(ctx, 13, 4, c.snout);
    px(ctx, 14, 4, c.snout);
    // Nostrils
    px(ctx, 13, 4, c.snoutDark);
    px(ctx, 14, 3, c.snoutDark);

    // Cheek blush
    px(ctx, 11, 4, c.cheek);
    px(ctx, 11, 5, c.cheek);

    // Legs animation - 4 frames of running cycle
    const legPositions = [
      // Frame 0: Left forward, Right back
      [[4, 11], [5, 12], [9, 11], [8, 12]],
      // Frame 1: Both center
      [[5, 11], [5, 12], [8, 11], [8, 12]],
      // Frame 2: Left back, Right forward
      [[3, 11], [4, 12], [10, 11], [10, 12]],
      // Frame 3: Both center (contact)
      [[6, 11], [6, 12], [7, 11], [7, 12]],
    ];

    const legs = legPositions[frame % 4];
    for (const [lx, ly] of legs) {
      px(ctx, lx, ly, c.legs);
    }

    // Tail
    const tailWag = frame % 2 === 0 ? 0 : -1;
    px(ctx, 2, 5 + tailWag, c.bodyDark);
    px(ctx, 1, 4 + tailWag, c.bodyDark);

    // Fever wings
    if (isFeverMode) {
      // Small pixel wings
      px(ctx, 3, 2, '#ffffff');
      px(ctx, 2, 1, '#ffffff');
      px(ctx, 1, 0, '#ffffff');
      px(ctx, 2, 2, '#ffffff');
      px(ctx, 1, 1, '#ffffff');
      px(ctx, 0, 0, '#ffffff');
      px(ctx, 3, 3, '#fef08a');
      px(ctx, 2, 3, '#fef08a');
    }
  }

  // Draw sliding piglet
  function drawPixelPigletSlide(
    ctx: CanvasRenderingContext2D,
    colors: typeof MANOW_COLORS,
    isFeverMode: boolean,
  ) {
    const c = isFeverMode
      ? { ...colors, body: colors.fever, belly: colors.feverBelly }
      : colors;

    // Flattened body (wider, shorter)
    for (let bx = 1; bx <= 13; bx++) {
      for (let by = 2; by <= 5; by++) {
        px(ctx, bx, by, c.body);
      }
    }

    // Belly
    for (let bx = 3; bx <= 11; bx++) {
      for (let by = 3; by <= 4; by++) {
        px(ctx, bx, by, c.belly);
      }
    }

    // Head (forward)
    for (let hx = 11; hx <= 14; hx++) {
      for (let hy = 1; hy <= 4; hy++) {
        px(ctx, hx, hy, c.body);
      }
    }

    // Eye (winking)
    px(ctx, 14, 2, c.eye);

    // Snout
    px(ctx, 15, 3, c.snout);
    px(ctx, 15, 2, c.snout);
    px(ctx, 15, 3, c.snoutDark);

    // Speed lines behind
    px(ctx, -1, 3, '#94a3b8');
    px(ctx, -2, 4, '#94a3b8');
    px(ctx, -3, 3, '#64748b');
  }

  // Draw jumping piglet (arms/legs spread)
  function drawPixelPigletJump(
    ctx: CanvasRenderingContext2D,
    colors: typeof MANOW_COLORS,
    isFeverMode: boolean,
    isManow: boolean,
    isRising: boolean,
  ) {
    const c = isFeverMode
      ? { ...colors, body: colors.fever, belly: colors.feverBelly }
      : colors;

    // Body
    for (let bx = 3; bx <= 11; bx++) {
      for (let by = 4; by <= 10; by++) {
        px(ctx, bx, by, c.body);
      }
    }
    for (let bx = 2; bx <= 12; bx++) {
      for (let by = 5; by <= 9; by++) {
        px(ctx, bx, by, c.body);
      }
    }

    // Belly
    for (let bx = 5; bx <= 10; bx++) {
      for (let by = 6; by <= 9; by++) {
        px(ctx, bx, by, c.belly);
      }
    }

    // Head
    for (let hx = 8; hx <= 13; hx++) {
      for (let hy = 1; hy <= 5; hy++) {
        px(ctx, hx, hy, c.body);
      }
    }
    px(ctx, 9, 0, c.body);
    px(ctx, 10, 0, c.body);
    px(ctx, 11, 0, c.body);
    px(ctx, 12, 0, c.body);

    // Ears
    px(ctx, 8, -1, c.bodyDark);
    px(ctx, 13, -1, c.bodyDark);

    // Bow / Headband
    if (isManow) {
      px(ctx, 9, -1, c.bow);
      px(ctx, 10, -1, c.bow);
      px(ctx, 9, -2, c.bow);
      px(ctx, 10, -2, c.bow);
    } else {
      for (let hx = 8; hx <= 13; hx++) {
        px(ctx, hx, 1, c.bow);
      }
    }

    // Eye (excited!)
    px(ctx, 12, 2, c.eye);
    px(ctx, 12, 3, c.eye);
    px(ctx, 13, 2, c.eye);
    px(ctx, 12, 2, c.eyeShine);

    // Snout
    px(ctx, 13, 3, c.snout);
    px(ctx, 14, 3, c.snout);
    px(ctx, 13, 4, c.snout);
    px(ctx, 14, 4, c.snout);
    px(ctx, 13, 4, c.snoutDark);
    px(ctx, 14, 3, c.snoutDark);

    // Cheek
    px(ctx, 11, 4, c.cheek);

    // Legs spread out in air
    if (isRising) {
      // Legs tucked up
      px(ctx, 4, 10, c.legs);
      px(ctx, 5, 10, c.legs);
      px(ctx, 9, 10, c.legs);
      px(ctx, 10, 10, c.legs);
    } else {
      // Legs spread falling
      px(ctx, 3, 11, c.legs);
      px(ctx, 4, 12, c.legs);
      px(ctx, 10, 11, c.legs);
      px(ctx, 11, 12, c.legs);
    }

    // Arms out
    px(ctx, 13, 6, c.body);
    px(ctx, 14, 5, c.body);
    px(ctx, 1, 6, c.body);
    px(ctx, 0, 7, c.body);

    // Tail
    px(ctx, 2, 5, c.bodyDark);
    px(ctx, 1, 4, c.bodyDark);

    // Fever wings
    if (isFeverMode) {
      px(ctx, 3, 1, '#ffffff');
      px(ctx, 2, 0, '#ffffff');
      px(ctx, 1, -1, '#ffffff');
      px(ctx, 2, 1, '#ffffff');
      px(ctx, 1, 0, '#ffffff');
      px(ctx, 0, -1, '#ffffff');
    }
  }

  // ──────────────────────────────────────────────
  // PIXEL ART ITEMS & OBSTACLES
  // ──────────────────────────────────────────────

  function drawPixelCoin(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
    const shimmer = frame % 20 < 10;
    const outer = shimmer ? '#f59e0b' : '#d97706';
    const inner = shimmer ? '#fef08a' : '#fcd34d';

    // 5x5 pixel coin
    for (let cy = 1; cy <= 3; cy++) {
      for (let cx = 0; cx <= 4; cx++) {
        ctx.fillStyle = outer;
        ctx.fillRect(x + cx * 3, y + cy * 3, 3, 3);
      }
    }
    // Top/bottom
    for (let cx = 1; cx <= 3; cx++) {
      ctx.fillStyle = outer;
      ctx.fillRect(x + cx * 3, y, 3, 3);
      ctx.fillRect(x + cx * 3, y + 4 * 3, 3, 3);
    }
    // Inner shine
    for (let cy = 1; cy <= 3; cy++) {
      for (let cx = 1; cx <= 3; cx++) {
        ctx.fillStyle = inner;
        ctx.fillRect(x + cx * 3, y + cy * 3, 3, 3);
      }
    }
    // $ symbol
    ctx.fillStyle = outer;
    ctx.fillRect(x + 2 * 3, y + 1 * 3, 3, 3);
    ctx.fillRect(x + 2 * 3, y + 3 * 3, 3, 3);
  }

  function drawPixelBoba(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Cup body
    for (let cy = 2; cy <= 7; cy++) {
      for (let cx = 1; cx <= 5; cx++) {
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x + cx * 3, y + cy * 3, 3, 3);
      }
    }
    // Cup top (lid)
    for (let cx = 0; cx <= 6; cx++) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cx * 3, y + 1 * 3, 3, 3);
    }
    // Straw
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 3 * 3, y, 3, 3 * 2);
    // Boba pearls
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 2 * 3, y + 6 * 3, 3, 3);
    ctx.fillRect(x + 4 * 3, y + 6 * 3, 3, 3);
    ctx.fillRect(x + 3 * 3, y + 5 * 3, 3, 3);
  }

  function drawPixelDonut(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const s = 3;
    // Outer ring
    for (let dy = 0; dy < 8; dy++) {
      for (let dx = 0; dx < 8; dx++) {
        const dist = Math.abs(dx - 3.5) + Math.abs(dy - 3.5);
        if (dist >= 1.5 && dist <= 4.5) {
          ctx.fillStyle = dy < 4 ? '#f472b6' : '#92400e';
          ctx.fillRect(x + dx * s, y + dy * s, s, s);
        }
      }
    }
    // Sprinkles
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 2 * s, y + 1 * s, s, s);
    ctx.fillRect(x + 5 * s, y + 2 * s, s, s);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(x + 4 * s, y + 1 * s, s, s);
  }

  function drawPixelDumbbell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const s = 3;
    // Left weight plate
    for (let dy = 0; dy < 7; dy++) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y + dy * s, s * 2, s);
    }
    // Right weight plate
    for (let dy = 0; dy < 7; dy++) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + w - s * 2, y + dy * s, s * 2, s);
    }
    // Bar
    ctx.fillStyle = '#94a3b8';
    for (let dx = 2; dx < Math.floor(w / s) - 2; dx++) {
      ctx.fillRect(x + dx * s, y + 3 * s, s, s);
    }
  }

  function drawPixelBarbell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
    const s = 3;
    // Chain
    ctx.fillStyle = '#6b7280';
    for (let cy = 0; cy < Math.floor(y / s); cy++) {
      ctx.fillRect(x + Math.floor(w / 2), cy * s, s, s);
    }
    // Left plate
    for (let dy = 0; dy < 8; dy++) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + dy * s, s * 3, s);
    }
    // Right plate
    for (let dy = 0; dy < 8; dy++) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + w - s * 3, y + dy * s, s * 3, s);
    }
    // Bar
    ctx.fillStyle = '#cbd5e1';
    for (let dx = 3; dx < Math.floor(w / s) - 3; dx++) {
      ctx.fillRect(x + dx * s, y + 3 * s, s, s);
      ctx.fillRect(x + dx * s, y + 4 * s, s, s);
    }
  }

  function drawPixelMagnet(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const s = 3;
    // U-shape magnet
    ctx.fillStyle = '#ef4444';
    for (let dy = 0; dy < 5; dy++) {
      ctx.fillRect(x, y + dy * s, s, s);
    }
    ctx.fillStyle = '#3b82f6';
    for (let dy = 0; dy < 5; dy++) {
      ctx.fillRect(x + 4 * s, y + dy * s, s, s);
    }
    // Bottom connector
    for (let dx = 0; dx <= 4; dx++) {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(x + dx * s, y + 5 * s, s, s);
    }
    // Tips
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x, y, s, s);
    ctx.fillRect(x + 4 * s, y, s, s);
  }

  function drawPixelShield(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const s = 3;
    // Shield shape
    for (let dy = 0; dy < 6; dy++) {
      const width = dy < 3 ? 5 : (5 - dy + 2);
      const startX = Math.floor((5 - width) / 2);
      for (let dx = startX; dx < startX + width; dx++) {
        ctx.fillStyle = dy === 0 ? '#7dd3fc' : '#38bdf8';
        ctx.fillRect(x + dx * s, y + dy * s, s, s);
      }
    }
    // Star center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2 * s, y + 2 * s, s, s);
  }

  // ──────────────────────────────────────────────
  // MAIN GAME LOOP
  // ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable image smoothing for crispy pixels
    ctx.imageSmoothingEnabled = false;

    let animId: number;

    const gameLoop = () => {
      const g = gameStateRef.current;
      const W = CANVAS_W;
      const H = CANVAS_H;
      g.frameCount++;

      // Clear Screen
      ctx.clearRect(0, 0, W, H);

      // Screen shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (g.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * SHAKE_INTENSITY * (g.screenShake / SHAKE_DURATION);
        shakeY = (Math.random() - 0.5) * SHAKE_INTENSITY * (g.screenShake / SHAKE_DURATION);
        g.screenShake--;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // ── BACKGROUND ──
      // Sky gradient (pixel-friendly solid bands)
      if (g.fever.isActive) {
        // Fever rainbow bands
        const bands = ['#fbcfe8', '#fef08a', '#bae6fd', '#c4b5fd', '#fbcfe8'];
        const bandH = Math.ceil(H / bands.length);
        bands.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, i * bandH, W, bandH);
        });
      } else {
        // Cozy pastel bands
        ctx.fillStyle = '#fce7f3';
        ctx.fillRect(0, 0, W, 60);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(0, 60, W, 60);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(0, 120, W, 60);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, 180, W, FLOOR_Y - 180);
      }

      // Parallax Layer 3 - Far background (slow)
      g.bgLayer3Offset = (g.bgLayer3Offset + g.speed * 0.15) % W;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      // Windows/decorations
      for (let wx = 0; wx < 3; wx++) {
        const bx = ((wx * 220) - g.bgLayer3Offset + W * 2) % W - 20;
        // Window frame
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(bx, 30, 48, 38);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
        ctx.fillRect(bx + 4, 34, 18, 14);
        ctx.fillRect(bx + 26, 34, 18, 14);
        ctx.fillRect(bx + 4, 52, 18, 12);
        ctx.fillRect(bx + 26, 52, 18, 12);
      }

      // Parallax Layer 2 - Mid background (medium)
      g.bgLayer2Offset = (g.bgLayer2Offset + g.speed * 0.35) % W;
      // Gym equipment silhouettes
      for (let eq = 0; eq < 4; eq++) {
        const ex = ((eq * 180) - g.bgLayer2Offset + W * 2) % W - 30;
        ctx.fillStyle = 'rgba(244, 114, 182, 0.12)';
        // Exercise machine shape
        ctx.fillRect(ex, 100, 8, 130);
        ctx.fillRect(ex - 10, 100, 28, 8);
        ctx.fillRect(ex + 30, 140, 8, 90);
      }

      // Gym sign
      ctx.fillStyle = g.fever.isActive ? '#ec4899' : '#f472b6';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ MOOAUAN GYM ⚡', W / 2, 28);

      // ── FLOOR ──
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);

      // Floor top edge highlight
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, FLOOR_Y, W, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, FLOOR_Y, W, 1);

      // Moving track stripes (pixel blocks)
      const trackOffset = (g.distance * 2) % 32;
      ctx.fillStyle = '#6b7280';
      for (let tx = -trackOffset; tx < W; tx += 32) {
        ctx.fillRect(tx, FLOOR_Y + 8, 16, 3);
      }
      // Second row
      ctx.fillStyle = '#4b5563';
      for (let tx = -trackOffset + 16; tx < W; tx += 32) {
        ctx.fillRect(tx, FLOOR_Y + 16, 12, 3);
      }

      // ── UPDATE GAME DYNAMICS ──
      if (g.isPlaying && !g.isGameOver) {
        g.distance += g.speed * 0.1;
        g.score += Math.floor(g.speed * 0.2);

        // Speed progression
        if (g.speed < MAX_SPEED) {
          g.speed += SPEED_INCREASE;
        }

        // Magnet logic
        if (g.magnet.isActive) {
          g.magnet.timer--;
          if (g.magnet.timer <= 0) {
            g.magnet.isActive = false;
            setHasMagnet(false);
          }
        }

        // Fever logic
        if (g.fever.isActive) {
          g.fever.timer--;
          if (g.fever.timer <= 0) {
            g.fever.isActive = false;
            g.fever.meter = 0;
            setIsFever(false);
          }
        }

        // ═══ COOKIE-RUN PHYSICS ═══
        const p = g.player;

        // Variable gravity: lighter going up, heavier going down
        if (!p.isGrounded) {
          const gravity = p.vy < 0 ? GRAVITY_ASCENDING : GRAVITY_DESCENDING;
          p.vy += gravity;

          // Clamp fall speed
          if (p.vy > MAX_FALL_SPEED) {
            p.vy = MAX_FALL_SPEED;
          }

          p.y += p.vy;

          // Ground landing
          if (p.y >= p.baseY) {
            p.y = p.baseY;
            p.vy = 0;
            p.isGrounded = true;
            p.isJumping = false;
            p.jumpCount = 0;
            p.coyoteTimer = COYOTE_TIME;

            // Landing squash!
            p.scaleX = 1.3;
            p.scaleY = SQUASH_LAND;
            p.targetScaleX = 1;
            p.targetScaleY = 1;

            // Landing dust poof
            for (let i = 0; i < 5; i++) {
              g.particles.push({
                x: p.x + 10 + Math.random() * 20,
                y: FLOOR_Y - 2,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 0.5,
                color: '#9ca3af',
                size: 2 + Math.random() * 3,
                life: 0,
                maxLife: 14 + Math.random() * 6,
              });
            }

            // Check for buffered jump
            if (g.jumpBuffered) {
              g.jumpBuffered = false;
              // Execute buffered jump immediately
              p.vy = JUMP_VELOCITY;
              p.isGrounded = false;
              p.isJumping = true;
              p.jumpCount = 1;
              p.scaleX = 0.75;
              p.scaleY = STRETCH_JUMP;
              play8BitJump();
            }
          }
        } else {
          // Coyote time countdown (even on ground, for responsiveness)
          if (p.coyoteTimer > 0) {
            p.coyoteTimer--;
          }
        }

        // Squash/stretch interpolation
        p.scaleX += (p.targetScaleX - p.scaleX) * SQUASH_RECOVER_SPEED;
        p.scaleY += (p.targetScaleY - p.scaleY) * SQUASH_RECOVER_SPEED;
        if (Math.abs(p.scaleX - p.targetScaleX) < 0.01) p.scaleX = p.targetScaleX;
        if (Math.abs(p.scaleY - p.targetScaleY) < 0.01) p.scaleY = p.targetScaleY;

        // Slide logic
        if (p.isSliding) {
          p.slideTimer--;
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.scaleX = 1;
            p.scaleY = 1;
            p.targetScaleX = 1;
            p.targetScaleY = 1;
          }
        }

        // Running dust trail
        if (p.isGrounded && !p.isSliding) {
          p.dustTimer++;
          if (p.dustTimer >= Math.max(3, 8 - g.speed * 0.4)) {
            p.dustTimer = 0;
            g.particles.push({
              x: p.x + 6,
              y: FLOOR_Y - 2,
              vx: -g.speed * 0.3 + (Math.random() - 0.5) * 1.5,
              vy: -Math.random() * 1.5,
              color: Math.random() > 0.5 ? '#d1d5db' : '#9ca3af',
              size: 2 + Math.random() * 2,
              life: 0,
              maxLife: 12 + Math.random() * 6,
            });
          }
        }

        // Jump buffer timeout
        if (g.jumpBufferTimer > 0) {
          g.jumpBufferTimer--;
          if (g.jumpBufferTimer <= 0) {
            g.jumpBuffered = false;
          }
        }

        // Animation frame cycle
        p.animTimer++;
        const animSpeed = Math.max(3, 7 - Math.floor(g.speed * 0.4));
        if (p.animTimer >= animSpeed) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 4;
        }

        // Invulnerability countdown
        if (p.invulnerableTimer > 0) {
          p.invulnerableTimer--;
        }

        // ── SPAWN OBSTACLES & COLLECTIBLES ──
        g.nextObstacleDist -= g.speed;
        if (g.nextObstacleDist <= 0) {
          if (g.fever.isActive) {
            // Fever mode: rain of gold coins in arc patterns
            for (let c = 0; c < 7; c++) {
              g.collectibles.push({
                x: W + c * 28,
                y: FLOOR_Y - 50 - Math.sin(c * 0.7) * 35,
                width: 16,
                height: 16,
                type: 'coin',
                value: 1,
              });
            }
            g.nextObstacleDist = 80;
          } else {
            const rand = Math.random();
            if (rand < 0.5) {
              // Low obstacle: donut or dumbbell (JUMP over)
              const isDonut = Math.random() < 0.5;
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - (isDonut ? 28 : 24),
                width: isDonut ? 28 : 38,
                height: isDonut ? 28 : 24,
                type: isDonut ? 'donut' : 'dumbbell',
                isHigh: false,
              });
            } else if (rand < 0.85) {
              // High obstacle: barbell (SLIDE under)
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - 65,
                width: 48,
                height: 32,
                type: 'barbell_high',
                isHigh: true,
              });
            } else {
              // Double obstacle - low + high (must time carefully!)
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - 26,
                width: 28,
                height: 26,
                type: 'donut',
                isHigh: false,
              });
              g.obstacles.push({
                x: W + 130,
                y: FLOOR_Y - 65,
                width: 48,
                height: 32,
                type: 'barbell_high',
                isHigh: true,
              });
            }

            // Coin trail
            const coinY = FLOOR_Y - (Math.random() < 0.5 ? 42 : 75);
            for (let c = 0; c < 3; c++) {
              g.collectibles.push({
                x: W + 85 + c * 26,
                y: coinY,
                width: 16,
                height: 16,
                type: 'coin',
                value: 1,
              });
            }

            // Boba chance
            if (Math.random() < 0.32) {
              g.collectibles.push({
                x: W + 180,
                y: FLOOR_Y - 55,
                width: 22,
                height: 26,
                type: 'boba',
                value: 5,
              });
            }

            // Powerup chance
            if (Math.random() < 0.1) {
              const isMag = Math.random() < 0.6;
              g.collectibles.push({
                x: W + 220,
                y: FLOOR_Y - 50,
                width: 18,
                height: 18,
                type: isMag ? 'star_magnet' : 'shield',
                value: 0,
              });
            }

            g.nextObstacleDist = Math.max(75, 145 - g.speed * 6);
          }
        }

        // Magnet range
        const magnetRadius = g.magnet.isActive ? 160 + g.skills.magnetLevel * 25 : 0;

        // ── UPDATE COLLECTIBLES ──
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const item = g.collectibles[i];
          item.x -= g.speed;

          // Magnet Attraction
          if (magnetRadius > 0 && !item.collected) {
            const dx = g.player.x + 20 - item.x;
            const dy = g.player.y + 15 - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < magnetRadius) {
              item.x += (dx / dist) * 8;
              item.y += (dy / dist) * 8;
            }
          }

          // Player Hitbox vs Collectible
          const playerX = g.player.x;
          const playerY = g.player.isSliding ? g.player.y + 16 : g.player.y;
          const playerW = g.player.width;
          const playerH = g.player.isSliding ? 22 : g.player.height;

          if (
            !item.collected &&
            playerX < item.x + item.width &&
            playerX + playerW > item.x &&
            playerY < item.y + item.height &&
            playerY + playerH > item.y
          ) {
            item.collected = true;

            if (item.type === 'coin') {
              g.coins += 1;
              g.score += 50;
              play8BitCoin();

              // Score popup
              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '+1',
                life: 30,
                color: '#ffd700',
              });
            } else if (item.type === 'boba') {
              play8BitPowerup();
              g.score += 200;
              const boost = 1 + g.skills.feverBoostLevel * 0.2;
              g.fever.meter = Math.min(100, g.fever.meter + 22 * boost);

              if (g.fever.meter >= 100 && !g.fever.isActive) {
                g.fever.isActive = true;
                g.fever.timer = 360 + g.skills.feverBoostLevel * 40;
                setIsFever(true);
                play8BitFeverJingle();
              }

              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '+200',
                life: 35,
                color: '#ec4899',
              });
            } else if (item.type === 'star_magnet') {
              play8BitPowerup();
              g.magnet.isActive = true;
              g.magnet.timer = 360 + g.skills.magnetLevel * 50;
              setHasMagnet(true);
            } else if (item.type === 'shield') {
              play8BitPowerup();
              g.shieldCount = Math.min(2, g.shieldCount + 1);
              setHasShield(true);
            }

            // Collect sparkles
            for (let p = 0; p < 6; p++) {
              g.particles.push({
                x: item.x + 8,
                y: item.y + 8,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: item.type === 'coin' ? '#ffd700' : '#ec4899',
                size: 2 + Math.random() * 2,
                life: 0,
                maxLife: 15,
              });
            }
          }

          if (item.x < -40 || item.collected) {
            g.collectibles.splice(i, 1);
          }
        }

        // ── UPDATE OBSTACLES & COLLISION ──
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Player hitbox (slightly smaller for fair collision)
          const px = g.player.x + 8;
          const py = g.player.isSliding ? g.player.y + 20 : g.player.y + 6;
          const pw = g.player.width - 16;
          const ph = g.player.isSliding ? 18 : g.player.height - 10;

          if (
            px < obs.x + obs.width - 6 &&
            px + pw > obs.x + 6 &&
            py < obs.y + obs.height - 4 &&
            py + ph > obs.y + 4
          ) {
            if (g.fever.isActive) {
              play8BitCoin();
              g.score += 100;
              // Destroy obstacle with explosion
              for (let p = 0; p < 14; p++) {
                g.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  color: p % 2 === 0 ? '#fbbf24' : '#f59e0b',
                  size: 3 + Math.random() * 3,
                  life: 0,
                  maxLife: 22,
                });
              }
              g.obstacles.splice(i, 1);
              continue;
            }

            if (g.player.invulnerableTimer <= 0) {
              if (g.shieldCount > 0) {
                // Break shield
                g.shieldCount--;
                g.player.invulnerableTimer = 60;
                setHasShield(g.shieldCount > 0);
                play8BitCrash();
                g.screenShake = SHAKE_DURATION;

                for (let p = 0; p < 16; p++) {
                  g.particles.push({
                    x: g.player.x + 20,
                    y: g.player.y + 20,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    color: p % 2 === 0 ? '#38bdf8' : '#7dd3fc',
                    size: 3 + Math.random() * 3,
                    life: 0,
                    maxLife: 25,
                  });
                }
              } else {
                // GAME OVER!
                g.isPlaying = false;
                g.isGameOver = true;
                play8BitCrash();
                g.screenShake = SHAKE_DURATION * 2;

                // Crash particles
                for (let p = 0; p < 20; p++) {
                  g.particles.push({
                    x: g.player.x + 20,
                    y: g.player.y + 20,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][p % 4],
                    size: 3 + Math.random() * 4,
                    life: 0,
                    maxLife: 30,
                  });
                }

                setIsPlaying(false);
                setIsGameOver(true);
                recordHighScore(g.score);
                setHighScore((prev) => Math.max(prev, g.score));
                awardCoins('game_run', g.coins);
                break;
              }
            }
          }

          if (obs.x < -60) {
            g.obstacles.splice(i, 1);
          }
        }

        // Sync React UI
        setScore(g.score);
        setRunCoins(g.coins);
        setFeverProgress(g.fever.isActive ? (g.fever.timer / 360) * 100 : g.fever.meter);
      }

      // ── RENDER COLLECTIBLES ──
      g.collectibles.forEach((item) => {
        if (item.collected) return;
        if (item.type === 'coin') {
          drawPixelCoin(ctx, item.x, item.y, g.frameCount);
        } else if (item.type === 'boba') {
          drawPixelBoba(ctx, item.x, item.y);
        } else if (item.type === 'star_magnet') {
          drawPixelMagnet(ctx, item.x, item.y);
        } else if (item.type === 'shield') {
          drawPixelShield(ctx, item.x, item.y);
        }
      });

      // ── RENDER OBSTACLES ──
      g.obstacles.forEach((obs) => {
        if (obs.type === 'donut') {
          drawPixelDonut(ctx, obs.x, obs.y);
        } else if (obs.type === 'dumbbell') {
          drawPixelDumbbell(ctx, obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === 'barbell_high') {
          drawPixelBarbell(ctx, obs.x, obs.y, obs.width);
        }
      });

      // ── RENDER PLAYER ──
      const p = g.player;
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;
      const colors = g.character === 'manow' ? MANOW_COLORS : MAGNUM_COLORS;
      const isManow = g.character === 'manow';

      if (!isBlinking) {
        ctx.save();

        // Apply squash/stretch transform
        const centerX = p.x + p.width / 2;
        const bottomY = p.isSliding ? p.y + 20 : p.y + p.height;
        ctx.translate(centerX, bottomY);
        ctx.scale(p.scaleX, p.scaleY);
        ctx.translate(-centerX, -bottomY);

        // Fever golden aura
        if (g.fever.isActive) {
          const auraSize = 3 + Math.sin(g.frameCount * 0.2) * 1;
          ctx.fillStyle = 'rgba(253, 224, 71, 0.3)';
          // Pixel aura - square blocks around character
          for (let ax = -2; ax <= 16; ax++) {
            for (let ay = -3; ay <= 14; ay++) {
              if (ax < 0 || ax > 14 || ay < -1 || ay > 12) {
                if (Math.random() > 0.6) {
                  ctx.fillRect(
                    p.x + ax * PX - auraSize,
                    p.y + ay * PX - auraSize,
                    PX, PX
                  );
                }
              }
            }
          }
        }

        // Shield bubble (pixel square)
        if (g.shieldCount > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          const shieldPulse = Math.sin(g.frameCount * 0.15) * 2;
          ctx.strokeRect(
            p.x - 4 - shieldPulse,
            p.y - 4 - shieldPulse,
            p.width + 8 + shieldPulse * 2,
            (p.isSliding ? 24 : p.height) + 8 + shieldPulse * 2
          );
        }

        // Draw the pixel art character
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.isSliding) {
          drawPixelPigletSlide(ctx, colors, g.fever.isActive);
        } else if (!p.isGrounded) {
          drawPixelPigletJump(ctx, colors, g.fever.isActive, isManow, p.vy < 0);
        } else {
          drawPixelPiglet(ctx, p.animFrame, colors, g.fever.isActive, isManow);
        }

        ctx.restore();
        ctx.restore();
      }

      // ── RENDER PARTICLES ──
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.05; // slight gravity on particles
        pt.life++;

        const alpha = 1 - pt.life / pt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        // Square pixels for particles too!
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
        ctx.globalAlpha = 1;

        if (pt.life >= pt.maxLife) {
          g.particles.splice(i, 1);
        }
      }

      // ── RENDER SCORE POPUPS ──
      for (let i = g.scorePopups.length - 1; i >= 0; i--) {
        const sp = g.scorePopups[i];
        sp.y -= 1.5;
        sp.life--;

        const alpha = sp.life / 30;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, sp.x, sp.y);
        ctx.globalAlpha = 1;

        if (sp.life <= 0) {
          g.scorePopups.splice(i, 1);
        }
      }

      ctx.restore(); // End screen shake

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Top Game HUD Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-white rounded-t-3xl border-b border-slate-700 text-xs">
        {/* Score & High Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Trophy size={14} />
            <span>{score}</span>
          </div>
          <span className="text-slate-400">|</span>
          <div className="text-slate-300">
            สถิติ: <span className="font-mono text-white">{highScore}</span>
          </div>
        </div>

        {/* Coins & Status Badges */}
        <div className="flex items-center gap-2">
          {hasShield && (
            <span className="flex items-center gap-0.5 text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400">
              <Shield size={10} /> เกราะ
            </span>
          )}
          {hasMagnet && (
            <span className="flex items-center gap-0.5 text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-400">
              <Zap size={10} /> แม่เหล็ก
            </span>
          )}
          <div className="flex items-center gap-1 font-black text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/40">
            <Coins size={13} />
            <span>+{runCoins}</span>
          </div>
        </div>
      </div>

      {/* Fever Bar Indicator */}
      <div className="w-full h-2 bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-150 ${
            isFever
              ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-sky-400 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-rose-500'
          }`}
          style={{ width: `${feverProgress}%` }}
        />
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full max-w-[560px] aspect-[16/9] bg-slate-950 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-full block cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
          onClick={handleJump}
        />

        {/* Start / Overlay Screen */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="text-4xl mb-2 animate-bounce">🏃‍♀️🐷</div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400 bg-clip-text text-transparent">
              MooAuan Piggy Run!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mt-1 mb-4">
              วิ่งหลบโดนัทและบาร์เบล เก็บเหรียญทองและชานมไข่มุกเข้าสู่โหมดร่างทอง!
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={initNewGame}
                className="btn-candy-pink px-6 py-2.5 text-sm font-extrabold shadow-lg hover:scale-105 transition-all"
              >
                🚀 เริ่มวิ่งเลย!
              </button>
              <button
                onClick={onOpenShop}
                className="btn-candy-yellow px-4 py-2.5 text-xs font-bold"
              >
                🛍️ ร้านค้าสกิล
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              💡 ควบคุม: แตะจอ / Spacebar เพื่อโดด, ลูกศรลง เพื่อสไลด์
            </p>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
            <div className="text-4xl mb-2">💥🐽</div>
            <h3 className="text-2xl font-black text-rose-400">ชนเข้าอย่างจัง!</h3>
            <p className="text-xs text-slate-300 mt-0.5">แต่ได้เหรียญสะสมไปอัปเกรดสกิลเพิ่มนะ</p>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 my-3 w-64 shadow-md">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>คะแนนรอบนี้:</span>
                <span className="font-bold text-white font-mono">{score}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-300">
                <span>เหรียญที่เก็บได้:</span>
                <span className="font-black font-mono">+{runCoins} 🪙</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={initNewGame}
                className="btn-candy-pink px-6 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
              >
                <RotateCcw size={14} />
                <span>เล่นใหม่อีกรอบ</span>
              </button>
              <button
                onClick={onOpenShop}
                className="btn-candy-yellow px-4 py-2.5 text-xs font-bold"
              >
                🛍️ ไปอัปเกรดสกิล
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Virtual Controls for Mobile */}
      <div className="w-full flex items-center justify-between p-3 bg-slate-900 rounded-b-3xl border-t border-slate-700">
        <button
          onClick={handleSlide}
          className="flex-1 mr-2 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-black text-sm rounded-2xl border border-slate-600 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          <span>⬇️ สไลด์มุด (SLIDE)</span>
        </button>

        <button
          onClick={handleJump}
          className="flex-1 ml-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>⬆️ กระโดด (JUMP)</span>
        </button>
      </div>
    </div>
  );
};
