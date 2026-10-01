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
// COOKIE-RUN BALANCED PHYSICS CONSTANTS
// ──────────────────────────────────────────────
const CANVAS_W = 560;
const CANVAS_H = 315;
const FLOOR_Y = 236;               // Aligned with the wooden track in game_bg.jpg
const PLAYER_X = 85;               // Fixed X position of player

// Snappy yet controllable Cookie Run physics
const JUMP_VELOCITY = -12.5;       // Initial jump impulse
const DOUBLE_JUMP_VELOCITY = -10.5;// Second mid-air jump
const GRAVITY_ASCENDING = 0.52;    // Smooth float on the way up
const GRAVITY_DESCENDING = 0.95;   // Snappy gravity on the way down
const MAX_FALL_SPEED = 14;         // Max falling speed
const COYOTE_TIME = 6;             // Grace period for jumping right after ledge

// Squash & Stretch
const SQUASH_LAND = 0.75;          // Y scale when landing
const STRETCH_JUMP = 1.25;         // Y scale when jumping
const SQUASH_RECOVER_SPEED = 0.14; // Speed to recover normal shape

// Slide duration
const SLIDE_DURATION = 32;         // ~0.53 seconds

// Balanced Speed Progression (Smooth, not overwhelming)
const INITIAL_SPEED = 3.4;         // Relaxed starting speed
const MAX_SPEED = 6.8;             // Max cap
const SPEED_INCREASE = 0.0003;     // Very gradual increase

// Screen shake
const SHAKE_INTENSITY = 7;
const SHAKE_DURATION = 12;

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
      y: FLOOR_Y - 46,
      width: 46,
      height: 46,
      baseY: FLOOR_Y - 46,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      jumpCount: 0,
      isSliding: false,
      slideTimer: 0,
      animTimer: 0,
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

  // Preload all real image assets
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img); // Avoid blocking
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
    ]).then(([bg, manowRun, manowJump, manowSlide, magnumRun, magnumJump, magnumSlide, coin, boba, donut, dumbbell, barbellHigh]) => {
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
  }, [character]);

  // Jump Control
  const handleJump = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) {
      initNewGame();
      return;
    }

    g.player.isSliding = false;

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
      for (let i = 0; i < 6; i++) {
        g.particles.push({
          x: g.player.x + 22,
          y: FLOOR_Y - 2,
          vx: (Math.random() - 0.7) * 3,
          vy: -Math.random() * 2.5 - 0.5,
          color: '#e2e8f0',
          size: 3 + Math.random() * 2,
          life: 0,
          maxLife: 16,
        });
      }

      play8BitJump();
      g.jumpBuffered = false;
      return;
    }

    // Double Jump
    if (g.skills.doubleJumpUnlocked && g.player.jumpCount === 1) {
      g.player.vy = DOUBLE_JUMP_VELOCITY;
      g.player.jumpCount = 2;

      g.player.scaleX = 0.85;
      g.player.scaleY = 1.15;
      g.player.targetScaleX = 1;
      g.player.targetScaleY = 1;

      for (let i = 0; i < 10; i++) {
        g.particles.push({
          x: g.player.x + 22,
          y: g.player.y + 35,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 3 + 1,
          color: i % 2 === 0 ? '#ffd700' : '#fbbf24',
          size: 3,
          life: 0,
          maxLife: 18,
        });
      }

      play8BitDoubleJump();
      g.jumpBuffered = false;
      return;
    }

    // Input buffer for snappy responsiveness
    g.jumpBuffered = true;
    g.jumpBufferTimer = 8;
  }, [initNewGame]);

  // Slide Control
  const handleSlide = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) return;

    if (g.player.isGrounded) {
      g.player.isSliding = true;
      g.player.slideTimer = SLIDE_DURATION;

      g.player.scaleX = 1.2;
      g.player.scaleY = 0.7;
      g.player.targetScaleX = 1.1;
      g.player.targetScaleY = 0.8;

      play8BitSlide();
    } else if (!g.player.isGrounded) {
      // Cookie Run Mid-air Fast Slam
      g.player.vy = MAX_FALL_SPEED * 0.9;
    }
  }, []);

  // Keyboard Shortcuts
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

      // Screen Shake
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
        // Seamless scrolling 16:9 pixel background
        const bgW = W;
        const bgH = H;
        const scrollX = -(g.bgOffset % bgW);

        ctx.drawImage(assets.bg, scrollX, 0, bgW, bgH);
        ctx.drawImage(assets.bg, scrollX + bgW, 0, bgW, bgH);
      } else {
        // Fallback cozy gradient while loading
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fce7f3');
        grad.addColorStop(0.7, '#fed7aa');
        grad.addColorStop(1, '#475569');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Fever Mode Rainbow Overlay
      if (g.fever.isActive) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        const rainbow = ctx.createLinearGradient(0, 0, W, 0);
        rainbow.addColorStop(0, '#ec4899');
        rainbow.addColorStop(0.3, '#fbbf24');
        rainbow.addColorStop(0.6, '#38bdf8');
        rainbow.addColorStop(1, '#a855f7');
        ctx.fillStyle = rainbow;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ── 2. UPDATE GAME DYNAMICS ──
      if (g.isPlaying && !g.isGameOver) {
        g.distance += g.speed * 0.1;
        g.score += Math.floor(g.speed * 0.2);
        g.bgOffset += g.speed * 0.8;

        // Controlled speed progression
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
            for (let i = 0; i < 5; i++) {
              g.particles.push({
                x: p.x + 12 + Math.random() * 20,
                y: FLOOR_Y - 2,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 0.5,
                color: '#cbd5e1',
                size: 3 + Math.random() * 2,
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

        // Slide countdown
        if (p.isSliding) {
          p.slideTimer--;
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.scaleX = 1;
            p.scaleY = 1;
          }
        }

        // Running dust trail
        if (p.isGrounded && !p.isSliding) {
          p.dustTimer++;
          if (p.dustTimer >= 6) {
            p.dustTimer = 0;
            g.particles.push({
              x: p.x + 4,
              y: FLOOR_Y - 2,
              vx: -g.speed * 0.4 + (Math.random() - 0.5),
              vy: -Math.random() * 1.2,
              color: '#94a3b8',
              size: 3,
              life: 0,
              maxLife: 12,
            });
          }
        }

        // Jump buffer decay
        if (g.jumpBufferTimer > 0) {
          g.jumpBufferTimer--;
          if (g.jumpBufferTimer <= 0) g.jumpBuffered = false;
        }

        if (p.invulnerableTimer > 0) p.invulnerableTimer--;

        // ── 3. SPAWN OBSTACLES & COLLECTIBLES ──
        g.nextObstacleDist -= g.speed;
        if (g.nextObstacleDist <= 0) {
          if (g.fever.isActive) {
            // Fever Rainbow Gold Rush: Golden arc waves
            for (let c = 0; c < 6; c++) {
              g.collectibles.push({
                x: W + c * 30,
                y: FLOOR_Y - 55 - Math.sin(c * 0.6) * 32,
                width: 22,
                height: 22,
                type: 'coin',
                value: 1,
              });
            }
            g.nextObstacleDist = 85;
          } else {
            const rand = Math.random();
            if (rand < 0.5) {
              // Low Obstacle: Donut or Dumbbell (Must JUMP)
              const isDonut = Math.random() < 0.55;
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - (isDonut ? 34 : 28),
                width: isDonut ? 34 : 38,
                height: isDonut ? 34 : 28,
                type: isDonut ? 'donut' : 'dumbbell',
                isHigh: false,
              });
            } else {
              // High Hanging Barbell (Must SLIDE)
              g.obstacles.push({
                x: W + 10,
                y: FLOOR_Y - 72,
                width: 52,
                height: 38,
                type: 'barbell_high',
                isHigh: true,
              });
            }

            // Coin row beside obstacle
            const coinY = FLOOR_Y - (Math.random() < 0.5 ? 45 : 75);
            for (let c = 0; c < 3; c++) {
              g.collectibles.push({
                x: W + 90 + c * 28,
                y: coinY,
                width: 20,
                height: 20,
                type: 'coin',
                value: 1,
              });
            }

            // Boba Tea Powerup (Fever charger)
            if (Math.random() < 0.35) {
              g.collectibles.push({
                x: W + 195,
                y: FLOOR_Y - 58,
                width: 26,
                height: 30,
                type: 'boba',
                value: 5,
              });
            }

            g.nextObstacleDist = Math.max(80, 160 - g.speed * 6);
          }
        }

        // Magnet attraction radius
        const magnetRadius = g.magnet.isActive ? 170 + g.skills.magnetLevel * 30 : 0;

        // ── 4. UPDATE & COLLECT ITEMS ──
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const item = g.collectibles[i];
          item.x -= g.speed;

          if (magnetRadius > 0 && !item.collected) {
            const dx = g.player.x + 22 - item.x;
            const dy = g.player.y + 20 - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < magnetRadius) {
              item.x += (dx / dist) * 9;
              item.y += (dy / dist) * 9;
            }
          }

          // Hitbox
          const px = g.player.x;
          const py = g.player.isSliding ? g.player.y + 18 : g.player.y;
          const pw = g.player.width;
          const ph = g.player.isSliding ? 24 : g.player.height;

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
            }

            for (let p = 0; p < 6; p++) {
              g.particles.push({
                x: item.x + 10,
                y: item.y + 10,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: item.type === 'coin' ? '#ffd700' : '#f472b6',
                size: 3,
                life: 0,
                maxLife: 14,
              });
            }
          }

          if (item.x < -50 || item.collected) {
            g.collectibles.splice(i, 1);
          }
        }

        // ── 5. UPDATE OBSTACLES & COLLISION ──
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Fair collision box
          const px = g.player.x + 8;
          const py = g.player.isSliding ? g.player.y + 22 : g.player.y + 6;
          const pw = g.player.width - 16;
          const ph = g.player.isSliding ? 20 : g.player.height - 10;

          if (
            px < obs.x + obs.width - 8 &&
            px + pw > obs.x + 8 &&
            py < obs.y + obs.height - 6 &&
            py + ph > obs.y + 6
          ) {
            if (g.fever.isActive) {
              // Destroy obstacle in Fever Mode!
              play8BitCoin();
              g.score += 100;
              for (let p = 0; p < 14; p++) {
                g.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 9,
                  vy: (Math.random() - 0.5) * 9,
                  color: '#fbbf24',
                  size: 4,
                  life: 0,
                  maxLife: 20,
                });
              }
              g.obstacles.splice(i, 1);
              continue;
            }

            if (g.player.invulnerableTimer <= 0) {
              if (g.shieldCount > 0) {
                // Shield absorbs crash
                g.shieldCount--;
                g.player.invulnerableTimer = 60;
                setHasShield(g.shieldCount > 0);
                play8BitCrash();
                g.screenShake = SHAKE_DURATION;

                for (let p = 0; p < 16; p++) {
                  g.particles.push({
                    x: g.player.x + 22,
                    y: g.player.y + 20,
                    vx: (Math.random() - 0.5) * 9,
                    vy: (Math.random() - 0.5) * 9,
                    color: '#38bdf8',
                    size: 4,
                    life: 0,
                    maxLife: 24,
                  });
                }
              } else {
                // Game Over!
                g.isPlaying = false;
                g.isGameOver = true;
                play8BitCrash();
                g.screenShake = SHAKE_DURATION * 2;

                for (let p = 0; p < 22; p++) {
                  g.particles.push({
                    x: g.player.x + 22,
                    y: g.player.y + 20,
                    vx: (Math.random() - 0.5) * 11,
                    vy: (Math.random() - 0.5) * 11,
                    color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][p % 4],
                    size: 4,
                    life: 0,
                    maxLife: 28,
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

          if (obs.x < -70) {
            g.obstacles.splice(i, 1);
          }
        }

        // Sync React HUD
        setScore(g.score);
        setRunCoins(g.coins);
        setFeverProgress(g.fever.isActive ? (g.fever.timer / 360) * 100 : g.fever.meter);
      }

      // ── 6. RENDER COLLECTIBLES (REAL IMAGES) ──
      g.collectibles.forEach((item) => {
        if (item.collected) return;
        if (item.type === 'coin') {
          if (assets.coin && assets.coin.complete && assets.coin.naturalWidth > 0) {
            const coinHover = Math.sin(g.frameCount * 0.15 + item.x * 0.05) * 3;
            ctx.drawImage(assets.coin, item.x, item.y + coinHover, item.width, item.height);
          } else {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(item.x + 10, item.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (item.type === 'boba') {
          if (assets.boba && assets.boba.complete && assets.boba.naturalWidth > 0) {
            ctx.drawImage(assets.boba, item.x, item.y, item.width, item.height);
          }
        }
      });

      // ── 7. RENDER OBSTACLES (REAL IMAGES) ──
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
            ctx.drawImage(assets.barbellHigh, obs.x, obs.y - 12, obs.width, obs.height + 12);
          }
        }
      });

      // ── 8. RENDER PLAYER (REAL GENERATED SPRITES) ──
      const p = g.player;
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;
      const isManow = g.character === 'manow';

      if (!isBlinking) {
        ctx.save();

        // Squash & Stretch Center Transform
        const centerX = p.x + p.width / 2;
        const bottomY = p.isSliding ? p.y + 24 : p.y + p.height;
        ctx.translate(centerX, bottomY);
        ctx.scale(p.scaleX, p.scaleY);
        ctx.translate(-centerX, -bottomY);

        // Fever Golden Halo
        if (g.fever.isActive) {
          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, p.y + 20, 30, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Shield Bubble
        if (g.shieldCount > 0) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, p.isSliding ? p.y + 14 : p.y + 22, 28, 0, Math.PI * 2);
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

        // Draw the image sprite with cute running bounce
        if (currentSprite && currentSprite.complete && currentSprite.naturalWidth > 0) {
          const runBounce = p.isGrounded && !p.isSliding ? Math.sin(g.frameCount * 0.3) * 2 : 0;
          if (p.isSliding) {
            ctx.drawImage(currentSprite, p.x - 6, p.y + 8, p.width + 12, p.height - 12);
          } else {
            ctx.drawImage(currentSprite, p.x, p.y + runBounce, p.width, p.height);
          }
        }

        ctx.restore();
      }

      // ── 9. RENDER PARTICLES ──
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.06;
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
        sp.y -= 1.2;
        sp.life--;

        const alpha = Math.max(0, sp.life / 28);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        ctx.font = 'bold 13px monospace';
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
          style={{ imageRendering: 'auto' }}
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
                className="btn-candy-pink px-6 py-2.5 text-sm font-extrabold shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                🚀 เริ่มวิ่งเลย!
              </button>
              <button
                onClick={onOpenShop}
                className="btn-candy-yellow px-4 py-2.5 text-xs font-bold cursor-pointer"
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
                className="btn-candy-pink px-6 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>เล่นใหม่อีกรอบ</span>
              </button>
              <button
                onClick={onOpenShop}
                className="btn-candy-yellow px-4 py-2.5 text-xs font-bold cursor-pointer"
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
          className="flex-1 mr-2 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-black text-sm rounded-2xl border border-slate-600 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <span>⬇️ สไลด์มุด (SLIDE)</span>
        </button>

        <button
          onClick={handleJump}
          className="flex-1 ml-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span>⬆️ กระโดด (JUMP)</span>
        </button>
      </div>
    </div>
  );
};
