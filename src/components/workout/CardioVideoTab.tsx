import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { YoutubeWorkoutModal } from './YoutubeWorkoutModal';
import {
  Play,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Clock,
  Activity,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';
import { getUserAvatar } from '../../utils/mascotLevels';

export interface SavedCardioVideo {
  id: string;
  user_id: string; // 'primary' | 'partner' | 'all'
  title: string;
  channelName?: string;
  youtubeId: string | null;
  youtubeUrl: string;
  category: string;
  durationMinutes: number;
  caloriesKcal: number;
  intensity?: string;
  targetMuscles: string[];
  benefits: string[];
  coachingTips?: string;
  note?: string;
  createdAt: string;
}

const DEFAULT_MANOW_VIDEOS: SavedCardioVideo[] = [
  {
    id: 'manow_vdo_1',
    user_id: 'partner',
    title: '🌸 พิลาทิสปั้นร่อง 11 & เอวคอด (15 นาที)',
    channelName: 'Chloe Ting',
    youtubeId: '2pLT-ulgUGo',
    youtubeUrl: 'https://www.youtube.com/watch?v=2pLT-ulgUGo',
    category: 'Pilates / ร่อง 11',
    durationMinutes: 15,
    caloriesKcal: 110,
    intensity: 'ปานกลาง (Moderate)',
    targetMuscles: ['หน้าท้องส่วนกลาง', 'ร่อง 11 (Line 11 Abs)', 'กล้ามเนื้อแกนกลางลำตัว'],
    benefits: ['ปั้นร่อง 11 ชัดเจน', 'กระชับเอวคอด', 'ไม่ปวดหลัง'],
    coachingTips: 'เกร็งหน้าท้องแนบกับพื้นตลอดเวลา หายใจออกตอนออกแรง',
    note: 'คลิปโปรดของน้องมะนาว ปั้นร่อง 11 ไวมาก',
    createdAt: '2026-10-01',
  },
  {
    id: 'manow_vdo_2',
    user_id: 'partner',
    title: '🔥 Dance Cardio K-Pop เบิร์นไขมัน สนุกสุดเหวี่ยง',
    channelName: 'Fit Dance Life',
    youtubeId: 'gC_L9qAHVJ8',
    youtubeUrl: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8',
    category: 'Dance Cardio',
    durationMinutes: 20,
    caloriesKcal: 170,
    intensity: 'สนุกสนาน เผาผลาญสูง',
    targetMuscles: ['กล้ามเนื้อทั่วร่างกาย', 'หัวใจและปอด (Cardio)'],
    benefits: ['เผาผลาญไขมันทั่วร่าง', 'สนุกไม่น่าเบื่อ', 'เพิ่มความคล่องตัว'],
    coachingTips: 'ขยับสะโพกและเกร็งหน้าท้องตามจังหวะเพลง ไม่ต้องกดดันตัวเอง',
    note: 'เต้นตามเพลง เผาผลาญดีมาก',
    createdAt: '2026-10-02',
  },
  {
    id: 'manow_vdo_3',
    user_id: 'partner',
    title: '🍑 ปั้นก้นกลมเด้ง & ต้นขากระชับ แบบไม่กระโดด',
    channelName: 'Daisy Keech',
    youtubeId: 'i1ZzdBgPBZg',
    youtubeUrl: 'https://www.youtube.com/watch?v=i1ZzdBgPBZg',
    category: 'Glutes & Legs Toning',
    durationMinutes: 15,
    caloriesKcal: 130,
    intensity: 'ปานกลาง (โฟกัสสะโพก)',
    targetMuscles: ['กล้ามเนื้อบั้นท้าย (Glutes)', 'ต้นขาด้านหลัง (Hamstrings)'],
    benefits: ['ปั้นก้นกลมเด้ง', 'กระชับต้นขา', 'ไม่กระแทกเข่า'],
    coachingTips: 'ดันส้นเท้าเป็นหลักตอนออกแรง บีบก้นค้างไว้ 1 วินาทีที่จุดสูงสุด',
    note: 'เน้นก้น ไม่ปวดเข่า',
    createdAt: '2026-10-03',
  },
  {
    id: 'manow_vdo_4',
    user_id: 'partner',
    title: '🧘 ยืดเหยียดผ่อนคลาย คลายกล้ามเนื้อ & แก้ออฟฟิศซินโดรม',
    channelName: 'Yoga with Adriene',
    youtubeId: 'g_tea8ZNk5A',
    youtubeUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
    category: 'Yoga / Stretches',
    durationMinutes: 20,
    caloriesKcal: 70,
    intensity: 'เบา ผ่อนคลาย',
    targetMuscles: ['คอ บ่า ไหล่', 'สะโพกและหลัง'],
    benefits: ['คลายปวดเมื่อย', 'แก้ออฟฟิศซินโดรม', 'หลับสบาย'],
    coachingTips: 'หายใจเข้าลึกๆ ทางจมูก ค่อยๆ ปล่อยลมหายใจออกผ่อนคลายกล้ามเนื้อ',
    note: 'ยืดเหยียดก่อนนอน หรือหลังออกกำลังกาย',
    createdAt: '2026-10-04',
  },
];

const DEFAULT_MAGNUM_VIDEOS: SavedCardioVideo[] = [
  {
    id: 'magnum_vdo_1',
    user_id: 'primary',
    title: '⚡ 20 Min Intense HIIT Fat Burner No Equipment',
    channelName: 'THENX',
    youtubeId: 'ml6cT4AZdqI',
    youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    category: 'HIIT Cardio',
    durationMinutes: 20,
    caloriesKcal: 220,
    intensity: 'หนักหน่วง (High Intensity)',
    targetMuscles: ['หัวใจและหลอดเลือด', 'กล้ามเนื้อทั่วร่าง', 'แกนกลางลำตัว'],
    benefits: ['เบิร์นไขมันเร่งด่วน', 'เพิ่มความอึดและพลังระเบิด (VO2 Max)'],
    coachingTips: 'ใส่เต็มแรงในช่วง Interval และหายใจคุมจังหวะช่วงพัก',
    note: 'HIIT เบิร์นไขมันวันพักเวท',
    createdAt: '2026-10-01',
  },
  {
    id: 'magnum_vdo_2',
    user_id: 'primary',
    title: '🔥 10 Min Sixpack Abs Workout - Brutal Core Routine',
    channelName: 'Chris Heria',
    youtubeId: 'DHD1-2P94DI',
    youtubeUrl: 'https://www.youtube.com/watch?v=DHD1-2P94DI',
    category: 'Core & Abs',
    durationMinutes: 10,
    caloriesKcal: 90,
    intensity: 'หนักปานกลาง',
    targetMuscles: ['กล้ามเนื้อหน้าท้องรวม', 'Upper/Lower Abs', 'Obliques'],
    benefits: ['หน้าท้องชัด ซิกแพ็กแน่น', 'เพิ่มความแข็งแรงให้แกนกลางลำตัว'],
    coachingTips: 'โฟกัสที่การม้วนลำตัว ไม่ใช้แรงดึงคอ',
    note: 'เก็บหน้าท้องหลังเวทเสร็จ',
    createdAt: '2026-10-02',
  },
];

interface CardioVideoTabProps {
  onStartLiveSession: (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => void;
  onSaveFinishedSession: (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => Promise<void>;
}

export const CardioVideoTab: React.FC<CardioVideoTabProps> = ({
  onStartLiveSession,
  onSaveFinishedSession,
}) => {
  const { activeProfileKey, primaryProfile, partnerProfile } = useApp();
  const currentProfile = activeProfileKey === 'partner' ? partnerProfile : primaryProfile;
  const isPartner = activeProfileKey === 'partner';

  // Saved Videos Storage State
  const [videoLibrary, setVideoLibrary] = useState<SavedCardioVideo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mooauan_cardio_videos_library');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [...DEFAULT_MANOW_VIDEOS, ...DEFAULT_MAGNUM_VIDEOS];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mooauan_cardio_videos_library', JSON.stringify(videoLibrary));
    }
  }, [videoLibrary]);

  const [filterScope, setFilterScope] = useState<'mine' | 'all'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [quickSaveFeedback, setQuickSaveFeedback] = useState<string | null>(null);

  // Filter videos based on current user / scope / search
  const displayedVideos = videoLibrary.filter((vdo) => {
    // Scope filter
    if (filterScope === 'mine') {
      if (vdo.user_id !== activeProfileKey && vdo.user_id !== 'all') {
        return false;
      }
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = vdo.title.toLowerCase().includes(q);
      const matchCat = (vdo.category || '').toLowerCase().includes(q);
      const matchNote = (vdo.note || '').toLowerCase().includes(q);
      const matchMuscles = vdo.targetMuscles.some((m) => m.toLowerCase().includes(q));
      return matchTitle || matchCat || matchNote || matchMuscles;
    }
    return true;
  });

  // Add new video to library from Youtube modal
  const handleAddNewVideoFromModal = (data: {
    title: string;
    youtubeId: string | null;
    youtubeUrl: string;
    durationMinutes: number;
    caloriesKcal: number;
    targetMuscles: string[];
    benefits: string[];
    note: string;
  }) => {
    const newVideo: SavedCardioVideo = {
      id: 'vdo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: activeProfileKey,
      title: data.title,
      youtubeId: data.youtubeId,
      youtubeUrl: data.youtubeUrl,
      category: data.title.includes('เต้น')
        ? 'Dance Cardio'
        : data.title.includes('ร่อง 11')
        ? 'Pilates / Core'
        : 'Cardio Workout',
      durationMinutes: data.durationMinutes,
      caloriesKcal: data.caloriesKcal,
      targetMuscles: data.targetMuscles,
      benefits: data.benefits,
      note: data.note,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setVideoLibrary((prev) => [newVideo, ...prev]);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบคลิป "${title}" ออกจากคลังวิดีโอใช่หรือไม่?`)) {
      setVideoLibrary((prev) => prev.filter((v) => v.id !== id));
      if (playingVideoId === id) setPlayingVideoId(null);
    }
  };

  const handleQuickLog = async (vdo: SavedCardioVideo) => {
    try {
      await onSaveFinishedSession({
        title: vdo.title,
        youtubeId: vdo.youtubeId,
        youtubeUrl: vdo.youtubeUrl,
        durationMinutes: vdo.durationMinutes,
        caloriesKcal: vdo.caloriesKcal,
        targetMuscles: vdo.targetMuscles,
        benefits: vdo.benefits,
        note: vdo.note || `คลิป: ${vdo.title}`,
      });
      setQuickSaveFeedback(`✅ บันทึก "${vdo.title}" สำเร็จแล้ว!`);
      setTimeout(() => setQuickSaveFeedback(null), 3000);
    } catch (e) {
      console.error('Quick log error:', e);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toast Feedback */}
      {quickSaveFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-slideDown">
          <CheckCircle2 size={16} />
          <span>{quickSaveFeedback}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border-2 relative overflow-hidden transition-all duration-300 ${
          isPartner
            ? 'bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100/70 border-pink-200 shadow-[0_6px_0_#fecdd3]'
            : 'bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100/70 border-sky-200 shadow-[0_6px_0_#bae6fd]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={getUserAvatar(activeProfileKey)}
              alt={currentProfile.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-500 text-white shadow-xs flex items-center gap-1">
                  <span>▶</span> Cardio VDO Library
                </span>
                <span className="text-xs font-bold text-slate-700">
                  สำหรับ {currentProfile.name} {isPartner ? '🌸' : '🏋️‍♂️'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                คลังคลิปออกกำลังกาย YouTube ส่วนตัว เล่นตามสดๆ หรือกดบันทึกย้อนหลังได้ทันที!
              </p>
            </div>
          </div>

          {/* Add Video Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-200/50 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>+ เพิ่มคลิปใหม่ (AI วิเคราะห์)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Scope Switcher */}
        <div className="flex items-center p-1 bg-zinc-200/60 backdrop-blur-md rounded-full max-w-xs shadow-inner border border-black/[0.04]">
          <button
            type="button"
            onClick={() => setFilterScope('mine')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterScope === 'mine'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{isPartner ? '🌸 ของมะนาว' : '🏋️‍♂️ ของแม็กนั่ม'}</span>
            <span className="text-[10px] ml-1 opacity-70 font-mono">
              ({videoLibrary.filter((v) => v.user_id === activeProfileKey || v.user_id === 'all').length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterScope('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterScope === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className="text-[10px] ml-1 opacity-70 font-mono">({videoLibrary.length})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาคลิป (เช่น ร่อง 11, ก้น, dance, HIIT)..."
            className="w-full pl-8 pr-8 py-2 bg-white border border-pink-200/80 rounded-2xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-400 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Video Cards Grid */}
      {displayedVideos.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-pink-200 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-red-500 mx-auto flex items-center justify-center font-black text-xl">
            🎬
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800">
              {searchQuery ? `ไม่พบคลิปที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีคลิปออกกำลังกายในคลัง'}
            </h4>
            <p className="text-xs text-slate-500">
              กดปุ่ม "+ เพิ่มคลิปใหม่" ด้านบนเพื่อแปะลิงก์ YouTube แล้วให้ AI วิเคราะห์สัดส่วนและแคลอรี่อัตโนมัติ
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition cursor-pointer"
          >
            + เพิ่มคลิปแรกเลย
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedVideos.map((vdo) => {
            const isPlaying = playingVideoId === vdo.id;

            return (
              <div
                key={vdo.id}
                className="bg-white/95 border border-pink-200/90 hover:border-pink-300 rounded-3xl p-4 sm:p-5 shadow-xs transition flex flex-col justify-between space-y-3 group"
              >
                {/* Card Top / Header */}
                <div className="space-y-2.5">
                  {/* Tags Bar */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                        📺 {vdo.category}
                      </span>
                      {vdo.user_id !== 'all' && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            vdo.user_id === 'partner'
                              ? 'bg-pink-50 text-pink-700 border-pink-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {vdo.user_id === 'partner' ? '🌸 มะนาว' : '🏋️‍♂️ แม็กนั่ม'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {vdo.youtubeUrl && (
                        <a
                          href={vdo.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="เปิดในแอป YouTube"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(vdo.id, vdo.title)}
                        className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                        title="ลบคลิปนี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                    {vdo.title}
                  </h4>

                  {/* YouTube Player or Embed Toggle */}
                  {isPlaying && vdo.youtubeId ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video w-full shadow-md animate-fadeIn">
                      <iframe
                        src={`https://www.youtube.com/embed/${vdo.youtubeId}?autoplay=1&rel=0`}
                        title={vdo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    vdo.youtubeId && (
                      <div
                        onClick={() => setPlayingVideoId(vdo.id)}
                        className="relative rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 cursor-pointer group/thumb border border-pink-100 shadow-2xs"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${vdo.youtubeId}/hqdefault.jpg`}
                          alt={vdo.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300 opacity-90 group-hover/thumb:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition active:scale-95 pl-0.5">
                            <Play size={20} fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                          {vdo.durationMinutes} น.
                        </div>
                      </div>
                    )
                  )}

                  {/* Quick Metric Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-800 flex items-center gap-1">
                        <Clock size={12} className="text-sky-500" /> ระยะเวลา
                      </span>
                      <span className="text-xs font-black text-sky-950 font-mono">
                        {vdo.durationMinutes} นาที
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-orange-50/80 border border-orange-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-800 flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" /> เผาผลาญ
                      </span>
                      <span className="text-xs font-black text-orange-950 font-mono">
                        ~{vdo.caloriesKcal} kcal
                      </span>
                    </div>
                  </div>

                  {/* Target Muscles Chips */}
                  {vdo.targetMuscles && vdo.targetMuscles.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        เน้นโฟกัส:
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {vdo.targetMuscles.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200/80"
                          >
                            ✨ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {vdo.benefits && vdo.benefits.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <Award size={12} className="text-emerald-600" /> สิ่งที่ได้จากคลิปนี้:
                      </div>
                      <p className="text-[11px] text-emerald-950 font-medium leading-relaxed">
                        {vdo.benefits.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Note */}
                  {vdo.note && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                      📝 {vdo.note}
                    </p>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-pink-100 grid grid-cols-2 gap-2">
                  {/* 1. Start Live Session */}
                  <button
                    type="button"
                    onClick={() => {
                      onStartLiveSession({
                        title: vdo.title,
                        youtubeId: vdo.youtubeId,
                        youtubeUrl: vdo.youtubeUrl,
                        durationMinutes: vdo.durationMinutes,
                        caloriesKcal: vdo.caloriesKcal,
                        targetMuscles: vdo.targetMuscles,
                        benefits: vdo.benefits,
                        note: vdo.note || `คลิป: ${vdo.title}`,
                      });
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>เริ่มเล่นสด (Live)</span>
                  </button>

                  {/* 2. Quick Log Finished Session */}
                  <button
                    type="button"
                    onClick={() => handleQuickLog(vdo)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 font-black text-xs flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>บันทึกว่าเล่นแล้ว</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YouTube Add / Analysis Modal */}
      {showAddModal && (
        <YoutubeWorkoutModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          selectedUserKey={activeProfileKey}
          onStartLiveSession={(data) => {
            handleAddNewVideoFromModal(data);
            onStartLiveSession(data);
          }}
          onSaveFinishedSession={async (data) => {
            handleAddNewVideoFromModal(data);
            await onSaveFinishedSession(data);
          }}
        />
      )}
    </div>
  );
};
