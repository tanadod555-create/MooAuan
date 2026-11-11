import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, MealType, FoodLog } from '../types';
import { getDefaultGeminiApiKey } from '../services/gemini';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Camera,
  Bot,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Check,
  Upload,
  Settings,
  MessageCircle,
  ExternalLink,
  Edit2,
  AlertCircle,
  Flame,
  Search,
} from 'lucide-react';
import { getUserAvatar } from '../utils/mascotLevels';

// ========================================================
// CATEGORIES: EXPENSE vs INCOME
// ========================================================
export const EXPENSE_CATEGORIES = [
  { id: 'exp-1', name: 'อาหารและเครื่องดื่ม', icon: '🍜', color: '#ff6584' },
  { id: 'exp-2', name: 'ของใช้ & ช้อปปิ้ง', icon: '🛍️', color: '#ec4899' },
  { id: 'exp-3', name: 'เดินทาง / น้ำมัน', icon: '🚗', color: '#38bdf8' },
  { id: 'exp-4', name: 'บิล & ค่าน้ำค่าไฟ', icon: '💡', color: '#a855f7' },
  { id: 'exp-5', name: 'สุขภาพ / ยา / คลินิก', icon: '💊', color: '#10b981' },
  { id: 'exp-6', name: 'บันเทิง & สังสรรค์', icon: '🎮', color: '#6366f1' },
  { id: 'exp-7', name: 'ค่าใช้จ่ายอื่นๆ', icon: '📦', color: '#64748b' },
];

export const INCOME_CATEGORIES = [
  { id: 'inc-1', name: 'เงินเดือนประจำ', icon: '💰', color: '#10b981' },
  { id: 'inc-2', name: 'ธุรกิจ / ค้าขาย / กำไร', icon: '💼', color: '#059669' },
  { id: 'inc-3', name: 'โบนัส & คอมมิชชั่น', icon: '🎁', color: '#f59e0b' },
  { id: 'inc-4', name: 'รับโอนเงิน / เพื่อนคืน', icon: '💸', color: '#3b82f6' },
  { id: 'inc-5', name: 'เงินปันผล & ดอกเบี้ย', icon: '📈', color: '#8b5cf6' },
  { id: 'inc-6', name: 'รายรับพิเศษ / อื่นๆ', icon: '🪙', color: '#64748b' },
];

export function getCategoryInfo(name: string, type: TransactionType = 'EXPENSE') {
  const list = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find((c) => c.name === name);
  if (found) return found;
  return { id: 'unknown', name, icon: type === 'INCOME' ? '💰' : '🛍️', color: '#64748b' };
}

interface BatchSlipItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'scanning' | 'done' | 'error';
  errorMessage?: string;
  parsedData?: {
    bank: string;
    merchant: string;
    amount: number;
    datetime: string;
    slipRef: string;
    suggestedCategory: string;
    type: TransactionType;
    note: string;
  };
}

export const SetthiMooAuanView: React.FC = () => {
  const {
    transactions,
    allTransactions,
    addTransaction,
    deleteTransaction,
    activeProfileKey,
    setActiveProfileKey,
    currentProfile,
    isSpecialPair,
    setActiveWorld,
    addFoodLog,
    settings,
    updateSettings,
  } = useApp();

  const isMaxnum = activeProfileKey === 'primary';
  const effectiveGeminiKey = settings.geminiApiKey || getDefaultGeminiApiKey();

  // Sub-tabs in Setthi MooAuan: 'home' | 'scanner' | 'ai_chat' | 'stats'
  const [subTab, setSubTab] = useState<'home' | 'scanner' | 'ai_chat' | 'stats'>('home');

  // Selected Date Filter (Defaults to Today)
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Quick AI Chat input
  const [aiInputText, setAiInputText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('EXPENSE');
  const [addAmount, setAddAmount] = useState<string>('');
  const [addCategory, setAddCategory] = useState<string>('อาหารและเครื่องดื่ม');
  const [addMerchant, setAddMerchant] = useState<string>('');
  const [addWallet, setAddWallet] = useState<string>('KBank');
  const [addNote, setAddNote] = useState<string>('');
  const [addDate, setAddDate] = useState<string>(today);
  const [addTime, setAddTime] = useState<string>(
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  );
  // Dual-Log Cross-link toggle
  const [alsoLogFood, setAlsoLogFood] = useState(false);
  const [foodMeal, setFoodMeal] = useState<MealType>('lunch');
  const [foodKcal, setFoodKcal] = useState<number>(450);

  // Multi-Image Batch Slip Scanner State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batchSlips, setBatchSlips] = useState<BatchSlipItem[]>([]);
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [currentScanIndex, setCurrentScanIndex] = useState(0);

  // Stats Mode: 'EXPENSE' | 'INCOME' | 'COMPARE'
  const [statsViewMode, setStatsViewMode] = useState<'EXPENSE' | 'INCOME' | 'COMPARE'>('EXPENSE');

  // Monthly Calculations
  const now = new Date(selectedDate);
  const currentMonthPrefix = selectedDate.substring(0, 7); // YYYY-MM

  const monthTxns = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  const todayTxns = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const monthExpense = useMemo(() => {
    return monthTxns.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTxns]);

  const monthIncome = useMemo(() => {
    return monthTxns.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTxns]);

  const todayExpense = useMemo(() => {
    return todayTxns.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  }, [todayTxns]);

  const todayIncome = useMemo(() => {
    return todayTxns.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  }, [todayTxns]);

  // Daily Benchmark: 800 THB/day recommended
  const DAILY_BENCHMARK = 800;

  // Monthly Budget Target
  const monthlyBudget = 25000;
  const remainingBudget = monthlyBudget - monthExpense;

  // Category breakdown for Donut Chart
  const expenseCatData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxns
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: monthExpense > 0 ? Math.round((amount / monthExpense) * 100) : 0,
        meta: getCategoryInfo(name, 'EXPENSE'),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxns, monthExpense]);

  const incomeCatData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxns
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: monthIncome > 0 ? Math.round((amount / monthIncome) * 100) : 0,
        meta: getCategoryInfo(name, 'INCOME'),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxns, monthIncome]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Local Regex fallback for AI Chat if offline
  const localRegexParse = (text: string) => {
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 50;
    const isIncome = /ได้|รับ|เงินเดือน|โบนัส|ขายได้|คืนเงิน/i.test(text);
    const type: TransactionType = isIncome ? 'INCOME' : 'EXPENSE';

    let category = isIncome ? 'รายรับพิเศษ / อื่นๆ' : 'ค่าใช้จ่ายอื่นๆ';
    let merchant = text.replace(/(\d+(?:\.\d+)?)/g, '').replace(/(บาท|บ\.|บ|thb)/gi, '').trim();
    merchant = merchant.replace(/^(กิน|ซื้อ|จ่าย|เติม|ได้|รับ)/g, '').trim() || (isIncome ? 'รายรับ' : 'ค่าใช้จ่าย');

    if (type === 'EXPENSE') {
      if (/(น้ำมัน|bts|mrt|แท็กซี่|วิน|รถเมล์|ทางด่วน|เดินทาง|ค่ารถ|grab|bolt)/i.test(text)) {
        category = 'เดินทาง / น้ำมัน';
      } else if (/(ค่าน้ำ|ค่าไฟ|ค่าเน็ต|บิล|ค่าห้อง|ค่าเช่า|ค่าโทรศัพท์)/i.test(text)) {
        category = 'บิล & ค่าน้ำค่าไฟ';
      } else if (/(ยา|หมอ|คลินิก|โรงพยาบาล|วิตามิน|หาหมอ)/i.test(text)) {
        category = 'สุขภาพ / ยา / คลินิก';
      } else if (/(ของใช้|เซเว่น|shopee|lazada|ช้อป|เสื้อ|กางเกง|ของเล่น|ครีม)/i.test(text)) {
        category = 'ของใช้ & ช้อปปิ้ง';
      } else if (/(ข้าว|อาหาร|กะเพรา|ก๋วยเตี๋ยว|กาแฟ|ชา|หมูกระทะ|ส้มตำ|ขนม|เค้ก|เบเกอรี่|กิน|เครื่องดื่ม)/i.test(text)) {
        category = 'อาหารและเครื่องดื่ม';
      }
    } else {
      if (/เงินเดือน/i.test(text)) category = 'เงินเดือนประจำ';
      else if (/ธุรกิจ|ขายของ|กำไร/i.test(text)) category = 'ธุรกิจ / ค้าขาย / กำไร';
      else if (/โบนัส/i.test(text)) category = 'โบนัส & คอมมิชชั่น';
    }

    return {
      type,
      amount,
      merchant,
      category,
      wallet: 'เงินสด',
      note: '',
      replyMessage: `หมูอ้วนช่วยจด ${merchant} ${amount.toLocaleString()} บาท เรียบร้อยแล้วน้า อู๊ดๆ! 🐷✨`,
    };
  };

  // Submit AI message to parse and auto-record
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInputText.trim() || isAiProcessing) return;

    setIsAiProcessing(true);
    setAiFeedback(null);
    const text = aiInputText.trim();
    setAiInputText('');

    try {
      let parsed: any = null;

      if (effectiveGeminiKey) {
        const prompt = `
คุณคือ "หมูอ้วนช่วยจด" 🐷 ผู้ช่วยอัจฉริยะด้านการเงินและจดบันทึกรายรับรายจ่ายของแอป "เศรษฐีหมูอ้วน"
ผู้ใช้พิมพ์ข้อความมา: "${text}"

วิเคราะห์และตอบกลับเป็น JSON Object เท่านั้น:
{
  "isTransaction": true,
  "type": "EXPENSE",
  "amount": 0.0,
  "merchant": "ชื่อรายการ/ร้านค้า",
  "category": "เลือก 1 ชื่อหมวดหมู่ที่เหมาะสมที่สุด",
  "wallet": "เงินสด",
  "note": "",
  "replyMessage": "ข้อความตอบกลับน่ารัก กวนๆ อู๊ดๆ 🐷"
}
`;
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveGeminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) parsed = JSON.parse(raw.trim());
        }
      }

      if (!parsed) {
        parsed = localRegexParse(text);
      }

      if (parsed.isTransaction !== false && parsed.amount > 0) {
        const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        await addTransaction({
          user_id: activeProfileKey,
          user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
          date: selectedDate,
          time: nowTime,
          type: parsed.type || 'EXPENSE',
          category: parsed.category || 'อาหารและเครื่องดื่ม',
          amount: Number(parsed.amount),
          wallet: parsed.wallet || 'เงินสด',
          merchant: parsed.merchant || 'รายการจดด่วน',
          note: parsed.note || '',
        });

        setAiFeedback({
          message: parsed.replyMessage || `บันทึก ${parsed.merchant} ฿${parsed.amount} เรียบร้อยแล้ว! 🐷`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      // Fallback
      const fallback = localRegexParse(text);
      const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      await addTransaction({
        user_id: activeProfileKey,
        user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
        date: selectedDate,
        time: nowTime,
        type: fallback.type,
        category: fallback.category,
        amount: fallback.amount,
        wallet: fallback.wallet,
        merchant: fallback.merchant,
        note: fallback.note,
      });
      setAiFeedback({ message: fallback.replyMessage, type: 'success' });
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle Manual Save
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (!amt || isNaN(amt) || amt <= 0) return;

    let foodId: string | undefined = undefined;

    // Dual-log to food if requested
    if (alsoLogFood && addType === 'EXPENSE') {
      foodId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await addFoodLog({
        date: addDate,
        time: addTime,
        meal: foodMeal,
        name: addMerchant.trim() || 'มื้ออาหาร',
        grams: 200,
        kcal: Number(foodKcal) || 450,
        protein_g: 20,
        carb_g: 45,
        fat_g: 12,
        source: 'manual',
        price_thb: amt,
        payment_channel: addWallet,
        note: 'บันทึกพร้อมรายจ่ายจากเศรษฐีหมูอ้วน',
      });
    }

    await addTransaction({
      user_id: activeProfileKey,
      user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
      date: addDate,
      time: addTime,
      type: addType,
      category: addCategory,
      amount: amt,
      wallet: addWallet,
      merchant: addMerchant.trim() || (addType === 'INCOME' ? 'รายรับ' : 'ค่าใช้จ่าย'),
      note: addNote.trim(),
      linked_food_log_id: foodId,
      food_kcal: alsoLogFood ? foodKcal : undefined,
    });

    setShowAddModal(false);
    setAddAmount('');
    setAddMerchant('');
    setAddNote('');
    setAlsoLogFood(false);
  };

  // Multi-Image Batch Slip Picker
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchSlipItem[] = Array.from(files).map((f) => ({
      id: `slip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'pending',
    }));

    setBatchSlips((prev) => [...prev, ...newItems]);
    setSubTab('scanner');
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process Batch Slips one by one with Gemini
  const handleStartBatchScan = async () => {
    if (batchSlips.length === 0 || isBatchScanning) return;
    setIsBatchScanning(true);

    for (let i = 0; i < batchSlips.length; i++) {
      const item = batchSlips[i];
      if (item.status === 'done') continue;

      setCurrentScanIndex(i + 1);

      // Update status to scanning
      setBatchSlips((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'scanning' } : s))
      );

      try {
        const base64Data = await fileToBase64(item.file);
        const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

        const prompt = `
วิเคราะห์ภาพสลิปโอนเงินธนาคารไทย หรือใบเสร็จร้านค้า ตอบกลับเป็น JSON เท่านั้น:
{
  "bank": "ชื่อธนาคาร เช่น KBank, SCB, PromptPay, TrueMoney",
  "merchant": "ชื่อผู้รับเงิน หรือชื่อร้านค้า",
  "amount": 0.00,
  "datetime": "YYYY-MM-DD HH:mm",
  "slipRef": "เลขอ้างอิงสลิป",
  "suggestedCategory": "เลือก 1 ชื่อหมวดหมู่: [อาหารและเครื่องดื่ม, เดินทาง / น้ำมัน, ของใช้ & ช้อปปิ้ง, บิล & ค่าน้ำค่าไฟ, สุขภาพ / ยา / คลินิก, บันเทิง & สังสรรค์, ค่าใช้จ่ายอื่นๆ]",
  "type": "EXPENSE",
  "note": "บันทึกช่วยจำในสลิป"
}
`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveGeminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: item.file.type || 'image/jpeg',
                        data: cleanBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(rawJson.trim());

        setBatchSlips((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: 'done',
                  parsedData: {
                    bank: parsed.bank || 'KBank',
                    merchant: parsed.merchant || 'สลิปโอนเงิน',
                    amount: Number(parsed.amount) || 0,
                    datetime: parsed.datetime || new Date().toISOString().replace('T', ' ').substring(0, 16),
                    slipRef: parsed.slipRef || '',
                    suggestedCategory: parsed.suggestedCategory || 'อาหารและเครื่องดื่ม',
                    type: parsed.type || 'EXPENSE',
                    note: parsed.note || '',
                  },
                }
              : s
          )
        );
      } catch (err: any) {
        console.error('Error scanning slip item:', err);
        setBatchSlips((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: 'error',
                  errorMessage: err.message || 'สแกนไม่สำเร็จ กรุณากรอกเอง',
                }
              : s
          )
        );
      }
    }

    setIsBatchScanning(false);
  };

  // Confirm and Save All Batch Slips
  const handleSaveAllBatchSlips = async () => {
    const readyItems = batchSlips.filter((s) => s.status === 'done' && s.parsedData);
    if (readyItems.length === 0) return;

    for (const item of readyItems) {
      const data = item.parsedData!;
      const dateParts = data.datetime.split(' ');
      const slipDate = dateParts[0] || selectedDate;
      const slipTime = dateParts[1] || '12:00';

      await addTransaction({
        user_id: activeProfileKey,
        user_name: isMaxnum ? 'แม็กนั่ม (Maxnum)' : 'มะนาว (Manow)',
        date: slipDate,
        time: slipTime,
        type: data.type || 'EXPENSE',
        category: data.suggestedCategory || 'อาหารและเครื่องดื่ม',
        amount: Number(data.amount) || 0,
        wallet: data.bank || 'KBank',
        merchant: data.merchant || 'สลิปโอนเงิน',
        note: data.note || '',
        slipRef: data.slipRef,
      });
    }

    setBatchSlips([]);
    setSubTab('home');
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn max-w-4xl mx-auto">
      {/* Hidden File Input for Batch Slips */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Top Banner & Mascot Greeting */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between gap-4 shadow-sm ${
          isMaxnum
            ? 'bg-gradient-to-r from-sky-50 via-white to-blue-50/50 border-sky-200 shadow-sky-100/50'
            : 'bg-gradient-to-r from-pink-50 via-white to-rose-50/50 border-pink-200 shadow-pink-100/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm shrink-0 bg-white flex items-center justify-center text-3xl animate-bounce-gentle ${
              isMaxnum ? 'border-sky-300' : 'border-pink-300'
            }`}
          >
            🐷💰
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                เศรษฐีหมูอ้วน 🐷💰
              </h2>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                  isMaxnum ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-pink-100 text-pink-800 border-pink-300'
                }`}
              >
                {isMaxnum ? 'กระเป๋าแม็กนั่ม 🏋️' : 'กระเป๋ามะนาว 🌸'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              บันทึกรายรับ-รายจ่าย สแกนสลิป และบริหารงบประมาณ
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Pills */}
      <div className="flex items-center p-1 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 shadow-2xs gap-1">
        <button
          onClick={() => setSubTab('home')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'home'
              ? isMaxnum
                ? 'bg-sky-400 text-white shadow-xs'
                : 'bg-pink-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🏠 ภาพรวม</span>
        </button>

        <button
          onClick={() => setSubTab('scanner')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'scanner'
              ? isMaxnum
                ? 'bg-sky-400 text-white shadow-xs'
                : 'bg-pink-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera size={14} />
          <span>สแกนสลิป</span>
          {batchSlips.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {batchSlips.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('ai_chat')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'ai_chat'
              ? isMaxnum
                ? 'bg-sky-400 text-white shadow-xs'
                : 'bg-pink-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot size={14} />
          <span>หมูอ้วนช่วยจด</span>
        </button>

        <button
          onClick={() => setSubTab('stats')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'stats'
              ? isMaxnum
                ? 'bg-sky-400 text-white shadow-xs'
                : 'bg-pink-400 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart size={14} />
          <span>สถิติ & ดอนัท</span>
        </button>
      </div>

      {/* SUBTAB CONTENT: HOME */}
      {subTab === 'home' && (
        <div className="space-y-5">
          {/* Daily & Monthly Financial Summary Card */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
            {/* Top Month Indicator */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                  สรุปรายรับ-รายจ่าย
                </span>
                <h3 className="text-base font-black text-slate-800">
                  {now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className={`py-2 px-4 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isMaxnum ? 'btn-candy-blue' : 'btn-candy-pink'
                }`}
              >
                <Plus size={14} className="stroke-[3]" />
                <span>+ จดรายการใหม่</span>
              </button>
            </div>

            {/* 3 Columns Monthly Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-700 block">รายรับเดือนนี้</span>
                <span className="text-sm sm:text-base font-mono font-black text-emerald-600 block mt-0.5">
                  +฿{monthIncome.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                <span className="text-[10px] font-bold text-rose-700 block">รายจ่ายสะสม</span>
                <span className="text-sm sm:text-base font-mono font-black text-rose-500 block mt-0.5">
                  -฿{monthExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-bold text-amber-700 block">คงเหลืองบ</span>
                <span className={`text-sm sm:text-base font-mono font-black block mt-0.5 ${
                  remainingBudget < 0 ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  ฿{remainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Daily Benchmark Meter (เกณฑ์รายวัน) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">เกณฑ์ค่าใช้จ่ายวันนี้ (เป้า ฿{DAILY_BENCHMARK})</span>
                  <span className={`font-mono ${todayExpense > DAILY_BENCHMARK ? 'text-rose-600' : 'text-slate-700'}`}>
                    ฿{todayExpense.toLocaleString()} / ฿{DAILY_BENCHMARK}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      todayExpense > DAILY_BENCHMARK ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (todayExpense / DAILY_BENCHMARK) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {todayExpense > DAILY_BENCHMARK ? '⚠️ ใช้จ่ายเกินเกณฑ์เฉลี่ยรายวันแล้ว' : '✅ ควบคุมค่าใช้จ่ายได้ดีเยี่ยม!'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-candy-white p-2.5 rounded-2xl border flex flex-col items-center justify-center shrink-0 text-slate-700 hover:bg-slate-100 cursor-pointer"
                title="เลือกรูปสลิปเพื่อสแกน"
              >
                <Camera size={18} className={isMaxnum ? 'text-sky-500' : 'text-pink-500'} />
                <span className="text-[9px] font-black mt-0.5">สแกนสลิป</span>
              </button>
            </div>
          </div>

          {/* Quick AI Note Bar */}
          <form onSubmit={handleSendAiMessage} className="relative">
            <input
              type="text"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              placeholder='พิมพ์จดด่วน เช่น "ข้าวกะเพรา 65", "เติมน้ำมัน 800", "เงินเดือน 35000"...'
              className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-4 pr-24 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!aiInputText.trim() || isAiProcessing}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-40 ${
                isMaxnum ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {isAiProcessing ? 'จด...' : 'จดปั๊บ ⚡'}
            </button>
          </form>

          {/* AI Feedback toast */}
          {aiFeedback && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center justify-between animate-fadeIn">
              <span>{aiFeedback.message}</span>
              <button onClick={() => setAiFeedback(null)} className="text-amber-500 hover:text-amber-700">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Date Navigator Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Transaction List (Zero-Wrap Mobile Layout) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>รายการวันที่ {selectedDate}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {todayTxns.length} รายการ
                </span>
              </h4>
            </div>

            {todayTxns.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-200 space-y-2">
                <div className="text-3xl">🐷💤</div>
                <p className="text-xs text-slate-500 font-bold">ยังไม่มีรายการบันทึกในวันนี้</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1 bg-slate-100 text-xs text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  + จดรายการแรก
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTxns.map((t) => {
                  const cat = getCategoryInfo(t.category, t.type);
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-2xs flex items-center justify-between gap-3"
                    >
                      {/* Left Side: Category Icon & Merchant Name */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                          {cat.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs sm:text-sm font-black text-slate-800 truncate">
                              {t.merchant}
                            </h5>
                            {t.linked_food_log_id && (
                              <button
                                type="button"
                                onClick={() => setActiveWorld('fit')}
                                className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-700 border border-pink-200 hover:bg-pink-200 transition flex items-center gap-0.5 cursor-pointer"
                                title="แตะเพื่อดูมื้ออาหารในหมูอ้วนฟิต"
                              >
                                <span>🍱 {t.food_kcal ? `${t.food_kcal} kcal` : 'ดูอาหาร'} ➜</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {t.time} • {t.category} • {t.wallet} {t.note ? `• ${t.note}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Zero-Wrap Amount & Delete Button */}
                      <div className="shrink-0 text-right whitespace-nowrap pl-2">
                        <span
                          className={`text-sm sm:text-base font-mono font-black block leading-none ${
                            t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {t.type === 'INCOME' ? '+' : '-'}฿{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteTransaction(t.id)}
                          className="text-[11px] text-slate-300 hover:text-rose-500 transition mt-1 cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={13} className="inline ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: BATCH SLIP SCANNER */}
      {subTab === 'scanner' && (
        <div className="space-y-5">
          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Camera size={18} className={isMaxnum ? 'text-sky-500' : 'text-pink-500'} />
                  <span>Multi-Image สแกนสลิปหลายรูปพร้อมกัน</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกสลิปจากอัลบั้มพร้อมกันได้ทีละ 5-10 รูป ระบบจะประมวลผลให้ในคราวเดียว
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`py-2 px-3.5 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isMaxnum ? 'btn-candy-blue' : 'btn-candy-pink'
                }`}
              >
                <Upload size={14} />
                <span>+ เลือกรูปสลิปเพิ่ม</span>
              </button>
            </div>

            {/* Scan Progress Bar if running */}
            {isBatchScanning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>กำลังสแกนสลิปที่ {currentScanIndex} จากทั้งหมด {batchSlips.length} รูป...</span>
                  <span className="font-mono">{Math.round((currentScanIndex / batchSlips.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(currentScanIndex / batchSlips.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Empty state */}
            {batchSlips.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3 cursor-pointer hover:border-slate-400 transition"
              >
                <div className="text-4xl">📸</div>
                <p className="text-sm font-black text-slate-700">แตะที่นี่เพื่อเลือกรูปสลิปหลายรูป</p>
                <p className="text-xs text-slate-400">รองรับไฟล์ JPG, PNG ลากไฟล์มาวางหรือเลือกจากอัลบั้มได้ทันที</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    รูปสลิปที่เลือกไว้ ({batchSlips.length} รูป)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchSlips([])}
                      className="text-xs text-slate-400 hover:text-rose-500 font-bold"
                    >
                      ล้างทั้งหมด
                    </button>
                    {!isBatchScanning && batchSlips.some((s) => s.status === 'pending') && (
                      <button
                        type="button"
                        onClick={handleStartBatchScan}
                        className="py-1.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl font-black text-xs shadow-xs hover:opacity-95"
                      >
                        ⚡ เริ่มสแกน AI ทั้งหมด
                      </button>
                    )}
                  </div>
                </div>

                {/* Slip Items Review Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {batchSlips.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex gap-3 items-center"
                    >
                      <img
                        src={item.previewUrl}
                        alt="slip"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        {item.status === 'pending' && (
                          <span className="text-slate-400 font-bold block">รอสแกน...</span>
                        )}
                        {item.status === 'scanning' && (
                          <span className="text-amber-600 font-bold animate-pulse block">กำลังอ่านสลิป...</span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-500 font-bold block">⚠️ {item.errorMessage}</span>
                        )}
                        {item.status === 'done' && item.parsedData && (
                          <div>
                            <span className="font-mono font-black text-slate-800 block text-sm">
                              ฿{item.parsedData.amount.toLocaleString()}
                            </span>
                            <span className="text-slate-600 font-bold truncate block">
                              {item.parsedData.merchant}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.parsedData.bank} • {item.parsedData.suggestedCategory}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setBatchSlips((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-300 hover:text-rose-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bulk Confirm Button */}
                {batchSlips.some((s) => s.status === 'done') && (
                  <button
                    type="button"
                    onClick={handleSaveAllBatchSlips}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md hover:opacity-95 transition cursor-pointer"
                  >
                    🎉 บันทึกรายการสลิปที่สำเร็จทั้งหมด (
                    {batchSlips.filter((s) => s.status === 'done').length} รายการ)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: AI CHATBOT "หมูอ้วนช่วยจด" */}
      {subTab === 'ai_chat' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-wiggle">🤖🐷</span>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  AI หมูอ้วนช่วยจด (พิมพ์ปุ๊บ บันทึกปั๊บ)
                </h3>
                <p className="text-xs text-slate-500">
                  บอกน้องหมูอ้วนเป็นภาษาพูดธรรมดา เช่น "กินข้าวกะเพรา 65", "เติมน้ำมัน 800", "ได้เงินเดือน 35000"
                </p>
              </div>
            </div>

            <form onSubmit={handleSendAiMessage} className="space-y-2">
              <textarea
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่ เช่น กินส้มตำไก่ย่าง 180 โอนจ่าย..."
                rows={3}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-400 resize-none shadow-inner"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!aiInputText.trim() || isAiProcessing}
                  className={`py-2.5 px-6 rounded-full text-xs font-black shadow-md transition cursor-pointer disabled:opacity-40 ${
                    isMaxnum ? 'btn-candy-blue' : 'btn-candy-pink'
                  }`}
                >
                  {isAiProcessing ? 'หมูอ้วนกำลังคิด...' : 'ส่งให้น้องหมูจด ➜'}
                </button>
              </div>
            </form>

            {/* Quick Prompt Pills */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">ตัวอย่างคำสั่งด่วน:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  'กินข้าวมันไก่ 60 บาท',
                  'ชานมไข่มุก 45 บ.',
                  'เติมน้ำมัน 800 โอน',
                  'ซื้อของใช้เซเว่น 185',
                  'ได้เงินคืน 500 บาท',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setAiInputText(sample)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: STATS & DONUT CHARTS */}
      {subTab === 'stats' && (
        <div className="space-y-5">
          {/* Stats Mode Switcher */}
          <div className="flex items-center p-1 bg-white rounded-full border border-slate-200 shadow-2xs gap-1 max-w-sm mx-auto">
            <button
              onClick={() => setStatsViewMode('EXPENSE')}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                statsViewMode === 'EXPENSE' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เฉพาะรายจ่าย
            </button>
            <button
              onClick={() => setStatsViewMode('INCOME')}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                statsViewMode === 'INCOME' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เฉพาะรายรับ
            </button>
            <button
              onClick={() => setStatsViewMode('COMPARE')}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                statsViewMode === 'COMPARE' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เปรียบเทียบ
            </button>
          </div>

          {/* Donut Chart Component Container */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <PieChart size={18} className="text-amber-500" />
              <span>
                {statsViewMode === 'EXPENSE'
                  ? 'สัดส่วนรายจ่ายตามหมวดหมู่'
                  : statsViewMode === 'INCOME'
                  ? 'สัดส่วนรายรับตามหมวดหมู่'
                  : 'เปรียบเทียบสัดส่วนการเงิน'}
              </span>
            </h3>

            {statsViewMode === 'EXPENSE' && (
              <DonutChartComponent data={expenseCatData} total={monthExpense} title="รายจ่ายรวม" type="EXPENSE" />
            )}

            {statsViewMode === 'INCOME' && (
              <DonutChartComponent data={incomeCatData} total={monthIncome} title="รายรับรวม" type="INCOME" />
            )}

            {statsViewMode === 'COMPARE' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around">
                  <div className="text-center">
                    <span className="text-xs font-bold text-emerald-700 block">รายรับ</span>
                    <span className="text-base font-mono font-black text-emerald-600">
                      +฿{monthIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-300">VS</div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-rose-700 block">รายจ่าย</span>
                    <span className="text-base font-mono font-black text-rose-500">
                      -฿{monthExpense.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{
                      width: `${monthIncome + monthExpense > 0 ? (monthIncome / (monthIncome + monthExpense)) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="h-full bg-rose-400 transition-all duration-500"
                    style={{
                      width: `${monthIncome + monthExpense > 0 ? (monthExpense / (monthIncome + monthExpense)) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL RECORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">จดบันทึกรายการใหม่ ✍️</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3 text-xs">
              {/* Type Switcher */}
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAddType('EXPENSE');
                    setAddCategory('อาหารและเครื่องดื่ม');
                  }}
                  className={`flex-1 py-2 rounded-xl font-black transition cursor-pointer ${
                    addType === 'EXPENSE' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  รายจ่าย
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddType('INCOME');
                    setAddCategory('เงินเดือนประจำ');
                  }}
                  className={`flex-1 py-2 rounded-xl font-black transition cursor-pointer ${
                    addType === 'INCOME' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  รายรับ
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">จำนวนเงิน (บาท) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full text-lg font-mono font-black p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Merchant / Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อรายการ / ร้านค้า *</label>
                <input
                  type="text"
                  required
                  placeholder={addType === 'INCOME' ? 'เช่น เงินเดือน, งานฟรีแลนซ์' : 'เช่น ข้าวกะเพราหมูกรอบ, ค่าน้ำมัน'}
                  value={addMerchant}
                  onChange={(e) => setAddMerchant(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">หมวดหมู่</label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {(addType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wallet / Channel */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">ช่องทางชำระเงิน</label>
                <select
                  value={addWallet}
                  onChange={(e) => setAddWallet(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {['KBank', 'SCB', 'PromptPay', 'เงินสด', 'TrueMoney', 'บัตรเครดิต'].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Two-Way Dual-Log Toggle to Fitness Food View */}
              {addType === 'EXPENSE' && (
                <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoLogFood}
                      onChange={(e) => setAlsoLogFood(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 cursor-pointer"
                    />
                    <span className="font-black text-pink-800 text-xs">
                      🍱 เชื่อมต่อบันทึกอาหารลง หมูอ้วนฟิต ด้วย
                    </span>
                  </label>

                  {alsoLogFood && (
                    <div className="grid grid-cols-2 gap-2 pt-1 animate-fadeIn">
                      <div>
                        <span className="text-[10px] text-pink-700 font-bold block mb-1">มื้ออาหาร</span>
                        <select
                          value={foodMeal}
                          onChange={(e) => setFoodMeal(e.target.value as MealType)}
                          className="w-full p-1.5 bg-white border border-pink-200 rounded-xl text-xs font-bold"
                        >
                          <option value="breakfast">🌅 เช้า</option>
                          <option value="lunch">☀️ เที่ยง</option>
                          <option value="dinner">🌙 เย็น</option>
                          <option value="snack">🍿 อาหารว่าง</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-pink-700 font-bold block mb-1">แคลอรีโดยประมาณ (kcal)</span>
                        <input
                          type="number"
                          value={foodKcal}
                          onChange={(e) => setFoodKcal(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-pink-200 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`py-2 px-6 rounded-full font-black text-white shadow-md cursor-pointer ${
                    addType === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// SUB-COMPONENT: DONUT CHART SVG (Kawaii Interactive)
// ========================================================
interface DonutItem {
  name: string;
  amount: number;
  percent: number;
  meta: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

const DonutChartComponent: React.FC<{
  data: DonutItem[];
  total: number;
  title: string;
  type: TransactionType;
}> = ({ data, total, title, type }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs font-bold">
        ยังไม่มีข้อมูลบันทึกในหมวดนี้
      </div>
    );
  }

  let accumulatedFraction = 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Donut Circle */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
            {data.map((item, idx) => {
              const fraction = item.amount / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedFraction * circumference);
              accumulatedFraction += fraction;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.meta.color || (type === 'INCOME' ? '#10b981' : '#ff6584')}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {hoveredIdx !== null && data[hoveredIdx] ? (
              <>
                <span className="text-xl">{data[hoveredIdx].meta.icon}</span>
                <span className="text-[11px] font-black text-slate-700 truncate max-w-[110px]">
                  {data[hoveredIdx].name}
                </span>
                <span
                  className={`text-xs font-mono font-black ${
                    type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  ฿{data[hoveredIdx].amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{data[hoveredIdx].percent}%</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-slate-400 font-bold">{title}</span>
                <span
                  className={`text-sm font-mono font-black ${
                    type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  ฿{total.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-slate-400">{data.length} หมวดหมู่</span>
              </>
            )}
          </div>
        </div>

        {/* Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? type === 'INCOME'
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-rose-50/80 border-rose-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span>{item.meta.icon}</span>
                    <span className="truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-black ${
                        type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {type === 'INCOME' ? '+' : '-'}฿{item.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {item.percent}%
                    </span>
                  </div>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.meta.color || (type === 'INCOME' ? '#10b981' : '#ff6584'),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
