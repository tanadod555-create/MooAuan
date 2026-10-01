import { MuscleInfo, MuscleKey } from '../types';

export const MUSCLE_GROUPS: Record<MuscleKey, MuscleInfo> = {
  chest: {
    key: 'chest',
    nameTh: 'Chest (Pectorals)',
    nameEn: 'Pectoral Muscles',
    latinName: 'Pectoralis major & minor',
    view: 'front',
    description: 'กล้ามเนื้อหน้าอก เป็นกล้ามเนื้อพัดขนาดใหญ่ ทำหน้าที่หุบแขนเข้าหากึ่งกลางลำตัวและดันไปข้างหน้า',
    submuscles: ['Upper Chest (Clavicular)', 'Mid Chest (Sternal)', 'Lower Chest (Costal)', 'Inner Chest & Pec Minor'],
    subdivisions: [
      {
        id: 'chest_upper',
        nameTh: 'Upper Chest (Clavicular Head)',
        nameEn: 'Upper Chest (Clavicular Head)',
        latinName: 'Pars clavicularis pectoralis majoris',
        originInsertion: 'เกาะจากกระดูกไหปลาร้า (Clavicle) ไปยังร่องกระดูกต้นแขน (Humerus)',
        fiberOrientation: 'เส้นใยวิ่งเฉียงขึ้น 30-45 องศา จากแขนขึ้นไปหาไหปลาร้า',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Shoulder Flexion (ยกแขนขึ้นไปข้างหน้า)',
          'Horizontal Adduction (หุบแขนเข้าหากึ่งกลางในมุมเฉียงขึ้น)',
          'Internal Rotation (หมุนข้อไหล่เข้าด้านใน)'
        ],
        biomechanicsNote: 'เนื่องจากเส้นใยวิ่งเฉียงขึ้น การออกแรงที่ดีที่สุดคือการผลักหรือหุบแขนขึ้นในแนวเฉียง 30-45° การปรับม้านั่ง Incline ประมาณ 30° จะตรงกับ Line of Pull มากที่สุด (หากชันเกิน 45° แรงจะถ่ายไปที่ไหล่หน้าแทน)',
        kinesiologyCues: [
          'ปรับเบาะ Incline 30° - ไม่ชันเกินไปเพื่อตัดแรงไหล่หน้า',
          'โฟกัสที่การ "บีบข้อศอกเฉียงขึ้นหาใต้คาง"',
          'อย่าแอ่นหลังจนอกลอยขึ้นกลายเป็นระนาบเรียบ'
        ],
        recommendedExercises: ['Incline Dumbbell Press', 'Incline Barbell Bench Press', 'Low-to-High Cable Fly', 'Incline Smith Machine Press']
      },
      {
        id: 'chest_mid',
        nameTh: 'Mid Chest (Sternal Head)',
        nameEn: 'Mid Chest (Sternal Head)',
        latinName: 'Pars sternocostalis pectoralis majoris',
        originInsertion: 'เกาะจากกระดูกอก (Sternum) และกระดูกซี่โครงซี่ที่ 2-6 ไปยังกระดูกต้นแขน',
        fiberOrientation: 'เส้นใยเรียงตัวในแนวนอนขนานกับระนาบพื้น (Transverse plane)',
        planeOfMotion: 'Transverse',
        primaryActions: [
          'Horizontal Adduction (หุบแขนเข้าหากึ่งกลางลำตัวในระนาบขนานพื้น)',
          'Shoulder Internal Rotation (หมุนข้อต่อหัวไหล่เข้าใน)',
          'Transverse Flexion'
        ],
        biomechanicsNote: 'เส้นใยวิ่งตามแนวนอนบริสุทธิ์ การเคลื่อนไหวในแนวราบ (Flat Bench Press หรือ Seated Machine Fly) จะทำให้เกิดจุดตั้งฉากและแรงต้านสูงสุดขนานไปกับแนวเส้นใย',
        kinesiologyCues: [
          'ดึงสะบักลงและบีบเข้าหากัน (Scapular Retraction & Depression)',
          'จินตนาการว่ากำลังพยายามเอา "ข้อพับแขนสองข้างมาชนกัน"',
          'กางศอกประมาณ 45-75 องศากับลำตัว เพื่อเซฟเยื่อหุ้มข้อไหล่ (Rotator Cuff)'
        ],
        recommendedExercises: ['Barbell Bench Press', 'Flat Dumbbell Press', 'Chest Press Machine', 'Pec Deck Machine Fly']
      },
      {
        id: 'chest_lower',
        nameTh: 'Lower Chest (Costal Head)',
        nameEn: 'Lower Chest (Abdominal / Costal Head)',
        latinName: 'Pars abdominalis pectoralis majoris',
        originInsertion: 'เกาะจากกระดูกซี่โครงล่างและปลอกกล้ามเนื้อหน้าท้อง (Rectus sheath) ไปยังกระดูกต้นแขน',
        fiberOrientation: 'เส้นใยวิ่งเฉียงลงจากต้นแขนลงไปยังขอบซี่โครงล่างและกระบังลม',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Shoulder Adduction (หุบแขนลงข้างลำตัว)',
          'Shoulder Horizontal Adduction (เฉียงลงล่าง)',
          'Shoulder Extension (ดึงแขนจากมุมสูงลงมาข้างลำตัว)'
        ],
        biomechanicsNote: 'เพื่อกระตุ้นเส้นใยอกล่าง มุมแรงต้านต้องเฉียงลงล่าง ท่าประเภท Decline หรือ Dips หรือ High-to-Low Cable Fly จะตรงกับแนวเส้นใยที่วิ่งเฉียงลงสู่กระดูกอกส่วนล่าง',
        kinesiologyCues: [
          'กดหัวไหล่และสะบักลงต่ำตลอดช่วงการเคลื่อนไหว',
          'ดันหรือหุบมือลงเฉียงไปหากระดูกเชิงกราน/หน้าตัก',
          'เวลาเล่น Dips ให้โน้มตัวไปข้างหน้าเล็กน้อยเพื่อให้อกล่างรับแรงมากกว่าหลังแขน'
        ],
        recommendedExercises: ['High-to-Low Cable Fly', 'Chest Dips', 'Decline Dumbbell Press', 'Decline Barbell Press']
      },
      {
        id: 'chest_inner_minor',
        nameTh: 'Inner Chest & Pec Minor',
        nameEn: 'Inner Fibers & Pectoralis Minor',
        latinName: 'Pectoralis minor & Sternal margin',
        originInsertion: 'Pec minor อยู่ชั้นลึก เกาะจากกระดูกซี่โครง 3-5 ไปยัง Coracoid process ของสะบัก',
        fiberOrientation: 'วิ่งเป็นแนวเฉียงลึก ทำหน้าที่ควบคุมสะบักและยึดโครงสร้างอก',
        planeOfMotion: 'Transverse',
        primaryActions: [
          'Scapular Depression (ดึงกระดูกสะบักลงล่าง)',
          'Scapular Protraction (ดันสะบักยื่นไปข้างหน้า)',
          'Full Cross-body Adduction (หุบแขนข้ามแนวกึ่งกลางลำตัว)'
        ],
        biomechanicsNote: 'จุดบีบสุดของอกใน (Inner Chest peak contraction) เกิดขึ้นเมื่อแขนหุบเลยแนวกึ่งกลางลำตัว (Overlapping Adduction) ซึ่งดัมเบลหรือบาร์เบลทำไม่ได้เพราะแรงต้านตามแนวดิ่งหมดไป ต้องใช้สายเคเบิลหรือเครื่อง Fly',
        kinesiologyCues: [
          'ใช้สายเคเบิลแบบมือเดี่ยว (Single-arm) แล้วหุบแขนเลยแนวกึ่งกลางตัวไปอีก 5-10 ซม.',
          'หยุดค้างบีบเกร็ง (Peak Contraction) 1-2 วินาที ณ จุดสูงสุด',
          'รักษาแนวข้อมือตรงไม่หักงอ'
        ],
        recommendedExercises: ['Single Arm Cable Crossover', 'Cross-Body Cable Press', 'Pec Deck Fly (Cross peak)', 'Push-up Plus']
      }
    ]
  },

  shoulders: {
    key: 'shoulders',
    nameTh: 'Deltoids (Shoulders)',
    nameEn: 'Deltoid Muscles',
    latinName: 'Deltoideus',
    view: 'both',
    description: 'กล้ามเนื้อหัวไหล่ทรงหมวกเกราะ 3 มิติ ทำหน้าที่ยกและกางแขนได้รอบทิศทาง 360 องศา',
    submuscles: ['Anterior Deltoid (Front)', 'Lateral Deltoid (Side)', 'Posterior Deltoid (Rear)', 'Rotator Cuff'],
    subdivisions: [
      {
        id: 'deltoid_anterior',
        nameTh: 'Anterior Deltoid (Front Delt)',
        nameEn: 'Anterior Deltoid (Front Delt)',
        latinName: 'Pars clavicularis deltoidei',
        originInsertion: 'เกาะจากขอบหน้าของกระดูกไหปลาร้า 1/3 ด้านนอก ไปยัง Deltoid tuberosity ของต้นแขน',
        fiberOrientation: 'เส้นใยวิ่งลงด้านล่างและเฉียงออกด้านข้างเล็กน้อย',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Shoulder Flexion (ยกแขนขึ้นไปข้างหน้า)',
          'Shoulder Horizontal Adduction (หุบแขนในแนวราบ)',
          'Shoulder Medial / Internal Rotation'
        ],
        biomechanicsNote: 'ไหล่หน้าทำงานหนักมากในทุกท่าดันอก (Overhead Press, Bench Press) ดังนั้นหากต้องการฝึกแยก ควรเน้นท่าที่มีแรงต้านขนานกับทิศทางยกแขนตรงไปข้างหน้า',
        kinesiologyCues: [
          'ไม่แอ่นหลังโยกตัวช่วยขณะยก',
          'หมุนข้อมือให้หลังมือชี้ขึ้น หรือถือดัมเบลแบบ Neutral Grip เพื่อลดการเสียดสีข้อต่อ',
          'ยกขึ้นจนแขนขนานกับพื้น ไม่จำเป็นต้องยกสูงเกินระดับสายตา'
        ],
        recommendedExercises: ['Overhead Shoulder Press (Barbell/Dumbbell)', 'Dumbbell Front Raise', 'Cable Front Raise', 'Seated Arnold Press']
      },
      {
        id: 'deltoid_lateral',
        nameTh: 'Lateral Deltoid (Side Delt)',
        nameEn: 'Lateral Deltoid (Side Delt)',
        latinName: 'Pars acromialis deltoidei',
        originInsertion: 'เกาะจากขอบนอกของ Acromion (ยอดกระดูกสะบัก) ไปยัง Deltoid tuberosity',
        fiberOrientation: 'ลักษณะโครงสร้างเป็นแบบ Multipennate (ขนนกหลายแฉก) ให้แรงดึงยกมหาศาล',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Shoulder Abduction (กางแขนออกจากลำตัวในระนาบด้านข้าง)',
          'Scapular Plane Abduction (กางแขนทำมุม 30 องศากับแนวระนาบ)'
        ],
        biomechanicsNote: 'การกางแขนตรงๆ 90° อาจทำให้เส้นเอ็น Supraspinatus ถูกบดกับกระดูก Acromion (Impingement) ทริคทางชีวกลศาสตร์คือให้กางแขนในแนว Scapular Plane (เฉียงไปข้างหน้าประมาณ 15-30 องศา) จะตรงกับแนวเส้นใยที่สุดและปลอดภัยต่อข้อต่อ',
        kinesiologyCues: [
          'กางแขนในแนวระนาบสะบัก (เฉียงไปข้างหน้า 15-30° เล็กน้อย)',
          'จินตนาการว่ากำลัง "ผลักข้อศอกออกไปหาผนังห้อง" ไม่ใช่การดึงมือขึ้น',
          'โน้มตัวไปข้างหน้าเล็กน้อย 10-15° เพื่อให้ไหล่ข้างอยู่ในจุดรับน้ำหนักสูงสุด'
        ],
        recommendedExercises: ['Dumbbell Lateral Raise', 'Cable Lateral Raise (Behind/Front)', 'Machine Lateral Raise', 'Egyptian Cable Lean Raise']
      },
      {
        id: 'deltoid_posterior',
        nameTh: 'Posterior Deltoid (Rear Delt)',
        nameEn: 'Posterior Deltoid (Rear Delt)',
        latinName: 'Pars spinalis deltoidei',
        originInsertion: 'เกาะจากสันกระดูกสะบัก (Spine of scapula) ไปยัง Deltoid tuberosity',
        fiberOrientation: 'เส้นใยวิ่งเฉียงลงและออกด้านข้างจากด้านหลังตัว',
        planeOfMotion: 'Transverse',
        primaryActions: [
          'Shoulder Horizontal Abduction (กางแขนไปข้างหลังจากแนวราบ)',
          'Shoulder Extension (ดึงแขนไปด้านหลัง)',
          'Shoulder External Rotation (หมุนข้อต่อหัวไหล่ออกนอก)'
        ],
        biomechanicsNote: 'เป็นกล้ามเนื้อที่มักถูกกล้ามเนื้อสะบัก (Rhomboids/Traps) แย่งการทำงาน ชีวกลศาสตร์ที่ถูกต้องคือต้องล็อกสะบักไม่ให้หนีบเข้าหากันจนเกินไป และกางศอกออกทำมุม 45-60° จากลำตัว',
        kinesiologyCues: [
          'อย่าบีบสะบักเข้าหากัน ให้เน้นการ "กวาดข้อศอกออกข้างและไปข้างหลัง"',
          'หมุนนิ้วก้อยขึ้นด้านบนเล็กน้อย หรือจับแบบ Neutral Grip เพื่อกระตุ้นไหล่หลังสูงสุด',
          'ใช้สายเคเบิลหรือเครื่อง Reverse Pec Deck เพื่อแรงต้านคงที่ตลอดช่วง'
        ],
        recommendedExercises: ['Reverse Pec Deck Fly', 'Face Pulls', 'Cable Rear Delt Fly', 'Incline Dumbbell Rear Lateral Raise']
      },
      {
        id: 'rotator_cuff',
        nameTh: 'Rotator Cuff (SITS)',
        nameEn: 'Rotator Cuff (SITS)',
        latinName: 'Supraspinatus, Infraspinatus, Teres minor, Subscapularis',
        originInsertion: 'เกาะรอบกระดูกสะบักเชื่อมเข้าครอบหัวกระดูกต้นแขน (Glenohumeral joint)',
        fiberOrientation: 'ห่อหุ้มรอบทิศทาง ทำหน้าที่เป็นตัวดูดและล็อกหัวกระดูกต้นแขนไว้ในเบ้า',
        planeOfMotion: 'Multi-planar',
        primaryActions: [
          'External Rotation (หมุนแขนออกด้านนอก - Infraspinatus & Teres minor)',
          'Internal Rotation (หมุนแขนเข้าด้านใน - Subscapularis)',
          'Joint Stabilization (รักษาความมั่นคงและป้องกันการหลุดของเบ้าหัวไหล่)'
        ],
        biomechanicsNote: 'แม้จะไม่ใช่กล้ามเนื้อมัดใหญ่ แต่เป็นเสาหลักในการถ่ายทอดแรง หาก Rotator Cuff อ่อนแอ ข้อไหล่จะหลวมและเกิดอาการบาดเจ็บ Impingement เมื่อยกน้ำหนักหนักๆ',
        kinesiologyCues: [
          'แนบข้อศอกติดลำตัว (หรือใช้ผ้ารองใต้รักแร้) ขณะฝึก External Rotation',
          'ใช้น้ำหนักเบาและการควบคุมจังหวะที่นิ่ง ไม่กระชาก',
          'ฝึกเป็นประจำในวัน Push หรือช่วง Warm-up'
        ],
        recommendedExercises: ['Cable External Rotation', 'Side-lying Dumbbell External Rotation', 'Face Pull with External Rotation', 'Band Pull-Apart']
      }
    ]
  },

  biceps: {
    key: 'biceps',
    nameTh: 'Biceps (Arm Flexors)',
    nameEn: 'Biceps & Arm Flexors',
    latinName: 'Biceps brachii & Brachialis',
    view: 'front',
    description: 'กล้ามเนื้องอข้อศอกและหมุนหงายฝ่ามือ สร้างมิติแขนด้านหน้าให้ดูเต็มและมีลูกกล้ามโค้งสูง (Peak)',
    submuscles: ['Long Head (Outer/Peak)', 'Short Head (Inner/Thickness)', 'Brachialis', 'Brachioradialis'],
    subdivisions: [
      {
        id: 'biceps_long_head',
        nameTh: 'Biceps Long Head (Peak)',
        nameEn: 'Biceps Brachii (Long Head)',
        latinName: 'Caput longum musculi bicipitis brachii',
        originInsertion: 'เกาะจาก Supraglenoid tubercle เหนือเบ้าข้อไหล่ ข้ามข้อต่อหัวไหล่ลงมายัง Radial tuberosity',
        fiberOrientation: 'วิ่งขนานตามแนวยาวด้านนอกของแขน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Elbow Flexion (งอข้อศอก)',
          'Forearm Supination (หมุนหงายฝ่ามือ)',
          'Shoulder Flexion (ช่วยยกแขนไปข้างหน้าเล็กน้อย)'
        ],
        biomechanicsNote: 'เนื่องจากเส้นเอ็นหัวยาวข้ามข้อไหล่ การวางข้อศอกไปด้านหลังลำตัว (เช่น Incline Dumbbell Curl) จะทำให้เส้นใยมัดนี้ถูกยืดออกเต็มที่ (Passive Stretch) ส่งผลให้เกิด Tension สูงสุดในการสร้างยอดกล้ามเนื้อ (Bicep Peak)',
        kinesiologyCues: [
          'ล็อกข้อศอกไว้ด้านหลังลำตัวเล็กน้อย (เช่น บนเบาะปรับเอน Incline 45-60°)',
          'จับบาร์แบบแคบลงเล็กน้อย (Narrower Grip) หรือบิดนิ้วก้อยเข้าหาตัว',
          'ไม่ยกข้อศอกขึ้นข้างหน้าเพื่อโกงน้ำหนัก'
        ],
        recommendedExercises: ['Incline Dumbbell Curl', 'Close-Grip Barbell Curl', 'Drag Curl', 'Cable Behind-the-Back Curl']
      },
      {
        id: 'biceps_short_head',
        nameTh: 'Biceps Short Head (Inner)',
        nameEn: 'Biceps Brachii (Short Head)',
        latinName: 'Caput breve musculi bicipitis brachii',
        originInsertion: 'เกาะจาก Coracoid process ของกระดูกสะบัก ไปยังกระดูกรัศมี (Radius)',
        fiberOrientation: 'วิ่งตามแนวด้านในของท่อนแขนบน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Elbow Flexion with Supination (งอศอกพร้อมบิดหงายฝ่ามือออกด้านนอก)',
          'Horizontal Adduction of arm'
        ],
        biomechanicsNote: 'เมื่อข้อศอกถูกดันมาข้างหน้าลำตัว (เช่น Preacher Curl หรือ Spider Curl) หัวสั้นจะเข้าสู่สภาวะความตึงตัวสูงขึ้น และการกว้างมือออก (Wide Grip) จะโฟกัสแรงมาที่มัดในนี้โดยตรง',
        kinesiologyCues: [
          'วางข้อศอกมาข้างหน้าลำตัว (วางบนเบาะ Preacher หรือเอนตัวคว่ำ)',
          'จับบาร์หรือดัมเบลกว้างกว่าช่วงไหล่เล็กน้อย',
          'จังหวะงอสุดให้ "บิดข้อมือหงายออกนอก (Supinate)" เค้นให้กล้ามเนื้อเกร็งตัวเต็มที่'
        ],
        recommendedExercises: ['Preacher Curl', 'Spider Curl', 'Wide-Grip EZ Bar Curl', 'Concentration Curl']
      },
      {
        id: 'brachialis',
        nameTh: 'Brachialis',
        nameEn: 'Brachialis Muscle',
        latinName: 'Musculus brachialis',
        originInsertion: 'เกาะจากครึ่งล่างด้านหน้าของกระดูกต้นแขน ไปยัง Tuberosity ของกระดูกอัลนา (Ulna)',
        fiberOrientation: 'อยู่ใต้ไบเซปส์ วิ่งตรงสู่ข้อศอก ไม่ข้ามข้อต่อไหล่',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Pure Elbow Flexion (งอข้อศอกอย่างบริสุทธิ์ในทุกองศาการหมุนข้อมือ)'
        ],
        biomechanicsNote: 'เนื่องจากเกาะกับกระดูก Ulna ซึ่งไม่หมุนตามข้อมือ กล้ามเนื้อมัดนี้จึงออกแรงงอข้อศอกได้เท่ากันไม่ว่าจะหงาย คว่ำ หรือจับค้อน แต่เมื่อจับแบบคว่ำหรือค้อน (Neutral/Pronated Grip) ไบเซปส์จะถูกลดประสิทธิภาพลง ทำให้ Brachialis ต้องรับภาระหลักเต็มๆ',
        kinesiologyCues: [
          'จับดัมเบลในแนวตั้งเหมือนถือค้อน (Neutral Hammer Grip)',
          'การเติบโตของมัดนี้จะดันให้กล้ามเนื้อ Biceps และ Triceps แยกชั้นและแขนดูกว้างขึ้นทันที',
          'ควบคุมช่วงลดน้ำหนัก (Eccentric) ให้ช้าลง 2-3 วินาที'
        ],
        recommendedExercises: ['Dumbbell Hammer Curl', 'Rope Cable Hammer Curl', 'Reverse EZ Bar Curl', 'Cross-Body Hammer Curl']
      }
    ]
  },

  triceps: {
    key: 'triceps',
    nameTh: 'Triceps',
    nameEn: 'Triceps Muscles',
    latinName: 'Triceps brachii',
    view: 'back',
    description: 'คิดเป็น 60% ของมวลรวมแขนทั้งหมด มี 3 หัว ทำหน้าที่เหยียดข้อศอกและดึงแขนเข้าหาลำตัว',
    submuscles: ['Long Head', 'Lateral Head (Horseshoe)', 'Medial Head'],
    subdivisions: [
      {
        id: 'triceps_long_head',
        nameTh: 'Triceps Long Head',
        nameEn: 'Triceps Long Head',
        latinName: 'Caput longum musculi tricipitis brachii',
        originInsertion: 'เป็นมัดเดียวที่เกาะข้ามข้อไหล่ จาก Infraglenoid tubercle ของสะบัก ไปยัง Olecranon ของศอก',
        fiberOrientation: 'วิ่งตามแนวด้านหลังในของต้นแขน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Elbow Extension (เหยียดข้อศอก)',
          'Shoulder Extension & Adduction (ดึงแขนไปด้านหลังและแนบเข้าหาตัว)'
        ],
        biomechanicsNote: 'เนื่องจากข้ามข้อไหล่ เมื่อยกแขนขึ้นเหนือศีรษะ (Overhead Position) หัวยาวจะถูกยืดออกจนสุด (Full Stretch) สร้างแรงกล้ามเนื้อและความตึงในระดับที่กระตุ้นการสร้างกล้ามเนื้อ (Hypertrophy) ได้สูงที่สุด',
        kinesiologyCues: [
          'ยกข้อศอกขึ้นเหนือศีรษะ เช่น ท่า Overhead Cable Extension หรือ Skullcrusher',
          'รักษาข้อศอกให้นิ่งชี้ไปข้างหน้า ไม่กางบานออกด้านข้างมากเกินไป',
          'ผ่อนน้ำหนักลงให้ลึกจนรู้สึกตึงที่ต้นแขนหลังด้านในก่อนเหยียดขึ้น'
        ],
        recommendedExercises: ['Overhead Cable Triceps Extension', 'EZ Bar Skullcrusher', 'Incline Dumbbell Overhead Extension', 'Close-Grip Bench Press']
      },
      {
        id: 'triceps_lateral_head',
        nameTh: 'Triceps Lateral Head (Horseshoe)',
        nameEn: 'Triceps Lateral Head',
        latinName: 'Caput laterale musculi tricipitis brachii',
        originInsertion: 'เกาะจากผิวด้านหลังของกระดูกต้นแขนเหนือ Radial groove ไปยัง Olecranon',
        fiberOrientation: 'วิ่งตามแนวขอบนอกของท่อนแขนบน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Elbow Extension under heavy load (เหยียดข้อศอกเมื่อมีแรงต้านหนัก)'
        ],
        biomechanicsNote: 'ออกแรงสูงสุดเมื่อแขนอยู่ข้างลำตัว (Shoulder Neutral/Adducted) ท่ากดลง เช่น Cable Pushdown หรือ Dips จะทำให้หัวนอกถูกเกร็งตัวอย่างรุนแรงและเกิดรอยต่อเกือกม้าที่ชัดเจน',
        kinesiologyCues: [
          'หนีบข้อศอกแนบข้างลำตัวและล็อกตำแหน่งให้นิ่งสนิท',
          'เหยียดแขนลงให้สุดจนล็อกศอกอย่างนุ่มนวล พร้อมบิดแยกเชือกออกที่จุดล่างสุด',
          'ดันด้วยส้นมือหรือฝ่ามือด้านนอก'
        ],
        recommendedExercises: ['Cable Rope Pushdown', 'Straight Bar Pushdown', 'Parallel Bar Triceps Dips', 'Diamond Push-ups']
      },
      {
        id: 'triceps_medial_head',
        nameTh: 'Triceps Medial Head',
        nameEn: 'Triceps Medial Head',
        latinName: 'Caput mediale musculi tricipitis brachii',
        originInsertion: 'เกาะจากผิวด้านหลังของกระดูกต้นแขนใต้ Radial groove ไปยัง Olecranon',
        fiberOrientation: 'อยู่ชั้นลึกใกล้กับข้อศอก ทำงานเป็นเบสในทุกการเหยียดแขน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Precise Elbow Extension (เหยียดข้อศอกในทุกช่วงมุม แม้น้ำหนักเบา)'
        ],
        biomechanicsNote: 'เป็นกล้ามเนื้อแกนหลักที่ทำงานตลอดเวลาในทุกมุมองศาการเหยียดศอก ท่าที่จับแบบหงายมือ (Reverse Grip Pushdown) จะช่วยลดแรงกระชากของหัวนอกและโฟกัสหัวในได้โดดเด่นขึ้น',
        kinesiologyCues: [
          'ใช้บาร์ตรงจับแบบหงายมือ (Underhand / Reverse Grip)',
          'เหยียดแขนจนสุดและเกร็งค้าง 1 วินาที',
          'เน้นการคุมจังหวะไม่ใช้แรงเหวี่ยง'
        ],
        recommendedExercises: ['Reverse Grip Cable Pushdown', 'Bench Dips', 'Single Arm Cable Kickback', 'Dumbbell Kickback']
      }
    ]
  },

  forearms: {
    key: 'forearms',
    nameTh: 'Forearms & Grip',
    nameEn: 'Forearms & Grip',
    latinName: 'Antebrachial flexors & extensors',
    view: 'both',
    description: 'ควบคุมพลังการจับ กำมือ และการเคลื่อนไหวข้อมือทุกมิติ ทั้งงอ เหยียด และบิด',
    submuscles: ['Wrist Flexors', 'Wrist Extensors', 'Brachioradialis'],
    subdivisions: [
      {
        id: 'forearm_flexors',
        nameTh: 'Wrist Flexors (Anterior Compartment)',
        nameEn: 'Anterior Forearm Compartment (Flexors)',
        latinName: 'Flexor carpi radialis, ulnaris & Digitorum',
        originInsertion: 'เกาะจาก Medial epicondyle ของข้อศอกลงไปยังกระดูกฝ่ามือและนิ้วมือ',
        fiberOrientation: 'วิ่งตามแนวด้านในของปลายแขน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Wrist Flexion (กระดกข้อมือเข้าหาตัว/งอข้อมือ)',
          'Finger Flexion & Grip Strength (กำมือ บีบแน่น)'
        ],
        biomechanicsNote: 'เป็นกลุ่มกล้ามเนื้อที่ให้ขนาดและความหนาของปลายแขนด้านใน และเป็นแหล่งพลัง Grip Strength ในการยกท่าดึงทุกชนิด',
        kinesiologyCues: [
          'วางปลายแขนราบบนต้นขาหรือขอบเบาะ',
          'ปล่อยให้ดัมเบลหรือบาร์เบลกลิ้งลงมาจนถึงปลายนิ้วก่อนม้วนข้อมือขึ้น',
          'บีบเกร็งค้างที่จุดสูงสุด'
        ],
        recommendedExercises: ['Barbell Wrist Curl', 'Dumbbell Wrist Curl', 'Dead Hang (ฝึกแรงบีบ)', 'Farmer Walk']
      },
      {
        id: 'forearm_extensors',
        nameTh: 'Wrist Extensors (Posterior Compartment)',
        nameEn: 'Posterior Forearm Compartment (Extensors)',
        latinName: 'Extensor carpi radialis & ulnaris',
        originInsertion: 'เกาะจาก Lateral epicondyle ของข้อศอกไปยังหลังมือ',
        fiberOrientation: 'วิ่งตามแนวหลังมือและสันแขนด้านนอก',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Wrist Extension (กระดกข้อมือขึ้นด้านบน)',
          'Joint Stabilization (รักษาสมดุลข้อมือไม่ให้พับลง)'
        ],
        biomechanicsNote: 'มักถูกละเลยจนเกิดความไม่สมดุลกับกลุ่ม Flexor การฝึกท่า Reverse Wrist Curl จะช่วยป้องกันอาการเอ็นข้อศอกอักเสบ (Tennis Elbow)',
        kinesiologyCues: [
          'คว่ำฝ่ามือลงบนขอบเบาะ',
          'กระดกเฉพาะข้อมือขึ้นอย่างช้าๆ ใช้น้ำหนักพอเหมาะ',
          'อย่าให้ท่อนแขนยกตาม'
        ],
        recommendedExercises: ['Reverse Barbell Wrist Curl', 'Reverse Dumbbell Wrist Curl', 'Forearm Roller']
      }
    ]
  },

  abs: {
    key: 'abs',
    nameTh: 'Abdominals & Core',
    nameEn: 'Abdominals & Core',
    latinName: 'Rectus abdominis & Obliques',
    view: 'front',
    description: 'ผนังกล้ามเนื้อพยุงกระดูกสันหลัง ป้องกันแรงกดทับ และสร้างมิติซิกแพคคมชัด',
    submuscles: ['Upper Rectus Abdominis', 'Lower Rectus Abdominis', 'Obliques', 'Transverse Abdominis & Serratus'],
    subdivisions: [
      {
        id: 'abs_upper',
        nameTh: 'Upper Rectus Abdominis',
        nameEn: 'Upper Rectus Abdominis',
        latinName: 'Pars superior recti abdominis',
        originInsertion: 'เกาะจากกระดูก Xiphoid process และกระดูกซี่โครง 5-7 วิ่งลงสู่แนวกึ่งกลาง',
        fiberOrientation: 'วิ่งในแนวดิ่งตามแนวกระดูกสันหลัง',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Trunk / Thoracic Flexion (งอหลังช่วงอกม้วนตัวลงมาหาเชิงกราน)'
        ],
        biomechanicsNote: 'กระตุ้นได้ดีที่สุดเมื่อกระดูกเชิงกรานอยู่กับที่ (Pelvis fixed) แล้วดึงกระดูกอกม้วนโค้งลงมาหาเชิงกราน การทำแค่ยกคอขึ้นไม่ทำให้กล้ามท้องทำงาน ต้องเกิดการงอของกระดูกสันหลัง (Spinal Flexion)',
        kinesiologyCues: [
          'จินตนาการว่ากำลัง "พยายามเอากระดูกซี่โครงล่างม้วนลงไปแตะสะดือ"',
          'อย่าดึงคอหรือใช้มือช่วยกระชากศีรษะ',
          'หายใจออกให้หมดปอดขณะม้วนตัวขึ้นเพื่อเกร็งกล้ามท้องได้ลึกที่สุด'
        ],
        recommendedExercises: ['Cable Crunch', 'Weighted Machine Crunch', 'Decline Bench Crunch', 'Swiss Ball Crunch']
      },
      {
        id: 'abs_lower',
        nameTh: 'Lower Rectus Abdominis',
        nameEn: 'Lower Rectus Abdominis',
        latinName: 'Pars inferior recti abdominis',
        originInsertion: 'เกาะลงไปยัง Pubic crest และ Pubic symphysis ของกระดูกเชิงกราน',
        fiberOrientation: 'วิ่งในแนวดิ่งเชื่อมขอบกระดูกเชิงกราน',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Posterior Pelvic Tilt (ม้วนเชิงกรานหงายขึ้นด้านบน)',
          'Trunk Flexion from below'
        ],
        biomechanicsNote: 'แม้ Rectus Abdominis จะเป็นกล้ามเนื้อแผ่นเดียว แต่การเคลื่อนไหวแบบม้วนเชิงกราน (Posterior Pelvic Tilt) ในท่า Hanging Leg/Knee Raise จะกระตุ้นความตึงของเส้นใยส่วนล่างได้เข้มข้นที่สุด (ระวังอย่าใช้แต่กล้ามเนื้องอสะโพก Hip Flexors)',
        kinesiologyCues: [
          'อย่าคิดแค่ยกขาขึ้น ให้โฟกัสที่การ "ม้วนก้นและเชิงกรานหงายขึ้นหาหน้าอก"',
          'งอเข่าเล็กน้อยเพื่อลดการทำงานของกล้ามเนื้อต้นขาด้านหน้า (Hip Flexors)',
          'หยุดค้าง 1 วินาทีที่จุดบนสุด และผ่อนลงช้าๆ ไม่เหวี่ยงตัว'
        ],
        recommendedExercises: ['Hanging Leg Raise', 'Captain’s Chair Knee Raise', 'Reverse Crunch', 'Ab Wheel Rollout']
      },
      {
        id: 'obliques',
        nameTh: 'External & Internal Obliques',
        nameEn: 'External & Internal Obliques',
        latinName: 'Musculus obliquus externus & internus abdominis',
        originInsertion: 'เกาะจากขอบซี่โครง 8 ซี่ล่าง วิ่งเฉียงเป็นรูปตัว V ลงสู่ขอบกระดูกเชิงกราน',
        fiberOrientation: 'เรียงตัวเฉียงเหมือนเอามือล้วงกระเป๋ากางเกง',
        planeOfMotion: 'Transverse',
        primaryActions: [
          'Trunk Rotation (บิดและหมุนลำตัว)',
          'Lateral Flexion (เอียงลำตัวไปด้านข้าง)',
          'Intra-abdominal Pressure Stabilization'
        ],
        biomechanicsNote: 'เส้นใยวิ่งเป็นแนวเฉียง การเคลื่อนไหวในระนาบหมุนตัดขวาง (Transverse Plane) เช่น ท่า Cable Woodchop หรือหมุนตัว จะทำให้เกิดแรงดึงตามแนวเส้นใยอย่างแม่นยำ',
        kinesiologyCues: [
          'บิดลำตัวจากช่วงเอวและซี่โครง ไม่ใช่แค่หมุนหัวไหล่หรือแขน',
          'รักษาเชิงกรานให้นิ่งมั่นคงเพื่อส่งแรงต้านมาที่ Obliques เต็มที่',
          'หายใจออกแรงๆ ในจังหวะบิดเกร็ง'
        ],
        recommendedExercises: ['Cable Woodchoppers (High-to-Low / Low-to-High)', 'Russian Twists', 'Hanging Windshield Wipers', 'Side Plank']
      }
    ]
  },

  quads: {
    key: 'quads',
    nameTh: 'Quadriceps',
    nameEn: 'Quadriceps Femoris',
    latinName: 'Quadriceps femoris',
    view: 'front',
    description: 'กลุ่มกล้ามเนื้อ 4 มัดด้านหน้าขา สร้างแรงถีบขับเคลื่อนและเหยียดเข่าอันทรงพลัง',
    submuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis (VMO)', 'Vastus Intermedius'],
    subdivisions: [
      {
        id: 'quad_rectus_femoris',
        nameTh: 'Rectus Femoris',
        nameEn: 'Rectus Femoris',
        latinName: 'Musculus rectus femoris',
        originInsertion: 'เกาะจาก Anterior inferior iliac spine (เชิงกราน) ข้ามข้อสะโพกและเข่าลงสู่ลูกสะบ้า',
        fiberOrientation: 'วิ่งเป็นแนวดิ่งตรงกลางหน้าขา',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Knee Extension (เหยียดข้อเข่า)',
          'Hip Flexion (งอข้อสะโพกยกขาขึ้น)'
        ],
        biomechanicsNote: 'เนื่องจากข้ามทั้งข้อสะโพกและข้อเข่า ในท่า Squat สะโพกจะงอพร้อมกับเข่างอ ทำให้ความยาวกล้ามเนื้อมัดนี้แทบไม่เปลี่ยน (Active Insufficiency) ดังนั้นท่าที่พัฒนา Rectus Femoris ได้ดีที่สุดคือ Leg Extension หรือ Sissy Squat ที่สะโพกอยู่นิ่งแล้วเหยียดเข่าอย่างเดียว',
        kinesiologyCues: [
          'เล่นท่า Leg Extension โดยปรับพนักพิงเอนไปข้างหลังเล็กน้อยเพื่อยืดมัดนี้',
          'เหยียดเข่าจนขาตรงสนิท เกร็งบีบหน้าขาค้าง 1 วินาที',
          'ควบคุมช่วงปล่อยลง 2-3 วินาที'
        ],
        recommendedExercises: ['Leg Extension Machine', 'Sissy Squat', 'Reverse Nordic Curl', 'Cable Leg Extension']
      },
      {
        id: 'quad_vastus_lateralis',
        nameTh: 'Vastus Lateralis (Outer Sweep)',
        nameEn: 'Vastus Lateralis',
        latinName: 'Musculus vastus lateralis',
        originInsertion: 'เกาะจาก Greater trochanter และ Linea aspera ของกระดูกต้นขา ไปยังลูกสะบ้า',
        fiberOrientation: 'วิ่งเฉียงลงตามแนวด้านข้างลำตัวขานอก สร้างความกว้างขา (Quad Sweep)',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Knee Extension under heavy load (เหยียดข้อเข่ารับแรงกดหนัก)'
        ],
        biomechanicsNote: 'เป็นมัดที่มีขนาดใหญ่ที่สุดของ Quadriceps รับแรงมากที่สุดในท่าประเภท Squat และ Leg Press ยิ่งมุมเข่างอลึก (Deep Knee Flexion) มัดนี้ยิ่งถูกยืดและรับแรงตึงตัวสูง',
        kinesiologyCues: [
          'ยืนปลายเท้าตรงหรือเฉียงออกเล็กน้อยตามธรรมชาติ',
          'ดันเข่าไปข้างหน้าให้พับลึกที่สุดเท่าที่ข้อเท้าไม่ลอย (Deep Squat)',
          'ดันส้นเท้าและฝ่ามือเท้าลงพื้นอย่างมั่นคง'
        ],
        recommendedExercises: ['Barbell Back Squat', 'Hack Squat', 'Leg Press', 'Front Squat']
      },
      {
        id: 'quad_vmo',
        nameTh: 'Vastus Medialis Oblique (VMO Tear Drop)',
        nameEn: 'Vastus Medialis Oblique (VMO)',
        latinName: 'Musculus vastus medialis',
        originInsertion: 'เกาะจากขอบในของกระดูกต้นขาลงสู่อุปกรณ์ยึดลูกสะบ้าด้านใน',
        fiberOrientation: 'เส้นใยส่วนล่างวิ่งทำมุมเฉียงเกือบ 55 องศา โอบลูกสะบ้า',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Terminal Knee Extension (เหยียดเข่าในช่วง 15-30 องศาหลังสุด)',
          'Patellar Tracking (ดึงล็อกลูกสะบ้าให้อยู่ในร่อง ไม่ให้ปวดเข่า)'
        ],
        biomechanicsNote: 'สำคัญอย่างยิ่งต่อสุขภาพเข่า หาก VMO อ่อนแอ ลูกสะบ้าจะถูกดึงออกข้างจนเกิดการเสียดสี ท่า Split Squat หรือท่าเหยียดเข่าสุดช่วงจะกระตุ้นมัดนี้เป็นพิเศษ',
        kinesiologyCues: [
          'เวลาเหยียดขาในเครื่อง Leg Extension ให้ล็อกเหยียดจนสุดช่วงเพื่อเค้นหยดน้ำ',
          'ท่า Bulgarian Split Squat ให้ก้าวขาระยะพอดี เพื่อให้เข่างอทำมุมลึก',
          'รักษาแนวหัวเข่าให้ชี้ไปในทิศทางเดียวกับนิ้วเท้าชี้เสมอ'
        ],
        recommendedExercises: ['Bulgarian Split Squat', 'Cyclist Squat (Heels Elevated)', 'Leg Extension (Full Lockout)', 'Step-ups']
      }
    ]
  },

  hamstrings: {
    key: 'hamstrings',
    nameTh: 'Hamstrings',
    nameEn: 'Hamstring Complex',
    latinName: 'Hamstrings',
    view: 'back',
    description: 'กล้ามเนื้อขับเคลื่อนด้านหลัง ช่วยงอเข่าและเหยียดสะโพก ป้องกันเอ็นไขว้หน้า (ACL)',
    submuscles: ['Biceps Femoris (Lateral)', 'Semitendinosus & Semimembranosus (Medial)'],
    subdivisions: [
      {
        id: 'hamstring_biceps_femoris',
        nameTh: 'Biceps Femoris (Lateral Hamstring)',
        nameEn: 'Biceps Femoris (Long & Short Head)',
        latinName: 'Musculus biceps femoris',
        originInsertion: 'หัวยาวเกาะจาก Ischial tuberosity (กระดูกก้นกบ) หัวสั้นเกาะจากกระดูกต้นขา วิ่งสู่หัวกระดูก Fibula',
        fiberOrientation: 'วิ่งตามแนวด้านนอกของหลังขา',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Knee Flexion (งอข้อเข่าเข้าหาก้น)',
          'Hip Extension (ถีบสะโพกเหยียดไปข้างหลัง - Long head only)',
          'External Rotation of Lower Leg (หมุนปลายขาออกนอกเล็กน้อย)'
        ],
        biomechanicsNote: 'หัวสั้น (Short head) ไม่ข้ามข้อสะโพก จึงทำงานได้เฉพาะในท่างอเข่า (Knee Flexion เช่น Leg Curl) เท่านั้น ในขณะที่หัวยาวทำงานได้ทั้งท่า RDL และ Leg Curl',
        kinesiologyCues: [
          'ในเครื่อง Seated หรือ Lying Leg Curl โฟกัสดึงส้นเท้าเข้าหาก้น',
          'ไม่ยกสะโพกลอยขึ้นจากเบาะในท่า Lying Leg Curl',
          'ผ่อนขากลับช้าๆ อย่าปล่อยให้แผ่นน้ำหนักกระแทก'
        ],
        recommendedExercises: ['Seated Leg Curl', 'Lying Leg Curl', 'Romanian Deadlift (RDL)', 'Single-leg Leg Curl']
      },
      {
        id: 'hamstring_medial',
        nameTh: 'Semitendinosus & Semimembranosus (Medial Hamstring)',
        nameEn: 'Medial Hamstrings (Semi-T & Semi-M)',
        latinName: 'Semitendinosus & Semimembranosus',
        originInsertion: 'เกาะจากกระดูกก้นกบ (Ischial tuberosity) วิ่งลงสู่ผิวด้านในของกระดูก Tibia',
        fiberOrientation: 'วิ่งตามแนวด้านในของหลังขา',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Hip Extension at Stretched Position (เหยียดสะโพกในช่วงกล้ามเนื้อยืดตัว)',
          'Knee Flexion with Internal Rotation (งอเข่าพร้อมหมุนปลายขาเข้าใน)'
        ],
        biomechanicsNote: 'กลุ่มมัดในนี้จะถูกกระตุ้นสูงสุดในท่าพับสะโพก (Hip Hinge เช่น Romanian Deadlift) เพราะเกิดการยืดตัวระดับสูงสุดที่ข้อต่อสะโพก',
        kinesiologyCues: [
          'ดันสะโพกไปข้างหลังให้ไกลที่สุด (Hinge back)',
          'รักษาแนวกระดูกสันหลังให้ตรง ไม่โก่งหลัง',
          'งอเข่าเพียงเล็กน้อย (Soft knees) เพื่อถ่ายแรงตึงมาที่หลังขาทันที'
        ],
        recommendedExercises: ['Barbell Romanian Deadlift (RDL)', 'Dumbbell RDL', 'Good Mornings', 'Glute Ham Raise']
      }
    ]
  },

  glutes: {
    key: 'glutes',
    nameTh: 'Gluteal Muscles (Glutes)',
    nameEn: 'Gluteal Muscles',
    latinName: 'Gluteal muscles',
    view: 'back',
    description: 'กล้ามเนื้อที่มีพละกำลังมากที่สุดในร่างกายมนุษย์ สร้างพลังสปริ้นต์ กระโดด และรูปทรงสะโพกกลมแน่น',
    submuscles: ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus'],
    subdivisions: [
      {
        id: 'glute_maximus',
        nameTh: 'Gluteus Maximus',
        nameEn: 'Gluteus Maximus',
        latinName: 'Musculus gluteus maximus',
        originInsertion: 'เกาะจากผิวนอกของกระดูกเชิงกรานและ Sacrum ไปยัง Gluteal tuberosity และ IT Band',
        fiberOrientation: 'เส้นใยหนาวิ่งเฉียงลง 45 องศาจากกึ่งกลางสะโพกออกด้านข้าง',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Hip Extension (ถีบสะโพกเหยียดไปข้างหลัง)',
          'Hip External Rotation (หมุนข้อสะโพกออกนอก)',
          'Posterior Pelvic Stabilization'
        ],
        biomechanicsNote: 'ท่า Hip Thrust หรือ Glute Bridge มีจุดเด่นทางชีวกลศาสตร์คือสร้างแรงต้านสูงสุด (Peak Tension) ในจุดที่กล้ามเนื้อหดสั้นที่สุด (Shortened Position) ซึ่งแตกต่างจาก Squat ที่ตึงสุดในจุดยืด',
        kinesiologyCues: [
          'ในท่า Barbell Hip Thrust ให้วางหลังส่วนสะบักบนเบาะ',
          'ถีบส้นเท้า ดันสะโพกขึ้นจนแนวตัวขนานพื้น บีบก้นค้าง 1-2 วินาที',
          'ตามองตรงไปข้างหน้า ไม่แหงนหน้ามองเพดานเพื่อป้องกันการแอ่นหลังล่าง'
        ],
        recommendedExercises: ['Barbell Hip Thrust', 'Glute Bridge', 'Cable Glute Kickback', 'Sumo Deadlift']
      },
      {
        id: 'glute_medius',
        nameTh: 'Gluteus Medius',
        nameEn: 'Gluteus Medius',
        latinName: 'Musculus gluteus medius',
        originInsertion: 'เกาะจากผิวนอกกระดูก Ilia ไปยัง Greater trochanter ของกระดูกต้นขา',
        fiberOrientation: 'แผ่เหมือนพัดบริเวณขอบบนด้านข้างของสะโพก',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Hip Abduction (กางขาออกจากกึ่งกลางลำตัว)',
          'Pelvic Stability (ป้องกันไม่ให้เชิงกรานเอียงตกเวลาเดินหรือยืนขาเดียว)'
        ],
        biomechanicsNote: 'ทำงานในระนาบ Frontal Plane อย่างแท้จริง การฝึกท่า Hip Abduction ด้วยสายเคเบิลหรือเครื่อง Abductor จะช่วยสร้างเนื้อสะโพกด้านบน-ข้าง (Upper Glute Shelf)',
        kinesiologyCues: [
          'กางขาออกด้านข้างโดยปลายเท้าชี้ตรงไปข้างหน้า (ไม่หมุนปลายเท้าชี้ขึ้น)',
          'ในเครื่อง Seated Abductor โน้มตัวไปข้างหน้าเล็กน้อยเพื่อโฟกัสก้นข้าง',
          'ควบคุมช่วงต้านขาหุบกลับช้าๆ'
        ],
        recommendedExercises: ['Seated Machine Hip Abduction', 'Cable Hip Abduction', 'Side Lying Leg Raise', 'Banded Crab Walk']
      }
    ]
  },

  calves: {
    key: 'calves',
    nameTh: 'Calves',
    nameEn: 'Calves',
    latinName: 'Gastrocnemius & Soleus',
    view: 'back',
    description: 'สปริงธรรมชาติของร่างกาย ช่วยเขย่งปลายเท้าและดันพื้นในทุกก้าวเดิน',
    submuscles: ['Gastrocnemius', 'Soleus', 'Tibialis Anterior'],
    subdivisions: [
      {
        id: 'calf_gastroc',
        nameTh: 'Gastrocnemius (Two Heads)',
        nameEn: 'Gastrocnemius (Medial & Lateral Heads)',
        latinName: 'Musculus gastrocnemius',
        originInsertion: 'เกาะจาก Femoral condyles (เหนือข้อเข่า) ข้ามข้อเข่าและข้อเท้าลงสู่เอ็นร้อยหวาย (Achilles)',
        fiberOrientation: 'เส้นใยแนวตั้งแบ่งเป็นสองแฉก (ในและนอก)',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Plantarflexion with Knee Extended (เขย่งปลายเท้าขณะเข่าเหยียดตรง)'
        ],
        biomechanicsNote: 'เนื่องจากเกาะข้ามข้อเข่า หากเข่างอ (เช่นท่านั่ง Seated Calf Raise) กล้ามเนื้อมัดนี้จะหย่อนและหมดแรง (Active Insufficiency) จึงต้องฝึกในท่ายืน (Standing Calf Raise) หรือเข่าตรงเท่านั้น',
        kinesiologyCues: [
          'เหยียดขาตรง (เข่าไม่งอ) ในท่ายืน Standing Calf Raise',
          'หย่อนส้นเท้าลงให้ต่ำกว่าระดับแท่นเพื่อยืดเอ็นร้อยหวายเต็มที่ ค้างไว้ 1 วินาทีเพื่อตัดแรงสปริงเอ็น',
          'เขย่งดันปลายเท้าขึ้นสูงสุดด้วยเนินนิ้วโป้งเท้า'
        ],
        recommendedExercises: ['Standing Calf Raise', 'Donkey Calf Raise', 'Leg Press Calf Press', 'Smith Machine Calf Raise']
      },
      {
        id: 'calf_soleus',
        nameTh: 'Soleus',
        nameEn: 'Soleus Muscle',
        latinName: 'Musculus soleus',
        originInsertion: 'เกาะจากกระดูก Tibia & Fibula (ใต้เข่า) ลงสู่เอ็นร้อยหวาย ไม่ข้ามข้อเข่า',
        fiberOrientation: 'กล้ามเนื้อแบนกว้างอยู่ใต้ Gastrocnemius',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Plantarflexion under any knee angle (เขย่งปลายเท้าได้ทุกมุม โดยเฉพาะตอนงอเข่า)'
        ],
        biomechanicsNote: 'เมื่อนั่งงอเข่า 90 องศา Gastrocnemius จะถูกปิดสวิตช์ ส่งผลให้ Soleus ต้องรับภาระการเขย่ง 100% การพัฒนามัดนี้จะดันให้น่องโดยรวมดูหนาและเต็มจากด้านข้าง',
        kinesiologyCues: [
          'ฝึกด้วยเครื่องท่านั่ง Seated Calf Raise (งอเข่า 90°)',
          'เนื่องจาก Soleus ประกอบด้วยเส้นใยกล้ามเนื้อกระตุกช้า (Type I) สูงมาก ให้ใช้น้ำหนักปานกลางและจำนวนครั้ง 15-20 ครั้ง',
          'ค้างที่จุดบนสุด 2 วินาที'
        ],
        recommendedExercises: ['Seated Calf Raise', 'Dumbbell Seated Calf Raise', 'Farmer Walk on Toes']
      }
    ]
  },

  traps: {
    key: 'traps',
    nameTh: 'Trapezius & Upper Back',
    nameEn: 'Trapezius',
    latinName: 'Trapezius',
    view: 'back',
    description: 'กล้ามเนื้อรูปว่าวคลุมตั้งแต่ต้นคอจนถึงกลางหลัง ควบคุมการเคลื่อนไหวของกระดูกสะบักทุกทิศทาง',
    submuscles: ['Upper Trapezius', 'Middle Trapezius & Rhomboids', 'Lower Trapezius'],
    subdivisions: [
      {
        id: 'traps_upper',
        nameTh: 'Upper Trapezius',
        nameEn: 'Upper Trapezius',
        latinName: 'Pars descendens trapezii',
        originInsertion: 'เกาะจากฐานกะโหลกศีรษะและแนวกระดูกคอ ไปยังกระดูกไหปลาร้า 1/3 ด้านนอก',
        fiberOrientation: 'เส้นใยวิ่งเฉียงลงและออกด้านข้าง',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Scapular Elevation (ยกสะบักและยักไหล่ขึ้นด้านบน)',
          'Upward Rotation of Scapula'
        ],
        biomechanicsNote: 'เส้นใยบ่าบนวิ่งเฉียงประมาณ 20-30° ไม่ได้วิ่งตรงในแนวดิ่งบริสุทธิ์ การยักไหล่แบบกางแขนออกเล็กน้อย (Kelso Shrug หรือ Dumbbell Shrug มุม 30°) จะตรงกับแนวเส้นใยมากกว่าการยืนตรงแขนแนบชิดตัว',
        kinesiologyCues: [
          'ยักไหล่ขึ้นในแนวเฉียงเข้าหากกหูด้านหลังเล็กน้อย',
          'อย่าหมุนควงหัวไหล่เป็นวงกลม เพราะทำให้เอ็นข้อต่อเสียดสีโดยไร้ประโยชน์',
          'หยุดค้างเกร็งที่จุดบนสุด 1-2 วินาที'
        ],
        recommendedExercises: ['Dumbbell Shrugs (Slight Lean)', 'Barbell Shrugs', 'Cable Shrugs', 'Farmer Walk']
      },
      {
        id: 'traps_mid_rhomboids',
        nameTh: 'Middle Trapezius & Rhomboids',
        nameEn: 'Middle Trapezius & Rhomboids',
        latinName: 'Pars transversa trapezii & Rhomboidei',
        originInsertion: 'เกาะจากกระดูกสันหลังช่วงอก T1-T5 วิ่งขวางมาเกาะขอบในของสะบัก',
        fiberOrientation: 'เส้นใยวางตัวในแนวนอนขวางแผ่นหลัง',
        planeOfMotion: 'Transverse',
        primaryActions: [
          'Scapular Retraction (บีบและหนีบกระดูกสะบักเข้าหากึ่งกลางหลัง)'
        ],
        biomechanicsNote: 'นี่คือหัวใจหลักในการสร้าง "ความหนาของแผ่นหลัง (Back Thickness)" ท่าดึง Row แบบกางศอกออกกว้าง (Wide-Grip Row ทำมุม 45-60° กับลำตัว) จะส่งแรงเข้าสู่มัดนี้โดยตรง',
        kinesiologyCues: [
          'กางข้อศอกออกประมาณ 45-60 องศาจากลำตัว (Wide Grip)',
          'โฟกัสที่การ "หนีบกระดูกสะบักสองข้างเข้าหากระดูกสันหลัง"',
          'แอ่นอกรับในจังหวะดึงสุด'
        ],
        recommendedExercises: ['Chest-Supported T-Bar Row (Wide)', 'Barbell Bent-Over Row (Wide Grip)', 'Seated Cable Row (Wide Grip)', 'Face Pulls with Retraction']
      },
      {
        id: 'traps_lower',
        nameTh: 'Lower Trapezius',
        nameEn: 'Lower Trapezius',
        latinName: 'Pars ascendens trapezii',
        originInsertion: 'เกาะจากกระดูกสันหลังช่วงอก T6-T12 วิ่งเฉียงขึ้นไปเกาะ Spine of scapula',
        fiberOrientation: 'เส้นใยวิ่งเฉียงขึ้นเป็นรูปตัว V หงาย',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Scapular Depression (ดึงกระดูกสะบักลงด้านล่าง)',
          'Scapular Upward Rotation'
        ],
        biomechanicsNote: 'สำคัญมากต่อการจัดสมดุลสะบัก ป้องกันอาการไหล่ห่อคอยื่น และช่วยให้ยกน้ำหนักเหนือหัวได้อย่างปลอดภัย',
        kinesiologyCues: [
          'ทำท่า Y-Raise หรือ Prone Trap Raise โน้มตัวคว่ำลง',
          'กางแขนเป็นรูปตัว Y ทำมุม 30-45° แล้วยกขึ้นโดยไม่โก่งหลัง',
          'รู้สึกถึงการดึงสะบักลงต่ำเข้าหากระเป๋ากางเกงหลัง'
        ],
        recommendedExercises: ['Prone Incline Y-Raise', 'Cable Lower Trap Pull', 'Scapular Pull-ups', 'Face Pull to Overhead Press']
      }
    ]
  },

  lats: {
    key: 'lats',
    nameTh: 'Latissimus Dorsi (Lats)',
    nameEn: 'Latissimus Dorsi',
    latinName: 'Latissimus dorsi & Teres major',
    view: 'back',
    description: 'กล้ามเนื้อแผ่นใหญ่ที่สุดของร่างกายท่อนบน สร้างทรวดทรงรูปตัว V (V-Taper) อันทรงพลัง',
    submuscles: ['Upper / Thoracic Lats', 'Lower / Iliac Lats', 'Teres Major'],
    subdivisions: [
      {
        id: 'lats_upper_thoracic',
        nameTh: 'Upper / Thoracic Latissimus Dorsi',
        nameEn: 'Upper / Thoracic Latissimus Dorsi',
        latinName: 'Pars thoracica latissimi dorsi',
        originInsertion: 'เกาะจากกระดูกสันหลังช่วงอกส่วนล่าง วิ่งเฉียงขึ้นโอบเข้าสู่ร่องกระดูกต้นแขน',
        fiberOrientation: 'เส้นใยวิ่งเฉียงขึ้นและออกข้างสู่รักแร้',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Shoulder Adduction (ดึงและหุบแขนจากมุมสูงลงมาข้างลำตัวในระนาบด้านข้าง)',
          'Shoulder Internal Rotation'
        ],
        biomechanicsNote: 'ถูกกระตุ้นสูงสุดในท่าดึงจากมุมสูงลงล่าง (Vertical Pulling) เช่น Pull-up หรือ Lat Pulldown แบบจับกว้างปานกลาง ทิศทางแรงต้านจะตั้งฉากกับแนวเส้นใยที่วิ่งเฉียงลงสู่กระดูกสันหลัง',
        kinesiologyCues: [
          'กดหัวไหล่และสะบักลงก่อนเริ่มดึง (Scapular Depression)',
          'ดึง "ข้อศอกลงและหุบเข้าหาซี่โครงด้านข้าง" ไม่ใช่แค่ออกแรงดึงด้วยฝ่ามือ',
          'แอ่นหน้าอกขึ้นหักมุมเล็กน้อย ไม่เอนตัวไปข้างหลังมากเกินไป'
        ],
        recommendedExercises: ['Lat Pulldown (Neutral/Wide Grip)', 'Overhand Pull-ups', 'Assisted Chin-ups', 'Straight-Arm Cable Pulldown']
      },
      {
        id: 'lats_lower_iliac',
        nameTh: 'Lower / Iliac Latissimus Dorsi',
        nameEn: 'Lower / Iliac Latissimus Dorsi',
        latinName: 'Pars iliaca latissimi dorsi',
        originInsertion: 'เกาะจากขอบกระดูกเชิงกราน (Iliac crest) และ Thoracolumbar fascia วิ่งขึ้นตรงสู่ต้นแขน',
        fiberOrientation: 'เส้นใยเรียงตัวในแนวดิ่งเกือบตั้งฉากกับลำตัว',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Shoulder Extension in Sagittal plane (ดึงแขนจากข้างหน้าถอยหลังแนบลำตัว)',
          'Elbow-to-Hip Adduction'
        ],
        biomechanicsNote: 'เพื่อเข้าสู่แนวเส้นใยส่วนล่าง แขนต้องอยู่ชิดลำตัวและดึงในระนาบ Sagittal Plane (ท่า Single-arm Cable Row หรือ Low Row ที่ข้อศอกไม่กางออก) ดึงศอกลงไปหาขอบกางเกง',
        kinesiologyCues: [
          'ดึงข้อศอกแนบติดข้างลำตัว (ไม่กางศอกออก)',
          'หยุดดึงเมื่อข้อศอกเสมอกับแนวด้านข้างลำตัว (หากดึงเลยไปด้านหลัง แรงจะถ่ายไปที่ไหล่หลังแทน)',
          'จินตนาการว่ากำลัง "พยายามเอาข้อศอกไปแตะที่กระเป๋ากางเกงหลัง"'
        ],
        recommendedExercises: ['Single Arm Neutral Cable Row', 'Kneeling Lat Pulldown (Single Arm)', 'Meadows Row', 'Close-Grip Seated Cable Row']
      },
      {
        id: 'teres_major',
        nameTh: 'Teres Major',
        nameEn: 'Teres Major',
        latinName: 'Musculus teres major',
        originInsertion: 'เกาะจากมุมล่างของกระดูกสะบัก วิ่งขนานไปเกาะกระดูกต้นแขนเคียงข้าง Lats',
        fiberOrientation: 'วิ่งเป็นแนวเฉียงสั้นๆ บริเวณใต้รักแร้',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Shoulder Adduction & Extension (ช่วย Lats ดึงแขนลงและแนบตัว)'
        ],
        biomechanicsNote: 'มักถูกเรียกว่า "Little Lat" จะทำงานหนักมากในท่าดึงแขนเหยียดตรง (Straight Arm Pulldown) และท่าจับกว้าง Overhand Pull-up',
        kinesiologyCues: [
          'ในท่า Straight-Arm Pulldown ให้ล็อกข้อศอกงอเล็กน้อยคงที่',
          'กดบาร์ลงมาหาหน้าตักโดยใช้แรงปีกใต้รักแร้',
          'เกร็งค้างที่หน้าตัก 1 วินาที'
        ],
        recommendedExercises: ['Straight-Arm Cable Pulldown', 'Wide-Grip Pull-ups', 'Cross-Body Lat Pull']
      }
    ]
  },

  lowback: {
    key: 'lowback',
    nameTh: 'Lower Back (Erector Spinae)',
    nameEn: 'Lower Back & Spinal Erectors',
    latinName: 'Erector spinae & Quadratus lumborum',
    view: 'back',
    description: 'เสาหลักแห่งความมั่นคงของแนวกระดูกสันหลัง ป้องกันการบาดเจ็บและช่วยส่งถ่ายพลังงานทั่วร่างกาย',
    submuscles: ['Erector Spinae', 'Quadratus Lumborum & Multifidus'],
    subdivisions: [
      {
        id: 'erector_spinae',
        nameTh: 'Erector Spinae',
        nameEn: 'Erector Spinae (Spinalis, Longissimus, Iliocostalis)',
        latinName: 'Musculus erector spinae',
        originInsertion: 'ทอดยาวเป็นคู่ขนานตามแนวกระดูกสันหลังตั้งแต่ Sacrum ขึ้นไปถึงฐานกะโหลกศีรษะ',
        fiberOrientation: 'วิ่งในแนวดิ่งตามแนวกระดูกสันหลัง',
        planeOfMotion: 'Sagittal',
        primaryActions: [
          'Spinal Extension (เหยียดกระดูกสันหลังให้ตั้งตรง)',
          'Isometric Spine Stabilization (ล็อกกระดูกสันหลังให้อยู่นิ่งในท่ายกหนัก Deadlift/Squat)'
        ],
        biomechanicsNote: 'หน้าที่หลักในชีวิตจริงและในยิมคือการทำงานแบบเกร็งค้างต้านแรงโน้มถ่วง (Isometric Contraction) ไม่ให้กระดูกสันหลังงอพับไปข้างหน้าขณะทำ Deadlift',
        kinesiologyCues: [
          'สร้างแรงดันในช่องท้อง (Bracing / Valsalva Maneuver) ก่อนเริ่มยก',
          'รักษาหลังให้ตรงเป็นแนวธรรมชาติ (Neutral Spine) ตลอดการยก',
          'ท่า Back Extension ให้เน้นการเกร็งหลังตั้งตรง ไม่แอ่นหลังจนเกินแนวปกติ (Avoid Hyperextension)'
        ],
        recommendedExercises: ['Barbell Deadlift', 'Hyperextensions (Back Extension 45°)', 'Good Mornings', 'Bird Dog']
      },
      {
        id: 'quadratus_lumborum',
        nameTh: 'Quadratus Lumborum (QL)',
        nameEn: 'Quadratus Lumborum (QL) & Multifidus',
        latinName: 'Musculus quadratus lumborum & multifidi',
        originInsertion: 'เกาะจากขอบกระดูกเชิงกรานด้านหลังขึ้นไปเกาะกระดูกซี่โครงที่ 12 และกระดูกสันหลังส่วนเอว L1-L4',
        fiberOrientation: 'แผ่นสี่เหลี่ยมลึกบริเวณข้างเอวด้านหลัง',
        planeOfMotion: 'Frontal',
        primaryActions: [
          'Lateral Flexion of Spine (เอียงตัวด้านข้าง)',
          'Pelvic Elevation (ยกกระดูกเชิงกราน)',
          'Deep Spinal Segmental Stabilization (ล็อกกระดูกสันหลังทีละปล้อง)'
        ],
        biomechanicsNote: 'เป็นกล้ามเนื้อที่มักจะตึงหรืออักเสบจนทำให้ปวดหลังล่าง ท่าเดินถือของข้างเดียว (Suitcase Carry) จะฝึกความมั่นคงของ QL ได้ยอดเยี่ยมโดยไม่สร้างแรงกดทับที่เป็นอันตราย',
        kinesiologyCues: [
          'เดินถือดัมเบลหรือเคตเทิลเบลข้างเดียว (Suitcase Carry) โดยเกร็งลำตัวให้ตรงสนิทไม่เอียงไปข้างใดข้างหนึ่ง',
          'หายใจอย่างสม่ำเสมอขณะเกร็งแกนกลาง',
          'ยืดคลายกล้ามเนื้อเอวและสะโพกหลังการฝึก'
        ],
        recommendedExercises: ['Suitcase Carry (ถือของข้างเดียว)', 'Side Plank with Hip Dip', 'Bird Dog', 'Pallof Press']
      }
    ]
  }
};
