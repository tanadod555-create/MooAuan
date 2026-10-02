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
import { Trophy, Coins, RotateCcw, Shield, Zap, Sparkles, Flame } from 'lucide-react';

// ──────────────────────────────────────────────
// COOKIE-RUN BALANCED PHYSICS & SIZES
// ──────────────────────────────────────────────
const CANVAS_W = 640;
const CANVAS_H = 360;
const FLOOR_Y = 278;               // Ground track position in game_bg.jpg
const PLAYER_X = 95;               // Fixed X position

// Cookie Run jump physics (scaled for larger 640x360 canvas)
const JUMP_VELOCITY = -14.2;       // Jump impulse
const DOUBLE_JUMP_VELOCITY = -12.0;// Second jump impulse
const GRAVITY_ASCENDING = 0.58;    // Ascending float
const GRAVITY_DESCENDING = 1.05;   // Snappy descent
const MAX_FALL_SPEED = 16;         // Terminal velocity
const COYOTE_TIME = 6;             // Coyote time frames

// Character Dimensions (Large & clearly visible!)
const CHAR_NORMAL_W = 74;
const CHAR_NORMAL_H = 70;
const CHAR_SLIDE_W = 96;
const CHAR_SLIDE_H = 46;
const CHAR_BLAST_W = 120;
const CHAR_BLAST_H = 114;

// Squash & Stretch
const SQUASH_LAND = 0.72;
const STRETCH_JUMP = 1.28;
const SQUASH_RECOVER_SPEED = 0.15;

// Speed Progression (Smooth, enjoyable, responsive)
const INITIAL_SPEED = 3.6;
const MAX_SPEED = 7.2;
const SPEED_INCREASE = 0.0003;

// Screen Shake
const SHAKE_INTENSITY = 8;
const SHAKE_DURATION = 14;

interface LoadedAssets {
  bg: HTMLImageElement | null;
  manowRun: HTMLImageElement | null;
  manowJump: HTMLImageElement | null;
  manowSlide: HTMLImageElement | null;
  magnumRun: HTMLImageElement | null;
  magnumJump: HTMLImageElement | null;
  magnumSlide: HTMLImageElement | null;
  coin: HTMLImageElement | null;
  boba: HTMLImageElement | null;
  donut: HTMLImageElement | null;
  dumbbell: HTMLImageElement | null;
  barbellHigh: HTMLImageElement | null;
  blast: HTMLImageElement | null;
  magnet: HTMLImageElement | null;
}

interface PiggyRunCanvasProps {
  onOpenShop: () => void;
  character?: CharacterType;
}

export const PiggyRunCanvas: React.FC<PiggyRunCanvasProps> = ({ onOpenShop, character }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const [hasBlast, setHasBlast] = useState(false);
  const [blastTimerLeft, setBlastTimerLeft] = useState(0);

  // Touch UI feedback
  const [isSlideActive, setIsSlideActive] = useState(false);
  const [isJumpActive, setIsJumpActive] = useState(false);

  // Loaded Sprite Assets Ref
  const assetsRef = useRef<LoadedAssets>({
    bg: null,
    manowRun: null,
    manowJump: null,
    manowSlide: null,
    magnumRun: null,
    magnumJump: null,
    magnumSlide: null,
    coin: null,
    boba: null,
    donut: null,
    dumbbell: null,
    barbellHigh: null,
    blast: null,
    magnet: null,
  });

  // Game State Ref
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
      y: FLOOR_Y - CHAR_NORMAL_H,
      width: CHAR_NORMAL_W,
      height: CHAR_NORMAL_H,
      baseY: FLOOR_Y - CHAR_NORMAL_H,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      jumpCount: 0,
      isSliding: false,
      slideHolding: false,
      slideTimer: 0,
      invulnerableTimer: 0,
      coyoteTimer: 0,
      scaleX: 1,
      scaleY: 1,
      targetScaleX: 1,
      targetScaleY: 1,
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
    blast: {
      isActive: false,
      timer: 0,
    },
    shieldCount: 0,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    bgOffset: 0,
    nextObstacleDist: 100,
    screenShake: 0,
    frameCount: 0,
    scorePopups: [] as { x: number; y: number; text: string; life: number; color: string }[],
    jumpBuffered: false,
    jumpBufferTimer: 0,
  });

  // Preload all clean transparent assets
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
      });
    };

    Promise.all([
      loadImage('./mascots/game_bg.jpg'),
      loadImage('./mascots/game_manow_run.png'),
      loadImage('./mascots/game_manow_jump.png'),
      loadImage('./mascots/game_manow_slide.png'),
      loadImage('./mascots/game_magnum_run.png'),
      loadImage('./mascots/game_magnum_jump.png'),
      loadImage('./mascots/game_magnum_slide.png'),
      loadImage('./mascots/game_item_coin.png'),
      loadImage('./mascots/game_item_boba.png'),
      loadImage('./mascots/game_item_donut.png'),
      loadImage('./mascots/game_item_dumbbell.png'),
      loadImage('./mascots/game_item_barbell_high.png'),
      loadImage('./mascots/game_item_blast.png'),
      loadImage('./mascots/game_item_magnet.png'),
    ]).then(([bg, manowRun, manowJump, manowSlide, magnumRun, magnumJump, magnumSlide, coin, boba, donut, dumbbell, barbellHigh, blast, magnet]) => {
      assetsRef.current = {
        bg,
        manowRun,
        manowJump,
        manowSlide,
        magnumRun,
        magnumJump,
        magnumSlide,
        coin,
        boba,
        donut,
        dumbbell,
        barbellHigh,
        blast,
        magnet,
      };
    });
  }, []);

  // Sync Character & Skills
  useEffect(() => {
    const saved = loadPiggySaveData();
    setHighScore(saved.highScore);
    gameStateRef.current.character = character || saved.selectedCharacter || 'manow';
    gameStateRef.current.skills = saved.skills;
  }, [character]);

  // Initialize Game Session
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
    g.player.slideHolding = false;
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

    g.blast.isActive = false;
    g.blast.timer = 0;

    g.shieldCount = saved.skills.shieldLevel > 0 ? 1 : 0;

    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.scorePopups = [];
    g.nextObstacleDist = 120;
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
    setHasBlast(false);
  }, [character]);

  // Jump Action
  const doJump = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) {
      initNewGame();
      return;
    }

    // Cancel slide when jumping
    g.player.isSliding = false;
    g.player.slideHolding = false;
    setIsSlideActive(false);

    // Ground or Coyote Time Jump
    if (g.player.isGrounded || g.player.coyoteTimer > 0) {
      g.player.vy = JUMP_VELOCITY;
      g.player.isGrounded = false;
      g.player.isJumping = true;
      g.player.jumpCount = 1;
      g.player.coyoteTimer = 0;

      // Stretch up
      g.player.scaleX = 0.8;
      g.player.scaleY = STRETCH_JUMP;
      g.player.targetScaleX = 1;
      g.player.targetScaleY = 1;

      // Jump dust puff
      for (let i = 0; i < 7; i++) {
        g.particles.push({
          x: g.player.x + 30,
          y: FLOOR_Y - 2,
          vx: (Math.random() - 0.7) * 3.5,
          vy: -Math.random() * 3 - 1,
          color: '#e2e8f0',
          size: 3 + Math.random() * 3,
          life: 0,
          maxLife: 16,
        });
      }

      play8BitJump();
      g.jumpBuffered = false;
      setIsJumpActive(true);
      setTimeout(() => setIsJumpActive(false), 120);
      return;
    }

    // Double Jump
    if (g.skills.doubleJumpUnlocked && g.player.jumpCount === 1) {
      g.player.vy = DOUBLE_JUMP_VELOCITY;
      g.player.jumpCount = 2;

      g.player.scaleX = 0.85;
      g.player.scaleY = 1.2;
      g.player.targetScaleX = 1;
      g.player.targetScaleY = 1;

      for (let i = 0; i < 12; i++) {
        g.particles.push({
          x: g.player.x + 35,
          y: g.player.y + 50,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 4 + 1,
          color: i % 2 === 0 ? '#ffd700' : '#fbbf24',
          size: 3.5,
          life: 0,
          maxLife: 20,
        });
      }

      play8BitDoubleJump();
      g.jumpBuffered = false;
      setIsJumpActive(true);
      setTimeout(() => setIsJumpActive(false), 120);
      return;
    }

    // Input buffer
    g.jumpBuffered = true;
    g.jumpBufferTimer = 8;
  }, [initNewGame]);

  // Slide Start Action (Left screen press / hold)
  const startSlide = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) return;

    if (g.player.isGrounded) {
      g.player.isSliding = true;
      g.player.slideHolding = true;
      g.player.slideTimer = 40; // minimum slide frames

      g.player.scaleX = 1.25;
      g.player.scaleY = 0.65;
      g.player.targetScaleX = 1.15;
      g.player.targetScaleY = 0.75;

      setIsSlideActive(true);
      play8BitSlide();
    } else if (!g.player.isGrounded) {
      // Cookie Run Mid-air Fast Slam Drop!
      g.player.vy = MAX_FALL_SPEED * 0.95;
      setIsSlideActive(true);
    }
  }, []);

  // Slide Release Action (Left screen touch up)
  const endSlide = useCallback(() => {
    const g = gameStateRef.current;
    g.player.slideHolding = false;
    setIsSlideActive(false);
  }, []);

  // Touch Screen Handler for Fullscreen Control (Left = Slide, Right = Jump)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchX = touch.clientX - rect.left;

      if (touchX < rect.width * 0.48) {
        // Left Side: SLIDE
        startSlide();
      } else {
        // Right Side: JUMP
        doJump();
      }
    }
  }, [doJump, startSlide]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchX = touch.clientX - rect.left;

      if (touchX < rect.width * 0.48) {
        endSlide();
      }
    }
  }, [endSlide]);

  // Pointer/Mouse Handlers for Desktop Click Zones
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return; // Handled by Touch events
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < rect.width * 0.48) {
      startSlide();
    } else {
      doJump();
    }
  }, [doJump, startSlide]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    endSlide();
  }, [endSlide]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        doJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        startSlide();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        endSlide();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [doJump, startSlide, endSlide]);

  // ──────────────────────────────────────────────
  // MAIN GAME ENGINE LOOP
  // ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const g = gameStateRef.current;
      const assets = assetsRef.current;
      const W = CANVAS_W;
      const H = CANVAS_H;
      g.frameCount++;

      ctx.clearRect(0, 0, W, H);

      // Screen Shake Transform
      let shakeX = 0;
      let shakeY = 0;
      if (g.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * SHAKE_INTENSITY * (g.screenShake / SHAKE_DURATION);
        shakeY = (Math.random() - 0.5) * SHAKE_INTENSITY * (g.screenShake / SHAKE_DURATION);
        g.screenShake--;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // ── 1. RENDER BACKGROUND IMAGE ──
      if (assets.bg && assets.bg.complete && assets.bg.naturalWidth > 0) {
        const bgW = W;
        const bgH = H;
        const scrollX = -(g.bgOffset % bgW);

        ctx.drawImage(assets.bg, scrollX, 0, bgW, bgH);
        ctx.drawImage(assets.bg, scrollX + bgW, 0, bgW, bgH);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fce7f3');
        grad.addColorStop(0.7, '#fed7aa');
        grad.addColorStop(1, '#475569');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Fever Rainbow Filter Overlay
      if (g.fever.isActive) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        const rainbow = ctx.createLinearGradient(0, 0, W, 0);
        rainbow.addColorStop(0, '#ec4899');
        rainbow.addColorStop(0.25, '#fbbf24');
        rainbow.addColorStop(0.5, '#38bdf8');
        rainbow.addColorStop(0.75, '#a855f7');
        rainbow.addColorStop(1, '#f43f5e');
        ctx.fillStyle = rainbow;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Giant Blast Mode Golden Shockwave
      if (g.blast.isActive) {
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.sin(g.frameCount * 0.3) * 0.08;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ── 2. UPDATE GAME DYNAMICS ──
      if (g.isPlaying && !g.isGameOver) {
        g.distance += g.speed * 0.1;
        g.score += Math.floor(g.speed * 0.25);
        g.bgOffset += g.speed * 0.9;

        // Controlled speed scaling
        if (g.speed < MAX_SPEED) {
          g.speed += SPEED_INCREASE;
        }

        // Magnet Powerup Timer
        if (g.magnet.isActive) {
          g.magnet.timer--;
          if (g.magnet.timer <= 0) {
            g.magnet.isActive = false;
            setHasMagnet(false);
          }
        }

        // Giant Blast Powerup Timer
        if (g.blast.isActive) {
          g.blast.timer--;
          setBlastTimerLeft(Math.ceil(g.blast.timer / 60));
          if (g.blast.timer <= 0) {
            g.blast.isActive = false;
            setHasBlast(false);
          }
        }

        // Fever Mode Timer
        if (g.fever.isActive) {
          g.fever.timer--;
          if (g.fever.timer <= 0) {
            g.fever.isActive = false;
            g.fever.meter = 0;
            setIsFever(false);
          }
        }

        // ═══ COOKIE-RUN PHYSICS UPDATE ═══
        const p = g.player;

        if (!p.isGrounded) {
          const gravity = p.vy < 0 ? GRAVITY_ASCENDING : GRAVITY_DESCENDING;
          p.vy += gravity;

          if (p.vy > MAX_FALL_SPEED) {
            p.vy = MAX_FALL_SPEED;
          }

          p.y += p.vy;

          // Landing Impact
          if (p.y >= p.baseY) {
            p.y = p.baseY;
            p.vy = 0;
            p.isGrounded = true;
            p.isJumping = false;
            p.jumpCount = 0;
            p.coyoteTimer = COYOTE_TIME;

            // Landing squash
            p.scaleX = 1.25;
            p.scaleY = SQUASH_LAND;
            p.targetScaleX = 1;
            p.targetScaleY = 1;

            // Landing dust
            for (let i = 0; i < 6; i++) {
              g.particles.push({
                x: p.x + 20 + Math.random() * 30,
                y: FLOOR_Y - 2,
                vx: (Math.random() - 0.5) * 3.5,
                vy: -Math.random() * 2.5 - 0.5,
                color: '#cbd5e1',
                size: 3 + Math.random() * 3,
                life: 0,
                maxLife: 14,
              });
            }

            // Execute buffered jump
            if (g.jumpBuffered) {
              g.jumpBuffered = false;
              p.vy = JUMP_VELOCITY;
              p.isGrounded = false;
              p.isJumping = true;
              p.jumpCount = 1;
              p.scaleX = 0.8;
              p.scaleY = STRETCH_JUMP;
              play8BitJump();
            }
          }
        } else {
          if (p.coyoteTimer > 0) p.coyoteTimer--;
        }

        // Smooth squash/stretch recovery
        p.scaleX += (p.targetScaleX - p.scaleX) * SQUASH_RECOVER_SPEED;
        p.scaleY += (p.targetScaleY - p.scaleY) * SQUASH_RECOVER_SPEED;

        // Slide countdown & holding state
        if (p.isSliding) {
          if (p.slideTimer > 0) p.slideTimer--;
          if (!p.slideHolding && p.slideTimer <= 0) {
            p.isSliding = false;
            p.scaleX = 1;
            p.scaleY = 1;
          }

          // Slide spark trail
          if (p.isGrounded && Math.random() < 0.6) {
            g.particles.push({
              x: p.x + 10,
              y: FLOOR_Y - 4,
              vx: -g.speed * 0.6 + (Math.random() - 0.5) * 2,
              vy: -Math.random() * 1.5 - 0.5,
              color: Math.random() < 0.5 ? '#f59e0b' : '#fbbf24',
              size: 3,
              life: 0,
              maxLife: 10,
            });
          }
        }

        // Running dust trail
        if (p.isGrounded && !p.isSliding) {
          p.dustTimer++;
          if (p.dustTimer >= 5) {
            p.dustTimer = 0;
            g.particles.push({
              x: p.x + 8,
              y: FLOOR_Y - 2,
              vx: -g.speed * 0.45 + (Math.random() - 0.5),
              vy: -Math.random() * 1.4,
              color: '#94a3b8',
              size: 3.5,
              life: 0,
              maxLife: 12,
            });
          }
        }

        // Giant Blast Footstep shockwaves
        if (g.blast.isActive && p.isGrounded && g.frameCount % 8 === 0) {
          g.screenShake = 3;
          for (let i = 0; i < 5; i++) {
            g.particles.push({
              x: p.x + 30 + Math.random() * 40,
              y: FLOOR_Y - 2,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 3 - 1,
              color: '#fde047',
              size: 4,
              life: 0,
              maxLife: 16,
            });
          }
        }

        // Jump buffer decay
        if (g.jumpBufferTimer > 0) {
          g.jumpBufferTimer--;
          if (g.jumpBufferTimer <= 0) g.jumpBuffered = false;
        }

        if (p.invulnerableTimer > 0) p.invulnerableTimer--;

        // ── 3. SPAWN OBSTACLES & COLLECTIBLES (ENHANCED FOR SLIDE & SKILLS) ──
        g.nextObstacleDist -= g.speed;
        if (g.nextObstacleDist <= 0) {
          if (g.fever.isActive) {
            // Golden Fever Wave: Golden arc waves + bonus boba
            for (let c = 0; c < 7; c++) {
              g.collectibles.push({
                x: W + c * 32,
                y: FLOOR_Y - 60 - Math.sin(c * 0.65) * 36,
                width: 32,
                height: 32,
                type: 'coin',
                value: 1,
              });
            }
            g.nextObstacleDist = 80;
          } else {
            const rand = Math.random();

            if (rand < 0.48) {
              // ⛓️ HIGH OVERHEAD BARBELL (MUST SLIDE UNDER!)
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - 84,
                width: 90,
                height: 65,
                type: 'barbell_high',
                isHigh: true,
              });

              // 🪙 Rewarding low coin row under the hanging barbell!
              for (let c = 0; c < 3; c++) {
                g.collectibles.push({
                  x: W + 20 + c * 30,
                  y: FLOOR_Y - 34,
                  width: 30,
                  height: 30,
                  type: 'coin',
                  value: 1,
                });
              }
            } else if (rand < 0.82) {
              // 🍩 / 🏋️ LOW GROUND OBSTACLE (MUST JUMP OVER!)
              const isDonut = Math.random() < 0.55;
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - (isDonut ? 50 : 42),
                width: isDonut ? 50 : 58,
                height: isDonut ? 50 : 42,
                type: isDonut ? 'donut' : 'dumbbell',
                isHigh: false,
              });

              // Arching coins over the ground obstacle
              for (let c = 0; c < 3; c++) {
                g.collectibles.push({
                  x: W + 15 + c * 28,
                  y: FLOOR_Y - 95 - Math.sin((c / 2) * Math.PI) * 20,
                  width: 30,
                  height: 30,
                  type: 'coin',
                  value: 1,
                });
              }
            } else {
              // ⚡ COMBO: LOW OBSTACLE FOLLOWED BY HIGH BARBELL (JUMP THEN SLIDE!)
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - 48,
                width: 48,
                height: 48,
                type: 'donut',
                isHigh: false,
              });
              g.obstacles.push({
                x: W + 160,
                y: FLOOR_Y - 84,
                width: 90,
                height: 65,
                type: 'barbell_high',
                isHigh: true,
              });

              for (let c = 0; c < 3; c++) {
                g.collectibles.push({
                  x: W + 170 + c * 30,
                  y: FLOOR_Y - 34,
                  width: 30,
                  height: 30,
                  type: 'coin',
                  value: 1,
                });
              }
            }

            // 🧋 Boba Milk Tea (Charges Fever)
            if (Math.random() < 0.32) {
              g.collectibles.push({
                x: W + 220,
                y: FLOOR_Y - 65,
                width: 40,
                height: 44,
                type: 'boba',
                value: 5,
              });
            }

            // ⭐ Rare Special In-Game Powerup Spawner
            if (Math.random() < 0.16) {
              const pTypeRand = Math.random();
              const pType: 'potion_blast' | 'star_magnet' | 'shield' =
                pTypeRand < 0.4 ? 'potion_blast' : pTypeRand < 0.75 ? 'star_magnet' : 'shield';

              g.collectibles.push({
                x: W + 270,
                y: FLOOR_Y - 65,
                width: 44,
                height: 44,
                type: pType,
                value: 0,
              });
            }

            g.nextObstacleDist = Math.max(90, 175 - g.speed * 6);
          }
        }

        // Magnet / Blast attraction radius
        const magnetRadius = g.blast.isActive
          ? 320
          : g.magnet.isActive
          ? 220 + g.skills.magnetLevel * 35
          : 0;

        // ── 4. UPDATE & COLLECT ITEMS ──
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const item = g.collectibles[i];
          item.x -= g.speed;

          // Magnet Attraction
          if (magnetRadius > 0 && !item.collected) {
            const dx = g.player.x + 35 - item.x;
            const dy = g.player.y + 30 - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < magnetRadius) {
              item.x += (dx / dist) * (g.blast.isActive ? 14 : 10);
              item.y += (dy / dist) * (g.blast.isActive ? 14 : 10);
            }
          }

          // Hitbox
          const px = g.player.x;
          const py = g.player.isSliding ? g.player.y + 24 : g.player.y;
          const pw = g.blast.isActive ? CHAR_BLAST_W : g.player.width;
          const ph = g.player.isSliding ? CHAR_SLIDE_H : g.player.height;

          if (
            !item.collected &&
            px < item.x + item.width &&
            px + pw > item.x &&
            py < item.y + item.height &&
            py + ph > item.y
          ) {
            item.collected = true;

            if (item.type === 'coin') {
              g.coins += 1;
              g.score += 50;
              play8BitCoin();
              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '+1 🪙',
                life: 28,
                color: '#ffd700',
              });
            } else if (item.type === 'boba') {
              play8BitPowerup();
              g.score += 200;
              const boost = 1 + g.skills.feverBoostLevel * 0.2;
              g.fever.meter = Math.min(100, g.fever.meter + 25 * boost);

              if (g.fever.meter >= 100 && !g.fever.isActive) {
                g.fever.isActive = true;
                g.fever.timer = 360 + g.skills.feverBoostLevel * 45;
                setIsFever(true);
                play8BitFeverJingle();
              }

              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '🧋 FEVER +25%',
                life: 32,
                color: '#ec4899',
              });
            } else if (item.type === 'potion_blast') {
              // 🚀 GIANT BLAST MODE!
              play8BitPowerup();
              g.blast.isActive = true;
              g.blast.timer = 360; // 6 seconds
              setHasBlast(true);
              setBlastTimerLeft(6);
              g.screenShake = 10;
              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '⭐ ร่างยักษ์ชนแหลก!',
                life: 45,
                color: '#fde047',
              });
            } else if (item.type === 'star_magnet') {
              play8BitPowerup();
              g.magnet.isActive = true;
              g.magnet.timer = 360 + g.skills.magnetLevel * 50;
              setHasMagnet(true);
              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '🧲 แม่เหล็กดูดเหรียญ!',
                life: 35,
                color: '#38bdf8',
              });
            } else if (item.type === 'shield') {
              play8BitPowerup();
              g.shieldCount = Math.min(2, g.shieldCount + 1);
              setHasShield(true);
              g.scorePopups.push({
                x: item.x,
                y: item.y,
                text: '🛡️ เกราะฟองสบู่ +1',
                life: 35,
                color: '#38bdf8',
              });
            }

            for (let p = 0; p < 8; p++) {
              g.particles.push({
                x: item.x + item.width / 2,
                y: item.y + item.height / 2,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: item.type === 'potion_blast' ? '#fde047' : item.type === 'coin' ? '#ffd700' : '#f472b6',
                size: 3.5,
                life: 0,
                maxLife: 16,
              });
            }
          }

          if (item.x < -60 || item.collected) {
            g.collectibles.splice(i, 1);
          }
        }

        // ── 5. UPDATE OBSTACLES & COLLISION ──
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Precise collision box
          const isBlast = g.blast.isActive;
          const pw = isBlast ? CHAR_BLAST_W : g.player.width - 16;
          const ph = g.player.isSliding ? CHAR_SLIDE_H - 12 : (isBlast ? CHAR_BLAST_H : g.player.height - 12);
          const px = g.player.x + 8;
          const py = g.player.isSliding ? g.player.y + 24 : g.player.y + 6;

          // Check AABB collision
          if (
            px < obs.x + obs.width - 10 &&
            px + pw > obs.x + 10 &&
            py < obs.y + obs.height - 8 &&
            py + ph > obs.y + 8
          ) {
            // In Giant Blast or Fever Mode: SMASH EVERYTHING!
            if (g.blast.isActive || g.fever.isActive) {
              play8BitCoin();
              g.score += 150;
              g.screenShake = 8;
              g.scorePopups.push({
                x: obs.x,
                y: obs.y,
                text: '💥 +150',
                life: 25,
                color: '#fbbf24',
              });

              for (let p = 0; p < 18; p++) {
                g.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  color: ['#fbbf24', '#f59e0b', '#ef4444', '#ffffff'][p % 4],
                  size: 4 + Math.random() * 3,
                  life: 0,
                  maxLife: 22,
                });
              }
              g.obstacles.splice(i, 1);
              continue;
            }

            // Normal collision check
            if (g.player.invulnerableTimer <= 0) {
              if (g.shieldCount > 0) {
                // Shield absorbs collision
                g.shieldCount--;
                g.player.invulnerableTimer = 60;
                setHasShield(g.shieldCount > 0);
                play8BitCrash();
                g.screenShake = SHAKE_DURATION;

                for (let p = 0; p < 18; p++) {
                  g.particles.push({
                    x: g.player.x + 30,
                    y: g.player.y + 30,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    color: '#38bdf8',
                    size: 4,
                    life: 0,
                    maxLife: 25,
                  });
                }
              } else {
                // Game Over!
                g.isPlaying = false;
                g.isGameOver = true;
                play8BitCrash();
                g.screenShake = SHAKE_DURATION * 2;

                for (let p = 0; p < 25; p++) {
                  g.particles.push({
                    x: g.player.x + 35,
                    y: g.player.y + 30,
                    vx: (Math.random() - 0.5) * 13,
                    vy: (Math.random() - 0.5) * 13,
                    color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][p % 4],
                    size: 4.5,
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

          if (obs.x < -100) {
            g.obstacles.splice(i, 1);
          }
        }

        // Sync React HUD
        setScore(g.score);
        setRunCoins(g.coins);
        setFeverProgress(g.fever.isActive ? (g.fever.timer / 360) * 100 : g.fever.meter);
      }

      // ── 6. RENDER COLLECTIBLES ──
      g.collectibles.forEach((item) => {
        if (item.collected) return;
        const hover = Math.sin(g.frameCount * 0.15 + item.x * 0.05) * 3;

        if (item.type === 'coin') {
          if (assets.coin && assets.coin.complete && assets.coin.naturalWidth > 0) {
            ctx.drawImage(assets.coin, item.x, item.y + hover, item.width, item.height);
          }
        } else if (item.type === 'boba') {
          if (assets.boba && assets.boba.complete && assets.boba.naturalWidth > 0) {
            ctx.drawImage(assets.boba, item.x, item.y + hover, item.width, item.height);
          }
        } else if (item.type === 'potion_blast') {
          if (assets.blast && assets.blast.complete && assets.blast.naturalWidth > 0) {
            ctx.drawImage(assets.blast, item.x, item.y + hover, item.width, item.height);
          }
        } else if (item.type === 'star_magnet') {
          if (assets.magnet && assets.magnet.complete && assets.magnet.naturalWidth > 0) {
            ctx.drawImage(assets.magnet, item.x, item.y + hover, item.width, item.height);
          }
        } else if (item.type === 'shield') {
          // Sparkling shield orb
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(item.x + 22, item.y + 22 + hover, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
      });

      // ── 7. RENDER OBSTACLES ──
      g.obstacles.forEach((obs) => {
        if (obs.type === 'donut') {
          if (assets.donut && assets.donut.complete && assets.donut.naturalWidth > 0) {
            ctx.drawImage(assets.donut, obs.x, obs.y, obs.width, obs.height);
          }
        } else if (obs.type === 'dumbbell') {
          if (assets.dumbbell && assets.dumbbell.complete && assets.dumbbell.naturalWidth > 0) {
            ctx.drawImage(assets.dumbbell, obs.x, obs.y, obs.width, obs.height);
          }
        } else if (obs.type === 'barbell_high') {
          if (assets.barbellHigh && assets.barbellHigh.complete && assets.barbellHigh.naturalWidth > 0) {
            // Chain from top down to the barbell
            ctx.drawImage(assets.barbellHigh, obs.x, obs.y - 18, obs.width, obs.height + 18);
          }
        }
      });

      // ── 8. RENDER PLAYER (REAL GENERATED SPRITES) ──
      const p = g.player;
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;
      const isManow = g.character === 'manow';
      const isBlast = g.blast.isActive;

      if (!isBlinking) {
        ctx.save();

        const currentW = isBlast ? CHAR_BLAST_W : (p.isSliding ? CHAR_SLIDE_W : CHAR_NORMAL_W);
        const currentH = isBlast ? CHAR_BLAST_H : (p.isSliding ? CHAR_SLIDE_H : CHAR_NORMAL_H);
        const centerX = p.x + currentW / 2;
        const bottomY = p.isSliding ? p.y + CHAR_SLIDE_H : p.y + currentH;

        ctx.translate(centerX, bottomY);
        ctx.scale(p.scaleX, p.scaleY);
        ctx.translate(-centerX, -bottomY);

        // Giant Blast Rainbow Star Aura
        if (isBlast) {
          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(centerX, p.y + currentH / 2, currentH * 0.65 + Math.sin(g.frameCount * 0.25) * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Fever Golden Halo
        if (g.fever.isActive) {
          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(centerX, p.y + currentH / 2, 42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Shield Bubble
        if (g.shieldCount > 0) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(centerX, p.isSliding ? p.y + 20 : p.y + 35, 38, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Choose appropriate sprite based on pose and character
        let currentSprite: HTMLImageElement | null = null;
        if (isManow) {
          if (p.isSliding) {
            currentSprite = assets.manowSlide;
          } else if (!p.isGrounded) {
            currentSprite = assets.manowJump;
          } else {
            currentSprite = assets.manowRun;
          }
        } else {
          if (p.isSliding) {
            currentSprite = assets.magnumSlide;
          } else if (!p.isGrounded) {
            currentSprite = assets.magnumJump;
          } else {
            currentSprite = assets.magnumRun;
          }
        }

        // Draw image sprite with cute running bounce
        if (currentSprite && currentSprite.complete && currentSprite.naturalWidth > 0) {
          const runBounce = p.isGrounded && !p.isSliding ? Math.sin(g.frameCount * 0.3) * 2.5 : 0;
          if (p.isSliding) {
            ctx.drawImage(currentSprite, p.x - 8, p.y + 20, CHAR_SLIDE_W, CHAR_SLIDE_H);
          } else if (isBlast) {
            ctx.drawImage(currentSprite, p.x - 15, p.y - 40 + runBounce, CHAR_BLAST_W, CHAR_BLAST_H);
          } else {
            ctx.drawImage(currentSprite, p.x, p.y + runBounce, CHAR_NORMAL_W, CHAR_NORMAL_H);
          }
        }

        ctx.restore();
      }

      // ── 9. RENDER PARTICLES ──
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.07;
        pt.life++;

        const alpha = Math.max(0, 1 - pt.life / pt.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
        ctx.globalAlpha = 1;

        if (pt.life >= pt.maxLife) {
          g.particles.splice(i, 1);
        }
      }

      // ── 10. RENDER FLOATING SCORE POPUPS ──
      for (let i = g.scorePopups.length - 1; i >= 0; i--) {
        const sp = g.scorePopups[i];
        sp.y -= 1.3;
        sp.life--;

        const alpha = Math.max(0, sp.life / 28);
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

      ctx.restore(); // Screen shake end

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative select-none flex flex-col items-center w-full max-w-[640px] mx-auto">
      {/* Top Game HUD Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-white rounded-t-3xl border-b border-slate-700 text-xs">
        {/* Score & High Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Trophy size={15} />
            <span className="text-sm font-mono">{score}</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-slate-300 text-[11px]">
            สถิติ: <span className="font-mono text-white">{highScore}</span>
          </div>
        </div>

        {/* Active Buff Badges */}
        <div className="flex items-center gap-1.5">
          {hasBlast && (
            <span className="flex items-center gap-1 text-[10px] bg-yellow-500/25 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400 animate-pulse font-bold">
              <Flame size={11} /> ยักษ์ ({blastTimerLeft}s)
            </span>
          )}
          {hasShield && (
            <span className="flex items-center gap-1 text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400 font-bold">
              <Shield size={11} /> เกราะ
            </span>
          )}
          {hasMagnet && (
            <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-400 font-bold">
              <Zap size={11} /> แม่เหล็ก
            </span>
          )}
          <div className="flex items-center gap-1 font-black text-yellow-300 bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/40">
            <Coins size={14} />
            <span className="font-mono text-xs">+{runCoins}</span>
          </div>
        </div>
      </div>

      {/* Fever Bar Indicator */}
      <div className="w-full h-2.5 bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-150 ${
            isFever
              ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-sky-400 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-rose-500'
          }`}
          style={{ width: `${feverProgress}%` }}
        />
      </div>

      {/* Main Viewport with Fullscreen Left/Right Touch Controls */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-[16/9] bg-slate-950 overflow-hidden shadow-2xl rounded-b-3xl touch-none cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-full block"
          style={{ imageRendering: 'auto' }}
        />

        {/* In-Game Sleek Touch Area Hints (Overlay at bottom) */}
        {isPlaying && !isGameOver && (
          <div className="absolute inset-x-0 bottom-2 px-3 flex justify-between pointer-events-none opacity-60">
            <div
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                isSlideActive
                  ? 'bg-amber-500 text-slate-900 border-amber-300 scale-105 opacity-100 shadow-lg'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700/50'
              }`}
            >
              👈 กดซ้าย: สไลด์มุด
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                isJumpActive
                  ? 'bg-pink-500 text-white border-pink-300 scale-105 opacity-100 shadow-lg'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700/50'
              }`}
            >
              กดขวา: กระโดด 👉
            </div>
          </div>
        )}

        {/* Start / Intro Screen */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white">
            <div className="text-4xl mb-1.5 animate-bounce">🏃‍♀️🐷</div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400 bg-clip-text text-transparent">
              MooAuan Piggy Run!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mt-0.5 mb-3">
              หลบโดนัทและบาร์เบล เก็บเหรียญ ชานมไข่มุก และขวดยาแปลงร่างยักษ์!
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  initNewGame();
                }}
                className="btn-candy-pink px-6 py-2 text-sm font-extrabold shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                🚀 เริ่มวิ่งเลย!
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShop();
                }}
                className="btn-candy-yellow px-4 py-2 text-xs font-bold cursor-pointer"
              >
                🛍️ ร้านค้าสกิล
              </button>
            </div>

            <div className="mt-3 text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
              <span>🎮 <strong>แตะจอซ้าย</strong> = สไลด์มุด</span>
              <span className="text-slate-500">|</span>
              <span><strong>แตะจอขวา</strong> = กระโดด</span>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white animate-fade-in">
            <div className="text-4xl mb-1">💥🐽</div>
            <h3 className="text-2xl font-black text-rose-400">ชนเข้าอย่างจัง!</h3>
            <p className="text-xs text-slate-300 mt-0.5">ได้เหรียญสะสมไปอัปเกรดสกิลเพิ่มนะ</p>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3 my-2.5 w-60 shadow-md">
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
                onClick={(e) => {
                  e.stopPropagation();
                  initNewGame();
                }}
                className="btn-candy-pink px-5 py-2 text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>เล่นใหม่อีกรอบ</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShop();
                }}
                className="btn-candy-yellow px-4 py-2 text-xs font-bold cursor-pointer"
              >
                🛍️ ไปอัปเกรดสกิล
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
