import { PiggyRunSaveData, PlayerSkills, CharacterType, SkillUpgradeInfo } from '../components/game/gameTypes';
export type { PiggyRunSaveData };

const STORAGE_KEY = 'ft_piggy_run_save';

const DEFAULT_SAVE_DATA: PiggyRunSaveData = {
  highScore: 0,
  totalCoins: 50, // Starter bonus coins
  selectedCharacter: 'manow',
  skills: {
    magnetLevel: 0,
    doubleJumpUnlocked: false,
    shieldLevel: 0,
    feverBoostLevel: 0,
  },
  unlockedSkins: ['default'],
};

// Event listeners for coin changes & notifications
type CoinListener = (newTotal: number, delta: number, reason: string) => void;
const coinListeners: Set<CoinListener> = new Set();

export const subscribeToCoinUpdates = (listener: CoinListener) => {
  coinListeners.add(listener);
  return () => {
    coinListeners.delete(listener);
  };
};

const notifyCoinListeners = (newTotal: number, delta: number, reason: string) => {
  coinListeners.forEach((fn) => {
    try {
      fn(newTotal, delta, reason);
    } catch (e) {
      console.error('Error notifying coin listener:', e);
    }
  });
};

export const loadPiggySaveData = (): PiggyRunSaveData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE_DATA,
      ...parsed,
      skills: {
        ...DEFAULT_SAVE_DATA.skills,
        ...(parsed.skills || {}),
      },
    };
  } catch (e) {
    console.error('Failed to load piggy save data:', e);
    return DEFAULT_SAVE_DATA;
  }
};

export const savePiggySaveData = (data: Partial<PiggyRunSaveData>) => {
  try {
    const current = loadPiggySaveData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save piggy data:', e);
    return DEFAULT_SAVE_DATA;
  }
};

/**
 * Award coins from gym workout activities
 * Playing lifting gets MUCH more coins than in-game running!
 */
export const awardCoins = (
  type: 'set_done' | 'workout_finish' | 'cardio_finish' | 'game_run',
  amount?: number
): { coinsAwarded: number; newTotal: number } => {
  let coinsAwarded = 0;
  let reason = '';

  switch (type) {
    case 'set_done':
      coinsAwarded = amount || 10;
      reason = 'ยกเวทสำเร็จ 1 เซต! 🏋️‍♂️';
      break;
    case 'workout_finish':
      coinsAwarded = amount || 150;
      reason = 'จบเซสชันยกเวทสุดโหด! 🔥';
      break;
    case 'cardio_finish':
      coinsAwarded = amount || 60;
      reason = 'คาร์ดิโอเบิร์นไขมันสำเร็จ! 🏃';
      break;
    case 'game_run':
      coinsAwarded = amount || 0;
      reason = 'วิ่งเก็บเหรียญในเกมหมูอ้วน 🪙';
      break;
  }

  const current = loadPiggySaveData();
  const newTotal = current.totalCoins + coinsAwarded;
  savePiggySaveData({ totalCoins: newTotal });
  notifyCoinListeners(newTotal, coinsAwarded, reason);

  return { coinsAwarded, newTotal };
};

export const spendCoins = (amount: number): boolean => {
  const current = loadPiggySaveData();
  if (current.totalCoins < amount) return false;

  const newTotal = current.totalCoins - amount;
  savePiggySaveData({ totalCoins: newTotal });
  notifyCoinListeners(newTotal, -amount, 'ซื้อของในร้านค้า');
  return true;
};

export const recordHighScore = (score: number) => {
  const current = loadPiggySaveData();
  if (score > current.highScore) {
    savePiggySaveData({ highScore: score });
    return true;
  }
  return false;
};

export const setSelectedCharacter = (char: CharacterType) => {
  savePiggySaveData({ selectedCharacter: char });
};

// Skill Upgrade Configs & Costs
export const getSkillCatalog = (skills: PlayerSkills): SkillUpgradeInfo[] => {
  return [
    {
      id: 'doubleJumpUnlocked',
      name: 'Double Jump',
      nameTh: 'กระโดดสองชั้น (ดับเบิ้ลจัมป์)',
      descriptionTh: 'สามารถกดกระโดดซ้ำกลางอากาศได้ 1 ครั้ง ช่วยหลบสิ่งกีดขวางสูงๆ ได้ง่ายขึ้นมาก',
      icon: '🦘',
      maxLevel: 1,
      currentLevel: skills.doubleJumpUnlocked ? 1 : 0,
      cost: 150,
      isUnlocked: skills.doubleJumpUnlocked,
    },
    {
      id: 'magnetLevel',
      name: 'Coin Magnet',
      nameTh: 'แม่เหล็กดูดเหรียญทอง',
      descriptionTh: 'เพิ่มระยะดูดเหรียญรอบตัวและเพิ่มเวลาการทำงานของไอเทมแม่เหล็ก',
      icon: '🧲',
      maxLevel: 5,
      currentLevel: skills.magnetLevel,
      cost: (skills.magnetLevel + 1) * 80,
    },
    {
      id: 'shieldLevel',
      name: 'Tough Pig Shield',
      nameTh: 'เกราะป้องกันพุงนุ่ม',
      descriptionTh: 'เริ่มเกมพร้อมเกราะป้องกัน ช่วยรอดชีวิตจากการชนสิ่งกีดขวางได้ 1 ครั้ง',
      icon: '🛡️',
      maxLevel: 3,
      currentLevel: skills.shieldLevel,
      cost: (skills.shieldLevel + 1) * 120,
    },
    {
      id: 'feverBoostLevel',
      name: 'Boba Fever Boost',
      nameTh: 'พลังชานมฟีเวอร์ไว',
      descriptionTh: 'หลอดฟีเวอร์เต็มเร็วขึ้น 20% ต่อเลเวล และอยู่ในโหมดร่างทองบินเก็บเหรียญได้นานขึ้น',
      icon: '🧋',
      maxLevel: 5,
      currentLevel: skills.feverBoostLevel,
      cost: (skills.feverBoostLevel + 1) * 90,
    },
  ];
};

export const purchaseSkillUpgrade = (skillId: keyof PlayerSkills): boolean => {
  const current = loadPiggySaveData();
  const catalog = getSkillCatalog(current.skills);
  const target = catalog.find((s) => s.id === skillId);
  if (!target) return false;

  if (target.id === 'doubleJumpUnlocked') {
    if (current.skills.doubleJumpUnlocked) return false;
    if (!spendCoins(target.cost)) return false;
    savePiggySaveData({
      skills: {
        ...current.skills,
        doubleJumpUnlocked: true,
      },
    });
    return true;
  }

  const currentLevel = current.skills[skillId] as number;
  if (currentLevel >= target.maxLevel) return false;
  if (!spendCoins(target.cost)) return false;

  savePiggySaveData({
    skills: {
      ...current.skills,
      [skillId]: currentLevel + 1,
    },
  });
  return true;
};
