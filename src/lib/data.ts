export interface QuizQuestion {
  q: string
  a: string[]
  correct: number
  exp?: string
}

export interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  notesContent: string | null
  quiz: string | null
  duration: number | null
  orderIndex: number
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  icon: string | null
  level: string
  category: string | null
  lessons: Lesson[]
  instructor: string
}

export const courses: Course[] = [
  {
    id: '1',
    slug: 'anatomiya',
    title: 'Anatomiya',
    subtitle: 'Inson anatomiyasi asoslari',
    description: 'Inson tanasining tuzilishi, organlar sistemasi va ularning funksiyalari haqida to\'liq ma\'lumot. Ushbu kursda siz skelet, mushak, nerv, qon aylanish va boshqa muhim sistemalarni o\'rganasiz.',
    icon: 'fa-heart-pulse',
    level: 'beginner',
    category: 'asosiy',
    instructor: 'Prof. Aliyev B.',
    lessons: [
      { id: 'l1', title: 'Skelet sistemasi', description: 'Skelet haqida umumiy ma\'lumot', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Skelet sistemasi inson tanasining asosiy tayanch sistemasidir. U 206 ta suyakdan iborat bo\'lib, quyidagi vazifalarni bajaradi: tayanch, himoya, harakat va mineral moddalar almashinuvi.\n\nAsosiy bo\'limlari: bosh skeleti, tana skeleti, qo\'l va oyoq skeleti.', quiz: '[{"q":"Inson skeletida nechta suyak bor?","a":["150","180","206","250"],"correct":2,"exp":"Voyaga yetgan odam skeleti 206 ta suyakdan iborat."},{"q":"Qaysi organ skeletni himoya qiladi?","a":["Yurak","Bosh miya","O\'pka","Jigar"],"correct":1},{"q":"Skeletning qaysi vazifasi mineral moddalar bilan bog\'liq?","a":["Tayanch","Himoya","Harakat","Mineral almashinuvi"],"correct":3}]', duration: 25, orderIndex: 0 },
      { id: 'l2', title: 'Mushak sistemasi', description: 'Mushaklar tuzilishi', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Mushak sistemasi: uch xil mushak mavjud - skelet (ko\'ndalang-targ\'il), silliq va yurak mushagi.\n\nSkelet mushaklari ixtiyoriy harakatlarni boshqaradi. Silliq mushaklar ichki organlarda joylashgan. Yurak mushagi faqat yurakda uchraydi.', quiz: '[{"q":"Necha xil mushak turi mavjud?","a":["1","2","3","4"],"correct":2},{"q":"Qaysi mushaklar ixtiyoriy harakat qiladi?","a":["Silliq","Skelet","Yurak","Hammasi"],"correct":1},{"q":"Yurak mushagi qayerda joylashgan?","a":["O\'pkada","Jigarda","Yurakda","Miyda"],"correct":2}]', duration: 20, orderIndex: 1 },
      { id: 'l3', title: 'Nerv sistemasi', description: 'Nerv tizimi haqida', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Nerv sistemasi ikki asosiy qismga bo\'linadi: markaziy (bosh miya va orqa miya) va periferik nerv sistemasi.\n\nNeyronlar nerv sistemasining asosiy hujayralari bo\'lib, ular impuls uzatish vazifasini bajaradi.', quiz: '[{"q":"Markaziy nerv sistemasiga nimalar kiradi?","a":["Nervlar","Bosh va orqa miya","Gangliylar","Retseptorlar"],"correct":1}]', duration: 30, orderIndex: 2 },
    ],
  },
  {
    id: '2',
    slug: 'fiziologiya',
    title: 'Fiziologiya',
    subtitle: 'Organizm funksiyalari',
    description: 'Organizmda kechadigan fiziologik jarayonlar, organlar va sistemalarning funksional faoliyati haqida batafsil o\'rganing.',
    icon: 'fa-brain',
    level: 'intermediate',
    category: 'asosiy',
    instructor: 'Prof. Karimova N.',
    lessons: [
      { id: 'l4', title: 'Hujayra fiziologiyasi', description: 'Hujayra asoslari', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Hujayra - tirik organizmning eng kichik tuzilmaviy va funksional birligi. Hujayra membranasi, yadrosi, organellalari va sitoplazmasidan iborat.', quiz: '[{"q":"Hujayraning asosiy vazifasi?","a":["Energiya ishlab chiqarish","Modda almashinuvi","Bo\'linish","Hammasi"],"correct":3}]', duration: 35, orderIndex: 0 },
      { id: 'l5', title: 'Yurak-qon aylanish', description: 'Qon aylanish sistemasi', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Yurak-qon aylanish sistemasi yurak va qon tomirlaridan iborat. Katta va kichik qon aylanish doiralari mavjud.', quiz: '[]', duration: 40, orderIndex: 1 },
    ],
  },
  {
    id: '3',
    slug: 'farmakologiya',
    title: 'Farmakologiya',
    subtitle: 'Dorilar haqida fan',
    description: 'Dorilar va ularning organizmga ta\'siri, farmakokinetika va farmakodinamika asoslari.',
    icon: 'fa-capsules',
    level: 'advanced',
    category: 'klinik',
    instructor: 'Prof. Tursunov M.',
    lessons: [
      { id: 'l6', title: 'Farmakokinetika', description: 'Dorilarning organizmdagi harakati', videoUrl: '', notesContent: 'Farmakokinetika - dorilarning organizmda so\'rilishi, taqsimlanishi, metabolizmi va chiqarilishini o\'rganadi.', quiz: '[]', duration: 30, orderIndex: 0 },
    ],
  },
  {
    id: '4',
    slug: 'gistologiya',
    title: 'Gistologiya',
    subtitle: 'To\'qimalar haqida fan',
    description: 'Organizm to\'qimalarining mikroskopik tuzilishini o\'rganuvchi fan.',
    icon: 'fa-microscope',
    level: 'beginner',
    category: 'asosiy',
    instructor: 'Prof. Aliyev B.',
    lessons: [],
  },
  {
    id: '5',
    slug: 'patologiya',
    title: 'Patologiya',
    subtitle: 'Kasalliklar mexanizmi',
    description: 'Kasalliklarning kelib chiqish mexanizmlari va patologik jarayonlar haqida.',
    icon: 'fa-flask',
    level: 'intermediate',
    category: 'klinik',
    instructor: 'Prof. Karimova N.',
    lessons: [
      { id: 'l7', title: 'Yallig\'lanish', description: 'Yallig\'lanish jarayoni', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesContent: 'Yallig\'lanish - organizmning zararlovchi omillarga nisbatan himoya reaksiyasi. 5 asosiy belgisi: qizarish, shish, issiqlik, og\'riq va funksiya buzilishi.', quiz: '[{"q":"Yallig\'lanishning nechta asosiy belgisi bor?","a":["3","4","5","6"],"correct":2}]', duration: 25, orderIndex: 0 },
    ],
  },
  {
    id: '6',
    slug: 'mikrobiologiya',
    title: 'Mikrobiologiya',
    subtitle: 'Mikroorganizmlar haqida',
    description: 'Bakteriyalar, viruslar va boshqa mikroorganizmlarning tuzilishi va hayot faoliyati.',
    icon: 'fa-virus',
    level: 'intermediate',
    category: 'asosiy',
    instructor: 'Prof. Tursunov M.',
    lessons: [],
  },
]

export type UserRole = 'student' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}
