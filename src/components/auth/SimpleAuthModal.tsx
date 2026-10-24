import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Check, Lock, User, Heart, Dumbbell, ArrowRight, UserPlus, LogIn, X } from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleAuthModal: React.FC<SimpleAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, signupNewAccount, currentAccount, logoutAccount } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupSex, setSignupSex] = useState<'male' | 'female'>('male');
  const [signupGoal, setSignupGoal] = useState('ลดไขมัน & กระชับสัดส่วน');

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!loginUsername.trim()) {
      setErrorMsg('กรุณากรอก Username');
      return;
    }
    const res = loginWithCredentials(loginUsername, loginPassword);
    if (!res.success) {
      setErrorMsg(res.message || 'Username หรือ Password ไม่ถูกต้อง');
    } else {
      onClose();
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setLoginUsername(user);
    setLoginPassword(pass);
    setErrorMsg(null);
    const res = loginWithCredentials(user, pass);
    if (res.success) {
      onClose();
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!signupUsername.trim() || !signupPassword.trim()) {
      setErrorMsg('กรุณากรอก Username และ Password ให้ครบถ้วน');
      return;
    }
    const res = signupNewAccount({
      username: signupUsername.trim(),
      password: signupPassword.trim(),
      name: signupName.trim() || (signupSex === 'male' ? 'หมูฟิต (หนุ่ม)' : 'หมูสวย (สาว)'),
      sex: signupSex,
      goal: signupGoal,
      height_cm: signupSex === 'male' ? 175 : 160,
      kcal_target: signupSex === 'male' ? 2200 : 1600,
      protein_target_g: signupSex === 'male' ? 150 : 100,
    });

    if (!res.success) {
      setErrorMsg(res.message || 'เกิดข้อผิดพลาดในการสมัคร');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-pink-200 rounded-[32px] p-6 shadow-2xl overflow-hidden animate-candy-pop">
        {/* Close Button if user is already logged in */}
        {currentAccount && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer z-20"
            title="ปิด"
          >
            <X size={16} />
          </button>
        )}

        {/* Mascot & Header */}
        <div className="text-center relative z-10 space-y-2 mb-4">
          <div className="flex justify-center -mt-1 mb-1">
            <div className="animate-wiggle cursor-pointer">
              <PigMascot size="lg" expression="cheer" className="drop-shadow-sm" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black border border-pink-200">
            <Sparkles size={13} className="animate-sparkle text-pink-500" />
            <span>หมูอ้วน FitTrack · Login & Sign Up 🎮</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {mode === 'login' ? 'เข้าสู่ระบบหมูอ้วน 🐽' : 'สร้างบัญชีหมูตัวใหม่ ✨'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {mode === 'login'
              ? 'ล็อกอินครั้งเดียวจำในเครื่องทันที เปิดครั้งต่อไปไม่ต้องกรอกซ้ำ!'
              : 'เลือกเพศเพื่อรับตัวละครหมู (ชาย=Maxnum, หญิง=Manow)'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-4 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn size={14} />
            <span>เข้าสู่ระบบ (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus size={14} />
            <span>สมัครสมาชิกใหม่ (Sign Up)</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick 1-Click Login for Maxnum & Manow */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block text-center">
                ✨ แตะเพื่อเข้าสู่ระบบด่วน (1-Click Login)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('maxnum', 'maxnum')}
                  className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>🏋️‍♂️ แม็กนั่ม (Maxnum)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manow', 'manow')}
                  className="p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-800 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>🌸 มะนาว (Manow)</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase absolute">
                หรือกรอกข้อมูล
              </span>
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User size={13} className="text-slate-400" />
                <span>Username (ชื่อผู้ใช้):</span>
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="เช่น maxnum, manow หรือ username ของคุณ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:bg-white transition"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Lock size={13} className="text-slate-400" />
                <span>Password (รหัสผ่าน):</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-200 transition active:scale-95 cursor-pointer mt-2"
            >
              <LogIn size={16} />
              <span>เข้าสู่ระบบ & จำไว้ในเครื่อง 🚀</span>
            </button>
          </form>
        ) : (
          /* MODE 2: SIGN UP FORM */
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Gender Selection: Male = Maxnum Pig, Female = Manow Pig */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">
                🐷 เลือกเพศตัวละครหมูของคุณ:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Male Card */}
                <button
                  type="button"
                  onClick={() => setSignupSex('male')}
                  className={`p-3 rounded-2xl border-2 text-left transition active:scale-95 cursor-pointer flex items-center gap-2.5 ${
                    signupSex === 'male'
                      ? 'bg-sky-50 border-sky-400 shadow-[0_4px_0_#38bdf8]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-400 text-white flex items-center justify-center text-xl shrink-0">
                    🏋️‍♂️
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>เพศชาย</span>
                      {signupSex === 'male' && <Check size={12} className="text-sky-600 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-slate-500">ใช้หมู Maxnum (ฟ้า)</p>
                  </div>
                </button>

                {/* Female Card */}
                <button
                  type="button"
                  onClick={() => setSignupSex('female')}
                  className={`p-3 rounded-2xl border-2 text-left transition active:scale-95 cursor-pointer flex items-center gap-2.5 ${
                    signupSex === 'female'
                      ? 'bg-pink-50 border-pink-400 shadow-[0_4px_0_#ff6584]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-400 text-white flex items-center justify-center text-xl shrink-0">
                    🌸
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span>เพศหญิง</span>
                      {signupSex === 'female' && <Check size={12} className="text-pink-600 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-slate-500">ใช้หมู Manow (ชมพู)</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Nickname / Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ชื่อเล่นที่คุณชอบ:</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="เช่น บาส, ป๊อป, แนท..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:bg-white"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ตั้ง Username:</label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="เช่น bas123, pop_fit"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ตั้ง Password:</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="ตั้งรหัสผ่านง่ายๆ ของคุณ"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:bg-white"
              />
            </div>

            {/* Goal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">เป้าหมายของคุณ:</label>
              <select
                value={signupGoal}
                onChange={(e) => setSignupGoal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400"
              >
                <option value="ลดไขมัน & กระชับสัดส่วน">ลดไขมัน & กระชับสัดส่วน 🔥</option>
                <option value="สร้างกล้ามเนื้อ & เพิ่มความแข็งแรง">สร้างกล้ามเนื้อ & เพิ่มแรง 🏋️‍♂️</option>
                <option value="รักษาสุขภาพ & ฟิตหุ่นสวย">รักษาสุขภาพ & ฟิตหุ่นสวย 🥗</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer mt-1"
            >
              <UserPlus size={16} />
              <span>สมัครสมาชิกและเริ่มเล่นทันที 🌟</span>
            </button>
          </form>
        )}

        {/* Bottom Actions: Logged In Account Info or Guest access option */}
        {currentAccount ? (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              กำลังเข้าสู่ระบบ: <b className="text-slate-800 font-bold">{currentAccount.name}</b>
            </span>
            <button
              type="button"
              onClick={() => {
                logoutAccount();
                setLoginUsername('');
                setLoginPassword('');
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold transition cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold transition cursor-pointer"
            >
              ข้ามไปก่อน (เข้าชมในฐานะ Guest) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
