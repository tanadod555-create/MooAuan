# 🎮 MooAuan Design System & UI/UX Pro Max Guidelines
> **A Comprehensive Specification for Kawaii Cozy Game UI & Tactile Micro-Interactions**  
> *Ready-to-copy design tokens, CSS snippets, React components, and layout architecture for modern web applications.*

---

## 📑 สารบัญ (Table of Contents)
1. [Core Design Philosophy (แนวคิดหลัก)](#1-core-design-philosophy)
2. [Color Palette & Theme Tokens (ชุดสีและธีม)](#2-color-palette--theme-tokens)
3. [Typography & Hierarchy (ฟอนต์และลำดับสายตา)](#3-typography--hierarchy)
4. [Tactile 3D Buttons & Elevation (ปุ่ม 3D และมิติ)](#4-tactile-3d-buttons--elevation)
5. [Card & Container Architecture (การ์ดและเลย์เอาต์)](#5-card-container-architecture)
6. [Keyframe Animations & Micro-Delight (แอนิเมชันน่ารักดุ๊กดิ๊ก)](#6-keyframe-animations--micro-delight)
7. [Essential UI Components (คอมโพเนนต์หลักที่ยกไปใช้ได้ทันที)](#7-essential-ui-components)
8. [Ergonomics & Responsive Design Rules (กฎการจัดหน้าจอ)](#8-ergonomics--responsive-design-rules)
9. [Copy-Paste Quickstart Guide (คู่มือติดตั้งในโปรเจกต์ใหม่)](#9-copy-paste-quickstart-guide)

---

## 1. Core Design Philosophy

ระบบดีไซน์นี้ผสมผสานระหว่าง **Modern Ergonomic SaaS (UI/UX Pro Max)** กับ **Kawaii Cozy Game Aesthetics** (สไตล์ Animal Crossing / Nintendo / Duolingo / Line Friends):

* **Juicy & Tactile**: ทุกการแตะ/คลิกต้องให้ความรู้สึกเด้ง กดแล้วยุบตัว (Tactile 3D feedback)
* **Cozy & Approachable**: ใช้มุมโค้งมนขนาดใหญ่ (`rounded-2xl`, `rounded-3xl`, `rounded-full`) สีโทนพาสเทลคู่สีตัดที่สดใส ไม่ดุดัน
* **Micro-Delight**: มีแอนิเมชันลอยเบาๆ (Gentle Float), สั่นดุกดิก (Wiggle), ยืดหยุ่นเหมือนเยลลี่ (Jelly Squish) และประกายวิ้ง (Sparkle)
* **Dual-Personality System**: รองรับระบบแยก Persona ได้เนียนตา (เช่น โหมดผู้หญิงหวานสตรอว์เบอร์รี vs. โหมดผู้ชายสปอร์ตสดใส)
* **Information Hierarchy First**: สวยน่ารักแต่ต้องอ่านง่าย ตัวเลขและสถิติชัดเจน ไม่รกตา

---

## 2. Color Palette & Theme Tokens

### 🌸 Theme 1: Strawberry Mochi (ผู้หญิง / โทนหวานน่ารัก)
| Token Name | Hex Code | Tailwind Equivalent | การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Pink Primary** | `#ff6584` | `rose-400 / pink-500` | ปุ่มกดหลัก, CTA, ไฮไลต์จุดสำคัญ |
| **Pink Dark Border** | `#d93d62` | `rose-600` | ขอบ 3D ด้านล่างของปุ่มชมพู |
| **Pink Pastel Border** | `#fed7e2` | `pink-200` | เส้นขอบการ์ดและกล่องข้อมูล |
| **Pink Bottom Shadow** | `#fecdd3` | `rose-200` | เงาหนา 3D ใต้การ์ด (`0 6px 0`) |
| **Canvas Background** | `#fff5f8` | Custom Radial Dot | สีพื้นหลังหลักทั้งหน้าจอ |
| **Deep Rose Text** | `#4a152e` | Custom Rose | สีข้อความหลัก คอนทราสต์สูง อ่านสบายตา |

### 🏋️‍♂️ Theme 2: Soda Pop Arcade (ผู้ชาย / โทนสปอร์ตเกมเมอร์)
| Token Name | Hex Code | Tailwind Equivalent | การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Blue Primary** | `#38bdf8` | `sky-400` | ปุ่มกดหลัก, Progress Bar, Focus ring |
| **Blue Dark Border** | `#0284c7` | `sky-600` | ขอบ 3D ด้านล่างของปุ่มฟ้า |
| **Blue Pastel Border** | `#bae6fd` | `sky-200` | เส้นขอบการ์ดและกล่องข้อมูล |
| **Blue Bottom Shadow** | `#bae6fd` | `sky-200` | เงาหนา 3D ใต้การ์ด (`0 6px 0`) |
| **Canvas Background** | `#f0f8ff` | Custom Radial Dot | สีพื้นหลังหลักทั้งหน้าจอ |
| **Deep Slate Text** | `#0f172a` | `slate-900` | สีข้อความหลัก ชัดเจน คมเข้ม |

### ⭐ Universal Accent Tokens (ใช้ร่วมกันทั้ง 2 ธีม)
| Accent Type | Color | Hex Code | การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Reward / Gold** | Amber Star | `#fbbf24` (ขอบ `#d97706`) | เหรียญ, รางวัล, EXP, แถบ Level |
| **Success / Eco** | Emerald Mint | `#34d399` (ขอบ `#059669`) | ทำสำเร็จ, เช็กถูก, วิตามิน, โภชนาการคลีน |
| **Warning / Calorie** | Crimson Red | `#f43f5e` (พื้น `#fff1f2`) | แคลอรีเกิน, แจ้งเตือนข้อผิดพลาด |
| **Neutral White** | Crisp Milk | `#ffffff` | พื้นหลังการ์ด, ป็อปอัป |

---

## 3. Typography & Hierarchy

### Google Fonts Setup
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&family=Prompt:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
```

### Font Pairing Strategy
* **Headers & Badges (ความสนุก เป็นมิตร)**: `Fredoka`, `Nunito` หรือ `Prompt` (สำหรับภาษาไทย)
* **Body & Descriptions (ความชัดเจน สบายตา)**: `Prompt` (น้ำหนัก 400-600)
* **Metrics & Counters (ตัวเลขสถิติ พลังงาน น้ำหนัก)**: `JetBrains Mono` หรือ `font-mono` ให้ความรู้สึกแม่นยำ น่าเชื่อถือ

### Typographic Hierarchy Table
| Element | Class | Weight | Size | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `text-xl sm:text-2xl` | `font-black` | 20-24px | มี Emoji เสริมอารมณ์ |
| **Section Header** | `text-base sm:text-lg` | `font-bold` | 16-18px | มี Icon หรือ Badge กำกับ |
| **Stat Numbers** | `text-2xl sm:text-3xl font-mono` | `font-black` | 24-30px | ใช้งานคู่กับ NumberTicker |
| **Body Text** | `text-xs sm:text-sm` | `font-medium` | 12-14px | สี `text-slate-600` หรือ `text-zinc-600` |
| **Badge / Tag** | `text-[10px] sm:text-xs` | `font-bold` | 10-12px | ขอบมนทรงแคปซูล `rounded-full px-2 py-0.5` |

---

## 4. Tactile 3D Buttons & Elevation

ปุ่มกดแบบเกม 3D ใช้เทคนิค **Solid Bottom Border + Active Transform** เพื่อสร้างแรงสะท้อนกลับเมื่อกด (Tactile Press):

```css
/* ========================================================
   TACTILE 3D GAME BUTTONS (CSS Snippets)
   ======================================================== */

/* 1. Pink Candy Button */
.btn-candy-pink {
  background-color: #ff6584;
  border-bottom: 4px solid #d93d62;
  border-radius: 9999px;
  color: #ffffff;
  font-weight: 800;
  transition: all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(255, 101, 132, 0.3);
}
.btn-candy-pink:hover {
  background-color: #ff7593;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 101, 132, 0.4);
}
.btn-candy-pink:active {
  transform: translateY(3px);
  border-bottom-width: 1px;
  box-shadow: 0 1px 4px rgba(255, 101, 132, 0.2);
}

/* 2. Blue Soda Button */
.btn-candy-blue {
  background-color: #38bdf8;
  border-bottom: 4px solid #0284c7;
  border-radius: 9999px;
  color: #ffffff;
  font-weight: 800;
  transition: all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.35);
}
.btn-candy-blue:hover {
  background-color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(56, 189, 248, 0.45);
}
.btn-candy-blue:active {
  transform: translateY(3px);
  border-bottom-width: 1px;
  box-shadow: 0 1px 4px rgba(56, 189, 248, 0.2);
}

/* 3. Yellow Reward Button */
.btn-candy-yellow {
  background-color: #fbbf24;
  border-bottom: 4px solid #d97706;
  border-radius: 9999px;
  color: #78350f;
  font-weight: 800;
  transition: all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
}
.btn-candy-yellow:active {
  transform: translateY(3px);
  border-bottom-width: 1px;
}

/* 4. White Clean Button */
.btn-candy-white {
  background-color: #ffffff;
  border: 2px solid #fce7f3;
  border-bottom: 4px solid #fbcfe8;
  border-radius: 9999px;
  color: #4a152e;
  font-weight: 700;
  transition: all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-candy-white:hover {
  background-color: #fff5f8;
  transform: translateY(-1px);
}
.btn-candy-white:active {
  transform: translateY(3px);
  border-bottom-width: 2px;
}

/* 5. General Tap Bounce (สำหรับไอคอนหรือการ์ดที่กดได้) */
.tap-bounce {
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tap-bounce:active {
  transform: scale(0.95);
}
```

---

## 5. Card & Container Architecture

### 1. Kawaii Game Cards (การ์ดขอบ 3D นูน)
```css
/* การ์ดขอบชมพูนูน 3D */
.card-kawaii-pink {
  background: #ffffff;
  border: 2.5px solid #fed7e2;
  border-radius: 28px;
  box-shadow: 0 6px 0 #fecdd3, 0 10px 24px -4px rgba(244, 114, 182, 0.15);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-kawaii-pink:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 0 #fecdd3, 0 16px 28px -4px rgba(244, 114, 182, 0.22);
}

/* การ์ดขอบฟ้านูน 3D */
.card-kawaii-blue {
  background: #ffffff;
  border: 2.5px solid #bae6fd;
  border-radius: 28px;
  box-shadow: 0 6px 0 #bae6fd, 0 10px 24px -4px rgba(56, 189, 248, 0.15);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-kawaii-blue:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 0 #bae6fd, 0 16px 28px -4px rgba(56, 189, 248, 0.22);
}

/* 2. Apple Glassmorphism Fallback (สำหรับแผงควบคุมที่ต้องการความหรูหรา) */
.card-apple {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(226, 232, 240, 0.85);
  border-radius: 24px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
```

### 2. Dotted Canvas Background (พื้นหลังตารางจุดน่ารัก)
```css
/* Strawberry Theme Canvas */
body.theme-manow {
  background-color: #fff5f8;
  background-image: 
    radial-gradient(#fecdd3 1px, transparent 1px),
    radial-gradient(#fbcfe8 1px, #fff5f8 1px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  color: #4a152e;
}

/* Soda Pop Theme Canvas */
body.theme-maxnum {
  background-color: #f0f8ff;
  background-image: 
    radial-gradient(#bae6fd 1.2px, transparent 1.2px),
    radial-gradient(#e0f2fe 1.2px, #f0f8ff 1.2px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  color: #0f172a;
}
```

---

## 6. Keyframe Animations & Micro-Delight

คัดสรรชุดแอนิเมชันที่ทำให้อนิเมตและอินเตอร์เฟซ "มีชีวิต" (Living UI):

```css
/* 1. Cute Wiggle (ดุ๊กดิ๊ก ซ้าย-ขวา เหมาะกับ Mascot, Trophy, Icon) */
@keyframes cute-wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.04); }
  75% { transform: rotate(5deg) scale(1.04); }
}
.animate-wiggle {
  animation: cute-wiggle 1.8s ease-in-out infinite;
  transform-origin: center bottom;
}
.hover-wiggle:hover {
  animation: cute-wiggle 0.6s ease-in-out infinite;
}

/* 2. Jelly Squish / Jiggle (ยืดหยุ่นเหมือนเจลลี่ เมื่อแตะหรือทำสำเร็จ) */
@keyframes cute-jiggle {
  0%, 100% { transform: scale(1, 1); }
  30% { transform: scale(1.08, 0.92); }
  60% { transform: scale(0.94, 1.06); }
  80% { transform: scale(1.02, 0.98); }
}
.animate-jiggle {
  animation: cute-jiggle 2.5s ease-in-out infinite;
}
.hover-jiggle:hover {
  animation: cute-jiggle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 3. Gentle Float / Bounce (ลอยเบาๆ เหมือนลูกโป่ง) */
@keyframes cute-bounce-gentle {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-7px) rotate(1.5deg); }
}
.animate-bounce-gentle {
  animation: cute-bounce-gentle 2.4s ease-in-out infinite;
}

/* 4. Sparkle Twinkle (ประกายวิ้ง สำหรับเลเวลอัป หรือเหรียญ) */
@keyframes cute-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% {
    transform: scale(1.25) rotate(15deg);
    opacity: 0.85;
    filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
  }
}
.animate-sparkle {
  animation: cute-sparkle 1.6s ease-in-out infinite;
}

/* 5. Mascot Breathing (การหายใจแบบ Idle state) */
@keyframes mascot-breath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04, 0.97); }
}
.animate-mascot {
  animation: mascot-breath 2.2s ease-in-out infinite;
}
```

---

## 7. Essential UI Components

### 🟢 Component 1: Magic Spotlight Card (`MagicCard.tsx`)
การ์ดที่มีแสงสปอตไลท์ติดตามเคอร์เซอร์เมาส์ เพิ่มความรู้สึกล้ำสมัย:

```tsx
import React, { useRef, useState } from 'react';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(244, 114, 182, 0.1)',
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[28px] border transition-all ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
```

---

### 🟢 Component 2: Animated Circular Progress (`CircularProgress.tsx`)
วงแหวนแสดงความคืบหน้าแบบ SVG สำหรับแคลอรี สารอาหาร หรือสถิติ:

```tsx
import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  labelClassName?: string;
  sublabelClassName?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color = '#f472b6',
  bgColor = '#fce7f3',
  label,
  sublabel,
  labelClassName = 'text-slate-800 font-black',
  sublabelClassName = 'text-slate-400 font-bold',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(value / (max || 1), 0), 1);
  const offset = circumference - safePercent * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className={`text-xl font-mono leading-none ${labelClassName}`}>{label}</span>}
        {sublabel && <span className={`text-[10px] mt-0.5 ${sublabelClassName}`}>{sublabel}</span>}
      </div>
    </div>
  );
};
```

---

### 🟢 Component 3: Floating Dock Navigation (`BottomNav.tsx`)
แถบ Navigation ด้านล่างลอยขอบมน ไม่บังเนื้อหา มี Backdrop Blur:

```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 pointer-events-none">
  <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-pink-200/80 rounded-[28px] p-1.5 shadow-[0_10px_30px_rgba(244,114,182,0.2)] flex items-center justify-between pointer-events-auto">
    {/* Tab Item Example */}
    <button className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm font-bold text-xs">
      <span className="text-base">🏋️</span>
      <span>ออกกำลัง</span>
      <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
    </button>
  </div>
</div>
```

---

## 8. Ergonomics & Responsive Design Rules

1. **Center Alignment Guarantee**:
   * Wrap root layouts in `max-w-5xl mx-auto px-4 w-full overflow-x-hidden`.
   * Never let horizontal rows push headers out of center (use `truncate`, `hidden sm:inline`, or flexible gap).
2. **Mobile Safe Areas**:
   * Always include `.pb-safe` (`padding-bottom: env(safe-area-inset-bottom, 1rem)`) สำหรับ iPhone Home Indicator
3. **High Contrast Accessibility (WCAG AAA/AA)**:
   * อย่าใช้สีชมพูอ่อนกับข้อความบนพื้นขาวเด็ดขาด ให้ใช้ `#4a152e` (Dark Plum) หรือ `slate-800` เพื่อให้อ่านง่าย
4. **Touch Target Size**:
   * ปุ่มและจุดแตะต้องมีความสูงขั้นต่ำอย่างน้อย **40px - 44px** (ป้องกันการกดยากบนมือถือ)

---

## 9. Copy-Paste Quickstart Guide

ต้องการนำระบบนี้ไปใช้ในโปรเจกต์ใหม่ (Next.js, Vite + React, หรือ HTML/Tailwind) ทำได้ใน 3 ขั้นตอน:

### Step 1: ติดตั้ง Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: คัดลอก CSS ลงใน `src/index.css`
คัดลอกส่วน **Animations**, **Buttons**, **Kawaii Cards**, และ **Themes** จากหัวข้อที่ 4, 5, 6 ในเอกสารนี้ไปวางใน `index.css` ของโปรเจกต์คุณ

### Step 3: สลับธีมได้ง่ายๆ ผ่าน Body Class
```javascript
// เมื่อต้องการสลับธีม
document.body.className = isBoy ? 'theme-maxnum' : 'theme-manow';
```

---
*Created with ❤️ by Antigravity Design System — Built for speed, delight, and seamless multi-project reuse.*
