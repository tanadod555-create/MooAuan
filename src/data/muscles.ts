import { MuscleInfo, MuscleKey } from '../types';

export const MUSCLE_GROUPS: Record<MuscleKey, MuscleInfo> = {
  chest: {
    key: 'chest',
    nameTh: 'อก',
    latinName: 'Pectoralis major & minor',
    submuscles: ['อกบน (Clavicular head)', 'อกกลาง-ล่าง (Sternocostal head)', 'Pectoralis minor'],
    view: 'front',
    description: 'กล้ามเนื้อหน้าอก ช่วยในการดันเข้าหากึ่งกลางลำตัวและยกแขน'
  },
  shoulders: {
    key: 'shoulders',
    nameTh: 'ไหล่',
    latinName: 'Deltoideus',
    submuscles: ['ไหล่หน้า (Anterior)', 'ไหล่ข้าง (Lateral)', 'ไหล่หลัง (Posterior)'],
    view: 'both',
    description: 'กล้ามเนื้อหัวไหล่ ช่วยในการยกแขนขึ้นทุกทิศทาง'
  },
  biceps: {
    key: 'biceps',
    nameTh: 'ต้นแขนด้านหน้า',
    latinName: 'Biceps brachii & Brachialis',
    submuscles: ['Long head', 'Short head', 'Brachialis', 'Brachioradialis'],
    view: 'front',
    description: 'กล้ามเนื้อแขนด้านหน้า ช่วยงอข้อศอกและหมุนหงายฝ่ามือ'
  },
  triceps: {
    key: 'triceps',
    nameTh: 'ต้นแขนด้านหลัง',
    latinName: 'Triceps brachii',
    submuscles: ['Long head', 'Lateral head', 'Medial head'],
    view: 'back',
    description: 'กล้ามเนื้อแขนด้านหลัง มีหน้าที่หลักในการเหยียดข้อศอก'
  },
  forearms: {
    key: 'forearms',
    nameTh: 'แขนท่อนล่าง',
    latinName: 'Antebrachial flexors & extensors',
    submuscles: ['กลุ่มงอข้อมือ (Flexors)', 'กลุ่มเหยียดข้อมือ (Extensors)', 'Brachioradialis'],
    view: 'both',
    description: 'กล้ามเนื้อปลายแขน ควบคุมการจับ กำมือ และการกระดกข้อมือ'
  },
  abs: {
    key: 'abs',
    nameTh: 'หน้าท้อง / แกนกลาง',
    latinName: 'Rectus abdominis & Obliques',
    submuscles: ['Rectus abdominis (Six-pack)', 'External & Internal obliques', 'Transversus abdominis (แกนกลาง)'],
    view: 'front',
    description: 'กล้ามเนื้อผนังหน้าท้อง พยุงแนวกระดูกสันหลังและงอลำตัว'
  },
  quads: {
    key: 'quads',
    nameTh: 'ต้นขาด้านหน้า',
    latinName: 'Quadriceps femoris',
    submuscles: ['Rectus femoris', 'Vastus lateralis', 'Vastus medialis (หยดน้ำ)', 'Vastus intermedius'],
    view: 'front',
    description: 'กล้ามเนื้อต้นขาด้านหน้า 4 มัด ทำหน้าที่เหยียดเข่า'
  },
  hamstrings: {
    key: 'hamstrings',
    nameTh: 'ต้นขาด้านหลัง',
    latinName: 'Hamstrings',
    submuscles: ['Biceps femoris', 'Semitendinosus', 'Semimembranosus'],
    view: 'back',
    description: 'กล้ามเนื้อต้นขาด้านหลัง ทำหน้าที่งอเข่าและเหยียดสะโพก'
  },
  glutes: {
    key: 'glutes',
    nameTh: 'สะโพก / ก้น',
    latinName: 'Gluteal muscles',
    submuscles: ['Gluteus maximus (ก้นใหญ่)', 'Gluteus medius (ก้นข้าง)', 'Gluteus minimus'],
    view: 'back',
    description: 'กล้ามเนื้อก้น เป็นตัวสร้างแรงขับเคลื่อนหลักในการลุกขึ้นและเหยียดสะโพก'
  },
  calves: {
    key: 'calves',
    nameTh: 'น่อง',
    latinName: 'Gastrocnemius & Soleus',
    submuscles: ['Gastrocnemius (มัดนอก)', 'Soleus (มัดลึก)'],
    view: 'back',
    description: 'กล้ามเนื้อน่อง ช่วยเขย่งปลายเท้าและดันพื้นเวลาเดินหรือกระโดด'
  },
  traps: {
    key: 'traps',
    nameTh: 'บ่า / สะบักบน',
    latinName: 'Trapezius',
    submuscles: ['Upper traps (ยกสะบัก)', 'Middle traps (ดึงสะบักชิด)', 'Lower traps (ดึงสะบักลง)'],
    view: 'back',
    description: 'กล้ามเนื้อรูปสี่เหลี่ยมข้าวหลามตัดคลุมบ่าถึงกลางหลัง'
  },
  lats: {
    key: 'lats',
    nameTh: 'หลังกว้าง / หลังกลาง',
    latinName: 'Latissimus dorsi & Rhomboids',
    submuscles: ['Latissimus dorsi (ปีกหลัง)', 'Teres major', 'Rhomboids (สะบักกลาง)'],
    view: 'back',
    description: 'กล้ามเนื้อปีกหลัง ช่วยดึงแขนลงและแนบข้างลำตัว เพิ่มมิติ V-Taper'
  },
  lowback: {
    key: 'lowback',
    nameTh: 'หลังส่วนล่าง',
    latinName: 'Erector spinae & Quadratus lumborum',
    submuscles: ['Erector spinae (สันหลัง)', 'Quadratus lumborum'],
    view: 'back',
    description: 'กล้ามเนื้อพยุงแนวกระดูกสันหลังให้ตั้งตรงและมั่นคง'
  }
};
