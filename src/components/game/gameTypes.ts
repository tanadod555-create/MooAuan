export type CharacterType = 'manow' | 'magnum';

export interface PlayerSkills {
  magnetLevel: number;        // 0 to 5: Increases coin attraction radius & duration
  doubleJumpUnlocked: boolean; // Enables mid-air 2nd jump
  shieldLevel: number;        // 0 to 3: Start with 1 shield charge or survive collision
  feverBoostLevel: number;    // 0 to 5: Fever bar fills faster and lasts longer
}

export interface PiggyRunSaveData {
  highScore: number;
  totalCoins: number;
  selectedCharacter: CharacterType;
  skills: PlayerSkills;
  unlockedSkins: string[];
}

export interface SkillUpgradeInfo {
  id: keyof PlayerSkills;
  name: string;
  nameTh: string;
  descriptionTh: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  isUnlocked?: boolean;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'donut' | 'dumbbell' | 'barbell_high' | 'kettlebell_hanging';
  isHigh: boolean; // Must slide under if true, jump over if false
}

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'boba' | 'star_magnet' | 'shield';
  value: number;
  collected?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}
