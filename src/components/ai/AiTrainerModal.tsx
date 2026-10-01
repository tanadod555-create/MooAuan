import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { chatWithTrainer, TrainerContextData } from '../../services/gemini';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Flame,
  Dumbbell,
  RefreshCw,
  RotateCcw,
  Copy,
  Check,
  Footprints,
  Leaf,
} from 'lucide-react';
import { PigMascot } from '../ui/PigMascot';

interface AiTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiTrainerModal: React.FC<AiTrainerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const {
    activeProfileKey,
    primaryProfile,
    partnerProfile,
    allFoodLogs,
    allWorkoutHistory,
    allBodyMetrics,
    settings,
  } = useApp();

  const activeProfile = activeProfileKey === 'partner' ? partnerProfile : primaryProfile;
  const targetDate = selectedDate || new Date().toISOString().split('T')[0];

  // Daily context computation
  const todayLogs = (allFoodLogs || []).filter(
    (l) => l.date === targetDate && (l.user_id || 'primary') === activeProfileKey
  );

  const todayWorkouts = (allWorkoutHistory || []).filter(
    (s) => s.date === targetDate && (s.user_id || 'primary') === activeProfileKey
  );

  const latestMetric = (allBodyMetrics || [])
    .filter((m) => (m.user_id || 'primary') === activeProfileKey)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const totalKcal = todayLogs.reduce((acc, l) => acc + (l.kcal || 0), 0);
  const totalProtein = todayLogs.reduce((acc, l) => acc + (l.protein_g || 0), 0);
  const totalCarb = todayLogs.reduce((acc, l) => acc + (l.carb_g || 0), 0);
  const totalFat = todayLogs.reduce((acc, l) => acc + (l.fat_g || 0), 0);
  const totalFiber = todayLogs.reduce((acc, l) => acc + (l.fiber_g || 0), 0);

  const initialGreeting: Message = {
    id: 'msg_init',
    sender: 'assistant',
    text: `สวัสดีครับคุณ **${activeProfile.name}**! 🐷✨ โค้ชหมูอ้วน AI ประจำตัวของคุณพร้อมแล้วครับ!

วันนี้ผมเห็นข้อมูลของคุณแล้ว:
- 🍽️ **พลังงาน**: ทานไปแล้ว **${totalKcal} / ${activeProfile.kcal_target || 2000} kcal**
- 🥩 **โปรตีน**: **${totalProtein} / ${activeProfile.protein_target_g || 140} g**
- 🥦 **ไฟเบอร์**: **${totalFiber} g**
- 🏋️‍♂️ **การฝึกซ้อม**: ${
      todayWorkouts.length > 0
        ? `เสร็จสิ้น ${todayWorkouts.length} เซสชัน (${todayWorkouts.map((w) => w.program_name).join(', ')})`
        : 'ยังไม่ได้บันทึกเซสชันซ้อมวันนี้'
    }

มีอะไรให้โค้ชช่วยวิเคราะห์ แนะนำมื้อถัดไป หรือแนะนำเรื่องฟอร์มซ้อม/แก้อาการล้า ถามมาได้เลยนะหมูอ้วน! 🐽💪`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  if (!isOpen) return null;

  // Build context object
  const buildContext = (): TrainerContextData => {
    return {
      userName: activeProfile.name,
      goal: activeProfile.goal || 'สร้างกล้ามเนื้อ & รูปร่างกระชับ',
      weightKg: latestMetric?.weight_kg,
      kcalTarget: activeProfile.kcal_target || 2000,
      proteinTarget: activeProfile.protein_target_g || 140,
      carbTarget: activeProfile.carb_target_g || 240,
      fatTarget: activeProfile.fat_target_g || 60,
      todayKcal: totalKcal,
      todayProtein: totalProtein,
      todayCarb: totalCarb,
      todayFat: totalFat,
      todayFiber: totalFiber,
      todayMeals: todayLogs.map((l) => ({
        meal: l.meal,
        name: l.name,
        kcal: l.kcal,
        protein_g: l.protein_g,
        carb_g: l.carb_g,
        fat_g: l.fat_g,
        fiber_g: l.fiber_g,
      })),
      todayWorkouts: todayWorkouts.map((w) => ({
        programName: w.program_name || 'เซสชันการฝึก',
        durationMins: 60,
        sessionNote: w.note,
        exercises: (w.sets || []).reduce(
          (acc, set) => {
            let found = acc.find((e) => e.name === (set.exercise_name || set.exercise_id));
            if (!found) {
              found = {
                name: set.exercise_name || set.exercise_id,
                setsCount: 0,
                topWeightKg: 0,
                exerciseNote: set.note,
              };
              acc.push(found);
            }
            found.setsCount += 1;
            if (set.weight_kg > found.topWeightKg) {
              found.topWeightKg = set.weight_kg;
            }
            if (set.note && !found.exerciseNote) {
              found.exerciseNote = set.note;
            }
            return acc;
          },
          [] as Array<{
            name: string;
            setsCount: number;
            topWeightKg: number;
            exerciseNote?: string;
          }>
        ),
        cardio: w.cardio?.map((c) => ({
          machineName: c.machine_name,
          durationMinutes: c.duration_minutes,
          inclinePct: c.incline_pct,
          speedKmh: c.speed_kmh,
          note: c.note,
        })),
      })),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || loading) return;

    const userMsg: Message = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages
        .filter((m) => m.id !== 'msg_init')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));

      const context = buildContext();
      const reply = await chatWithTrainer({
        userMessage: messageContent,
        history,
        context,
        apiKey: settings.geminiApiKey,
      });

      const aiMsg: Message = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ อุ๊ย! เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถติดต่อ AI ได้'}\n\nกรุณาตรวจสอบว่าได้ตั้งค่า Gemini API Key หรือยังในเมนูการตั้งค่าครับ 🐽`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (confirm('ต้องการล้างประวัติการสนทนานี้และเริ่มใหม่ใช่หรือไม่?')) {
      setMessages([initialGreeting]);
    }
  };

  // Quick Action Prompts
  const quickPrompts = [
    {
      label: '🔍 วิเคราะห์ภาพรวมวันนี้',
      text: 'ช่วยวิเคราะห์ภาพรวมการกินโภชนาการและการฝึกซ้อมของฉันในวันนี้ให้หน่อย ว่ามีจุดไหนดีและมีจุดไหนควรปรับปรุงบ้าง',
    },
    {
      label: '🥗 มื้อถัดไปกินอะไรดี?',
      text: 'จากสารอาหารที่ฉันทานไปแล้ววันนี้ มื้อถัดไปฉันควรกินอะไรดีเพื่อให้โปรตีนและไฟเบอร์ถึงเป้า แนะนำเมนูอาหารไทยง่ายๆ หน่อย',
    },
    {
      label: '🩹 เจ็บ/ตึงกล้ามเนื้อ ซ้อมยังไง?',
      text: 'ถ้าวันนี้รู้สึกตึงหรือเจ็บข้อต่อ/กล้ามเนื้อ (เช่น หัวไหล่หรือข้อศอก) ในการซ้อมวันถัดไปฉันควรปรับโปรแกรมหรือวอร์มอัพอย่างไร?',
    },
    {
      label: '⛰️ แนะนำการเดินชันคาร์ดิโอ',
      text: 'แนะนำการตั้งความชัน สปีด และระยะเวลาในการเดินชันลู่วิ่งให้อยู่ในโซน 2 เผาผลาญไขมันดีที่สุดโดยไม่สูญเสียกล้ามเนื้อหน่อย',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl h-[92vh] max-h-[780px] bg-white rounded-3xl shadow-2xl border border-pink-200/90 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-pink-100 bg-gradient-to-r from-pink-100/90 via-rose-50/70 to-pink-100/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <PigMascot size="md" expression="cheer" className="drop-shadow-xs" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1">
                  โค้ชหมูอ้วน AI
                  <span className="text-[11px] font-bold text-rose-500 font-mono">
                    (Personal Trainer)
                  </span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {activeProfileKey === 'partner' ? '🌸 ของมะนาว (Manow)' : '🏋️‍♂️ ของแม็กนั่ม (Maxnum)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                วิเคราะห์การกิน ออกกำลังกาย และคำนวณสารอาหารเรียลไทม์ผ่าน Gemini API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition cursor-pointer"
              title="เริ่มบทสนทนาใหม่"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition cursor-pointer"
              title="ปิดหน้าต่างแชท"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Daily Metric Pill Strip */}
        <div className="px-3 py-2 bg-pink-50/60 border-b border-pink-100 flex items-center justify-between gap-2 overflow-x-auto text-[11px] scrollbar-none shrink-0 font-medium">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-slate-600">
              <Flame size={12} className="text-rose-500" />
              แคลอรี่: <strong className="font-mono text-rose-600">{totalKcal} / {activeProfile.kcal_target || 2000}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600">
              🥩 โปรตีน: <strong className="font-mono text-sky-700">{totalProtein} / {activeProfile.protein_target_g || 140}g</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Leaf size={11} className="text-emerald-600" />
              ไฟเบอร์: <strong className="font-mono text-emerald-700">{totalFiber}g</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {targetDate}
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-300 to-rose-300 p-0.5 shrink-0 self-start shadow-xs">
                    <PigMascot size="xs" expression="workout" className="w-full h-full" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-pink-200/80 rounded-tl-xs'
                  }`}
                >
                  {/* Message Content with simple Markdown rendering */}
                  <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <div key={i} className="flex items-start gap-1.5 ml-1">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{renderFormattedLine(line.substring(2))}</span>
                          </div>
                        );
                      }
                      return <p key={i}>{renderFormattedLine(line)}</p>;
                    })}
                  </div>

                  {/* Message Footer: Timestamp & Copy */}
                  <div
                    className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                      isUser
                        ? 'border-white/20 text-white/80'
                        : 'border-pink-100 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-rose-500 flex items-center gap-0.5 transition cursor-pointer"
                        title="คัดลอกข้อความนี้"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            <span className="text-emerald-500">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>คัดลอก</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shrink-0 self-start shadow-xs">
                    {activeProfileKey === 'partner' ? '🌸' : '🏋️'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-300 to-rose-300 p-0.5 shrink-0 self-start shadow-xs">
                <PigMascot size="xs" expression="eating" className="w-full h-full" />
              </div>
              <div className="bg-white border border-pink-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  โค้ชหมูอ้วนกำลังคิดและคำนวณข้อมูล... 🐽💭
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="p-2 border-t border-pink-100 bg-pink-50/30 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              disabled={loading}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white hover:bg-pink-100 text-slate-700 border border-pink-200/80 shrink-0 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-pink-100 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถาม หรือปรึกษาโค้ชหมูอ้วน เช่น วันนี้กินพอมั้ย? เจ็บไหล่เล่นอะไรแทนได้..."
              disabled={loading}
              className="flex-1 bg-pink-50/40 border border-pink-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send size={15} />
              <span className="hidden sm:inline">ส่ง</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Basic markdown parser helper for **bold** text
 */
function renderFormattedLine(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-black text-rose-600">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
