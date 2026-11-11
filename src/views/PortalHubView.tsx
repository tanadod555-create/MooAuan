import React from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, DollarSign, Sparkles, Flame, ArrowRight, ShieldCheck, Camera, Bot, PieChart, Activity } from 'lucide-react';
import { getUserAvatar, calculatePigEvolution, PIG_10_LEVELS } from '../utils/mascotLevels';

export const PortalHubView: React.FC = () => {
  const {
    activeWorld,
    setActiveWorld,
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    isSpecialPair,
    workoutHistory,
    transactions,
    foodLogs,
    currentAccount,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';
  const evolution = calculatePigEvolution(workoutHistory);
  const levelCfg = PIG_10_LEVELS[evolution.level] || PIG_10_LEVELS[1];

  // Quick stats for previews
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === todayStr);
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayFood = foodLogs.filter(f => f.date === todayStr);
  const todayKcal = todayFood.reduce((sum, f) => sum + f.kcal, 0);

  return (
    <div className="min-h-screen py-8 px-4 max-w-5xl mx-auto flex flex-col justify-between animate-fadeIn pb-24">
      {/* Top Welcome & Persona Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-pink-200/80 shadow-xs">
          <span className="text-lg">🚪✨</span>
          <span className="text-xs font-black text-slate-700 tracking-wide">
            ยินดีต้อนรับสู่จักรวาลหมูอ้วน (MooAuan Portal)
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          เลือกโลกที่คุณต้องการเข้าใช้งาน 🌟
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-medium">
          เชื่อมโยงการออกกำลังกาย อาหาร และการเงินไว้ด้วยกันแบบ 2-in-1 สลับไปมาได้ตลอดเวลา
        </p>

        {/* Persona Switcher Pill (For Maxnum & Manow) */}
        {isSpecialPair && (
          <div className="inline-flex items-center p-1 bg-white/90 rounded-full border border-slate-200 shadow-xs mt-2">
            <button
              onClick={() => setActiveProfileKey('primary')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                isMaxnum
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <img
                src={getUserAvatar('primary')}
                alt="Maxnum"
                className="w-4 h-4 rounded-full object-cover border border-white/60"
              />
              <span>แม็กนั่ม (Maxnum) 🏋️</span>
            </button>
            <button
              onClick={() => setActiveProfileKey('partner')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                !isMaxnum
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <img
                src={getUserAvatar('partner')}
                alt="Manow"
                className="w-4 h-4 rounded-full object-cover border border-white/60"
              />
              <span>มะนาว (Manow) 🌸</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Dual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full mb-8">
        {/* Card 1: หมูอ้วนฟิต (MooAuan Fit) */}
        <div
          onClick={() => setActiveWorld('fit')}
          className={`group rounded-[32px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${
            isMaxnum ? 'card-kawaii-blue' : 'card-kawaii-pink'
          }`}
        >
          <div>
            {/* Header Badge & Mascot Avatar */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                isMaxnum
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-pink-50 text-pink-700 border-pink-200'
              }`}>
                <Dumbbell size={14} className={isMaxnum ? 'text-sky-500' : 'text-pink-500'} />
                <span>สุขภาพ & ฟิตเนส</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                  <Flame size={12} className="text-orange-500" />
                  Streak {evolution.streakWeeks} วีค
                </span>
              </div>
            </div>

            {/* Mascot Center Illustration */}
            <div className="flex items-center gap-4 my-5 bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-white flex items-center justify-center animate-wiggle">
                <img
                  src={getUserAvatar(activeProfileKey)}
                  alt="Fit Piggy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  หมูอ้วนฟิต 🏋️‍♂️
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  MooAuan FitTrack & Nutrition
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-600 font-bold">
                  <span>วันนี้: {Math.round(todayKcal)} kcal</span>
                  <span>•</span>
                  <span>ซ้อม: {workoutHistory.length} ครั้ง</span>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">💪</span>
                <span>ตารางฝึกเวทเทรนนิ่ง & บันทึกเซ็ตสด</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">🍱</span>
                <span>สแกนรูปอาหาร AI & สารอาหาร (Thai DRI)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">🔥</span>
                <span>วิดีโอคาร์ดิโอ & แผนผังการฟื้นตัวกล้ามเนื้อ</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className={`w-full py-3.5 px-6 text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isMaxnum ? 'btn-candy-blue' : 'btn-candy-pink'
            }`}
          >
            <span>เข้าสู่หมูอ้วนฟิต</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: หมูอ้วนเศรษฐี (Setthi MooAuan) */}
        <div
          onClick={() => setActiveWorld('setthi')}
          className="group rounded-[32px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 card-kawaii-pink bg-gradient-to-b from-white via-white to-amber-50/30 border-2.5 border-amber-200 shadow-[0_6px_0_#fde68a]"
        >
          <div>
            {/* Header Badge & Icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                <DollarSign size={14} className="text-amber-600" />
                <span>การเงิน & สลากออม</span>
              </span>

              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Sparkles size={12} className="text-emerald-600" />
                กระเป๋าเงินพร้อมใช้
              </span>
            </div>

            {/* Mascot Center Illustration */}
            <div className="flex items-center gap-4 my-5 bg-gradient-to-r from-amber-50/60 to-white p-4 rounded-2xl border border-amber-100">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md shrink-0 bg-amber-50 flex items-center justify-center text-3xl animate-bounce-gentle">
                🐷💰
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  หมูอ้วนเศรษฐี 🐷💰
                </h2>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  Setthi MooAuan Finance
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-600 font-bold">
                  <span>จ่ายวันนี้: ฿{todayExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  <span>•</span>
                  <span>{todayTransactions.length} รายการ</span>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">📸</span>
                <span>Multi-Image สแกนสลิปหลายรูปพร้อมกัน</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">🤖</span>
                <span>AI หมูอ้วนช่วยจด (พิมพ์ปุ๊บ บันทึกปั๊บ)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-white/70 p-2 rounded-xl border border-slate-100">
                <span className="text-base">📊</span>
                <span>กราฟแท่ง & Donut Chart สัดส่วนรายจ่าย</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-3.5 px-6 text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md btn-candy-yellow"
          >
            <span>เข้าสู่หมูอ้วนเศรษฐี</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Info & Dual-Sync Explanation */}
      <div className="text-center p-4 bg-white/80 rounded-2xl border border-pink-100 max-w-xl mx-auto shadow-2xs">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-bold">
          <span className="text-pink-500">🔗</span>
          <span>ระบบ Dual-Log อัตโนมัติ:</span>
          <span className="text-slate-500 font-normal">
            บันทึกอาหารแล้วกรอกราคา จะลงกระเป๋าเงินให้ทันที
          </span>
        </div>
      </div>
    </div>
  );
};
