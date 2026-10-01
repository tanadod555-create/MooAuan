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
import { Trophy, Coins, RotateCcw, Volume2, VolumeX, Sparkles, Shield, Zap } from 'lucide-react';

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
  const [feverProgress, setFeverProgress] = useState(0); // 0 to 100
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);

  // References for requestAnimationFrame loop
  const gameStateRef = useRef({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    coins: 0,
    speed: 4.5,
    distance: 0,
    character: character || 'manow',
    skills: {
      magnetLevel: 0,
      doubleJumpUnlocked: false,
      shieldLevel: 0,
      feverBoostLevel: 0,
    } as PlayerSkills,
    player: {
      x: 80,
      y: 190,
      width: 44,
      height: 38,
      baseY: 190,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      jumpCount: 0,
      isSliding: false,
      slideTimer: 0,
      animFrame: 0,
      animTimer: 0,
      invulnerableTimer: 0,
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
    nextObstacleDist: 90,
  });

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
    g.speed = 4.8;
    g.distance = 0;
    g.character = character || saved.selectedCharacter || 'manow';
    g.skills = saved.skills;

    g.player.y = g.player.baseY;
    g.player.vy = 0;
    g.player.isGrounded = true;
    g.player.isJumping = false;
    g.player.jumpCount = 0;
    g.player.isSliding = false;
    g.player.invulnerableTimer = 0;

    g.fever.meter = 0;
    g.fever.isActive = false;
    g.fever.timer = 0;

    g.magnet.isActive = false;
    g.magnet.timer = 0;

    g.shieldCount = saved.skills.shieldLevel > 0 ? 1 : 0;

    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.nextObstacleDist = 80;

    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setRunCoins(0);
    setFeverProgress(0);
    setIsFever(false);
    setHasShield(g.shieldCount > 0);
    setHasMagnet(false);
  }, [character]);

  // Handle Player Jump
  const handleJump = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) {
      initNewGame();
      return;
    }

    // Cancel slide if jumping
    g.player.isSliding = false;

    // Ground jump
    if (g.player.isGrounded) {
      g.player.vy = -10.5;
      g.player.isGrounded = false;
      g.player.isJumping = true;
      g.player.jumpCount = 1;
      play8BitJump();
      return;
    }

    // Double Jump (if unlocked via skills)
    if (g.skills.doubleJumpUnlocked && g.player.jumpCount === 1) {
      g.player.vy = -9.5;
      g.player.jumpCount = 2;
      play8BitDoubleJump();

      // Sparkles on double jump
      for (let i = 0; i < 8; i++) {
        g.particles.push({
          x: g.player.x + 20,
          y: g.player.y + 30,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 1,
          color: '#ffd700',
          size: 3,
          life: 0,
          maxLife: 20,
        });
      }
    }
  }, [initNewGame]);

  // Handle Player Slide
  const handleSlide = useCallback(() => {
    const g = gameStateRef.current;
    if (!g.isPlaying || g.isGameOver) return;

    if (g.player.isGrounded) {
      g.player.isSliding = true;
      g.player.slideTimer = 35; // Frames of slide duration (~0.6s)
      play8BitSlide();
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

  // Game Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const g = gameStateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      // Clear Screen
      ctx.clearRect(0, 0, W, H);

      // --- 1. DRAW BACKGROUND & SCENERY ---
      // Sky/Wall gradient
      const wallGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (g.fever.isActive) {
        // Fever Rainbow Party Sky
        wallGrad.addColorStop(0, '#fbcfe8');
        wallGrad.addColorStop(0.5, '#fef08a');
        wallGrad.addColorStop(1, '#bae6fd');
      } else {
        // Cozy Retro Gym Wall
        wallGrad.addColorStop(0, '#fce7f3');
        wallGrad.addColorStop(0.7, '#fed7aa');
        wallGrad.addColorStop(1, '#fef3c7');
      }
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, W, H);

      // Parallax City Window / Wall Decors
      g.backgroundOffset = (g.backgroundOffset + g.speed * 0.4) % W;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(W - (g.backgroundOffset % W) - 80, 40, 60, 50);
      ctx.fillRect(W - ((g.backgroundOffset + W / 2) % W) - 80, 40, 60, 50);

      // Neon Sign "MooAuan Run!" in background
      ctx.fillStyle = g.fever.isActive ? '#ec4899' : '#f43f5e';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ MOOAUAN GYM ⚡', W / 2, 35);

      // Floor (Running Track)
      const floorY = 228;
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, floorY, W, H - floorY);
      // Floor wooden slats / lanes
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY + 6);
      ctx.lineTo(W, floorY + 6);
      ctx.stroke();

      // Moving track stripes
      const trackOffset = (g.distance * 1.5) % 40;
      ctx.fillStyle = '#94a3b8';
      for (let tx = -trackOffset; tx < W; tx += 40) {
        ctx.fillRect(tx, floorY + 12, 18, 4);
      }

      // --- 2. UPDATE GAME DYNAMICS (WHEN ACTIVE) ---
      if (g.isPlaying && !g.isGameOver) {
        g.distance += g.speed * 0.1;
        g.score += Math.floor(g.speed * 0.2);
        // Gradually increase speed
        if (g.speed < 8.5) {
          g.speed += 0.0006;
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

        // Physics: Player Y & Gravity
        if (!g.player.isGrounded) {
          g.player.vy += 0.48; // Gravity
          g.player.y += g.player.vy;

          if (g.player.y >= g.player.baseY) {
            g.player.y = g.player.baseY;
            g.player.vy = 0;
            g.player.isGrounded = true;
            g.player.isJumping = false;
            g.player.jumpCount = 0;
          }
        }

        // Slide logic
        if (g.player.isSliding) {
          g.player.slideTimer--;
          if (g.player.slideTimer <= 0) {
            g.player.isSliding = false;
          }
        }

        // Animation frame cycle
        g.player.animTimer++;
        if (g.player.animTimer >= 6) {
          g.player.animTimer = 0;
          g.player.animFrame = (g.player.animFrame + 1) % 4;
        }

        // Invulnerability countdown
        if (g.player.invulnerableTimer > 0) {
          g.player.invulnerableTimer--;
        }

        // Spawn Obstacles & Collectibles
        g.nextObstacleDist -= g.speed;
        if (g.nextObstacleDist <= 0) {
          // If in fever mode, spawn clusters of gold coins!
          if (g.fever.isActive) {
            for (let c = 0; c < 5; c++) {
              g.collectibles.push({
                x: W + c * 32,
                y: floorY - 50 - Math.sin(c) * 30,
                width: 18,
                height: 18,
                type: 'coin',
                value: 1,
              });
            }
            g.nextObstacleDist = 90;
          } else {
            // Normal spawner
            const rand = Math.random();
            if (rand < 0.55) {
              // Low Obstacle: Donut or Dumbbell (Must JUMP)
              const isDonut = Math.random() < 0.5;
              g.obstacles.push({
                x: W + 10,
                y: floorY - (isDonut ? 30 : 25),
                width: isDonut ? 32 : 36,
                height: isDonut ? 30 : 25,
                type: isDonut ? 'donut' : 'dumbbell',
                isHigh: false,
              });
            } else {
              // High Hanging Obstacle: Barbell (Must SLIDE)
              g.obstacles.push({
                x: W + 10,
                y: floorY - 68,
                width: 48,
                height: 32,
                type: 'barbell_high',
                isHigh: true,
              });
            }

            // Spawn row of coins / boba alongside
            const coinY = floorY - (Math.random() < 0.5 ? 40 : 80);
            for (let c = 0; c < 3; c++) {
              g.collectibles.push({
                x: W + 90 + c * 28,
                y: coinY,
                width: 16,
                height: 16,
                type: 'coin',
                value: 1,
              });
            }

            // Chance for Boba Milk Tea (Charges Fever)
            if (Math.random() < 0.35) {
              g.collectibles.push({
                x: W + 185,
                y: floorY - 60,
                width: 22,
                height: 26,
                type: 'boba',
                value: 5,
              });
            }

            // Chance for Magnet or Shield
            if (Math.random() < 0.12) {
              const isMag = Math.random() < 0.6;
              g.collectibles.push({
                x: W + 220,
                y: floorY - 50,
                width: 20,
                height: 20,
                type: isMag ? 'star_magnet' : 'shield',
                value: 0,
              });
            }

            g.nextObstacleDist = Math.max(85, 140 - g.speed * 5);
          }
        }

        // Magnet range
        const magnetRadius = g.magnet.isActive ? 160 + g.skills.magnetLevel * 25 : 0;

        // Update Collectibles
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const item = g.collectibles[i];
          item.x -= g.speed;

          // Magnet Attraction
          if (magnetRadius > 0 && !item.collected) {
            const dx = g.player.x + 20 - item.x;
            const dy = g.player.y + 15 - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < magnetRadius) {
              item.x += (dx / dist) * 7;
              item.y += (dy / dist) * 7;
            }
          }

          // Player Hitbox vs Collectible
          const px = g.player.x;
          const py = g.player.isSliding ? g.player.y + 16 : g.player.y;
          const pw = g.player.width;
          const ph = g.player.isSliding ? 22 : g.player.height;

          if (
            !item.collected &&
            px < item.x + item.width &&
            px + pw > item.x &&
            py < item.y + item.height &&
            py + ph > item.y
          ) {
            item.collected = true;

            // Handle Item Effect
            if (item.type === 'coin') {
              g.coins += 1;
              g.score += 50;
              play8BitCoin();
            } else if (item.type === 'boba') {
              play8BitPowerup();
              g.score += 200;
              // Fever fill
              const boost = 1 + g.skills.feverBoostLevel * 0.2;
              g.fever.meter = Math.min(100, g.fever.meter + 22 * boost);
              if (g.fever.meter >= 100 && !g.fever.isActive) {
                g.fever.isActive = true;
                g.fever.timer = 360 + g.skills.feverBoostLevel * 40; // ~6 to 9 seconds
                setIsFever(true);
                play8BitFeverJingle();
              }
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

            // Spawn sparkle particles
            for (let p = 0; p < 6; p++) {
              g.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: item.type === 'coin' ? '#ffd700' : '#ec4899',
                size: 3,
                life: 0,
                maxLife: 15,
              });
            }
          }

          // Remove if off screen
          if (item.x < -40 || item.collected) {
            g.collectibles.splice(i, 1);
          }
        }

        // Update Obstacles & Collision
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Player Hitbox
          const px = g.player.x + 6;
          const py = g.player.isSliding ? g.player.y + 18 : g.player.y + 4;
          const pw = g.player.width - 12;
          const ph = g.player.isSliding ? 18 : g.player.height - 8;

          // Check Collision
          if (
            px < obs.x + obs.width - 4 &&
            px + pw > obs.x + 4 &&
            py < obs.y + obs.height - 4 &&
            py + ph > obs.y + 4
          ) {
            if (g.fever.isActive) {
              // Destroy obstacle in fever mode!
              play8BitCoin();
              for (let p = 0; p < 12; p++) {
                g.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
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
                // Break shield
                g.shieldCount--;
                g.player.invulnerableTimer = 60; // 1s invulnerable
                setHasShield(g.shieldCount > 0);
                play8BitCrash();
                // Shield break particles
                for (let p = 0; p < 14; p++) {
                  g.particles.push({
                    x: px + pw / 2,
                    y: py + ph / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
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
                setIsPlaying(false);
                setIsGameOver(true);

                // Save High Score & Award Coins
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

        // Sync React UI values periodically
        setScore(g.score);
        setRunCoins(g.coins);
        setFeverProgress(g.fever.isActive ? (g.fever.timer / 360) * 100 : g.fever.meter);
      }

      // --- 3. RENDER COLLECTIBLES ---
      g.collectibles.forEach((item) => {
        if (item.type === 'coin') {
          // 🪙 Spinning Pixel Coin
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(item.x + 8, item.y + 8, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(item.x + 8, item.y + 8, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'boba') {
          // 🧋 Boba Milk Tea Cup
          ctx.fillStyle = '#fed7aa'; // Tea color
          ctx.fillRect(item.x + 3, item.y + 6, 14, 18);
          ctx.fillStyle = '#451a03'; // Boba pearls
          ctx.fillRect(item.x + 5, item.y + 18, 3, 3);
          ctx.fillRect(item.x + 11, item.y + 18, 3, 3);
          ctx.fillRect(item.x + 8, item.y + 15, 3, 3);
          // Straw
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(item.x + 8, item.y, 3, 7);
        } else if (item.type === 'star_magnet') {
          // 🧲 Magnet Powerup
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(item.x + 2, item.y + 2, 16, 16);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(item.x + 12, item.y + 2, 6, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(item.x + 6, item.y + 6, 8, 12);
        } else if (item.type === 'shield') {
          // 🛡️ Shield Powerup
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(item.x + 10, item.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(item.x + 8, item.y + 5, 4, 10);
        }
      });

      // --- 4. RENDER OBSTACLES ---
      g.obstacles.forEach((obs) => {
        if (obs.type === 'donut') {
          // 🍩 Glazed Donut
          ctx.fillStyle = '#78350f'; // Chocolate
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 15, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f472b6'; // Pink frosting
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 15, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#475569'; // Hole
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 15, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'dumbbell') {
          // 🏋️ Dumbbell on Ground
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x, obs.y, 8, 24);
          ctx.fillRect(obs.x + obs.width - 8, obs.y, 8, 24);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(obs.x + 8, obs.y + 9, obs.width - 16, 6);
        } else if (obs.type === 'barbell_high') {
          // ⛓️ Hanging Overhead Barbell (Slide Under)
          // Chain
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x + 24, 0);
          ctx.lineTo(obs.x + 24, obs.y);
          ctx.stroke();
          // Barbell
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(obs.x, obs.y + 4, 10, 24);
          ctx.fillRect(obs.x + obs.width - 10, obs.y + 4, 10, 24);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(obs.x + 8, obs.y + 13, obs.width - 16, 6);
        }
      });

      // --- 5. RENDER PLAYER PIGLET ---
      const p = g.player;
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;

      if (!isBlinking) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Fever Golden Aura Glow
        if (g.fever.isActive) {
          ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
          ctx.beginPath();
          ctx.arc(22, 19, 28, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shield Bubble
        if (g.shieldCount > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(22, p.isSliding ? 24 : 19, 24, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Color palettes
        const isManow = g.character === 'manow';
        const bodyColor = g.fever.isActive ? '#fde047' : isManow ? '#fbb6ce' : '#f9a8d4';
        const bellyColor = g.fever.isActive ? '#fef08a' : '#fce7f3';
        const headbandColor = isManow ? '#fb923c' : '#ef4444';
        const bowColor = '#ec4899';

        if (p.isSliding) {
          // --- SLIDING POSE (Flattened Low on Belly) ---
          ctx.fillStyle = bodyColor;
          ctx.fillRect(4, 14, 38, 18);
          ctx.fillStyle = bellyColor;
          ctx.fillRect(8, 20, 26, 8);

          // Head / Face forward
          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.arc(36, 18, 12, 0, Math.PI * 2);
          ctx.fill();

          // Eye & Snout
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(40, 15, 3, 2); // Winking slide eye
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(42, 18, 5, 5); // Snout

          // Slide dust sparks
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(0, 28, 4, 3);
          ctx.fillRect(-6, 26, 4, 2);
        } else {
          // --- STANDING / RUNNING / JUMPING POSE ---
          const legFrame = p.isGrounded ? p.animFrame : 1;

          // Legs
          ctx.fillStyle = isManow ? '#f472b6' : '#38bdf8';
          if (legFrame === 0) {
            ctx.fillRect(10, 28, 7, 10);
            ctx.fillRect(26, 24, 7, 8);
          } else if (legFrame === 1) {
            ctx.fillRect(16, 26, 7, 9);
            ctx.fillRect(22, 26, 7, 9);
          } else if (legFrame === 2) {
            ctx.fillRect(10, 24, 7, 8);
            ctx.fillRect(26, 28, 7, 10);
          } else {
            ctx.fillRect(14, 26, 7, 9);
            ctx.fillRect(24, 26, 7, 9);
          }

          // Main Chubby Pig Body
          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.ellipse(20, 18, 18, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // Round Belly
          ctx.fillStyle = bellyColor;
          ctx.beginPath();
          ctx.ellipse(22, 19, 13, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pig Head
          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.arc(28, 10, 11, 0, Math.PI * 2);
          ctx.fill();

          // Headband / Bow
          if (isManow) {
            // Bow on ear
            ctx.fillStyle = bowColor;
            ctx.fillRect(22, 0, 5, 5);
            ctx.fillRect(28, 0, 5, 5);
          } else {
            // Red Headband
            ctx.fillStyle = headbandColor;
            ctx.fillRect(21, 5, 14, 3);
          }

          // Eyes (Bead black eyes with twinkle)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(32, 7, 3, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(33, 7, 1, 1);

          // Snout
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.ellipse(36, 12, 4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#831843';
          ctx.fillRect(35, 11, 1, 2);
          ctx.fillRect(37, 11, 1, 2);

          // Cheeks
          ctx.fillStyle = '#fb7185';
          ctx.fillRect(28, 12, 3, 2);

          // Arms pumping
          ctx.fillStyle = bodyColor;
          if (legFrame === 0) {
            ctx.fillRect(28, 16, 8, 4);
          } else if (legFrame === 2) {
            ctx.fillRect(10, 16, 8, 4);
          } else {
            ctx.fillRect(18, 17, 7, 4);
          }

          // Fever Golden Angel Wings
          if (g.fever.isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(8, 10);
            ctx.lineTo(-6, 0);
            ctx.lineTo(0, 14);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // --- 6. RENDER PARTICLES ---
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;

        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);

        if (pt.life >= pt.maxLife) {
          g.particles.splice(i, 1);
        }
      }

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
          width={560}
          height={315}
          className="w-full h-full block cursor-pointer"
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

      {/* Bottom Virtual Controls for Mobile / Touch Screen */}
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
