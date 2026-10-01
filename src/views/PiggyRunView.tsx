import React, { useState, useEffect } from 'react';
import { PiggyRunCanvas } from '../components/game/PiggyRunCanvas';
import { PiggyRunShop } from '../components/game/PiggyRunShop';
import {
  loadPiggySaveData,
  subscribeToCoinUpdates,
  PiggyRunSaveData,
} from '../services/piggyGameService';
import {
  getGameSoundMuted,
  setGameSoundMuted,
} from '../components/game/gameAudio';
import {
  Gamepad2,
  ShoppingBag,
  Coins,
  Trophy,
  Volume2,
  VolumeX,
  Dumbbell,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const PiggyRunView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'shop'>('game');
  const [isMuted, setIsMuted] = useState(getGameSoundMuted());
  const [saveData, setSaveData] = useState<PiggyRunSaveData>(() => loadPiggySaveData());

  useEffect(() => {
    const unsubscribe = subscribeToCoinUpdates(() => {
      setSaveData(loadPiggySaveData());
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setGameSoundMuted(next);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* 1. Header Banner & Economy Stat Bar */}
      <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border-2 border-pink-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md text-2xl shrink-0">
            🏃💨
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>MooAuan Piggy Run!</span>
              <span className="text-xs bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full font-bold border border-pink-200">
                16-Bit Retro
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              มินิเกมหมูอ้วนวิ่งเก็บเหรียญ หลบดัมเบลล์ สไลด์มุดบาร์เบลล์ และระเบิดโหมดฟีเวอร์!
            </p>
          </div>
        </div>

        {/* Top Badges (Coins, HighScore, Sound) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            {/* Total Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs">
              <Coins size={16} className="text-amber-500" />
              <span className="font-black text-sm font-mono">
                {saveData.totalCoins.toLocaleString()}
              </span>
            </div>

            {/* High Score */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs">
              <Trophy size={16} className="text-rose-500" />
              <span className="font-black text-sm font-mono">
                {saveData.highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition active:scale-90 cursor-pointer ${
              isMuted
                ? 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
            }`}
            title={isMuted ? 'เปิดเสียงเกม 8-Bit' : 'ปิดเสียงเกม'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* 2. Tab Navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-sm">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'game'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 size={16} />
          <span>🎮 เล่นเกมวิ่ง (Play Run)</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={16} />
          <span>🛍️ ร้านค้าสกิล & ตัวละคร (Shop)</span>
        </button>
      </div>

      {/* 3. Main Tab Contents */}
      {activeTab === 'game' ? (
        <div className="space-y-4">
          {/* Game Canvas Container */}
          <div className="bg-slate-950 border-2 border-pink-500/40 rounded-3xl p-3 sm:p-5 shadow-xl overflow-hidden">
            <PiggyRunCanvas
              onOpenShop={() => setActiveTab('shop')}
              character={saveData.selectedCharacter}
            />
          </div>

          {/* Quick Guide & Workout Farming Tip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Guide Card */}
            <div className="bg-white/95 rounded-2xl p-4 border border-pink-200 shadow-xs space-y-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-pink-500" />
                <span>วิธีบังคับ & กฎการเล่น 🕹️</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-slate-800">กระโดด (Jump):</strong> กดปุ่ม Space / ลูกศรขึ้น หรือแตะปุ่มจอ เพื่อโดดข้ามดัมเบลล์และโดนัท
                </li>
                <li>
                  <strong className="text-slate-800">กระโดด 2 จังหวะ (Double Jump):</strong> กดกระโดดซ้ำกลางอากาศเพื่อตีลังกาลอยข้ามสิ่งกีดขวางสูง
                </li>
                <li>
                  <strong className="text-slate-800">สไลด์มุด (Slide):</strong> กดปุ่มลูกศรลง หรือแตะปุ่มสไลด์ เพื่อมุดใต้คานบาร์เบลล์แขวน
                </li>
                <li>
                  <strong className="text-slate-800">โหมดชาไข่มุก (Boba Fever):</strong> เก็บแก้วชานมไข่มุกจนหลอดเต็ม เพื่อพุ่งทะลวงความเร็วแสงแบบไร้เทียมทาน!
                </li>
              </ul>
            </div>

            {/* Economy Farming Tip Card */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200 shadow-xs space-y-2">
              <h3 className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
                <Dumbbell size={16} className="text-rose-500" />
                <span>เคล็ดลับฟาร์มเหรียญทองไว 🪙</span>
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                การวิ่งในเกมจะได้เหรียญครั้งละ 10 - 40 เหรียญ แต่ถ้าคุณ **ออกกำลังกายในชีวิตจริง**:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white/90 p-2.5 rounded-xl border border-rose-100 text-center">
                  <div className="text-rose-600 font-extrabold text-sm">+10 🪙</div>
                  <div className="text-[11px] text-slate-500 font-bold">ยกเวทสำเร็จ 1 เซ็ต</div>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-rose-100 text-center">
                  <div className="text-amber-600 font-extrabold text-sm">+150++ 🪙</div>
                  <div className="text-[11px] text-slate-500 font-bold">กดจบเซสชันเวท</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Shop Tab */
        <div className="bg-slate-900 border-2 border-yellow-400/40 rounded-3xl p-4 sm:p-6 shadow-xl">
          <PiggyRunShop onBackToGame={() => setActiveTab('game')} />
        </div>
      )}
    </div>
  );
};
