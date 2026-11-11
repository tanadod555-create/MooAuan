import React from 'react';
import { useApp } from '../context/AppContext';
import { getUserAvatar } from '../utils/mascotLevels';

export const PortalHubView: React.FC = () => {
  const {
    setActiveWorld,
    activeProfileKey,
    setActiveProfileKey,
    isSpecialPair,
    transactions,
    foodLogs,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';

  // Real-time quick snapshot for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === todayStr);
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayFood = foodLogs.filter(f => f.date === todayStr);
  const todayKcal = todayFood.reduce((sum, f) => sum + f.kcal, 0);

  return (
    <div className="min-h-[80vh] px-4 py-8 max-w-3xl mx-auto flex flex-col justify-center items-center animate-fadeIn">
      {/* Persona Toggle (Only for Maxnum & Manow) */}
      {isSpecialPair && (
        <div className="inline-flex items-center p-1 bg-white/90 rounded-full border border-pink-200/80 shadow-2xs mb-6">
          <button
            type="button"
            onClick={() => setActiveProfileKey('primary')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isMaxnum
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <img
              src={getUserAvatar('primary')}
              alt="Maxnum"
              className="w-4 h-4 rounded-full object-cover border border-white/60"
            />
            <span>แม็กนั่ม 🏋️</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveProfileKey('partner')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              !isMaxnum
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <img
              src={getUserAvatar('partner')}
              alt="Manow"
              className="w-4 h-4 rounded-full object-cover border border-white/60"
            />
            <span>มะนาว 🌸</span>
          </button>
        </div>
      )}

      {/* Clean Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          เลือกสิ่งที่ต้องการทำวันนี้ 🐷
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
          สลับไปมาระหว่างฟิตเนสและการเงินได้ตลอดเวลาที่มุมบนขวา
        </p>
      </div>

      {/* The 2 Main Choices: Fit vs Setthi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* Choice 1: หมูอ้วนฟิต */}
        <button
          type="button"
          onClick={() => setActiveWorld('fit')}
          className={`group rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0 text-left border-2 shadow-md ${
            isMaxnum
              ? 'bg-gradient-to-b from-white to-sky-50/60 border-sky-200 hover:border-sky-300 shadow-sky-100/60 hover:shadow-sky-200/80'
              : 'bg-gradient-to-b from-white to-pink-50/60 border-pink-200 hover:border-pink-300 shadow-pink-100/60 hover:shadow-pink-200/80'
          }`}
        >
          {/* Mascot Illustration */}
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white shadow-md bg-white p-1 mb-4 group-hover:scale-105 transition-transform">
            <img
              src={getUserAvatar(activeProfileKey)}
              alt="Fit Piggy"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-1">
            หมูอ้วนฟิต 🏋️‍♂️
          </h2>
          <p className="text-xs font-bold text-slate-500 mb-4">
            เวทเทรนนิ่ง คาร์ดิโอ & นับแคลอรี่
          </p>

          {/* Today Snapshot Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">
            วันนี้ {Math.round(todayKcal).toLocaleString()} kcal
          </div>
        </button>

        {/* Choice 2: หมูอ้วนเศรษฐี */}
        <button
          type="button"
          onClick={() => setActiveWorld('setthi')}
          className="group rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0 text-left border-2 border-amber-200 hover:border-amber-300 bg-gradient-to-b from-white to-amber-50/60 shadow-md shadow-amber-100/60 hover:shadow-amber-200/80"
        >
          {/* Mascot Illustration */}
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-amber-200 shadow-md bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
            🐷💰
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-1">
            หมูอ้วนเศรษฐี 💰
          </h2>
          <p className="text-xs font-bold text-slate-500 mb-4">
            บันทึกรายรับ-รายจ่าย & สแกนสลิป
          </p>

          {/* Today Snapshot Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-amber-200/80 text-[11px] font-mono font-bold text-amber-800 shadow-2xs">
            ใช้ไป ฿{todayExpenses.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} วันนี้
          </div>
        </button>
      </div>
    </div>
  );
};
