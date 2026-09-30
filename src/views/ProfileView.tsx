import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BodyMetric, UserProfile } from '../types';
import {
  User,
  Users,
  TrendingUp,
  Scale,
  Settings as SettingsIcon,
  Cloud,
  Key,
  Database,
  Plus,
  Calendar,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';

export const ProfileView: React.FC = () => {
  const {
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    partnerProfile,
    updateProfile,
    bodyMetrics,
    addBodyMetric,
    settings,
    updateSettings,
    workoutHistory,
    foodLogs,
    syncAllToGoogleSheets,
    isSyncing,
    openUnifiedSpreadsheet,
    unifiedSpreadsheetUrl,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stats' | 'profile' | 'settings'>('stats');

  // New Metric Modal
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMetricWeight, setNewMetricWeight] = useState(72.0);
  const [newMetricFat, setNewMetricFat] = useState<number | undefined>(16.0);
  const [newMetricWaist, setNewMetricWaist] = useState<number | undefined>(80);
  const [newMetricNote, setNewMetricNote] = useState('');

  // Editable Profile States
  const [editName, setEditName] = useState(currentProfile.name);
  const [editHeight, setEditHeight] = useState(currentProfile.height_cm);
  const [editGoal, setEditGoal] = useState(currentProfile.goal);
  const [editKcal, setEditKcal] = useState(currentProfile.kcal_target);
  const [editProtein, setEditProtein] = useState(currentProfile.protein_target_g);

  // Settings inputs
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [spreadsheetId, setSpreadsheetId] = useState(
    activeProfileKey === 'primary' ? settings.primarySpreadsheetId || '' : settings.partnerSpreadsheetId || ''
  );
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [geminiProxy, setGeminiProxy] = useState(settings.geminiProxyUrl || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl || '');
  const [useProxy, setUseProxy] = useState(settings.useProxy || false);

  // Sorted metrics
  const sortedMetrics = [...bodyMetrics].sort((a, b) => a.date.localeCompare(b.date));
  const latestMetric = sortedMetrics[sortedMetrics.length - 1];

  // Calculate BMI
  const heightM = (currentProfile.height_cm || 170) / 100;
  const currentWeightKg = latestMetric ? latestMetric.weight_kg : 70;
  const bmi = (currentWeightKg / (heightM * heightM)).toFixed(1);

  // Calculate weekly workout volume
  const totalVolumeAllTime = workoutHistory.reduce((sum, sess) => {
    const completedSets = sess.sets?.filter((s) => s.done) || [];
    return sum + completedSets.reduce((sSum, s) => sSum + s.weight_kg * s.reps, 0);
  }, 0);

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBodyMetric({
      date: newMetricDate,
      weight_kg: newMetricWeight,
      body_fat_pct: newMetricFat,
      waist_cm: newMetricWaist,
      note: newMetricNote.trim() || undefined,
    });
    setShowMetricModal(false);
    setNewMetricNote('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      height_cm: editHeight,
      goal: editGoal,
      kcal_target: editKcal,
      protein_target_g: editProtein,
    });
    alert('บันทึกการแก้ไขโปรไฟล์สำเร็จแล้ว!');
  };

  const handleSaveSettings = () => {
    updateSettings({
      googleClientId: clientId,
      [activeProfileKey === 'primary' ? 'primarySpreadsheetId' : 'partnerSpreadsheetId']: spreadsheetId,
      appsScriptUrl,
      geminiApiKey: geminiKey,
      geminiProxyUrl: geminiProxy,
      useProxy,
    });
    alert('บันทึกการตั้งค่าแล้ว!');
  };

  // Google OAuth Login trigger via GIS token client
  const handleGoogleLogin = () => {
    if (!settings.googleClientId && !clientId) {
      alert('กรุณากรอก Google Client ID ในช่องด้านล่างก่อนเริ่มการเชื่อมต่อ');
      return;
    }

    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        // @ts-ignore
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId || settings.googleClientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              updateSettings({
                googleAccessToken: tokenResponse.access_token,
                autoSyncGoogleSheets: true,
              });
              alert('เข้าสู่ระบบด้วย Google สำเร็จแล้ว! พร้อมสร้างหรือเชื่อมต่อ Google Sheet');
            }
          },
        });
        tokenClient.requestAccessToken();
      } else {
        alert('Google Identity Services SDK กำลังโหลด กรุณารอสักครู่แล้วลองอีกครั้ง');
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google: ' + err.message);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const backupData = {
      profile: currentProfile,
      metrics: bodyMetrics,
      foodLogs,
      workoutHistory,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-backup-${activeProfileKey}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Selector Banner */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/25">
            {currentProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{currentProfile.name}</h2>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                {activeProfileKey === 'primary' ? 'เจ้าของ (Owner)' : 'แฟน (Partner)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              เป้าหมาย: <strong className="text-slate-200">{currentProfile.goal}</strong>
            </p>
          </div>
        </div>

        {/* Toggle Account Pill */}
        <button
          onClick={() => setActiveProfileKey(activeProfileKey === 'primary' ? 'partner' : 'primary')}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95"
        >
          <Users size={14} className="text-emerald-400" />
          <span>สลับโปรไฟล์</span>
        </button>
      </div>

      {/* Sub-tab navigation: สถิติร่างกาย / ข้อมูลส่วนตัว / ตั้งค่า Google Sheet */}
      <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp size={16} />
          สถิติ & ความก้าวหน้า
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User size={16} />
          ข้อมูลส่วนตัว
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SettingsIcon size={16} />
          Google & API
        </button>
      </div>

      {/* TAB 1: STATS & PROGRESS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Quick Metrics Cards with 21st.dev MagicCard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MagicCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Scale size={14} className="text-emerald-400" /> น้ำหนักล่าสุด
              </span>
              <p className="text-xl font-black text-white mt-1">
                {currentWeightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(56, 189, 248, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles size={14} className="text-blue-400" /> Body Fat %
              </span>
              <p className="text-xl font-black text-white mt-1">
                {latestMetric?.body_fat_pct ? `${latestMetric.body_fat_pct}%` : '–'}
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 font-medium">ค่า BMI</span>
              <p className="text-xl font-black text-white mt-1">
                {bmi} <span className="text-xs text-emerald-400 font-bold">ปกติ</span>
              </p>
            </MagicCard>

            <MagicCard spotlightColor="rgba(16, 185, 129, 0.15)" className="p-4">
              <span className="text-xs text-slate-400 font-medium">Total Volume ยกสะสม</span>
              <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
                <NumberTicker value={totalVolumeAllTime} />{' '}
                <span className="text-xs text-slate-400 font-normal">kg</span>
              </p>
            </MagicCard>
          </div>

          {/* Interactive Weight Trend Chart (SVG Line Graph) */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  แนวโน้มน้ำหนักตัว (Weight Progression)
                </h3>
                <p className="text-xs text-slate-400">บันทึกความก้าวหน้าอย่างต่อเนื่อง</p>
              </div>
              <ShimmerButton
                onClick={() => setShowMetricModal(true)}
                shimmerColor="#34d399"
                className="py-0.5"
              >
                <Plus size={14} />
                <span className="text-xs font-bold">บันทึกน้ำหนัก</span>
              </ShimmerButton>
            </div>

            {/* SVG Chart */}
            {sortedMetrics.length < 2 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800">
                ต้องการข้อมูลอย่างน้อย 2 จุดเพื่อแสดงกราฟเส้น (กด "บันทึกน้ำหนัก" เพื่อเพิ่ม)
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full h-44 bg-slate-950 rounded-2xl border border-slate-800/80 p-3 relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Generate SVG Path Points */}
                    {(() => {
                      const weights = sortedMetrics.map((m) => m.weight_kg);
                      const minW = Math.min(...weights) - 1;
                      const maxW = Math.max(...weights) + 1;
                      const range = maxW - minW || 1;

                      const points = sortedMetrics.map((m, idx) => {
                        const x = (idx / (sortedMetrics.length - 1)) * 380 + 10;
                        const y = 110 - ((m.weight_kg - minW) / range) * 95;
                        return { x, y, weight: m.weight_kg, date: m.date };
                      });

                      const pathD = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ');
                      const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#chartGradient)" />
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="#090d16"
                                stroke="#34d399"
                                strokeWidth="2"
                              />
                              <text
                                x={p.x}
                                y={p.y - 8}
                                fill="#a7f3d0"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {p.weight}kg
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* X axis dates */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
                  <span>{sortedMetrics[0].date}</span>
                  <span>{sortedMetrics[sortedMetrics.length - 1].date}</span>
                </div>
              </div>
            )}

            {/* Metrics History Table */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">ประวัติการชั่งน้ำหนัก:</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {sortedMetrics.slice().reverse().map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar size={13} /> {m.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{m.weight_kg} kg</span>
                      {m.body_fat_pct && <span className="text-blue-400">{m.body_fat_pct}% fat</span>}
                      {m.waist_cm && <span className="text-slate-400">เอว {m.waist_cm} cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User size={18} className="text-emerald-400" />
            ข้อมูลผู้ใช้ & เป้าหมายโภชนาการ ({currentProfile.name})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">ชื่อเล่น / ชื่อเรียก</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">ส่วนสูง (ซม.)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">เป้าหมายการฝึก</label>
            <input
              type="text"
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-amber-400 mb-1">เป้าหมายแคลอรี่ต่อวัน (kcal)</label>
              <input
                type="number"
                value={editKcal}
                onChange={(e) => setEditKcal(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-400 mb-1">เป้าหมายโปรตีนต่อวัน (กรัม)</label>
              <input
                type="number"
                value={editProtein}
                onChange={(e) => setEditProtein(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              บันทึกข้อมูลโปรไฟล์
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GOOGLE SHEETS & GEMINI API SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Google Sheets Integration Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                เชื่อมต่อ Google Sheets API v4
              </h3>
              {settings.googleAccessToken ? (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={13} /> เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white font-bold flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-emerald-400" />
                  Google Spreadsheet รวมศูนย์ (แม็กนั่ม & มะนาว)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  บันทึกข้อมูลทุกอย่างของทั้งสองคนลงในไฟล์เดียวกัน พร้อมคอลัมน์ระบุชื่อคนกำกับทุกแถวอย่างชัดเจน
                </p>
              </div>
              <button
                type="button"
                onClick={openUnifiedSpreadsheet}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 active:scale-95 transition"
              >
                <span>เปิด Sheet รวม</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Google Login Button */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google OAuth Client ID (Web Application):
                </label>
                <input
                  type="text"
                  placeholder="เช่น 123456789-xxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  ลงชื่อเข้าใช้ด้วย Google (Sign in)
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await syncAllToGoogleSheets();
                    alert(res.message);
                  }}
                  disabled={isSyncing}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40"
                >
                  <Cloud size={15} />
                  {isSyncing ? 'กำลังซิงค์...' : 'สร้าง Sheet อัตโนมัติ / ซิงค์เดี๋ยวนี้'}
                </button>
              </div>
            </div>

            {/* Spreadsheet ID for unified spreadsheet */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google Spreadsheet ID รวม (ทั้งแม็กนั่ม & มะนาว):
              </label>
              <input
                type="text"
                placeholder="เช่น 1cBYIM2WiqqGHIJi8t_JiUF4py30g3CGgQhGWwKWH2_A"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Apps Script Web App URL */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Apps Script Web App URL (ทางเลือก: ซิงค์ลง Sheet โดยไม่ต้องขอ OAuth):
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                คัดลอกจาก Apps Script Project (ID: 1AzjOzJKjgrFqUehHtzhojd-_Im7mN3_sXHHKtosOmlJMsRs24Bl8_l0e) หลังกด Deploy
              </span>
            </div>
          </div>

          {/* Gemini AI Configuration Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              การตั้งค่า Gemini AI สำหรับวิเคราะห์อาหาร
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gemini API Key (ใช้งานส่วนตัวโดยตรง):
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                คีย์จะถูกบันทึกใน LocalStorage ของเบราว์เซอร์เครื่องคุณเท่านั้น ไม่มีการส่งไปเซิร์ฟเวอร์ภายนอก
              </span>
            </div>

            {/* Proxy URL configuration */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  หรือเรียกผ่าน Proxy (Cloudflare Worker / Google Apps Script):
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useProxy}
                    onChange={(e) => setUseProxy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {useProxy && (
                <input
                  type="text"
                  placeholder="https://my-gemini-proxy.workers.dev"
                  value={geminiProxy}
                  onChange={(e) => setGeminiProxy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>

          {/* Backup & Export JSON Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download size={18} className="text-sky-400" />
              สำรองข้อมูล (Export Backup)
            </h3>
            <p className="text-xs text-slate-400">
              ดาวน์โหลดประวัติการฝึกซ้อม น้ำหนัก และรายการอาหารทั้งหมดเป็นไฟล์ JSON เพื่อความปลอดภัย
            </p>
            <button
              onClick={handleExportData}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Download size={15} />
              ดาวน์โหลด JSON Backup
            </button>
          </div>
        </div>
      )}

      {/* Record Weight / Metric Modal */}
      {showMetricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="font-bold text-white text-base">บันทึกน้ำหนักตัว</h3>

            <form onSubmit={handleSaveMetric} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">วันที่ชั่ง</label>
                <input
                  type="date"
                  required
                  value={newMetricDate}
                  onChange={(e) => setNewMetricDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-400 mb-1">น้ำหนักตัว (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newMetricWeight}
                  onChange={(e) => setNewMetricWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="เช่น 16.5"
                    value={newMetricFat ?? ''}
                    onChange={(e) => setNewMetricFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">รอบเอว (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="เช่น 79"
                    value={newMetricWaist ?? ''}
                    onChange={(e) => setNewMetricWaist(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ชั่งตอนเช้าหลังตื่นนอน"
                  value={newMetricNote}
                  onChange={(e) => setNewMetricNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMetricModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
