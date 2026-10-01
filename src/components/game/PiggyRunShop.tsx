import React, { useState, useEffect } from 'react';
import {
  loadPiggySaveData,
  getSkillCatalog,
  purchaseSkillUpgrade,
  setSelectedCharacter,
} from '../../services/piggyGameService';
import { PiggyRunSaveData, CharacterType } from './gameTypes';
import { play8BitPowerup, play8BitCoin } from './gameAudio';
import { Coins, Check, ArrowRight, Zap, Sparkles, User, Dumbbell } from 'lucide-react';

interface PiggyRunShopProps {
  onBackToGame: () => void;
}

export const PiggyRunShop: React.FC<PiggyRunShopProps> = ({ onBackToGame }) => {
  const [saveData, setSaveData] = useState<PiggyRunSaveData>(loadPiggySaveData());
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const refreshData = () => {
    setSaveData(loadPiggySaveData());
  };

  const handleUpgrade = (skillId: any, name: string) => {
    const success = purchaseSkillUpgrade(skillId);
    if (success) {
      play8BitPowerup();
      refreshData();
      setPurchaseMsg(`อัปเกรด "${name}" สำเร็จ! 🎉`);
      setTimeout(() => setPurchaseMsg(null), 3000);
    } else {
      setPurchaseMsg('เหรียญไม่พอ! ไปยกเวทในยิมเพื่อฟาร์มเหรียญเพิ่มนะ 🏋️‍♂️');
      setTimeout(() => setPurchaseMsg(null), 3000);
    }
  };

  const handleSelectChar = (char: CharacterType) => {
    setSelectedCharacter(char);
    play8BitCoin();
    refreshData();
  };

  const skills = getSkillCatalog(saveData.skills);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
      {/* Top Header & Coin Counter */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black bg-gradient-to-r from-yellow-300 via-pink-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>🛍️ ร้านค้า & อัปเกรดสกิลหมูอ้วน</span>
          </h3>
          <p className="text-xs text-slate-400">
            ใช้เหรียญทองที่ได้จากการยกเวทและเล่นเกมมาอัปเกรดพลัง!
          </p>
        </div>

        {/* Big Coin Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/50 rounded-2xl shadow-inner">
          <Coins size={18} className="text-yellow-400" />
          <span className="font-black text-yellow-300 font-mono text-base">
            {saveData.totalCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tip Banner: How to get coins */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/30 text-xs flex items-center gap-2.5">
        <Dumbbell size={20} className="text-rose-400 shrink-0" />
        <div className="text-slate-300">
          <strong className="text-white">ทริกฟาร์มเงินไว:</strong> ยกเวทครบ 1 เซตได้{' '}
          <span className="text-yellow-400 font-bold">+10 🪙</span>, จบเซสชันได้มากถึง{' '}
          <span className="text-yellow-400 font-bold">+150 🪙</span>! ได้เงินไวกว่าวิ่งเก็บในเกมหลายเท่า
        </div>
      </div>

      {purchaseMsg && (
        <div className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-400 text-pink-300 text-xs text-center font-bold animate-pulse">
          {purchaseMsg}
        </div>
      )}

      {/* SECTION 1: CHARACTER SELECTOR */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <User size={14} className="text-pink-400" />
          <span>เลือกตัวละครวิ่ง (Select Runner)</span>
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Manow Piglet */}
          <div
            onClick={() => handleSelectChar('manow')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              saveData.selectedCharacter === 'manow'
                ? 'bg-pink-950/40 border-pink-400 shadow-md shadow-pink-500/20'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-pink-400/40 flex items-center justify-center p-0.5">
                <img
                  src="./mascots/piggy_run_manow.gif"
                  alt="หมูมะนาว"
                  className="w-full h-full object-contain"
                />
              </div>
              {saveData.selectedCharacter === 'manow' && (
                <span className="text-[10px] font-black bg-pink-500 text-white px-2 py-0.5 rounded-full">
                  เลือกอยู่ ✓
                </span>
              )}
            </div>
            <div className="font-extrabold text-sm text-pink-300">น้องหมูมะนาว 🌸</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              โบว์ชมพูหวาน ร่างทองฟีเวอร์ปีกนางฟ้า
            </p>
          </div>

          {/* Magnum Piglet */}
          <div
            onClick={() => handleSelectChar('magnum')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              saveData.selectedCharacter === 'magnum'
                ? 'bg-sky-950/40 border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-sky-400/40 flex items-center justify-center p-0.5">
                <img
                  src="./mascots/piggy_run_magnum.gif"
                  alt="หมูแม็กนั่ม"
                  className="w-full h-full object-contain"
                />
              </div>
              {saveData.selectedCharacter === 'magnum' && (
                <span className="text-[10px] font-black bg-sky-500 text-white px-2 py-0.5 rounded-full">
                  เลือกอยู่ ✓
                </span>
              )}
            </div>
            <div className="font-extrabold text-sm text-sky-300">น้องหมูแม็กนั่ม 🏋️‍♂️</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ผ้าคาดหัวสีแดง ร่างทองซูเปอร์ไซย่า
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: SKILL UPGRADES */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-400" />
          <span>อัปเกรดสกิลพิเศษ (Powerup Upgrades)</span>
        </h4>

        {skills.map((skill) => {
          const isMax =
            skill.id === 'doubleJumpUnlocked'
              ? skill.isUnlocked
              : skill.currentLevel >= skill.maxLevel;
          const canAfford = saveData.totalCoins >= skill.cost;

          return (
            <div
              key={skill.id}
              className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {skill.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{skill.nameTh}</span>
                    <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                      {skill.id === 'doubleJumpUnlocked'
                        ? skill.isUnlocked
                          ? 'ปลดล็อกแล้ว'
                          : 'ล็อกอยู่'
                        : `Lv. ${skill.currentLevel}/${skill.maxLevel}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                    {skill.descriptionTh}
                  </p>
                </div>
              </div>

              {/* Buy / Max Button */}
              <div className="shrink-0">
                {isMax ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <Check size={12} /> เต็มแล้ว
                  </span>
                ) : (
                  <button
                    onClick={() => handleUpgrade(skill.id, skill.nameTh)}
                    disabled={!canAfford}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      canAfford
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:brightness-110'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Coins size={13} />
                    <span>{skill.cost}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Return to Game Button */}
      <div className="pt-2">
        <button
          onClick={onBackToGame}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>🎮 กลับไปวิ่งทำสถิติ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
