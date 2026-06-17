import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, Globe, GraduationCap, ArrowRight, Phone, Mail, MapPin,
  Search, Plus, Pencil, Trash2, LogOut, Star, Check,
  Stethoscope, Cpu, Briefcase, Scale, Moon, Pill, Palette, Users,
  Wrench, Award, Wallet, ShieldCheck, Plane, FileText, Sparkles,
  Building2, ChevronRight, Send, Lock, Heart, Upload, Settings,
  Layers, Image as ImageIcon, Save, Clock, Eye, EyeOff,
  CheckCircle2, XCircle, Link2, Copy, TrendingUp, UserPlus, Sun
} from "lucide-react";
import { store, auth, addLead, getLeads, partner, captureRef, getRef, admin } from "./storage";
import * as XLSX from "xlsx";

/* ---------- custom brand icons (safe, no dependency on lucide brand set) ---------- */
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const TelegramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.94 4.3a1 1 0 0 0-1.35-1.06L2.9 10.1c-.86.34-.83 1.62.06 1.92l4.4 1.45 1.7 5.32a1 1 0 0 0 1.71.38l2.2-2.28 4.43 3.26c.62.46 1.5.12 1.66-.63l2.88-15.22zM9.3 13.72l8.2-5.22c.14-.09.29.11.16.22l-6.6 6.06c-.18.17-.3.4-.32.66l-.2 2.2-1.24-3.9z" />
  </svg>
);

/* ------------------------------------------------------------------ */
const LANGS = [
  { code: "uz", flag: "🇺🇿", name: "O‘zbekcha" },
  { code: "tr", flag: "🇹🇷", name: "Türkçe" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
];

const FIELDS = [
  { key: "medicine", icon: Stethoscope }, { key: "dentistry", icon: Heart },
  { key: "pharmacy", icon: Pill }, { key: "engineering", icon: Wrench },
  { key: "it", icon: Cpu }, { key: "business", icon: Briefcase },
  { key: "law", icon: Scale }, { key: "islamic", icon: Moon },
  { key: "arts", icon: Palette }, { key: "social", icon: Users },
];

const FACULTY_OPTIONS = [
  "Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon",
  "Beslenme ve Diyetetik", "Veterinerlik", "Psikoloji", "Moleküler Biyoloji ve Genetik",
  "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Yapay Zeka Mühendisliği",
  "Elektrik-Elektronik Mühendisliği", "Makine Mühendisliği", "Mekatronik Mühendisliği",
  "Endüstri Mühendisliği", "İnşaat Mühendisliği", "Biyomedikal Mühendisliği",
  "Havacılık ve Uzay Mühendisliği", "Pilotaj", "Mimarlık", "İç Mimarlık",
  "Şehir ve Bölge Planlama", "İşletme", "İktisat", "Maliye", "Bankacılık ve Finans",
  "Muhasebe ve Finansal Yönetim", "Uluslararası Ticaret ve Lojistik", "Uluslararası İlişkiler",
  "Siyaset Bilimi ve Kamu Yönetimi", "Hukuk", "Sosyoloji", "Halkla İlişkiler ve Tanıtım",
  "Gazetecilik", "Radyo Televizyon ve Sinema", "Yeni Medya ve İletişim", "Grafik Tasarım",
  "İletişim ve Tasarım", "Endüstriyel Tasarım", "Moda ve Tekstil Tasarımı", "Güzel Sanatlar",
  "Müzik", "Gastronomi ve Mutfak Sanatları", "Turizm İşletmeciliği",
  "Mütercim-Tercümanlık (İngilizce)", "İngiliz Dili ve Edebiyatı", "Türk Dili ve Edebiyatı",
  "Arap Dili ve Edebiyatı", "Rehberlik ve Psikolojik Danışmanlık", "Okul Öncesi Öğretmenliği",
  "İlahiyat", "İslami İlimler", "Matematik", "İstatistik", "Kimya", "Fizik", "Biyoloji",
];

/* Turkish faculty name -> [uz, en, ru, ar] */
const FAC_I18N = {
  "Tıp": ["Tibbiyot", "Medicine", "Медицина", "الطب"],
  "Diş Hekimliği": ["Stomatologiya", "Dentistry", "Стоматология", "طب الأسنان"],
  "Eczacılık": ["Farmatsevtika", "Pharmacy", "Фармацевтика", "الصيدلة"],
  "Hemşirelik": ["Hamshiralik", "Nursing", "Сестринское дело", "التمريض"],
  "Fizyoterapi ve Rehabilitasyon": ["Fizioterapiya va reabilitatsiya", "Physiotherapy & Rehabilitation", "Физиотерапия и реабилитация", "العلاج الطبيعي وإعادة التأهيل"],
  "Beslenme ve Diyetetik": ["Ovqatlanish va dietologiya", "Nutrition & Dietetics", "Питание и диетология", "التغذية والحمية"],
  "Veterinerlik": ["Veterinariya", "Veterinary Medicine", "Ветеринария", "الطب البيطري"],
  "Psikoloji": ["Psixologiya", "Psychology", "Психология", "علم النفس"],
  "Moleküler Biyoloji ve Genetik": ["Molekulyar biologiya va genetika", "Molecular Biology & Genetics", "Молекулярная биология и генетика", "البيولوجيا الجزيئية والوراثة"],
  "Bilgisayar Mühendisliği": ["Kompyuter muhandisligi", "Computer Engineering", "Компьютерная инженерия", "هندسة الحاسوب"],
  "Yazılım Mühendisliği": ["Dasturiy injiniring", "Software Engineering", "Программная инженерия", "هندسة البرمجيات"],
  "Yapay Zeka Mühendisliği": ["Sun'iy intellekt muhandisligi", "AI Engineering", "Инженерия ИИ", "هندسة الذكاء الاصطناعي"],
  "Elektrik-Elektronik Mühendisliği": ["Elektr-elektronika muhandisligi", "Electrical & Electronics Engineering", "Электротехника и электроника", "الهندسة الكهربائية والإلكترونية"],
  "Makine Mühendisliği": ["Mashinasozlik muhandisligi", "Mechanical Engineering", "Машиностроение", "الهندسة الميكانيكية"],
  "Mekatronik Mühendisliği": ["Mexatronika muhandisligi", "Mechatronics Engineering", "Мехатроника", "هندسة الميكاترونيكس"],
  "Endüstri Mühendisliği": ["Sanoat muhandisligi", "Industrial Engineering", "Промышленная инженерия", "الهندسة الصناعية"],
  "İnşaat Mühendisliği": ["Qurilish muhandisligi", "Civil Engineering", "Строительная инженерия", "الهندسة المدنية"],
  "Biyomedikal Mühendisliği": ["Biotibbiy muhandislik", "Biomedical Engineering", "Биомедицинская инженерия", "الهندسة الطبية الحيوية"],
  "Havacılık ve Uzay Mühendisliği": ["Aviatsiya va kosmik muhandislik", "Aerospace Engineering", "Аэрокосмическая инженерия", "هندسة الطيران والفضاء"],
  "Pilotaj": ["Uchuvchilik (pilotaj)", "Piloting", "Пилотирование", "الطيران"],
  "Mimarlık": ["Arxitektura", "Architecture", "Архитектура", "العمارة"],
  "İç Mimarlık": ["Ichki arxitektura", "Interior Architecture", "Дизайн интерьера", "العمارة الداخلية"],
  "Şehir ve Bölge Planlama": ["Shahar va hudud rejalashtirish", "Urban & Regional Planning", "Градостроительство", "تخطيط المدن والمناطق"],
  "İşletme": ["Biznes boshqaruvi", "Business Administration", "Бизнес-администрирование", "إدارة الأعمال"],
  "İktisat": ["Iqtisodiyot", "Economics", "Экономика", "الاقتصاد"],
  "Maliye": ["Moliya", "Public Finance", "Финансы", "المالية"],
  "Bankacılık ve Finans": ["Bank ishi va moliya", "Banking & Finance", "Банковское дело и финансы", "المصرفية والتمويل"],
  "Muhasebe ve Finansal Yönetim": ["Buxgalteriya va moliyaviy boshqaruv", "Accounting & Financial Management", "Бухучёт и финансовый менеджмент", "المحاسبة والإدارة المالية"],
  "Uluslararası Ticaret ve Lojistik": ["Xalqaro savdo va logistika", "International Trade & Logistics", "Международная торговля и логистика", "التجارة الدولية واللوجستيات"],
  "Uluslararası İlişkiler": ["Xalqaro munosabatlar", "International Relations", "Международные отношения", "العلاقات الدولية"],
  "Siyaset Bilimi ve Kamu Yönetimi": ["Siyosatshunoslik va davlat boshqaruvi", "Political Science & Public Administration", "Политология и госуправление", "العلوم السياسية والإدارة العامة"],
  "Hukuk": ["Huquq", "Law", "Право", "القانون"],
  "Sosyoloji": ["Sotsiologiya", "Sociology", "Социология", "علم الاجتماع"],
  "Halkla İlişkiler ve Tanıtım": ["Jamoatchilik bilan aloqalar", "Public Relations", "Связи с общественностью", "العلاقات العامة"],
  "Gazetecilik": ["Jurnalistika", "Journalism", "Журналистика", "الصحافة"],
  "Radyo Televizyon ve Sinema": ["Radio, TV va kino", "Radio, TV & Cinema", "Радио, ТВ и кино", "الإذاعة والتلفزيون والسينما"],
  "Yeni Medya ve İletişim": ["Yangi media va kommunikatsiya", "New Media & Communication", "Новые медиа и коммуникации", "الإعلام الجديد والاتصال"],
  "Grafik Tasarım": ["Grafik dizayn", "Graphic Design", "Графический дизайн", "التصميم الجرافيكي"],
  "İletişim ve Tasarım": ["Kommunikatsiya va dizayn", "Communication & Design", "Коммуникации и дизайн", "الاتصال والتصميم"],
  "Endüstriyel Tasarım": ["Sanoat dizayni", "Industrial Design", "Промышленный дизайн", "التصميم الصناعي"],
  "Moda ve Tekstil Tasarımı": ["Moda va to‘qimachilik dizayni", "Fashion & Textile Design", "Дизайн моды и текстиля", "تصميم الأزياء والنسيج"],
  "Güzel Sanatlar": ["Tasviriy san'at", "Fine Arts", "Изобразительное искусство", "الفنون الجميلة"],
  "Müzik": ["Musiqa", "Music", "Музыка", "الموسيقى"],
  "Gastronomi ve Mutfak Sanatları": ["Gastronomiya va oshpazlik", "Gastronomy & Culinary Arts", "Гастрономия и кулинария", "فنون الطهي"],
  "Turizm İşletmeciliği": ["Turizm menejmenti", "Tourism Management", "Управление туризмом", "إدارة السياحة"],
  "Mütercim-Tercümanlık (İngilizce)": ["Tarjimonlik (ingliz tili)", "Translation & Interpreting (English)", "Перевод (английский)", "الترجمة (الإنجليزية)"],
  "İngiliz Dili ve Edebiyatı": ["Ingliz tili va adabiyoti", "English Language & Literature", "Английский язык и литература", "اللغة الإنجليزية وآدابها"],
  "Türk Dili ve Edebiyatı": ["Turk tili va adabiyoti", "Turkish Language & Literature", "Турецкий язык и литература", "اللغة التركية وآدابها"],
  "Arap Dili ve Edebiyatı": ["Arab tili va adabiyoti", "Arabic Language & Literature", "Арабский язык и литература", "اللغة العربية وآدابها"],
  "Rehberlik ve Psikolojik Danışmanlık": ["Psixologik maslahat va yo‘naltirish", "Guidance & Counseling", "Психологическое консультирование", "الإرشاد النفسي"],
  "Okul Öncesi Öğretmenliği": ["Maktabgacha ta'lim o‘qituvchiligi", "Preschool Teaching", "Дошкольное образование", "معلم رياض الأطفال"],
  "İlahiyat": ["Ilohiyot", "Theology", "Теология", "الإلهيات"],
  "İslami İlimler": ["Islomiy ilmlar", "Islamic Studies", "Исламские науки", "العلوم الإسلامية"],
  "Matematik": ["Matematika", "Mathematics", "Математика", "الرياضيات"],
  "İstatistik": ["Statistika", "Statistics", "Статистика", "الإحصاء"],
  "Kimya": ["Kimyo", "Chemistry", "Химия", "الكيمياء"],
  "Fizik": ["Fizika", "Physics", "Физика", "الفيزياء"],
  "Biyoloji": ["Biologiya", "Biology", "Биология", "الأحياء"],
};

const facLabel = (name, lang) => {
  if (!name) return "";
  if (lang === "tr") return name;
  const e = FAC_I18N[name];
  if (!e) return name;
  return e[{ uz: 0, en: 1, ru: 2, ar: 3 }[lang]] || name;
};

/* Faculty (Turkish) -> filter field category */
const FAC_FIELD = {
  "Tıp": "medicine", "Diş Hekimliği": "dentistry", "Eczacılık": "pharmacy",
  "Hemşirelik": "medicine", "Fizyoterapi ve Rehabilitasyon": "medicine",
  "Beslenme ve Diyetetik": "medicine", "Veterinerlik": "medicine",
  "Moleküler Biyoloji ve Genetik": "medicine", "Psikoloji": "social",
  "Bilgisayar Mühendisliği": "it", "Yazılım Mühendisliği": "it", "Yapay Zeka Mühendisliği": "it",
  "Elektrik-Elektronik Mühendisliği": "engineering", "Makine Mühendisliği": "engineering",
  "Mekatronik Mühendisliği": "engineering", "Endüstri Mühendisliği": "engineering",
  "İnşaat Mühendisliği": "engineering", "Biyomedikal Mühendisliği": "engineering",
  "Havacılık ve Uzay Mühendisliği": "engineering", "Pilotaj": "engineering",
  "Mimarlık": "arts", "İç Mimarlık": "arts", "Şehir ve Bölge Planlama": "social",
  "İşletme": "business", "İktisat": "business", "Maliye": "business",
  "Bankacılık ve Finans": "business", "Muhasebe ve Finansal Yönetim": "business",
  "Uluslararası Ticaret ve Lojistik": "business", "Turizm İşletmeciliği": "business",
  "Uluslararası İlişkiler": "social", "Siyaset Bilimi ve Kamu Yönetimi": "social",
  "Hukuk": "law", "Sosyoloji": "social", "Halkla İlişkiler ve Tanıtım": "social",
  "Gazetecilik": "social", "Radyo Televizyon ve Sinema": "arts", "Yeni Medya ve İletişim": "social",
  "Grafik Tasarım": "arts", "İletişim ve Tasarım": "arts", "Endüstriyel Tasarım": "arts",
  "Moda ve Tekstil Tasarımı": "arts", "Güzel Sanatlar": "arts", "Müzik": "arts",
  "Gastronomi ve Mutfak Sanatları": "arts",
  "Mütercim-Tercümanlık (İngilizce)": "social", "İngiliz Dili ve Edebiyatı": "social",
  "Türk Dili ve Edebiyatı": "social", "Arap Dili ve Edebiyatı": "social",
  "Rehberlik ve Psikolojik Danışmanlık": "social", "Okul Öncesi Öğretmenliği": "social",
  "İlahiyat": "islamic", "İslami İlimler": "islamic",
  "Matematik": "social", "İstatistik": "social", "Kimya": "social", "Fizik": "social", "Biyoloji": "social",
};

const deriveFields = (facs) => [...new Set((facs || []).map(f => FAC_FIELD[f]).filter(Boolean))];

/* Built-in university database (name, city, common faculties) for the admin autocomplete */
const UNI_DB = [
  { name: "İstanbul Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Hukuk", "İşletme", "Eczacılık"] },
  { name: "İstanbul Teknik Üniversitesi (İTÜ)", city: "İstanbul", faculties: ["Bilgisayar Mühendisliği", "Makine Mühendisliği", "İnşaat Mühendisliği", "Mimarlık"] },
  { name: "Boğaziçi Üniversitesi", city: "İstanbul", faculties: ["Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "İşletme", "İktisat"] },
  { name: "Orta Doğu Teknik Üniversitesi (ODTÜ)", city: "Ankara", faculties: ["Bilgisayar Mühendisliği", "Makine Mühendisliği", "Mimarlık", "İşletme"] },
  { name: "Ankara Üniversitesi", city: "Ankara", faculties: ["Tıp", "Hukuk", "İlahiyat", "Siyaset Bilimi ve Kamu Yönetimi"] },
  { name: "Hacettepe Üniversitesi", city: "Ankara", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik"] },
  { name: "Ege Üniversitesi", city: "İzmir", faculties: ["Tıp", "Eczacılık", "Bilgisayar Mühendisliği", "İşletme"] },
  { name: "Dokuz Eylül Üniversitesi", city: "İzmir", faculties: ["Tıp", "Hukuk", "İşletme", "Mimarlık"] },
  { name: "Gazi Üniversitesi", city: "Ankara", faculties: ["Tıp", "Diş Hekimliği", "Hukuk", "Makine Mühendisliği"] },
  { name: "Marmara Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Hukuk", "İşletme", "İlahiyat"] },
  { name: "Yıldız Teknik Üniversitesi", city: "İstanbul", faculties: ["Bilgisayar Mühendisliği", "İnşaat Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Mimarlık"] },
  { name: "Koç Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Bilgisayar Mühendisliği", "İşletme", "Hukuk"] },
  { name: "Sabancı Üniversitesi", city: "İstanbul", faculties: ["Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "İşletme", "Endüstri Mühendisliği"] },
  { name: "Bilkent Üniversitesi", city: "Ankara", faculties: ["Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "İşletme", "Mimarlık"] },
  { name: "İstanbul Aydın Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Bilgisayar Mühendisliği", "İşletme", "Uluslararası İlişkiler"] },
  { name: "İstanbul Medipol Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik"] },
  { name: "Bahçeşehir Üniversitesi (BAU)", city: "İstanbul", faculties: ["Hukuk", "Grafik Tasarım", "Yazılım Mühendisliği", "İşletme"] },
  { name: "Üsküdar Üniversitesi", city: "İstanbul", faculties: ["Psikoloji", "Hemşirelik", "Yazılım Mühendisliği", "Fizyoterapi ve Rehabilitasyon"] },
  { name: "Fatih Sultan Mehmet Vakıf Üniversitesi", city: "İstanbul", faculties: ["İslami İlimler", "Hukuk", "Mimarlık", "Türk Dili ve Edebiyatı"] },
  { name: "Özyeğin Üniversitesi", city: "İstanbul", faculties: ["Bilgisayar Mühendisliği", "İşletme", "Hukuk", "Mimarlık"] },
  { name: "Yeditepe Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Hukuk", "İşletme"] },
  { name: "İstanbul Bilgi Üniversitesi", city: "İstanbul", faculties: ["Hukuk", "İşletme", "Grafik Tasarım", "Bilgisayar Mühendisliği"] },
  { name: "Acıbadem Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Hemşirelik", "Eczacılık", "Fizyoterapi ve Rehabilitasyon"] },
  { name: "İstinye Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik"] },
  { name: "Beykoz Üniversitesi", city: "İstanbul", faculties: ["İşletme", "Uluslararası Ticaret ve Lojistik", "Gastronomi ve Mutfak Sanatları", "Yazılım Mühendisliği"] },
  { name: "Atılım Üniversitesi", city: "Ankara", faculties: ["Bilgisayar Mühendisliği", "Hukuk", "İşletme", "Mimarlık"] },
  { name: "Çankaya Üniversitesi", city: "Ankara", faculties: ["Bilgisayar Mühendisliği", "Hukuk", "İşletme", "Mimarlık"] },
  { name: "TOBB Ekonomi ve Teknoloji Üniversitesi", city: "Ankara", faculties: ["Bilgisayar Mühendisliği", "İşletme", "İktisat", "Hukuk"] },
  { name: "Selçuk Üniversitesi", city: "Konya", faculties: ["Tıp", "Hukuk", "İlahiyat", "Veterinerlik"] },
  { name: "Necmettin Erbakan Üniversitesi", city: "Konya", faculties: ["Tıp", "İlahiyat", "Hemşirelik", "Hukuk"] },
  { name: "Karadeniz Teknik Üniversitesi (KTÜ)", city: "Trabzon", faculties: ["Tıp", "Bilgisayar Mühendisliği", "İnşaat Mühendisliği", "İşletme"] },
  { name: "Atatürk Üniversitesi", city: "Erzurum", faculties: ["Tıp", "Diş Hekimliği", "Hukuk", "İlahiyat"] },
  { name: "Çukurova Üniversitesi", city: "Adana", faculties: ["Tıp", "Eczacılık", "İşletme", "Bilgisayar Mühendisliği"] },
  { name: "Akdeniz Üniversitesi", city: "Antalya", faculties: ["Tıp", "Hukuk", "Turizm İşletmeciliği", "İşletme"] },
  { name: "Sakarya Üniversitesi", city: "Sakarya", faculties: ["Bilgisayar Mühendisliği", "İşletme", "Hukuk", "İlahiyat"] },
  { name: "Eskişehir Osmangazi Üniversitesi", city: "Eskişehir", faculties: ["Tıp", "Bilgisayar Mühendisliği", "İşletme", "Makine Mühendisliği"] },
  { name: "Bursa Uludağ Üniversitesi", city: "Bursa", faculties: ["Tıp", "Hukuk", "İşletme", "İlahiyat"] },
  { name: "Gaziantep Üniversitesi", city: "Gaziantep", faculties: ["Tıp", "Bilgisayar Mühendisliği", "İşletme", "Hukuk"] },
  { name: "İzmir Ekonomi Üniversitesi", city: "İzmir", faculties: ["Bilgisayar Mühendisliği", "İşletme", "Hukuk", "Endüstriyel Tasarım"] },
  { name: "Yaşar Üniversitesi", city: "İzmir", faculties: ["İşletme", "Hukuk", "Mimarlık", "Bilgisayar Mühendisliği"] },
  { name: "İstanbul Kent Üniversitesi", city: "İstanbul", faculties: ["Diş Hekimliği", "Eczacılık", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Psikoloji", "Bilgisayar Mühendisliği", "Endüstri Mühendisliği", "İşletme", "Uluslararası İlişkiler", "Gastronomi ve Mutfak Sanatları", "Radyo Televizyon ve Sinema", "İç Mimarlık"] },
  { name: "İstanbul Kültür Üniversitesi", city: "İstanbul", faculties: ["Hukuk", "Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Endüstri Mühendisliği", "Mimarlık", "İç Mimarlık", "Psikoloji", "İşletme", "İktisat", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Radyo Televizyon ve Sinema", "İngiliz Dili ve Edebiyatı", "Moleküler Biyoloji ve Genetik"] },
  { name: "Fenerbahçe Üniversitesi", city: "İstanbul", faculties: ["Eczacılık", "Bilgisayar Mühendisliği", "Endüstri Mühendisliği", "Biyomedikal Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Mimarlık", "İç Mimarlık", "İktisat", "Psikoloji", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "İngiliz Dili ve Edebiyatı"] },
  { name: "İstanbul Yeni Yüzyıl Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Psikoloji", "Bilgisayar Mühendisliği", "İşletme", "Halkla İlişkiler ve Tanıtım"] },
  { name: "İstanbul Atlas Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Beslenme ve Diyetetik", "Psikoloji", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Biyomedikal Mühendisliği", "Endüstri Mühendisliği", "İşletme", "İngiliz Dili ve Edebiyatı", "İç Mimarlık", "Endüstriyel Tasarım"] },
  { name: "Biruni Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Beslenme ve Diyetetik", "Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Biyomedikal Mühendisliği", "Moleküler Biyoloji ve Genetik", "İç Mimarlık", "Rehberlik ve Psikolojik Danışmanlık"] },
  { name: "İstanbul Topkapı Üniversitesi", city: "İstanbul", faculties: ["İktisat", "İşletme", "Psikoloji", "Uluslararası İlişkiler", "Uluslararası Ticaret ve Lojistik", "Halkla İlişkiler ve Tanıtım", "İngiliz Dili ve Edebiyatı", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Mimarlık", "İç Mimarlık", "Grafik Tasarım", "Gastronomi ve Mutfak Sanatları", "Radyo Televizyon ve Sinema", "Moda ve Tekstil Tasarımı"] },
  { name: "İstanbul Gelişim Üniversitesi", city: "İstanbul", faculties: ["Diş Hekimliği", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Beslenme ve Diyetetik", "Psikoloji", "İşletme", "İktisat", "Uluslararası İlişkiler", "Uluslararası Ticaret ve Lojistik", "Bilgisayar Mühendisliği", "Elektrik-Elektronik Mühendisliği", "İnşaat Mühendisliği", "Havacılık ve Uzay Mühendisliği", "Mimarlık", "İç Mimarlık", "Grafik Tasarım", "Gastronomi ve Mutfak Sanatları", "Turizm İşletmeciliği"] },
  { name: "İstanbul Okan Üniversitesi", city: "İstanbul", faculties: ["Tıp", "Diş Hekimliği", "Eczacılık", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Beslenme ve Diyetetik", "Psikoloji", "Hukuk", "İşletme", "Uluslararası İlişkiler", "Uluslararası Ticaret ve Lojistik", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Endüstri Mühendisliği", "Mimarlık", "İç Mimarlık", "Gastronomi ve Mutfak Sanatları", "Turizm İşletmeciliği", "Mütercim-Tercümanlık (İngilizce)"] },
  { name: "İstanbul Nişantaşı Üniversitesi", city: "İstanbul", faculties: ["Psikoloji", "İşletme", "İktisat", "Uluslararası Ticaret ve Lojistik", "Halkla İlişkiler ve Tanıtım", "Hukuk", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Elektrik-Elektronik Mühendisliği", "Endüstri Mühendisliği", "Mimarlık", "İç Mimarlık", "Grafik Tasarım", "Radyo Televizyon ve Sinema", "Gastronomi ve Mutfak Sanatları", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "Beslenme ve Diyetetik", "Turizm İşletmeciliği"] },
  { name: "İstanbul Beykent Üniversitesi", city: "İstanbul", faculties: ["Hukuk", "İşletme", "İktisat", "Uluslararası İlişkiler", "Psikoloji", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", "Elektrik-Elektronik Mühendisliği", "İnşaat Mühendisliği", "Endüstri Mühendisliği", "Mimarlık", "İç Mimarlık", "Grafik Tasarım", "Radyo Televizyon ve Sinema", "Gastronomi ve Mutfak Sanatları", "Hemşirelik", "Fizyoterapi ve Rehabilitasyon", "İngiliz Dili ve Edebiyatı", "Turizm İşletmeciliği"] },
];

/* ------------------------------------------------------------------ */
/*  TRANSLATIONS                                                       */
/* ------------------------------------------------------------------ */
const T = {
  uz: {
    nav: { home: "Bosh sahifa", universities: "Universitetlar", about: "Biz haqimizda", contact: "Bog‘lanish", admin: "Admin panel" },
    cta: { consult: "Bepul konsultatsiya", browse: "Universitetlarni ko‘rish", apply: "Ariza qoldirish", details: "Batafsil", viewAll: "Barchasini ko‘rish", contactUs: "Biz bilan bog‘laning" },
    hero: { badge: "Yillik kontraktlar 800$ dan boshlanadi", title1: "Turkiyada o‘qish", title2: "orzuyingizni ro‘yobga chiqaramiz", subtitle: "Savura EDU bilan Turkiyaning 10 lab yetakchi universitetiga barcha hujjatlaringizni biz tayyorlaymiz va qabul qildiramiz. Siz yo‘nalishni tanlang — qolganini bizga qoldiring.", s1: "Hamkor universitet", s2: "Joylashtirilgan talaba", s3: "Qabul muvaffaqiyati" },
    adv: { eyebrow: "Nega Turkiya?", title: "Turkiyada o‘qishning afzalliklari", sub: "Sifat, narx va imkoniyatlar — barchasi bir joyda.", items: [
      { t: "Jahon darajasidagi ta’lim", d: "Yevropa standartidagi dasturlar va xalqaro reytingdagi universitetlar." },
      { t: "Hamyonbop narx", d: "Yiliga 800$ dan boshlanadigan kontraktlar va stipendiya imkoniyatlari." },
      { t: "Tan olingan diplom", d: "Diplomlaringiz butun dunyoda e’tirof etiladi." },
      { t: "Stipendiyalar", d: "Davlat va universitet grantlari bilan xarajatlaringizni kamaytiring." },
      { t: "Boy madaniyat", d: "Sharq va G‘arb uyg‘unligi, xavfsiz va mehmondo‘st muhit." },
      { t: "Qulay joylashuv", d: "Yevropa va Osiyo o‘rtasida, vatanga yaqin va arzon parvozlar." } ] },
    fields: { eyebrow: "Yo‘nalishlar", title: "Siz istagan yo‘nalishni topamiz", sub: "Tibbiyotdan Islomiy bilimlargacha — har bir orzu uchun mos universitet.", names: { medicine: "Tibbiyot", dentistry: "Stomatologiya", pharmacy: "Farmatsevtika", engineering: "Muhandislik", it: "IT va dasturlash", business: "Biznes va iqtisod", law: "Huquq", islamic: "Islomiy bilimlar", arts: "San’at va dizayn", social: "Ijtimoiy fanlar" } },
    process: { eyebrow: "Jarayon", title: "4 oddiy qadamda Turkiyaga", steps: [
      { t: "Konsultatsiya", d: "Yo‘nalish va universitetni birga tanlaymiz." },
      { t: "Hujjatlar", d: "Barcha hujjatlarni tayyorlaymiz, tarjima va tasdiqlaymiz." },
      { t: "Qabul", d: "Universitetga ariza topshiramiz va qabul xatini olamiz." },
      { t: "Joylashish", d: "Viza, yotoqxona va Turkiyada kutib olishni tashkil qilamiz." } ] },
    featured: { title: "Mashhur universitetlar", sub: "Eng ko‘p tanlanadigan hamkor universitetlarimiz." },
    band: { title: "Orzuyingizni bugun boshlang", sub: "Bepul konsultatsiya oling — mutaxassislarimiz siz uchun eng mos yo‘nalishni topadi." },
    unis: { title: "Turkiya universitetlari", sub: "Yo‘nalish bo‘yicha tanlang va siz uchun mos kontraktni toping.", search: "Universitet yoki shaharni qidiring", all: "Barchasi", from: "dan / yil", fieldsLabel: "Yo‘nalishlar", none: "Hech narsa topilmadi. Boshqa filtrni sinab ko‘ring." },
    detail: { faculties: "Fakultetlar", colFaculty: "Fakultet", colPrice: "Narxi (yillik)", colLocation: "Manzil", colAdmission: "Qabul", about: "Universitet haqida", close: "Yopish", noFac: "Fakultetlar tez orada qo‘shiladi.", colLang: "Til", langTr: "Turkcha", langEn: "Inglizcha", admOpen: "Qabul ochiq", admClosed: "Qabul yopiq", annual: "Yillik kontrakt", scholarship: "5 yillik burs", save: "tejaysiz", perYear: "/yil" },
    about: { title: "Savura EDU haqida", p1: "Savura EDU — Savura brendi oilasining ta’lim yo‘nalishi. Biz yoshlarni Turkiyaning eng yaxshi universitetlariga joylashtirishga ixtisoslashganmiz.", p2: "Maqsadimiz — talabalik yo‘lidagi barcha tashvishlarni o‘z zimmamizga olish. Hujjat tayyorlashdan tortib vizaga, yotoqxonadan birinchi darsgacha — siz bilan birgamiz.", vTitle: "Bizning qadriyatlarimiz", values: [
      { t: "Ishonch", d: "Har bir hujjat va va’da ortida shaffoflik turadi." },
      { t: "Tezkorlik", d: "Hujjatlaringiz tez va to‘g‘ri rasmiylashtiriladi." },
      { t: "G‘amxo‘rlik", d: "Siz Turkiyada o‘zingizni yolg‘iz his qilmaysiz." } ] },
    contact: { title: "Biz bilan bog‘laning", sub: "Savolingiz bormi? Bepul konsultatsiya uchun yozing.", name: "Ismingiz", email: "Email", phone: "Telefon", msg: "Xabaringiz", send: "Yuborish", ok: "Rahmat! Arizangiz qabul qilindi. Tez orada bog‘lanamiz.", infoTitle: "Aloqa ma’lumotlari", addressLabel: "Manzil", hours: "Ish vaqti" },
    docs: { eyebrow: "Hujjatlar & Hazırlık", title: "Turk tilini bilmasangiz ham o‘qiysiz", sub: "Til muammosi to‘siq emas — biz tayyorlovdan diplomgacha yo‘ldamiz.", docsTitle: "Kerakli hujjatlar", docs: ["Pasport", "Maktab attestati yoki kollej diplomi"], prepTitle: "1 yillik tayyorlov (hazırlık)", prepText: "Tilni bilmaydiganlar uchun 1 yillik tayyorlov bor. Yo‘nalish tiliga qarab turkcha yoki inglizcha tayyorlov o‘qiysiz — tayyorlov tili siz tanlagan dastur tiliga mos belgilanadi." },
    benefits: { eyebrow: "Imkoniyatlar", title: "O‘qish — bu faqat boshlanishi", sub: "Turkiyada talabalik nafaqat diplom, balki yashash, ishlash va Yevropaga yo‘l ochadi.", items: [ { t: "Yashash ruxsatnomasi", d: "Universitetga qabul qilinganingizdan so‘ng Turkiyada qonuniy yashash uchun ruxsatnoma (ikamet) olasiz." }, { t: "O‘qib, ishlab pul topish", d: "Darsdan bo‘sh vaqtingizda ishlashingiz mumkin — kontrakt va yashash xarajatlaringizni bemalol qoplaydigan daromad topasiz." }, { t: "Work & Travel", d: "Yozgi ta’tilda Yevropa davlatlariga Work and Travel dasturi bilan borib, ishlab dam olasiz." }, { t: "Erasmus+ almashinuvi", d: "Erasmus dasturi orqali o‘qishingizning bir qismini Yevropa Ittifoqi universitetlarida davom ettirasiz." } ] },
    partner: {
      nav: "Hamkorlik",
      earnTitle: "Savura EDU bilan daromad qilishni boshlang",
      earnSub: "Abituriyentingizni, do‘stingizni yoki qarindoshingizni Savura EDU ga shunchaki tavsiya qiling — ular o‘qishga joylashsa, siz pul ishlaysiz.",
      earnCta: "Hamkor bo‘lish",
      heroEyebrow: "Hamkorlik dasturi",
      heroTitle: "Tavsiya qiling — birga daromad qiling",
      heroSub: "Bir marta ro‘yxatdan o‘ting, shaxsiy havolangizni ulashing va tavsiya qilgan har bir o‘quvchingiz universitetga joylashganda mukofot oling.",
      rewardWord: "Har bir joylashgan o‘quvchi uchun",
      rewardUpto: "gacha",
      how: [
        { t: "Ro‘yxatdan o‘ting", d: "Bir daqiqada hamkor akkauntini oching va shaxsiy referal kodingiz hamda havolangizni oling." },
        { t: "Ulashing", d: "Havolangizni do‘stlaringiz, o‘quvchilaringiz va qarindoshlaringizga yuboring yoki ijtimoiy tarmoqqa joylang." },
        { t: "Daromad qiling", d: "Tavsiyangiz bilan kelgan abituriyent o‘qishga joylashsa, mukofot balansingizga tushadi." },
        { t: "Pulni yeching", d: "Balansingizni istalgan vaqt Karta, IBAN, bank o‘tkazmasi yoki TRC20 orqali yechib oling." }
      ],
      whoTitle: "Kim daromad qila oladi?",
      who: ["O‘qituvchilar va repetitorlar", "Talabalar", "Abituriyent ota-onalari", "Bloggerlar va kontakti bor har kim"],
      ctaJoin: "Hamkor bo‘lish",
      ctaLogin: "Kabinetga kirish",
      haveAcc: "Akkauntingiz bormi?",
      noAcc: "Akkauntingiz yo‘qmi?",
      regTitle: "Hamkor bo‘lib ro‘yxatdan o‘tish",
      fName: "Ism familiya", fEmail: "Email", fPhone: "Telefon", fPass: "Parol",
      fAudience: "Kimlarni tavsiya qilmoqchisiz? (ixtiyoriy)",
      regBtn: "Ro‘yxatdan o‘tish",
      loginTitle: "Hamkor kabinetiga kirish", loginBtn: "Kirish",
      hello: "Salom", myCode: "Sizning referal kodingiz", myLink: "Ulashish havolasi",
      copy: "Nusxalash", copied: "Nusxalandi!", logout: "Chiqish",
      stReferred: "Tavsiya qilingan", stProcess: "Jarayonda", stPaid: "To‘lagan", stCancelled: "Bekor qilingan",
      balance: "Joriy balans", pending: "Kutilayotgan balans", withdraw: "Pulni yechish",
      tName: "Ism", tUni: "Universitet", tStatus: "Holat", tReward: "Mukofot", tDate: "Sana",
      noRefs: "Hozircha tavsiyalar yo‘q. Havolangizni ulashing!",
      sNew: "Yangi", sThinking: "O‘ylamoqda", sInpay: "To‘lov jarayonida", sPaid: "To‘ladi", sCancelled: "Bekor",
      wTitle: "Pul yechish arizasi", wAmount: "Summa ($)", wMethod: "Usul",
      mCard: "Karta", mIban: "IBAN", mBank: "Bank o‘tkazmasi", mTrc: "TRC20 (USDT)",
      wDetails: "Karta raqami / IBAN / hamyon manzili", wSubmit: "Ariza yuborish",
      wHistory: "To‘lovlar tarixi", wRequested: "Kutilmoqda", wPaid: "To‘landi", noPayouts: "To‘lovlar tarixi bo‘sh.",
      refField: "Referal kodi (ixtiyoriy)",
      confirmNeeded: "Ro‘yxatdan o‘tish vaqtincha mavjud emas. Administrator bilan bog‘laning.",
      loginErr: "Email yoki parol noto‘g‘ri.", regErr: "Ro‘yxatdan o‘tishda xatolik. Email band bo‘lishi mumkin.",
      minBal: "Yechish uchun yetarli balans yo‘q.", fConfirm: "Parolni tasdiqlang", passMismatch: "Parollar mos kelmadi.", passShort: "Parol kamida 6 belgidan iborat bo‘lsin.", msgsTitle: "Xabarlar", noMsgs: "Hozircha xabarlar yo‘q.", editCode: "Kodni tahrirlash", codeLabel: "O‘z referal kodingiz", codeHint: "Kamida 6 belgi — harf va raqam", codeShort: "Kamida 6 belgi bo‘lsin.", codeInvalid: "Faqat harf va raqam ishlating.", codeTaken: "Bu kod band.", codeOk: "Bo‘sh — ishlatsa bo‘ladi.", codeSaved: "Kod yangilandi!", checkEmail: "Tasdiqlash havolasi emailingizga yuborildi. Pochtangizni tekshirib havolani bosing, so‘ng kiring.", earnForEach: "Har bir o‘quvchi uchun daromad oling", rwPerStudent: "Ayni damda 1 ta talaba uchun to‘lanadigan summa", rwEstMonthly: "Taxminiy oylik daromad", rwUpTo100: "Bir oyda 100 tagacha talaba taklif qilishingiz mumkin", save: "Saqlash", cancel: "Bekor"
    },
    proc: { nav: "Hujjatlar va qabul", title: "Kerakli hujjatlar va qabul jarayoni", sub: "Bosqichingizni tanlang va kerakli hujjatlar ro‘yxatini ko‘ring. Hujjatlarni to‘g‘ri va sifatli tayyorlash grant olish imkonini oshiradi.", levelsTitle: "Bosqich bo‘yicha hujjatlar", bachelor: "Bakalavr", master: "Magistratura", doctorate: "Doktorantura", docs: { bachelor: ["Pasport (qizil, yashil yoki ID karta) — PDF", "9-sinf shahodatnomasi asl nusxasi — PDF", "11-sinf shahodatnomasi yoki kollej/litsey diplomi va ilovasi (asl) — PDF. Hali o‘qiyotgan bo‘lsangiz — joriy baholar hujjati", "Niyat (motivatsiya) xati", "1–2 o‘qituvchi/murabbiydan tavsiyanoma", "Yutuqlar: sertifikat, diplom, medal va h.k. (mavjud bo‘lsa)", "TÖMER til sertifikati (mavjud bo‘lsa)"], master: ["Pasport — PDF", "Maktab/kollej/litsey diplomi va ilovasi — PDF", "Bakalavr diplomi va ilovasi (asl) — PDF. Hali o‘qiyotgan bo‘lsangiz — reyting daftarchasi", "Niyat (motivatsiya) xati", "Ilmiy ish mavzusi va kirish qismi (grant uchun muhim)", "1–2 o‘qituvchi/ilmiy rahbardan tavsiyanoma", "Yutuqlar: sertifikat, diplom, maqolalar (mavjud bo‘lsa)", "TÖMER til sertifikati (mavjud bo‘lsa)"], doctorate: ["Pasport — PDF", "Maktab/kollej/litsey diplomi va ilovasi — PDF", "Bakalavr va magistr diplomi va ilovasi (asl) — PDF. Hali o‘qiyotgan bo‘lsangiz — reyting daftarchasi", "Niyat (motivatsiya) xati", "Ilmiy ish mavzusi va kirish qismi (doktorantura uchun shart)", "Ilmiy ishga 1–2 o‘qituvchi/rahbardan tavsiyanoma", "Yutuqlar: sertifikat, diplom, medal, maqolalar (mavjud bo‘lsa)", "TÖMER til sertifikati (mavjud bo‘lsa)"] }, extrasTitle: "Majburiy qo‘shimcha hujjatlar", motivation: { t: "Niyat (motivatsiya) xati", d: "Nega Turkiyani va shu yo‘nalishni tanlaganingiz, bitirgandan keyingi maqsadlaringiz. Taxminan 500 so‘z, professional va aniq.", points: ["O‘zingizni qisqa tanishtiring", "Asosiy maqsadingiz", "Erishgan yutuqlaringiz", "Nega Turkiya va nega bu soha", "Topshirayotgan universitetingiz haqida", "Grant evaziga nima qila olasiz"] }, reference: { t: "Tavsiyanoma (reference letter)", d: "O‘qish joyingizdagi o‘qituvchidan. Ilmiy unvoni yuqori bo‘lgani (fan nomzodi, professor) afzal. O‘qituvchining faol elektron pochtasi ko‘rsatilishi shart." }, stagesTitle: "Qabul jarayoni", stages: [{ t: "1-bosqich: hujjatlarni ko‘rib chiqish", d: "Hujjatlar, maqsad va qiziqishlar mutaxassislar tomonidan o‘rganiladi. Muvaffaqiyatlilar suhbatga o‘tadi (ba’zan matematika/mantiq testi bo‘lishi mumkin)." }, { t: "2-bosqich: suhbat", d: "O‘rtacha 15–20 daqiqa. Asosan Turkiyada o‘qish maqsadi va tanlangan yo‘nalish haqida savollar." }, { t: "3-bosqich: tanlov", d: "Komissiya suhbat natijalarini baholaydi va grant yutganlar ro‘yxati tuziladi." }] },
    footer: { tagline: "Turkiyada o‘qish — Savura EDU bilan oson.", quick: "Tezkor havolalar", rights: "Barcha huquqlar himoyalangan." },
    admin: { login: "Admin kirish", email: "Email", pass: "Parol", enter: "Kirish", wrong: "Parol noto‘g‘ri", hint: "Davom etish uchun parolni kiriting", title: "Boshqaruv paneli", tabU: "Universitetlar", tabI: "Arizalar", tabS: "Sozlamalar", logout: "Chiqish", add: "Universitet qo‘shish", edit: "Tahrirlash", save: "Saqlash", cancel: "Bekor qilish", fName: "Universitet nomi", fCity: "Shahar", fImg: "Universitet rasmi", upload: "Rasm yuklash", remove: "Rasmni o‘chirish", imgHint: "JPG/PNG — avtomatik kichraytiriladi", fDesc: "Tavsif", fFields: "Yo‘nalishlar (filtr uchun)", fFeatured: "Bosh sahifada ko‘rsatish", saved: "Saqlandi", confirm: "Rostdan o‘chirilsinmi?", noI: "Hozircha arizalar yo‘q.", iName: "Ism", iContact: "Aloqa", iMsg: "Xabar", iDate: "Sana", shared: "Eslatma: ma’lumotlar saytda barcha tashrif buyuruvchilarga ko‘rinadi.", facTitle: "Fakultetlar (narxi, manzili, qabul)", addFac: "Fakultet qo‘shish", facName: "Fakultet nomi", facPrice: "Yillik narx", facSchol: "5 yil burs (jami)", facLoc: "Manzil", facAdm: "Qabul holati", facLang: "Ta'lim tili", uniHint: "Ro'yxatdan tanlasangiz shahri va fakultetlari avtomatik to'ladi", coTitle: "Kompaniya ma’lumotlari", coPhone: "Telefon raqam", coEmail: "Email", coAddr: "Manzil", coHours: "Ish vaqti", coIg: "Instagram havolasi", coTg: "Telegram havolasi", coPrice: "Boshlang‘ich narx ($)", saveCo: "Sozlamalarni saqlash", tabP: "Hamkorlar", iRef: "Referal / Hamkor", payReqs: "Pul yechish arizalari", markPaid: "To‘lov qildim", noPartners: "Hozircha hamkorlar yo‘q.", noPayReq: "Pul yechish arizalari yo‘q.", crmRef: "Tavsiyalar", crmBal: "Balans", tabM: "Xabarlar", search: "Qidirish (ism, telefon, kod...)", fAll: "Barchasi", today: "Bugun", yesterday: "Kecha", mTo: "Kimga", mAll: "Barcha hamkorlarga", mTitleF: "Sarlavha", mBodyF: "Xabar matni", mSend: "Yuborish", mSentTitle: "Yuborilgan xabarlar", mNoSent: "Hali xabar yo‘q.", coReward: "Har bir referal uchun mukofot ($)", bcast: "Hammaga", dlExcel: "Excelʼga yuklash" },
  },

  tr: {
    nav: { home: "Ana sayfa", universities: "Üniversiteler", about: "Hakkımızda", contact: "İletişim", admin: "Yönetim paneli" },
    cta: { consult: "Ücretsiz danışmanlık", browse: "Üniversiteleri gör", apply: "Başvuru bırak", details: "Detaylar", viewAll: "Tümünü gör", contactUs: "Bize ulaşın" },
    hero: { badge: "Yıllık kontratlar 800$'dan başlar", title1: "Türkiye'de okuma", title2: "hayalinizi gerçekleştiriyoruz", subtitle: "Savura EDU ile Türkiye'nin onlarca önde gelen üniversitesi için tüm belgelerinizi hazırlıyor ve kabulünüzü sağlıyoruz. Siz bölümü seçin — gerisini bize bırakın.", s1: "Partner üniversite", s2: "Yerleştirilen öğrenci", s3: "Kabul başarısı" },
    adv: { eyebrow: "Neden Türkiye?", title: "Türkiye'de okumanın avantajları", sub: "Kalite, fiyat ve fırsatlar — hepsi tek yerde.", items: [
      { t: "Dünya standartında eğitim", d: "Avrupa standardında programlar ve uluslararası sıralamalarda üniversiteler." },
      { t: "Uygun fiyat", d: "Yılda 800$'dan başlayan kontratlar ve burs imkânları." },
      { t: "Tanınan diploma", d: "Diplomalarınız tüm dünyada geçerlidir." },
      { t: "Burslar", d: "Devlet ve üniversite burslarıyla masraflarınızı azaltın." },
      { t: "Zengin kültür", d: "Doğu ile Batı'nın uyumu, güvenli ve misafirperver ortam." },
      { t: "Elverişli konum", d: "Avrupa ile Asya arasında, vatana yakın ve uygun uçuşlar." } ] },
    fields: { eyebrow: "Bölümler", title: "İstediğiniz bölümü buluyoruz", sub: "Tıptan İslami ilimlere kadar — her hayale uygun üniversite.", names: { medicine: "Tıp", dentistry: "Diş hekimliği", pharmacy: "Eczacılık", engineering: "Mühendislik", it: "Bilişim & yazılım", business: "İşletme & ekonomi", law: "Hukuk", islamic: "İslami ilimler", arts: "Sanat & tasarım", social: "Sosyal bilimler" } },
    process: { eyebrow: "Süreç", title: "4 basit adımda Türkiye'ye", steps: [
      { t: "Danışmanlık", d: "Bölümü ve üniversiteyi birlikte seçeriz." },
      { t: "Belgeler", d: "Tüm belgeleri hazırlar, çevirir ve onaylatırız." },
      { t: "Kabul", d: "Üniversiteye başvuruyu yapar, kabul mektubunu alırız." },
      { t: "Yerleşim", d: "Vize, yurt ve Türkiye'de karşılamayı düzenleriz." } ] },
    featured: { title: "Popüler üniversiteler", sub: "En çok tercih edilen partner üniversitelerimiz." },
    band: { title: "Hayalinize bugün başlayın", sub: "Ücretsiz danışmanlık alın — uzmanlarımız size en uygun bölümü bulsun." },
    unis: { title: "Türkiye üniversiteleri", sub: "Bölüme göre seçin ve size uygun kontratı bulun.", search: "Üniversite veya şehir ara", all: "Tümü", from: "/ yıl", fieldsLabel: "Bölümler", none: "Sonuç bulunamadı. Başka bir filtre deneyin." },
    detail: { faculties: "Fakülteler", colFaculty: "Fakülte", colPrice: "Ücret (yıllık)", colLocation: "Konum", colAdmission: "Kayıt", about: "Üniversite hakkında", close: "Kapat", noFac: "Fakülteler yakında eklenecek.", colLang: "Dil", langTr: "Türkçe", langEn: "İngilizce", admOpen: "Kayıt açık", admClosed: "Kayıt kapalı", annual: "Yıllık kontrat", scholarship: "5 yıllık burs", save: "tasarruf", perYear: "/yıl" },
    about: { title: "Savura EDU hakkında", p1: "Savura EDU, Savura markası ailesinin eğitim koludur. Gençleri Türkiye'nin en iyi üniversitelerine yerleştirmede uzmanız.", p2: "Amacımız öğrencilik yolundaki tüm endişeleri üstlenmek. Belge hazırlığından vizeye, yurttan ilk derse kadar yanınızdayız.", vTitle: "Değerlerimiz", values: [
      { t: "Güven", d: "Her belgenin ve sözün arkasında şeffaflık vardır." },
      { t: "Hız", d: "Belgeleriniz hızlı ve doğru işlenir." },
      { t: "Özen", d: "Türkiye'de kendinizi yalnız hissetmezsiniz." } ] },
    contact: { title: "Bize ulaşın", sub: "Sorunuz mu var? Ücretsiz danışmanlık için yazın.", name: "Adınız", email: "E-posta", phone: "Telefon", msg: "Mesajınız", send: "Gönder", ok: "Teşekkürler! Başvurunuz alındı. En kısa sürede dönüş yapacağız.", infoTitle: "İletişim bilgileri", addressLabel: "Adres", hours: "Çalışma saatleri" },
    docs: { eyebrow: "Belgeler & Hazırlık", title: "Türkçe bilmesen de okuyabilirsin", sub: "Dil bir engel değil — hazırlıktan diplomaya kadar yanındayız.", docsTitle: "Gerekli belgeler", docs: ["Pasaport", "Lise diploması (attestat) veya kolej diploması"], prepTitle: "1 yıllık hazırlık programı", prepText: "Dil bilmeyen öğrenciler için 1 yıllık hazırlık vardır. Bölümün diline göre Türkçe veya İngilizce hazırlık okursun — hazırlık dili seçtiğin programın diline göre belirlenir." },
    benefits: { eyebrow: "Fırsatlar", title: "Okumak sadece başlangıç", sub: "Türkiye'de öğrencilik; diplomanın yanında yaşama, çalışma ve Avrupa'ya açılan bir kapıdır.", items: [ { t: "Oturma izni", d: "Üniversiteye kabul edildikten sonra Türkiye'de yasal kalmak için oturma izni (ikamet) alırsınız." }, { t: "Okurken çalışmak", d: "Boş zamanlarında çalışabilirsin — kontrat ve yaşam giderlerini rahatça karşılayacak gelir elde edebilirsin." }, { t: "Work & Travel", d: "Yaz tatilinde Work and Travel programıyla Avrupa ülkelerine gidip çalışabilir ve gezebilirsin." }, { t: "Erasmus+ değişimi", d: "Erasmus programıyla eğitiminin bir bölümünü Avrupa Birliği üniversitelerinde sürdürebilirsin." } ] },
    partner: {
      nav: "Ortaklık",
      earnTitle: "Savura EDU ile kazanmaya başlayın",
      earnSub: "Öğrencinizi, arkadaşınızı veya akrabanızı Savura EDU'ya önerin — üniversiteye yerleştiklerinde siz kazanın.",
      earnCta: "Ortak ol",
      heroEyebrow: "Ortaklık programı",
      heroTitle: "Öner — birlikte kazan",
      heroSub: "Bir kez kaydolun, kişisel bağlantınızı paylaşın ve önerdiğiniz her öğrenci üniversiteye yerleştiğinde ödül kazanın.",
      rewardWord: "Yerleşen her öğrenci için",
      rewardUpto: "kadar",
      how: [
        { t: "Kaydolun", d: "Bir dakikada ortak hesabı açın, kişisel referans kodunuzu ve bağlantınızı alın." },
        { t: "Paylaşın", d: "Bağlantınızı arkadaşlarınıza, öğrencilerinize ve akrabalarınıza gönderin veya sosyal medyada paylaşın." },
        { t: "Kazanın", d: "Önerinizle gelen aday üniversiteye yerleştiğinde ödül bakiyenize eklenir." },
        { t: "Parayı çekin", d: "Bakiyenizi istediğiniz zaman Kart, IBAN, banka havalesi veya TRC20 ile çekin." }
      ],
      whoTitle: "Kimler kazanabilir?",
      who: ["Öğretmenler ve özel ders verenler", "Öğrenciler", "Aday veliler", "Bloggerlar ve çevresi olan herkes"],
      ctaJoin: "Ortak ol", ctaLogin: "Panele giriş",
      haveAcc: "Hesabınız var mı?", noAcc: "Hesabınız yok mu?",
      regTitle: "Ortak olarak kaydol",
      fName: "Ad soyad", fEmail: "E-posta", fPhone: "Telefon", fPass: "Şifre",
      fAudience: "Kimleri önermek istiyorsunuz? (isteğe bağlı)",
      regBtn: "Kaydol", loginTitle: "Ortak paneline giriş", loginBtn: "Giriş",
      hello: "Merhaba", myCode: "Referans kodunuz", myLink: "Paylaşım bağlantısı",
      copy: "Kopyala", copied: "Kopyalandı!", logout: "Çıkış",
      stReferred: "Önerilen", stProcess: "Süreçte", stPaid: "Ödedi", stCancelled: "İptal",
      balance: "Güncel bakiye", pending: "Bekleyen bakiye", withdraw: "Para çek",
      tName: "Ad", tUni: "Üniversite", tStatus: "Durum", tReward: "Ödül", tDate: "Tarih",
      noRefs: "Henüz öneri yok. Bağlantınızı paylaşın!",
      sNew: "Yeni", sThinking: "Düşünüyor", sInpay: "Ödeme sürecinde", sPaid: "Ödedi", sCancelled: "İptal",
      wTitle: "Para çekme talebi", wAmount: "Tutar ($)", wMethod: "Yöntem",
      mCard: "Kart", mIban: "IBAN", mBank: "Banka havalesi", mTrc: "TRC20 (USDT)",
      wDetails: "Kart no / IBAN / cüzdan adresi", wSubmit: "Talep gönder",
      wHistory: "Ödeme geçmişi", wRequested: "Bekliyor", wPaid: "Ödendi", noPayouts: "Ödeme geçmişi boş.",
      refField: "Referans kodu (isteğe bağlı)",
      confirmNeeded: "Kayıt geçici olarak kapalı. Lütfen yönetici ile iletişime geçin.",
      loginErr: "E-posta veya şifre hatalı.", regErr: "Kayıt sırasında hata. E-posta kullanımda olabilir.",
      minBal: "Çekim için yeterli bakiye yok.", fConfirm: "Şifreyi onaylayın", passMismatch: "Şifreler eşleşmiyor.", passShort: "Şifre en az 6 karakter olmalı.", msgsTitle: "Mesajlar", noMsgs: "Henüz mesaj yok.", editCode: "Kodu düzenle", codeLabel: "Kendi referans kodunuz", codeHint: "En az 6 karakter — harf ve rakam", codeShort: "En az 6 karakter olmalı.", codeInvalid: "Sadece harf ve rakam kullanın.", codeTaken: "Bu kod kullanımda.", codeOk: "Uygun — kullanılabilir.", codeSaved: "Kod güncellendi!", checkEmail: "Onay bağlantısı e-postanıza gönderildi. Lütfen e-postanızı kontrol edip bağlantıya tıklayın, sonra giriş yapın.", earnForEach: "Her öğrenci için gelir elde edin", rwPerStudent: "Şu anda 1 öğrenci için ödenen tutar", rwEstMonthly: "Tahmini aylık gelir", rwUpTo100: "Ayda 100'e kadar öğrenci önerebilirsiniz", save: "Kaydet", cancel: "İptal"
    },
    proc: { nav: "Belgeler ve kabul", title: "Gerekli belgeler ve kabul süreci", sub: "Seviyeni seç ve gerekli belgeleri gör. Belgeleri doğru ve eksiksiz hazırlamak burs şansını artırır.", levelsTitle: "Seviyeye göre belgeler", bachelor: "Lisans", master: "Yüksek lisans", doctorate: "Doktora", docs: { bachelor: ["Pasaport (kırmızı, yeşil veya kimlik) — PDF", "9. sınıf belgesi aslı — PDF", "Lise diploması veya kolej/lise diploması ve eki (asıl) — PDF. Hâlâ okuyorsanız — güncel not belgesi", "Niyet (motivasyon) mektubu", "1–2 öğretmen/danışmandan referans mektubu", "Başarılar: sertifika, diploma, madalya vb. (varsa)", "TÖMER dil sertifikası (varsa)"], master: ["Pasaport — PDF", "Lise/kolej diploması ve eki — PDF", "Lisans diploması ve eki (asıl) — PDF. Hâlâ okuyorsanız — not dökümü (transkript)", "Niyet (motivasyon) mektubu", "Araştırma konusu ve giriş bölümü (burs için önemli)", "1–2 öğretmen/danışmandan referans mektubu", "Başarılar: sertifika, diploma, makaleler (varsa)", "TÖMER dil sertifikası (varsa)"], doctorate: ["Pasaport — PDF", "Lise/kolej diploması ve eki — PDF", "Lisans ve yüksek lisans diploması ve eki (asıl) — PDF. Hâlâ okuyorsanız — transkript", "Niyet (motivasyon) mektubu", "Araştırma konusu ve giriş bölümü (doktora için şart)", "Araştırma için 1–2 öğretmen/danışmandan referans", "Başarılar: sertifika, diploma, madalya, makaleler (varsa)", "TÖMER dil sertifikası (varsa)"] }, extrasTitle: "Zorunlu ek belgeler", motivation: { t: "Niyet (motivasyon) mektubu", d: "Türkiye'yi ve bu bölümü neden seçtiğin, mezuniyet sonrası hedeflerin. Yaklaşık 500 kelime, profesyonel ve net.", points: ["Kendini kısaca tanıt", "Ana hedefin", "Başarıların", "Neden Türkiye ve neden bu alan", "Başvurduğun üniversite hakkında", "Burs karşılığında neler katabilirsin"] }, reference: { t: "Referans mektubu", d: "Okulundaki bir öğretmenden. Akademik unvanı yüksek olması (doktor, profesör) tercih edilir. Öğretmenin aktif e-posta adresi belirtilmelidir." }, stagesTitle: "Kabul süreci", stages: [{ t: "1. aşama: belge incelemesi", d: "Belgeler, hedefler ve ilgi alanları uzmanlarca incelenir. Başarılı olanlar mülakata geçer (bazen matematik/mantık testi olabilir)." }, { t: "2. aşama: mülakat", d: "Ortalama 15–20 dakika. Genelde Türkiye'de okuma amacı ve seçilen bölüm hakkında sorular." }, { t: "3. aşama: seçim", d: "Komisyon mülakat sonuçlarını değerlendirir ve burs kazananların listesi oluşturulur." }] },
    footer: { tagline: "Türkiye'de okumak — Savura EDU ile kolay.", quick: "Hızlı bağlantılar", rights: "Tüm hakları saklıdır." },
    admin: { login: "Yönetici girişi", email: "E-posta", pass: "Şifre", enter: "Giriş", wrong: "Şifre yanlış", hint: "Devam etmek için şifrenizi girin", title: "Yönetim paneli", tabU: "Üniversiteler", tabI: "Başvurular", tabS: "Ayarlar", logout: "Çıkış", add: "Üniversite ekle", edit: "Düzenle", save: "Kaydet", cancel: "İptal", fName: "Üniversite adı", fCity: "Şehir", fImg: "Üniversite görseli", upload: "Görsel yükle", remove: "Görseli kaldır", imgHint: "JPG/PNG — otomatik küçültülür", fDesc: "Açıklama", fFields: "Bölümler (filtre için)", fFeatured: "Ana sayfada göster", saved: "Kaydedildi", confirm: "Gerçekten silinsin mi?", noI: "Henüz başvuru yok.", iName: "Ad", iContact: "İletişim", iMsg: "Mesaj", iDate: "Tarih", shared: "Not: veriler sitede tüm ziyaretçilere görünür.", facTitle: "Fakülteler (ücret, konum, kayıt)", addFac: "Fakülte ekle", facName: "Fakülte adı", facPrice: "Yıllık ücret", facSchol: "5 yıl burs (toplam)", facLoc: "Konum", facAdm: "Kayıt durumu", facLang: "Eğitim dili", uniHint: "Listeden seçerseniz şehir ve fakülteler otomatik dolar", coTitle: "Şirket bilgileri", coPhone: "Telefon", coEmail: "E-posta", coAddr: "Adres", coHours: "Çalışma saatleri", coIg: "Instagram bağlantısı", coTg: "Telegram bağlantısı", coPrice: "Başlangıç fiyatı ($)", saveCo: "Ayarları kaydet", tabP: "Ortaklar", iRef: "Referans / Ortak", payReqs: "Para çekme talepleri", markPaid: "Ödeme yaptım", noPartners: "Henüz ortak yok.", noPayReq: "Para çekme talebi yok.", crmRef: "Öneriler", crmBal: "Bakiye", tabM: "Mesajlar", search: "Ara (ad, telefon, kod...)", fAll: "Tümü", today: "Bugün", yesterday: "Dün", mTo: "Kime", mAll: "Tüm ortaklara", mTitleF: "Başlık", mBodyF: "Mesaj metni", mSend: "Gönder", mSentTitle: "Gönderilen mesajlar", mNoSent: "Henüz mesaj yok.", coReward: "Her referans için ödül ($)", bcast: "Herkese", dlExcel: "Excelʼe indir" },
  },

  en: {
    nav: { home: "Home", universities: "Universities", about: "About us", contact: "Contact", admin: "Admin panel" },
    cta: { consult: "Free consultation", browse: "Browse universities", apply: "Apply now", details: "Details", viewAll: "View all", contactUs: "Contact us" },
    hero: { badge: "Annual contracts from $800", title1: "We make your dream of", title2: "studying in Turkey come true", subtitle: "With Savura EDU we prepare all your documents and secure admission to dozens of leading Turkish universities. You choose the program — we handle the rest.", s1: "Partner universities", s2: "Students placed", s3: "Admission success" },
    adv: { eyebrow: "Why Turkey?", title: "Advantages of studying in Turkey", sub: "Quality, price and opportunity — all in one place.", items: [
      { t: "World-class education", d: "European-standard programs and internationally ranked universities." },
      { t: "Affordable tuition", d: "Contracts from $800 a year and scholarship opportunities." },
      { t: "Recognized diploma", d: "Your diplomas are accepted around the world." },
      { t: "Scholarships", d: "Cut your costs with government and university grants." },
      { t: "Rich culture", d: "A blend of East and West in a safe, welcoming environment." },
      { t: "Great location", d: "Between Europe and Asia, close to home with affordable flights." } ] },
    fields: { eyebrow: "Programs", title: "We find the program you want", sub: "From medicine to Islamic studies — the right university for every dream.", names: { medicine: "Medicine", dentistry: "Dentistry", pharmacy: "Pharmacy", engineering: "Engineering", it: "IT & Software", business: "Business & Economics", law: "Law", islamic: "Islamic studies", arts: "Arts & Design", social: "Social sciences" } },
    process: { eyebrow: "Process", title: "To Turkey in 4 simple steps", steps: [
      { t: "Consultation", d: "We choose the program and university together." },
      { t: "Documents", d: "We prepare, translate and certify all your documents." },
      { t: "Admission", d: "We submit your application and obtain the acceptance letter." },
      { t: "Settling in", d: "We arrange visa, dormitory and a welcome in Turkey." } ] },
    featured: { title: "Popular universities", sub: "Our most-chosen partner universities." },
    band: { title: "Start your dream today", sub: "Get a free consultation — our experts will find the program that fits you best." },
    unis: { title: "Universities in Turkey", sub: "Filter by program and find the right contract for you.", search: "Search university or city", all: "All", from: "/ year", fieldsLabel: "Programs", none: "Nothing found. Try a different filter." },
    detail: { faculties: "Faculties", colFaculty: "Faculty", colPrice: "Price (yearly)", colLocation: "Location", colAdmission: "Admission", about: "About the university", close: "Close", noFac: "Faculties coming soon.", colLang: "Language", langTr: "Turkish", langEn: "English", admOpen: "Admission open", admClosed: "Admission closed", annual: "Annual contract", scholarship: "5-year scholarship", save: "you save", perYear: "/year" },
    about: { title: "About Savura EDU", p1: "Savura EDU is the education branch of the Savura brand family. We specialize in placing young people into Turkey's best universities.", p2: "Our goal is to take every worry off your shoulders — from document preparation to visa, from dormitory to your first lecture, we are with you.", vTitle: "Our values", values: [
      { t: "Trust", d: "Transparency stands behind every document and promise." },
      { t: "Speed", d: "Your documents are processed quickly and correctly." },
      { t: "Care", d: "You will never feel alone in Turkey." } ] },
    contact: { title: "Contact us", sub: "Have a question? Write to us for a free consultation.", name: "Your name", email: "Email", phone: "Phone", msg: "Your message", send: "Send", ok: "Thank you! Your request has been received. We'll be in touch shortly.", infoTitle: "Contact details", addressLabel: "Address", hours: "Working hours" },
    docs: { eyebrow: "Documents & Prep", title: "Study even without Turkish", sub: "Language is no barrier — we guide you from prep to diploma.", docsTitle: "Required documents", docs: ["Passport", "High-school certificate (attestat) or college diploma"], prepTitle: "1-year preparatory program", prepText: "There is a 1-year prep program for students who don't speak the language. Depending on the program's language you take Turkish or English prep — the prep language follows the language of the program you choose." },
    benefits: { eyebrow: "Opportunities", title: "Studying is just the beginning", sub: "Student life in Turkey means more than a diploma — it opens the door to living, working and Europe.", items: [ { t: "Residence permit", d: "Once you are admitted, you receive a residence permit (ikamet) to live in Turkey legally." }, { t: "Work while you study", d: "You can work in your free time and comfortably earn enough to cover tuition and living costs." }, { t: "Work & Travel", d: "During summer holidays you can join Work and Travel programs in European countries to work and explore." }, { t: "Erasmus+ exchange", d: "Through Erasmus you can continue part of your studies at universities in the European Union." } ] },
    partner: {
      nav: "Partnership",
      earnTitle: "Start earning with Savura EDU",
      earnSub: "Simply recommend your student, friend or relative to Savura EDU — when they enroll, you earn.",
      earnCta: "Become a partner",
      heroEyebrow: "Partner program",
      heroTitle: "Refer — and earn together",
      heroSub: "Register once, share your personal link, and get rewarded every time a student you referred enrolls at a university.",
      rewardWord: "For every enrolled student",
      rewardUpto: "up to",
      how: [
        { t: "Register", d: "Open a partner account in a minute and get your personal referral code and link." },
        { t: "Share", d: "Send your link to friends, students and relatives, or post it on social media." },
        { t: "Earn", d: "When an applicant who came through you enrolls, the reward is added to your balance." },
        { t: "Withdraw", d: "Withdraw your balance anytime via Card, IBAN, bank transfer or TRC20." }
      ],
      whoTitle: "Who can earn?",
      who: ["Teachers and tutors", "Students", "Applicants' parents", "Bloggers and anyone with contacts"],
      ctaJoin: "Become a partner", ctaLogin: "Log in to cabinet",
      haveAcc: "Already have an account?", noAcc: "Don't have an account?",
      regTitle: "Register as a partner",
      fName: "Full name", fEmail: "Email", fPhone: "Phone", fPass: "Password",
      fAudience: "Who do you plan to refer? (optional)",
      regBtn: "Register", loginTitle: "Partner cabinet login", loginBtn: "Log in",
      hello: "Hello", myCode: "Your referral code", myLink: "Share link",
      copy: "Copy", copied: "Copied!", logout: "Log out",
      stReferred: "Referred", stProcess: "In process", stPaid: "Enrolled", stCancelled: "Cancelled",
      balance: "Current balance", pending: "Pending balance", withdraw: "Withdraw",
      tName: "Name", tUni: "University", tStatus: "Status", tReward: "Reward", tDate: "Date",
      noRefs: "No referrals yet. Share your link!",
      sNew: "New", sThinking: "Considering", sInpay: "In payment", sPaid: "Enrolled", sCancelled: "Cancelled",
      wTitle: "Withdrawal request", wAmount: "Amount ($)", wMethod: "Method",
      mCard: "Card", mIban: "IBAN", mBank: "Bank transfer", mTrc: "TRC20 (USDT)",
      wDetails: "Card no / IBAN / wallet address", wSubmit: "Send request",
      wHistory: "Payout history", wRequested: "Pending", wPaid: "Paid", noPayouts: "No payouts yet.",
      refField: "Referral code (optional)",
      confirmNeeded: "Registration is temporarily unavailable. Please contact the administrator.",
      loginErr: "Wrong email or password.", regErr: "Registration error. Email may already be in use.",
      minBal: "Not enough balance to withdraw.", fConfirm: "Confirm password", passMismatch: "Passwords do not match.", passShort: "Password must be at least 6 characters.", msgsTitle: "Messages", noMsgs: "No messages yet.", editCode: "Edit code", codeLabel: "Your own referral code", codeHint: "At least 6 characters — letters and digits", codeShort: "Must be at least 6 characters.", codeInvalid: "Use letters and digits only.", codeTaken: "This code is taken.", codeOk: "Available.", codeSaved: "Code updated!", checkEmail: "A confirmation link was sent to your email. Please check your inbox, click the link, then log in.", earnForEach: "Earn income for every student", rwPerStudent: "Amount paid per student right now", rwEstMonthly: "Estimated monthly income", rwUpTo100: "You can refer up to 100 students per month", save: "Save", cancel: "Cancel"
    },
    proc: { nav: "Documents & admission", title: "Required documents & admission process", sub: "Choose your level to see the documents. Preparing them correctly and completely increases your scholarship chances.", levelsTitle: "Documents by level", bachelor: "Bachelor's", master: "Master's", doctorate: "Doctorate", docs: { bachelor: ["Passport (any type or ID card) — PDF", "9th-grade certificate, original — PDF", "High-school certificate or college/lyceum diploma with transcript (original) — PDF. If still studying — current grade record", "Motivation letter", "Reference letter from 1–2 teachers/mentors", "Achievements: certificates, diplomas, medals, etc. (if any)", "TÖMER language certificate (if any)"], master: ["Passport — PDF", "High-school/college diploma with transcript — PDF", "Bachelor's diploma with transcript (original) — PDF. If still studying — transcript of records", "Motivation letter", "Research topic and introduction (important for the scholarship)", "Reference letter from 1–2 teachers/supervisors", "Achievements: certificates, diplomas, articles (if any)", "TÖMER language certificate (if any)"], doctorate: ["Passport — PDF", "High-school/college diploma with transcript — PDF", "Bachelor's and master's diplomas with transcripts (original) — PDF. If still studying — transcript", "Motivation letter", "Research topic and introduction (required for doctorate)", "Reference letter for research from 1–2 teachers/supervisors", "Achievements: certificates, diplomas, medals, articles (if any)", "TÖMER language certificate (if any)"] }, extrasTitle: "Mandatory extra documents", motivation: { t: "Motivation letter", d: "Why you chose Turkey and this field, and your goals after graduation. About 500 words, professional and clear.", points: ["Briefly introduce yourself", "Your main goal", "Your achievements", "Why Turkey and why this field", "About the university you apply to", "What you can give back for the scholarship"] }, reference: { t: "Reference letter", d: "From a teacher at your institution. A higher academic title (PhD, professor) is preferred. The teacher's active email must be included." }, stagesTitle: "Admission process", stages: [{ t: "Stage 1: document review", d: "Specialists review documents, goals and interests. Successful applicants move to the interview (sometimes a math/logic test)." }, { t: "Stage 2: interview", d: "About 15–20 minutes. Mostly about your goal of studying in Turkey and your chosen program." }, { t: "Stage 3: selection", d: "The committee evaluates interview results and the list of scholarship winners is formed." }] },
    footer: { tagline: "Studying in Turkey — made easy with Savura EDU.", quick: "Quick links", rights: "All rights reserved." },
    admin: { login: "Admin login", email: "Email", pass: "Password", enter: "Log in", wrong: "Wrong password", hint: "Enter your password to continue", title: "Dashboard", tabU: "Universities", tabI: "Inquiries", tabS: "Settings", logout: "Log out", add: "Add university", edit: "Edit", save: "Save", cancel: "Cancel", fName: "University name", fCity: "City", fImg: "University image", upload: "Upload image", remove: "Remove image", imgHint: "JPG/PNG — auto-resized", fDesc: "Description", fFields: "Programs (for filter)", fFeatured: "Show on homepage", saved: "Saved", confirm: "Delete for real?", noI: "No inquiries yet.", iName: "Name", iContact: "Contact", iMsg: "Message", iDate: "Date", shared: "Note: data is visible to all site visitors.", facTitle: "Faculties (price, location, admission)", addFac: "Add faculty", facName: "Faculty name", facPrice: "Annual price", facSchol: "5-yr scholarship (total)", facLoc: "Location", facAdm: "Admission status", facLang: "Language", uniHint: "Pick from the list to auto-fill city and faculties", coTitle: "Company details", coPhone: "Phone number", coEmail: "Email", coAddr: "Address", coHours: "Working hours", coIg: "Instagram link", coTg: "Telegram link", coPrice: "Starting price ($)", saveCo: "Save settings", tabP: "Partners", iRef: "Referral / Partner", payReqs: "Withdrawal requests", markPaid: "Mark as paid", noPartners: "No partners yet.", noPayReq: "No withdrawal requests.", crmRef: "Referrals", crmBal: "Balance", tabM: "Messages", search: "Search (name, phone, code...)", fAll: "All", today: "Today", yesterday: "Yesterday", mTo: "To", mAll: "All partners", mTitleF: "Title", mBodyF: "Message text", mSend: "Send", mSentTitle: "Sent messages", mNoSent: "No messages yet.", coReward: "Reward per referral ($)", bcast: "Everyone", dlExcel: "Download Excel" },
  },

  ru: {
    nav: { home: "Главная", universities: "Университеты", about: "О нас", contact: "Контакты", admin: "Админ-панель" },
    cta: { consult: "Бесплатная консультация", browse: "Смотреть университеты", apply: "Оставить заявку", details: "Подробнее", viewAll: "Смотреть все", contactUs: "Связаться с нами" },
    hero: { badge: "Годовые контракты от 800$", title1: "Осуществим вашу мечту", title2: "учиться в Турции", subtitle: "С Savura EDU мы готовим все ваши документы и обеспечиваем поступление в десятки ведущих университетов Турции. Вы выбираете направление — остальное берём на себя.", s1: "Университетов-партнёров", s2: "Поступивших студентов", s3: "Успех поступления" },
    adv: { eyebrow: "Почему Турция?", title: "Преимущества учёбы в Турции", sub: "Качество, цена и возможности — всё в одном месте.", items: [
      { t: "Образование мирового уровня", d: "Программы европейского стандарта и университеты в мировых рейтингах." },
      { t: "Доступная цена", d: "Контракты от 800$ в год и стипендиальные возможности." },
      { t: "Признанный диплом", d: "Ваши дипломы принимаются по всему миру." },
      { t: "Стипендии", d: "Снижайте расходы с государственными и университетскими грантами." },
      { t: "Богатая культура", d: "Гармония Востока и Запада в безопасной и гостеприимной среде." },
      { t: "Удобное расположение", d: "Между Европой и Азией, близко к дому и доступные перелёты." } ] },
    fields: { eyebrow: "Направления", title: "Найдём желаемое направление", sub: "От медицины до исламских наук — подходящий университет для любой мечты.", names: { medicine: "Медицина", dentistry: "Стоматология", pharmacy: "Фармацевтика", engineering: "Инженерия", it: "IT и разработка", business: "Бизнес и экономика", law: "Право", islamic: "Исламские науки", arts: "Искусство и дизайн", social: "Социальные науки" } },
    process: { eyebrow: "Процесс", title: "В Турцию за 4 простых шага", steps: [
      { t: "Консультация", d: "Вместе выбираем направление и университет." },
      { t: "Документы", d: "Готовим, переводим и заверяем все ваши документы." },
      { t: "Поступление", d: "Подаём заявку и получаем письмо о зачислении." },
      { t: "Размещение", d: "Организуем визу, общежитие и встречу в Турции." } ] },
    featured: { title: "Популярные университеты", sub: "Самые выбираемые университеты-партнёры." },
    band: { title: "Начните мечту сегодня", sub: "Получите бесплатную консультацию — наши специалисты подберут подходящее направление." },
    unis: { title: "Университеты Турции", sub: "Выберите по направлению и найдите подходящий контракт.", search: "Поиск университета или города", all: "Все", from: "/ год", fieldsLabel: "Направления", none: "Ничего не найдено. Попробуйте другой фильтр." },
    detail: { faculties: "Факультеты", colFaculty: "Факультет", colPrice: "Цена (в год)", colLocation: "Адрес", colAdmission: "Приём", about: "Об университете", close: "Закрыть", noFac: "Факультеты скоро появятся.", colLang: "Язык", langTr: "Турецкий", langEn: "Английский", admOpen: "Приём открыт", admClosed: "Приём закрыт", annual: "Годовой контракт", scholarship: "5-летний грант", save: "экономия", perYear: "/год" },
    about: { title: "О Savura EDU", p1: "Savura EDU — образовательное направление семьи брендов Savura. Мы специализируемся на поступлении молодёжи в лучшие университеты Турции.", p2: "Наша цель — снять с ваших плеч все заботы: от подготовки документов до визы, от общежития до первой лекции мы рядом.", vTitle: "Наши ценности", values: [
      { t: "Доверие", d: "За каждым документом и обещанием стоит прозрачность." },
      { t: "Скорость", d: "Ваши документы оформляются быстро и правильно." },
      { t: "Забота", d: "В Турции вы не будете чувствовать себя одиноко." } ] },
    contact: { title: "Связаться с нами", sub: "Есть вопрос? Напишите нам для бесплатной консультации.", name: "Ваше имя", email: "Email", phone: "Телефон", msg: "Ваше сообщение", send: "Отправить", ok: "Спасибо! Ваша заявка принята. Мы скоро свяжемся с вами.", infoTitle: "Контактные данные", addressLabel: "Адрес", hours: "Часы работы" },
    docs: { eyebrow: "Документы и подготовка", title: "Учитесь, даже не зная турецкого", sub: "Язык — не преграда: мы рядом от подготовки до диплома.", docsTitle: "Необходимые документы", docs: ["Загранпаспорт", "Аттестат школы или диплом колледжа"], prepTitle: "Годичная подготовка (hazırlık)", prepText: "Для студентов без знания языка есть годичная подготовка. В зависимости от языка программы вы проходите турецкую или английскую подготовку — язык подготовки соответствует языку выбранной программы." },
    benefits: { eyebrow: "Возможности", title: "Учёба — это только начало", sub: "Студенчество в Турции — это не только диплом, но и проживание, работа и путь в Европу.", items: [ { t: "Вид на жительство", d: "После зачисления вы получаете вид на жительство (икамет) для легального проживания в Турции." }, { t: "Учёба и работа", d: "В свободное время можно работать и спокойно зарабатывать на контракт и проживание." }, { t: "Work & Travel", d: "На летних каникулах можно поехать по программе Work and Travel в страны Европы — работать и путешествовать." }, { t: "Обмен Erasmus+", d: "По программе Erasmus часть обучения можно продолжить в университетах Евросоюза." } ] },
    partner: {
      nav: "Партнёрство",
      earnTitle: "Начните зарабатывать с Savura EDU",
      earnSub: "Просто порекомендуйте своего ученика, друга или родственника Savura EDU — когда они поступят, вы заработаете.",
      earnCta: "Стать партнёром",
      heroEyebrow: "Партнёрская программа",
      heroTitle: "Рекомендуйте — и зарабатывайте вместе",
      heroSub: "Зарегистрируйтесь один раз, делитесь персональной ссылкой и получайте вознаграждение каждый раз, когда приведённый вами студент поступает в университет.",
      rewardWord: "За каждого поступившего студента",
      rewardUpto: "до",
      how: [
        { t: "Регистрация", d: "Откройте партнёрский аккаунт за минуту и получите персональный реферальный код и ссылку." },
        { t: "Поделитесь", d: "Отправьте ссылку друзьям, ученикам и родственникам или опубликуйте в соцсетях." },
        { t: "Зарабатывайте", d: "Когда пришедший по вашей ссылке абитуриент поступает, вознаграждение добавляется на ваш баланс." },
        { t: "Выводите", d: "Выводите баланс в любое время через Карту, IBAN, банковский перевод или TRC20." }
      ],
      whoTitle: "Кто может зарабатывать?",
      who: ["Учителя и репетиторы", "Студенты", "Родители абитуриентов", "Блогеры и все, у кого есть контакты"],
      ctaJoin: "Стать партнёром", ctaLogin: "Войти в кабинет",
      haveAcc: "Уже есть аккаунт?", noAcc: "Нет аккаунта?",
      regTitle: "Регистрация партнёра",
      fName: "Имя и фамилия", fEmail: "Эл. почта", fPhone: "Телефон", fPass: "Пароль",
      fAudience: "Кого вы планируете рекомендовать? (необязательно)",
      regBtn: "Зарегистрироваться", loginTitle: "Вход в кабинет партнёра", loginBtn: "Войти",
      hello: "Здравствуйте", myCode: "Ваш реферальный код", myLink: "Ссылка для приглашения",
      copy: "Копировать", copied: "Скопировано!", logout: "Выйти",
      stReferred: "Приглашено", stProcess: "В процессе", stPaid: "Поступили", stCancelled: "Отменено",
      balance: "Текущий баланс", pending: "Ожидаемый баланс", withdraw: "Вывести",
      tName: "Имя", tUni: "Университет", tStatus: "Статус", tReward: "Вознаграждение", tDate: "Дата",
      noRefs: "Пока нет рекомендаций. Поделитесь ссылкой!",
      sNew: "Новый", sThinking: "Думает", sInpay: "В оплате", sPaid: "Поступил", sCancelled: "Отменён",
      wTitle: "Запрос на вывод", wAmount: "Сумма ($)", wMethod: "Способ",
      mCard: "Карта", mIban: "IBAN", mBank: "Банковский перевод", mTrc: "TRC20 (USDT)",
      wDetails: "Номер карты / IBAN / адрес кошелька", wSubmit: "Отправить запрос",
      wHistory: "История выплат", wRequested: "Ожидает", wPaid: "Выплачено", noPayouts: "История выплат пуста.",
      refField: "Реферальный код (необязательно)",
      confirmNeeded: "Регистрация временно недоступна. Свяжитесь с администратором.",
      loginErr: "Неверная почта или пароль.", regErr: "Ошибка регистрации. Возможно, почта уже используется.",
      minBal: "Недостаточно баланса для вывода.", fConfirm: "Подтвердите пароль", passMismatch: "Пароли не совпадают.", passShort: "Пароль должен быть не менее 6 символов.", msgsTitle: "Сообщения", noMsgs: "Сообщений пока нет.", editCode: "Изменить код", codeLabel: "Ваш реферальный код", codeHint: "Минимум 6 символов — буквы и цифры", codeShort: "Минимум 6 символов.", codeInvalid: "Только буквы и цифры.", codeTaken: "Этот код занят.", codeOk: "Свободен.", codeSaved: "Код обновлён!", checkEmail: "Ссылка для подтверждения отправлена на вашу почту. Проверьте почту, перейдите по ссылке, затем войдите.", earnForEach: "Зарабатывайте за каждого студента", rwPerStudent: "Сумма за 1 студента сейчас", rwEstMonthly: "Примерный доход в месяц", rwUpTo100: "Вы можете приглашать до 100 студентов в месяц", save: "Сохранить", cancel: "Отмена"
    },
    proc: { nav: "Документы и поступление", title: "Необходимые документы и процесс поступления", sub: "Выберите уровень, чтобы увидеть документы. Правильная и полная подготовка повышает шансы на грант.", levelsTitle: "Документы по уровням", bachelor: "Бакалавриат", master: "Магистратура", doctorate: "Докторантура", docs: { bachelor: ["Паспорт (любой или ID-карта) — PDF", "Аттестат за 9 класс, оригинал — PDF", "Аттестат за 11 класс или диплом колледжа/лицея с приложением (оригинал) — PDF. Если ещё учитесь — справка с текущими оценками", "Мотивационное письмо", "Рекомендательное письмо от 1–2 преподавателей/наставников", "Достижения: сертификаты, дипломы, медали и т.д. (при наличии)", "Языковой сертификат TÖMER (при наличии)"], master: ["Паспорт — PDF", "Диплом школы/колледжа с приложением — PDF", "Диплом бакалавра с приложением (оригинал) — PDF. Если ещё учитесь — выписка оценок", "Мотивационное письмо", "Тема исследования и введение (важно для гранта)", "Рекомендательное письмо от 1–2 преподавателей/руководителей", "Достижения: сертификаты, дипломы, статьи (при наличии)", "Языковой сертификат TÖMER (при наличии)"], doctorate: ["Паспорт — PDF", "Диплом школы/колледжа с приложением — PDF", "Дипломы бакалавра и магистра с приложениями (оригинал) — PDF. Если ещё учитесь — выписка оценок", "Мотивационное письмо", "Тема исследования и введение (обязательно для докторантуры)", "Рекомендация для исследования от 1–2 преподавателей/руководителей", "Достижения: сертификаты, дипломы, медали, статьи (при наличии)", "Языковой сертификат TÖMER (при наличии)"] }, extrasTitle: "Обязательные дополнительные документы", motivation: { t: "Мотивационное письмо", d: "Почему вы выбрали Турцию и это направление, ваши цели после выпуска. Примерно 500 слов, профессионально и чётко.", points: ["Кратко представьтесь", "Ваша главная цель", "Ваши достижения", "Почему Турция и почему это направление", "Об университете, куда поступаете", "Что вы можете дать взамен гранта"] }, reference: { t: "Рекомендательное письмо", d: "От преподавателя вашего учебного заведения. Предпочтительно с высоким научным званием (кандидат наук, профессор). Должен быть указан активный email преподавателя." }, stagesTitle: "Процесс поступления", stages: [{ t: "Этап 1: проверка документов", d: "Специалисты изучают документы, цели и интересы. Успешные проходят на собеседование (иногда тест по математике/логике)." }, { t: "Этап 2: собеседование", d: "Около 15–20 минут. В основном о цели учёбы в Турции и выбранном направлении." }, { t: "Этап 3: отбор", d: "Комиссия оценивает результаты собеседования, формируется список получателей гранта." }] },
    footer: { tagline: "Учёба в Турции — легко с Savura EDU.", quick: "Быстрые ссылки", rights: "Все права защищены." },
    admin: { login: "Вход для админа", email: "Эл. почта", pass: "Пароль", enter: "Войти", wrong: "Неверный пароль", hint: "Введите пароль для продолжения", title: "Панель управления", tabU: "Университеты", tabI: "Заявки", tabS: "Настройки", logout: "Выйти", add: "Добавить университет", edit: "Изменить", save: "Сохранить", cancel: "Отмена", fName: "Название университета", fCity: "Город", fImg: "Изображение университета", upload: "Загрузить фото", remove: "Удалить фото", imgHint: "JPG/PNG — авто-сжатие", fDesc: "Описание", fFields: "Направления (для фильтра)", fFeatured: "Показывать на главной", saved: "Сохранено", confirm: "Точно удалить?", noI: "Заявок пока нет.", iName: "Имя", iContact: "Контакт", iMsg: "Сообщение", iDate: "Дата", shared: "Примечание: данные видны всем посетителям сайта.", facTitle: "Факультеты (цена, адрес, приём)", addFac: "Добавить факультет", facName: "Название факультета", facPrice: "Цена в год", facSchol: "5-летний грант (всего)", facLoc: "Адрес", facAdm: "Статус приёма", facLang: "Язык обучения", uniHint: "Выберите из списка — город и факультеты заполнятся автоматически", coTitle: "Данные компании", coPhone: "Номер телефона", coEmail: "Email", coAddr: "Адрес", coHours: "Часы работы", coIg: "Ссылка Instagram", coTg: "Ссылка Telegram", coPrice: "Начальная цена ($)", saveCo: "Сохранить настройки", tabP: "Партнёры", iRef: "Реферал / Партнёр", payReqs: "Запросы на вывод", markPaid: "Отметить выплаченным", noPartners: "Партнёров пока нет.", noPayReq: "Запросов на вывод нет.", crmRef: "Рекомендации", crmBal: "Баланс", tabM: "Сообщения", search: "Поиск (имя, телефон, код...)", fAll: "Все", today: "Сегодня", yesterday: "Вчера", mTo: "Кому", mAll: "Всем партнёрам", mTitleF: "Заголовок", mBodyF: "Текст сообщения", mSend: "Отправить", mSentTitle: "Отправленные", mNoSent: "Сообщений пока нет.", coReward: "Вознаграждение за реферала ($)", bcast: "Всем", dlExcel: "Скачать Excel" },
  },

  ar: {
    nav: { home: "الرئيسية", universities: "الجامعات", about: "من نحن", contact: "تواصل معنا", admin: "لوحة التحكم" },
    cta: { consult: "استشارة مجانية", browse: "تصفّح الجامعات", apply: "قدّم طلبًا", details: "التفاصيل", viewAll: "عرض الكل", contactUs: "تواصل معنا" },
    hero: { badge: "عقود سنوية تبدأ من 800$", title1: "نحقّق حلمك", title2: "بالدراسة في تركيا", subtitle: "مع سفورة للتعليم نجهّز جميع أوراقك ونضمن قبولك في عشرات الجامعات التركية الرائدة. اختر تخصّصك فقط ودع الباقي علينا.", s1: "جامعة شريكة", s2: "طالب تم قبوله", s3: "نسبة نجاح القبول" },
    adv: { eyebrow: "لماذا تركيا؟", title: "مزايا الدراسة في تركيا", sub: "الجودة والسعر والفرص — كلّها في مكان واحد.", items: [
      { t: "تعليم عالمي المستوى", d: "برامج بمعايير أوروبية وجامعات مصنّفة دوليًا." },
      { t: "أسعار مناسبة", d: "عقود تبدأ من 800$ سنويًا مع فرص للمنح الدراسية." },
      { t: "شهادة معترف بها", d: "شهاداتك معتمدة في جميع أنحاء العالم." },
      { t: "منح دراسية", d: "قلّل تكاليفك عبر المنح الحكومية والجامعية." },
      { t: "ثقافة غنية", d: "تناغم بين الشرق والغرب في بيئة آمنة ومضيافة." },
      { t: "موقع مميّز", d: "بين أوروبا وآسيا، قريب من الوطن ورحلات بأسعار مناسبة." } ] },
    fields: { eyebrow: "التخصصات", title: "نجد لك التخصّص الذي تريده", sub: "من الطب إلى العلوم الإسلامية — الجامعة المناسبة لكل حلم.", names: { medicine: "الطب", dentistry: "طب الأسنان", pharmacy: "الصيدلة", engineering: "الهندسة", it: "تقنية المعلومات والبرمجة", business: "إدارة الأعمال والاقتصاد", law: "القانون", islamic: "العلوم الإسلامية", arts: "الفنون والتصميم", social: "العلوم الاجتماعية" } },
    process: { eyebrow: "المراحل", title: "إلى تركيا في 4 خطوات بسيطة", steps: [
      { t: "الاستشارة", d: "نختار التخصّص والجامعة معًا." },
      { t: "الأوراق", d: "نجهّز ونترجم ونصدّق جميع أوراقك." },
      { t: "القبول", d: "نقدّم طلبك ونحصل على خطاب القبول." },
      { t: "الاستقرار", d: "ننظّم التأشيرة والسكن واستقبالك في تركيا." } ] },
    featured: { title: "جامعات مشهورة", sub: "أكثر جامعاتنا الشريكة اختيارًا." },
    band: { title: "ابدأ حلمك اليوم", sub: "احصل على استشارة مجانية — سيجد خبراؤنا التخصّص الأنسب لك." },
    unis: { title: "جامعات تركيا", sub: "اختر حسب التخصّص واعثر على العقد المناسب لك.", search: "ابحث عن جامعة أو مدينة", all: "الكل", from: "/ سنة", fieldsLabel: "التخصصات", none: "لا توجد نتائج. جرّب تصفية أخرى." },
    detail: { faculties: "الكليات", colFaculty: "الكلية", colPrice: "السعر (سنوي)", colLocation: "الموقع", colAdmission: "القبول", about: "عن الجامعة", close: "إغلاق", noFac: "ستضاف الكليات قريبًا.", colLang: "اللغة", langTr: "التركية", langEn: "الإنجليزية", admOpen: "القبول مفتوح", admClosed: "القبول مغلق", annual: "العقد السنوي", scholarship: "منحة 5 سنوات", save: "توفير", perYear: "/سنة" },
    about: { title: "عن سفورة للتعليم", p1: "سفورة للتعليم هي الذراع التعليمي لعائلة علامة سفورة. نتخصّص في قبول الشباب في أفضل الجامعات التركية.", p2: "هدفنا أن نحمل عنك كل الهموم — من تجهيز الأوراق إلى التأشيرة، ومن السكن إلى أول محاضرة، نحن معك.", vTitle: "قيمنا", values: [
      { t: "الثقة", d: "الشفافية وراء كل ورقة ووعد." },
      { t: "السرعة", d: "تُنجز أوراقك بسرعة وبدقة." },
      { t: "الاهتمام", d: "لن تشعر بالوحدة في تركيا." } ] },
    contact: { title: "تواصل معنا", sub: "لديك سؤال؟ راسلنا للحصول على استشارة مجانية.", name: "اسمك", email: "البريد الإلكتروني", phone: "الهاتف", msg: "رسالتك", send: "إرسال", ok: "شكرًا! تم استلام طلبك وسنتواصل معك قريبًا.", infoTitle: "بيانات التواصل", addressLabel: "العنوان", hours: "ساعات العمل" },
    docs: { eyebrow: "المستندات والتحضير", title: "ادرس حتى لو كنت لا تعرف التركية", sub: "اللغة ليست عائقًا — نرافقك من التحضير حتى التخرج.", docsTitle: "المستندات المطلوبة", docs: ["جواز السفر", "شهادة الثانوية (الأتيستات) أو دبلوم الكلية"], prepTitle: "برنامج تحضيري لمدة سنة", prepText: "يوجد برنامج تحضيري لمدة سنة للطلاب الذين لا يجيدون اللغة. وحسب لغة البرنامج تدرس تحضيريًا تركيًا أو إنجليزيًا — وتُحدَّد لغة التحضير وفق لغة البرنامج الذي تختاره." },
    benefits: { eyebrow: "الفرص", title: "الدراسة مجرد البداية", sub: "الحياة الطلابية في تركيا ليست شهادة فحسب، بل باب للإقامة والعمل والوصول إلى أوروبا.", items: [ { t: "تصريح الإقامة", d: "بعد قبولك تحصل على تصريح إقامة (إقامت) للعيش في تركيا بشكل قانوني." }, { t: "الدراسة مع العمل", d: "يمكنك العمل في وقت فراغك وكسب ما يكفي لتغطية القسط ونفقات المعيشة بسهولة." }, { t: "Work & Travel", d: "في العطلة الصيفية يمكنك المشاركة في برنامج Work and Travel في الدول الأوروبية للعمل والسياحة." }, { t: "تبادل Erasmus+", d: "عبر برنامج إيراسموس يمكنك متابعة جزء من دراستك في جامعات الاتحاد الأوروبي." } ] },
    partner: {
      nav: "الشراكة",
      earnTitle: "ابدأ الربح مع Savura EDU",
      earnSub: "ببساطة أوصِ بطالبك أو صديقك أو قريبك إلى Savura EDU — عندما يلتحقون بالجامعة، تربح أنت.",
      earnCta: "كن شريكاً",
      heroEyebrow: "برنامج الشراكة",
      heroTitle: "أوصِ — واربح معاً",
      heroSub: "سجّل مرة واحدة، شارك رابطك الشخصي، واحصل على مكافأة في كل مرة يلتحق فيها طالب أوصيت به بالجامعة.",
      rewardWord: "لكل طالب يلتحق",
      rewardUpto: "حتى",
      how: [
        { t: "سجّل", d: "افتح حساب شريك في دقيقة واحصل على رمز الإحالة والرابط الخاص بك." },
        { t: "شارك", d: "أرسل رابطك للأصدقاء والطلاب والأقارب أو انشره على وسائل التواصل." },
        { t: "اربح", d: "عندما يلتحق المتقدم الذي جاء عبرك، تُضاف المكافأة إلى رصيدك." },
        { t: "اسحب", d: "اسحب رصيدك في أي وقت عبر البطاقة أو IBAN أو التحويل البنكي أو TRC20." }
      ],
      whoTitle: "من يمكنه الربح؟",
      who: ["المعلمون والمدرّسون", "الطلاب", "أولياء أمور المتقدمين", "المدوّنون وكل من لديه معارف"],
      ctaJoin: "كن شريكاً", ctaLogin: "الدخول إلى الحساب",
      haveAcc: "لديك حساب؟", noAcc: "ليس لديك حساب؟",
      regTitle: "التسجيل كشريك",
      fName: "الاسم الكامل", fEmail: "البريد الإلكتروني", fPhone: "الهاتف", fPass: "كلمة المرور",
      fAudience: "من تنوي أن توصي به؟ (اختياري)",
      regBtn: "تسجيل", loginTitle: "الدخول إلى حساب الشريك", loginBtn: "دخول",
      hello: "مرحباً", myCode: "رمز الإحالة الخاص بك", myLink: "رابط المشاركة",
      copy: "نسخ", copied: "تم النسخ!", logout: "خروج",
      stReferred: "موصى بهم", stProcess: "قيد المعالجة", stPaid: "التحقوا", stCancelled: "ملغى",
      balance: "الرصيد الحالي", pending: "الرصيد المتوقع", withdraw: "سحب",
      tName: "الاسم", tUni: "الجامعة", tStatus: "الحالة", tReward: "المكافأة", tDate: "التاريخ",
      noRefs: "لا إحالات بعد. شارك رابطك!",
      sNew: "جديد", sThinking: "يفكّر", sInpay: "قيد الدفع", sPaid: "التحق", sCancelled: "ملغى",
      wTitle: "طلب سحب", wAmount: "المبلغ ($)", wMethod: "الطريقة",
      mCard: "بطاقة", mIban: "IBAN", mBank: "تحويل بنكي", mTrc: "TRC20 (USDT)",
      wDetails: "رقم البطاقة / IBAN / عنوان المحفظة", wSubmit: "إرسال الطلب",
      wHistory: "سجل المدفوعات", wRequested: "قيد الانتظار", wPaid: "تم الدفع", noPayouts: "لا مدفوعات بعد.",
      refField: "رمز الإحالة (اختياري)",
      confirmNeeded: "التسجيل غير متاح مؤقتاً. يرجى التواصل مع المسؤول.",
      loginErr: "البريد أو كلمة المرور غير صحيحة.", regErr: "خطأ في التسجيل. قد يكون البريد مستخدماً.",
      minBal: "الرصيد غير كافٍ للسحب.", fConfirm: "أكد كلمة المرور", passMismatch: "كلمتا المرور غير متطابقتين.", passShort: "يجب ألا تقل كلمة المرور عن 6 أحرف.", msgsTitle: "الرسائل", noMsgs: "لا رسائل بعد.", editCode: "تعديل الرمز", codeLabel: "رمز الإحالة الخاص بك", codeHint: "6 أحرف على الأقل — حروف وأرقام", codeShort: "يجب ألا يقل عن 6 أحرف.", codeInvalid: "استخدم الحروف والأرقام فقط.", codeTaken: "هذا الرمز مستخدم.", codeOk: "متاح.", codeSaved: "تم تحديث الرمز!", checkEmail: "تم إرسال رابط التأكيد إلى بريدك. تحقق من بريدك وانقر على الرابط ثم سجّل الدخول.", earnForEach: "اربح دخلاً عن كل طالب", rwPerStudent: "المبلغ المدفوع لكل طالب حالياً", rwEstMonthly: "الدخل الشهري التقديري", rwUpTo100: "يمكنك إحالة حتى 100 طالب شهرياً", save: "حفظ", cancel: "إلغاء"
    },
    proc: { nav: "المستندات والقبول", title: "المستندات المطلوبة وعملية القبول", sub: "اختر المرحلة لرؤية المستندات. تجهيزها بشكل صحيح وكامل يزيد فرص الحصول على المنحة.", levelsTitle: "المستندات حسب المرحلة", bachelor: "البكالوريوس", master: "الماجستير", doctorate: "الدكتوراه", docs: { bachelor: ["جواز السفر (أو بطاقة الهوية) — PDF", "شهادة الصف التاسع الأصلية — PDF", "شهادة الثانوية أو دبلوم الكلية/الليسيه مع الملحق (الأصل) — PDF. إن كنت ما زلت تدرس — كشف الدرجات الحالي", "خطاب الدوافع (Motivation)", "خطاب توصية من 1–2 من المعلمين/المرشدين", "الإنجازات: شهادات، دبلومات، ميداليات... (إن وجدت)", "شهادة اللغة TÖMER (إن وجدت)"], master: ["جواز السفر — PDF", "دبلوم الثانوية/الكلية مع الملحق — PDF", "دبلوم البكالوريوس مع الملحق (الأصل) — PDF. إن كنت ما زلت تدرس — كشف الدرجات", "خطاب الدوافع", "موضوع البحث ومقدّمته (مهم للمنحة)", "خطاب توصية من 1–2 من المعلمين/المشرفين", "الإنجازات: شهادات، دبلومات، أبحاث (إن وجدت)", "شهادة اللغة TÖMER (إن وجدت)"], doctorate: ["جواز السفر — PDF", "دبلوم الثانوية/الكلية مع الملحق — PDF", "دبلوما البكالوريوس والماجستير مع الملاحق (الأصل) — PDF. إن كنت ما زلت تدرس — كشف الدرجات", "خطاب الدوافع", "موضوع البحث ومقدّمته (شرط للدكتوراه)", "خطاب توصية للبحث من 1–2 من المعلمين/المشرفين", "الإنجازات: شهادات، دبلومات، ميداليات، أبحاث (إن وجدت)", "شهادة اللغة TÖMER (إن وجدت)"] }, extrasTitle: "مستندات إضافية إلزامية", motivation: { t: "خطاب الدوافع", d: "لماذا اخترت تركيا وهذا التخصص، وأهدافك بعد التخرج. حوالي 500 كلمة، باحترافية ووضوح.", points: ["عرّف بنفسك باختصار", "هدفك الأساسي", "إنجازاتك", "لماذا تركيا ولماذا هذا المجال", "عن الجامعة التي تتقدّم إليها", "ماذا يمكن أن تقدّم مقابل المنحة"] }, reference: { t: "خطاب التوصية", d: "من معلّم في مؤسستك التعليمية. يُفضّل أن يكون بدرجة علمية عالية (دكتوراه، أستاذ). يجب ذكر بريد إلكتروني فعّال للمعلّم." }, stagesTitle: "عملية القبول", stages: [{ t: "المرحلة 1: مراجعة المستندات", d: "يراجع المختصّون المستندات والأهداف والاهتمامات. الناجحون ينتقلون إلى المقابلة (أحيانًا اختبار رياضيات/منطق)." }, { t: "المرحلة 2: المقابلة", d: "حوالي 15–20 دقيقة. غالبًا عن هدفك من الدراسة في تركيا والتخصص المختار." }, { t: "المرحلة 3: الاختيار", d: "تقيّم اللجنة نتائج المقابلة وتُعدّ قائمة الفائزين بالمنحة." }] },
    footer: { tagline: "الدراسة في تركيا — سهلة مع سفورة للتعليم.", quick: "روابط سريعة", rights: "جميع الحقوق محفوظة." },
    admin: { login: "دخول المشرف", email: "البريد الإلكتروني", pass: "كلمة المرور", enter: "دخول", wrong: "كلمة المرور خاطئة", hint: "أدخل كلمة المرور للمتابعة", title: "لوحة التحكم", tabU: "الجامعات", tabI: "الطلبات", tabS: "الإعدادات", logout: "خروج", add: "إضافة جامعة", edit: "تعديل", save: "حفظ", cancel: "إلغاء", fName: "اسم الجامعة", fCity: "المدينة", fImg: "صورة الجامعة", upload: "رفع صورة", remove: "إزالة الصورة", imgHint: "JPG/PNG — يُصغّر تلقائيًا", fDesc: "الوصف", fFields: "التخصصات (للتصفية)", fFeatured: "العرض في الصفحة الرئيسية", saved: "تم الحفظ", confirm: "هل تريد الحذف فعلًا؟", noI: "لا توجد طلبات بعد.", iName: "الاسم", iContact: "التواصل", iMsg: "الرسالة", iDate: "التاريخ", shared: "ملاحظة: البيانات مرئية لكل زوار الموقع.", facTitle: "الكليات (السعر، الموقع، القبول)", addFac: "إضافة كلية", facName: "اسم الكلية", facPrice: "السعر السنوي", facSchol: "منحة 5 سنوات (الإجمالي)", facLoc: "الموقع", facAdm: "حالة القبول", facLang: "لغة الدراسة", uniHint: "اختر من القائمة ليُملأ المدينة والكليات تلقائيًا", coTitle: "بيانات الشركة", coPhone: "رقم الهاتف", coEmail: "البريد الإلكتروني", coAddr: "العنوان", coHours: "ساعات العمل", coIg: "رابط إنستغرام", coTg: "رابط تيليجرام", coPrice: "السعر الابتدائي ($)", saveCo: "حفظ الإعدادات", tabP: "الشركاء", iRef: "إحالة / شريك", payReqs: "طلبات السحب", markPaid: "تم الدفع", noPartners: "لا شركاء بعد.", noPayReq: "لا طلبات سحب.", crmRef: "الإحالات", crmBal: "الرصيد", tabM: "الرسائل", search: "بحث (اسم، هاتف، رمز...)", fAll: "الكل", today: "اليوم", yesterday: "أمس", mTo: "إلى", mAll: "كل الشركاء", mTitleF: "العنوان", mBodyF: "نص الرسالة", mSend: "إرسال", mSentTitle: "الرسائل المرسلة", mNoSent: "لا رسائل بعد.", coReward: "مكافأة لكل إحالة ($)", bcast: "للجميع", dlExcel: "تنزيل Excel" },
  },
};

/* ------------------------------------------------------------------ */
/*  SEED DATA  (with faculties)                                        */
/* ------------------------------------------------------------------ */
const SEED = [
  { id: "u1", name: "Fatih Sultan Mehmet Vakıf Üniversitesi", city: "İstanbul", featured: true, image: "", fields: ["islamic", "law", "arts", "social"], desc: "İslami ilimler ve sosyal bilimler alanında öncü vakıf üniversitelerinden biri.", faculties: [
    { name: "İslami İlimler", language: "tr", price: 800, price5: 3000, location: "İstanbul · Halıcıoğlu", admission: "open" },
    { name: "Hukuk", language: "tr", price: 3500, price5: 13000, location: "İstanbul · Topkapı", admission: "open" },
    { name: "Mimarlık", language: "en", price: 4500, price5: 17000, location: "İstanbul · Halıcıoğlu", admission: "open" } ] },
  { id: "u2", name: "Karabük Üniversitesi", city: "Karabük", featured: true, image: "", fields: ["engineering", "it", "business", "social"], desc: "Uluslararası öğrenciler için uygun ve kaliteli bir devlet üniversitesi.", faculties: [
    { name: "Bilgisayar Mühendisliği", language: "tr", price: 800, price5: 3000, location: "Karabük", admission: "open" },
    { name: "Bilgisayar Mühendisliği", language: "en", price: 1200, price5: 4500, location: "Karabük", admission: "open" },
    { name: "İşletme", language: "tr", price: 700, price5: 2600, location: "Karabük", admission: "open" } ] },
  { id: "u3", name: "İstanbul Aydın Üniversitesi", city: "İstanbul", featured: true, image: "", fields: ["medicine", "engineering", "business", "it"], desc: "Geniş bölüm yelpazesi ve güçlü uluslararası iş birlikleriyle modern bir üniversite.", faculties: [
    { name: "Tıp", language: "en", price: 11000, price5: 42000, location: "İstanbul · Florya", admission: "open" },
    { name: "Bilgisayar Mühendisliği", language: "en", price: 4000, price5: 15000, location: "İstanbul · Florya", admission: "open" },
    { name: "İşletme", language: "tr", price: 3500, price5: 13000, location: "İstanbul · Florya", admission: "open" } ] },
  { id: "u4", name: "İstanbul Medipol Üniversitesi", city: "İstanbul", featured: false, image: "", fields: ["medicine", "dentistry", "pharmacy"], desc: "Tıp, diş hekimliği ve eczacılık alanında lider bir üniversite.", faculties: [
    { name: "Tıp", language: "tr", price: 21000, price5: 80000, location: "İstanbul · Kavacık", admission: "open" },
    { name: "Diş Hekimliği", language: "en", price: 18000, price5: 68000, location: "İstanbul · Kavacık", admission: "open" },
    { name: "Eczacılık", language: "tr", price: 9000, price5: 34000, location: "İstanbul · Kavacık", admission: "closed" } ] },
  { id: "u5", name: "Bahçeşehir Üniversitesi (BAU)", city: "İstanbul", featured: false, image: "", fields: ["business", "law", "arts", "it"], desc: "Uluslararası ağı ve yenilikçi eğitimiyle saygın bir üniversite.", faculties: [
    { name: "Hukuk", language: "tr", price: 5500, price5: 21000, location: "İstanbul · Beşiktaş", admission: "open" },
    { name: "Grafik Tasarım", language: "en", price: 6000, price5: 23000, location: "İstanbul · Beşiktaş", admission: "open" },
    { name: "Yazılım Mühendisliği", language: "en", price: 6500, price5: 25000, location: "İstanbul · Beşiktaş", admission: "open" } ] },
  { id: "u6", name: "Üsküdar Üniversitesi", city: "İstanbul", featured: true, image: "", fields: ["social", "medicine", "it"], desc: "Psikoloji ve sağlık bilimleri alanında tanınan bir üniversite.", faculties: [
    { name: "Psikoloji", language: "tr", price: 3500, price5: 13000, location: "İstanbul · Üsküdar", admission: "open" },
    { name: "Hemşirelik", language: "tr", price: 3000, price5: 11000, location: "İstanbul · Üsküdar", admission: "open" },
    { name: "Yazılım Mühendisliği", language: "en", price: 3800, price5: 14500, location: "İstanbul · Üsküdar", admission: "open" } ] },
];

const DEFAULT_COMPANY = {
  phone: "+998 90 123 45 67",
  email: "info@savura.edu",
  address: "İstanbul · Toshkent",
  hours: "Dush–Shan · 09:00–18:00",
  instagram: "https://instagram.com/savura.edu",
  telegram: "https://t.me/savura_edu",
  priceFrom: "800",
};

/* ------------------------------------------------------------------ */
/*  STORAGE  (see ./storage.js — localStorage by default, Supabase if env set) */
/* ------------------------------------------------------------------ */
// `store` is imported at the top of the file from "./storage".

function fileToImage(file, maxW = 760, quality = 0.6) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = rej; img.src = reader.result;
    };
    reader.onerror = rej; reader.readAsDataURL(file);
  });
}

const cardPrice = (u) => {
  const fp = (u.faculties || []).map(f => Number(f.price) || 0).filter(n => n > 0);
  return fp.length ? Math.min(...fp) : (Number(u.price) || 0);
};

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */
const STAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><g fill='none' stroke='%23ffffff' stroke-opacity='0.14' stroke-width='1.2'><path d='M32 6 L39 25 L58 32 L39 39 L32 58 L25 39 L6 32 L25 25 Z'/><circle cx='32' cy='32' r='6'/></g></svg>";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');
:root{--teal:#0B8A8C;--teal-d:#0A6E70;--teal-l:#13B0B2;--coral:#FF5A5A;--coral-d:#E8453F;--amber:#FFC233;--amber-d:#F5A623;--ink:#0E2A2C;--ink-soft:#3C5658;--line:#E3EDEC;--bg:#FBFCF9;--bg2:#F0FAF8;--card:#FFFFFF;--r:18px;--maxw:1180px;--sh:0 18px 40px -22px rgba(11,138,140,.35)}
:root[data-theme="dark"]{color-scheme:dark;--ink:#EAF3F1;--ink-soft:#94ABA9;--line:#263A38;--bg:#0B1312;--bg2:#101C1A;--card:#15211F;--sh:0 18px 40px -22px rgba(0,0,0,.65)}
body{background:var(--bg)}
.sv-root,.card,.section.alt,.footer,.field input,.field textarea,.btn-out,.chip,.fpill,.searchbox,.tabs,.lang-btn,.lang-pop,.setcard,.itable,.acard,.faccard{transition:background-color .25s ease,color .25s ease,border-color .25s ease}
.theme-btn{display:flex;align-items:center;justify-content:center;width:42px;height:42px;background:var(--card);border:1px solid var(--line);border-radius:999px;color:var(--ink)}
.theme-btn:hover{border-color:var(--teal);color:var(--teal)}
:root[data-theme="dark"] .footer{background:#070D0C}
:root[data-theme="dark"] .nav{background:rgba(11,19,18,.82)}
:root[data-theme="dark"] .burger{background:#1B2D2B}
:root[data-theme="dark"] .pcell.schol{background:rgba(245,166,35,.12);border-color:rgba(245,166,35,.32)}
:root[data-theme="dark"] .pcell.schol .pv{color:var(--amber)}

*{box-sizing:border-box}
.sv-root{font-family:'Manrope',system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.sv-root[dir="rtl"]{font-family:'Cairo','Manrope',sans-serif}
.sv-root button{font-family:inherit;cursor:pointer}
.sv-root a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 clamp(22px,6vw,60px)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}
h1,h2,h3{margin:0;line-height:1.1;letter-spacing:-.02em;font-weight:800}
.btn{border:none;border-radius:999px;padding:14px 26px;font-weight:700;font-size:.98rem;display:inline-flex;align-items:center;gap:9px;transition:transform .18s,box-shadow .25s,background .2s;white-space:nowrap}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--coral);color:#fff;box-shadow:0 14px 26px -12px rgba(255,90,90,.7)}
.btn-primary:hover{background:var(--coral-d)}
.btn-teal{background:var(--teal);color:#fff;box-shadow:0 14px 26px -12px rgba(11,138,140,.6)}
.btn-teal:hover{background:var(--teal-d)}
.btn-ghost{background:rgba(255,255,255,.16);color:#fff;border:1.5px solid rgba(255,255,255,.5)}
.btn-ghost:hover{background:rgba(255,255,255,.26)}
.btn-out{background:var(--card);color:var(--teal);border:1.5px solid var(--line)}
.btn-out:hover{border-color:var(--teal);box-shadow:var(--sh)}
.nav{position:sticky;top:0;z-index:60;background:rgba(251,252,249,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:72px}
.brand{display:flex;align-items:center;gap:11px;cursor:pointer;background:none;border:none;padding:0}
.brand-mark{width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,var(--teal),var(--teal-l));display:grid;place-items:center;color:#fff;box-shadow:0 8px 18px -8px rgba(11,138,140,.7)}
.brand-name{font-weight:800;font-size:1.22rem;letter-spacing:-.02em}
.brand-name b{color:var(--coral)}
.brand-sub{font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);font-weight:700;margin-top:-2px}
.nav-right{display:flex;align-items:center;gap:10px}
.lang-btn{display:flex;align-items:center;gap:7px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 13px;font-weight:700;font-size:.9rem;color:var(--ink)}
.lang-btn:hover{border-color:var(--teal)}
.lang-pop{position:absolute;top:58px;min-width:180px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:0 24px 50px -20px rgba(14,42,44,.4);padding:7px;z-index:70}
.sv-root[dir="ltr"] .lang-pop{right:0}.sv-root[dir="rtl"] .lang-pop{left:0}
.lang-item{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;padding:10px 12px;border-radius:11px;font-weight:600;font-size:.95rem;color:var(--ink);text-align:start}
.lang-item:hover{background:var(--bg2)}.lang-item.on{background:var(--teal);color:#fff}
.burger{width:46px;height:46px;border-radius:13px;background:var(--ink);color:#fff;border:none;display:grid;place-items:center}
.burger:hover{background:var(--teal)}
.overlay{position:fixed;inset:0;z-index:80;background:linear-gradient(160deg,var(--teal-d),var(--teal));display:flex;flex-direction:column;animation:fade .25s ease}
.overlay::before{content:"";position:absolute;inset:0;background-image:url("${STAR}");background-size:64px;opacity:.5}
.ov-top{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;height:72px;color:#fff}
.ov-x{flex:none;margin-inline-start:auto;width:46px;height:46px;border-radius:13px;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.4);color:#fff;display:grid;place-items:center}
.ov-x:hover{background:rgba(255,255,255,.28)}
.ov-links{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px}
.ov-link{background:none;border:none;color:#fff;font-size:clamp(1.8rem,7vw,3rem);font-weight:800;letter-spacing:-.02em;text-align:start;padding:8px 0;opacity:.92;display:flex;align-items:center;gap:16px;transition:transform .2s,opacity .2s}
.ov-link:hover{transform:translateX(8px);opacity:1}.sv-root[dir="rtl"] .ov-link:hover{transform:translateX(-8px)}
.ov-link .num{font-size:1rem;font-weight:700;opacity:.55;width:34px}
.ov-foot{position:relative;padding-bottom:30px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;color:rgba(255,255,255,.85)}
.ov-soc{display:flex;gap:10px}
.soc{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.34);color:#fff}
.soc:hover{background:rgba(255,255,255,.3)}
.hero{position:relative;background:linear-gradient(155deg,var(--teal) 0%,var(--teal-d) 60%,#075658 100%);color:#fff;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background-image:url("${STAR}");background-size:64px;opacity:.55}
.hero::after{content:"";position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(255,194,51,.32),transparent 70%);top:-160px;inset-inline-end:-120px}
.hero-in{position:relative;display:grid;grid-template-columns:1.15fr .85fr;gap:46px;align-items:center;padding-top:64px;padding-bottom:78px}
.hero-in>div{min-width:0}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(255,194,51,.18);border:1.5px solid rgba(255,194,51,.55);color:var(--amber);font-weight:800;font-size:.86rem;padding:9px 16px;border-radius:999px}
.hero h1{font-size:clamp(2.3rem,5.2vw,3.7rem);margin:20px 0 16px}
.hero h1 .hl{color:var(--amber)}
.hero p.lead{font-size:1.12rem;color:rgba(255,255,255,.9);max-width:560px;margin-bottom:28px}
.hero-cta{display:flex;flex-wrap:wrap;gap:13px}
.hero-stats{display:flex;gap:30px;margin-top:38px;flex-wrap:wrap}
.hstat .n{font-size:2rem;font-weight:800;color:var(--amber);line-height:1}
.hstat .l{font-size:.84rem;color:rgba(255,255,255,.82);margin-top:5px;max-width:130px}
.hero-card{background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.24);border-radius:26px;padding:26px;backdrop-filter:blur(6px)}
.passport{background:var(--card);color:var(--ink);border-radius:18px;padding:22px;box-shadow:0 30px 60px -28px rgba(0,0,0,.5)}
.pp-top{display:flex;align-items:center;justify-content:space-between;border-bottom:2px dashed var(--line);padding-bottom:14px;margin-bottom:14px}
.pp-stamp{width:62px;height:62px;border-radius:50%;border:2.5px solid var(--coral);color:var(--coral);display:grid;place-items:center;font-weight:800;transform:rotate(-12deg);font-size:.66rem;text-align:center;line-height:1.1}
.pp-row{display:flex;align-items:center;gap:12px;padding:9px 0}
.pp-ic{width:38px;height:38px;border-radius:11px;background:var(--bg2);color:var(--teal);display:grid;place-items:center;flex-shrink:0}
.pp-row .k{font-size:.72rem;color:var(--ink-soft);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.pp-row .v{font-weight:700;font-size:.98rem}
.section{padding:78px 0}.section.alt{background:var(--bg2)}
.sec-head{max-width:620px;margin-bottom:42px}.sec-head.center{margin-inline:auto;text-align:center}
.sec-head h2{font-size:clamp(1.8rem,3.6vw,2.6rem);margin:12px 0 12px}
.sec-head p{color:var(--ink-soft);font-size:1.06rem}
.grid{display:grid;gap:20px}.g3{grid-template-columns:repeat(3,1fr)}.g2{grid-template-columns:repeat(2,1fr)}.g4{grid-template-columns:repeat(4,1fr)}
.adv-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:26px;transition:transform .22s,box-shadow .25s,border-color .2s}
.adv-card:hover{transform:translateY(-6px);box-shadow:var(--sh);border-color:transparent}
.adv-ic{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;margin-bottom:16px;color:#fff}
.adv-card h3{font-size:1.18rem;margin-bottom:8px}.adv-card p{color:var(--ink-soft);font-size:.96rem}
.chips{display:flex;flex-wrap:wrap;gap:13px;justify-content:center}
.chip{display:inline-flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:13px 20px;font-weight:700;font-size:.98rem;color:var(--ink);transition:.2s}
.chip:hover{background:var(--teal);color:#fff;border-color:var(--teal);transform:translateY(-3px)}
.chip:hover .chip-ic{color:#fff}.chip-ic{color:var(--teal);display:grid;place-items:center}
.step{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:28px 24px}
.step .sn{font-size:2.2rem;font-weight:800;color:var(--amber);line-height:1}
.step h3{font-size:1.16rem;margin:12px 0 8px}.step p{color:var(--ink-soft);font-size:.95rem}
.step .arrow{position:absolute;top:50%;inset-inline-end:-22px;color:var(--line);z-index:2}
.ucard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;transition:transform .22s,box-shadow .25s;cursor:pointer}
.ucard:hover{transform:translateY(-6px);box-shadow:var(--sh)}
.ucard .cap{height:160px;position:relative;display:grid;place-items:center;color:#fff;overflow:hidden}
.ucard .cap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ucard .cap .ovl{position:absolute;inset:0;background:linear-gradient(135deg,rgba(11,138,140,.82),rgba(7,86,88,.9))}
.ucard .cap.has-img .ovl{background:linear-gradient(180deg,rgba(7,86,88,.15),rgba(7,86,88,.7))}
.ucard .cap .ini{position:relative;font-size:2.6rem;font-weight:800;opacity:.95}
.ucard .feat{position:absolute;top:12px;inset-inline-start:12px;background:var(--amber);color:#3a2a00;font-weight:800;font-size:.72rem;padding:5px 11px;border-radius:999px;display:flex;align-items:center;gap:5px;z-index:2}
.ucard .body{padding:20px;display:flex;flex-direction:column;flex:1}
.ucard h3{font-size:1.12rem;margin-bottom:6px}
.ucard .city{display:flex;align-items:center;gap:6px;color:var(--ink-soft);font-size:.9rem;font-weight:600;margin-bottom:12px}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.tag{background:var(--bg2);color:var(--teal-d);font-weight:700;font-size:.74rem;padding:5px 10px;border-radius:8px}
.uprice{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--line)}
.uprice .p{font-size:1.5rem;font-weight:800;color:var(--coral);line-height:1}
.uprice .p small{font-size:.78rem;color:var(--ink-soft);font-weight:700}
.fbar{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px;align-items:center}
.searchbox{flex:1;min-width:230px;display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:12px 16px}
.searchbox input{border:none;outline:none;font-size:1rem;width:100%;font-family:inherit;background:none;color:var(--ink)}
.fpills{display:flex;flex-wrap:wrap;gap:9px}
.fpill{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-weight:700;font-size:.88rem;color:var(--ink-soft);display:inline-flex;align-items:center;gap:6px}
.fpill:hover{border-color:var(--teal);color:var(--teal)}.fpill.on{background:var(--teal);color:#fff;border-color:var(--teal)}
.band{position:relative;background:linear-gradient(135deg,var(--coral),var(--coral-d));color:#fff;border-radius:28px;padding:54px 44px;overflow:hidden;text-align:center}
.band::before{content:"";position:absolute;inset:0;background-image:url("${STAR}");background-size:64px;opacity:.5}
.band h2{position:relative;font-size:clamp(1.7rem,3.4vw,2.5rem);margin-bottom:12px}
.band p{position:relative;color:rgba(255,255,255,.92);max-width:560px;margin:0 auto 26px;font-size:1.06rem}
.band .btn{position:relative;z-index:2}
.about-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.about-card{background:linear-gradient(155deg,var(--teal),var(--teal-d));color:#fff;border-radius:24px;padding:34px;position:relative;overflow:hidden}
.about-card::before{content:"";position:absolute;inset:0;background-image:url("${STAR}");background-size:64px;opacity:.5}
.vrow{position:relative;display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.18)}
.vrow:last-child{border-bottom:none}
.vrow .vi{width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.16);display:grid;place-items:center;flex-shrink:0}
.vrow h4{margin:0 0 3px;font-size:1.06rem}.vrow p{margin:0;color:rgba(255,255,255,.85);font-size:.92rem}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.form{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;gap:14px}
.field label{display:block;font-weight:700;font-size:.86rem;margin-bottom:6px;color:var(--ink)}
.field input,.field textarea{width:100%;border:1px solid var(--line);border-radius:11px;padding:12px 14px;font-size:1rem;font-family:inherit;outline:none;background:var(--bg);color:var(--ink);transition:border .2s}
.field input:focus,.field textarea:focus{border-color:var(--teal);background:var(--card)}
.cinfo{display:flex;flex-direction:column;gap:14px}
.cibox{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px 20px}
.cibox:hover{border-color:var(--teal)}
.cibox .ci{width:46px;height:46px;border-radius:13px;background:var(--bg2);color:var(--teal);display:grid;place-items:center;flex-shrink:0}
.cibox .k{font-size:.76rem;color:var(--ink-soft);font-weight:700}.cibox .v{font-weight:700;font-size:1rem}
.ok{background:#e8f8f1;border:1px solid #aee5cc;color:#0a7a52;border-radius:12px;padding:14px;font-weight:700;display:flex;align-items:center;gap:9px}
.footer{background:var(--ink);color:rgba(255,255,255,.7);padding:56px 0 26px}
.foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1.2fr;gap:36px;margin-bottom:34px}
.footer h4{color:#fff;font-size:1.04rem;margin-bottom:14px}
.flink{display:block;background:none;border:none;color:rgba(255,255,255,.7);padding:6px 0;font-size:.96rem;text-align:start}
.flink:hover{color:var(--amber)}
.fsoc{display:flex;gap:10px;margin-top:14px}
.fsoc a{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.1);color:#fff}
.fsoc a:hover{background:var(--teal)}
.fbot{border-top:1px solid rgba(255,255,255,.12);padding-top:20px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-size:.88rem}
.fbot .copy{cursor:default;user-select:none}
/* DETAIL MODAL */
.dmodal{position:fixed;inset:0;z-index:95;background:rgba(14,42,44,.6);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;animation:fade .2s}
.dcard{background:var(--card);border-radius:24px;max-width:760px;width:100%;margin:auto;overflow:hidden;box-shadow:0 40px 90px -30px rgba(0,0,0,.6)}
.dhead{height:200px;position:relative;display:grid;place-items:center;color:#fff;overflow:hidden}
.dhead img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.dhead .ovl{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,138,140,.45),rgba(7,86,88,.9))}
.dhead .ini{position:relative;font-size:3.4rem;font-weight:800;opacity:.4}
.dhead .dtitle{position:absolute;inset-inline:0;bottom:0;padding:22px;z-index:2}
.dhead .dtitle h2{font-size:1.6rem;color:#fff}
.dhead .dtitle .dcity{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.92);font-weight:600;margin-top:6px}
.dx{position:absolute;top:14px;inset-inline-end:14px;z-index:3;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);color:#fff;display:grid;place-items:center}
.dx:hover{background:rgba(255,255,255,.4)}
.dbody{padding:24px}
.dbody .ddesc{color:var(--ink-soft);margin-bottom:18px}
.factable{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:20px}
.facrow-d{display:grid;grid-template-columns:1.4fr .8fr 1.2fr 1fr;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line);font-size:.92rem;align-items:center}
.facrow-d:last-child{border-bottom:none}
.facrow-d.h{background:var(--bg2);font-weight:800;font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-soft)}
.facrow-d .fp{font-weight:800;color:var(--coral)}
.adm-pill{display:inline-block;background:#e8f8f1;color:#0a7a52;font-weight:700;font-size:.78rem;padding:4px 10px;border-radius:999px}
.adm-pill.closed{background:#fdecec;color:#c0392b}
.langbadge{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:999px;margin-top:4px;background:var(--bg2);color:var(--teal-d)}
.langbadge.en{background:#eef0ff;color:#4b46c7}
.faclist{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
.faccard{border:1px solid var(--line);border-radius:14px;padding:15px 16px;background:var(--card)}
.facc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:13px}
.facc-name{font-weight:800;font-size:1.04rem;line-height:1.2}
.facc-meta{display:flex;align-items:center;gap:9px;margin-top:6px;flex-wrap:wrap}
.facc-loc{display:inline-flex;align-items:center;gap:3px;color:var(--ink-soft);font-size:.84rem;font-weight:600}
.facc-prices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pcell{background:var(--bg2);border-radius:12px;padding:12px 14px}
.pcell.schol{background:#fff7e6;border:1px solid #ffe1a6}
.pk{font-size:.7rem;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
.pv{font-size:1.22rem;font-weight:800;color:var(--ink);line-height:1}
.pcell.schol .pv{color:var(--coral)}
.pv small{font-size:.72rem;color:var(--ink-soft);font-weight:700}
.save{margin-top:7px;display:inline-block;background:#e8f8f1;color:#0a7a52;font-weight:800;font-size:.74rem;padding:4px 10px;border-radius:999px}
.facsub{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.facsub select,.facsub input{border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:.9rem;font-family:inherit;outline:none;background:var(--bg);width:100%;color:var(--ink)}
.facsub select:focus,.facsub input:focus{border-color:var(--teal);background:var(--card)}
.facdel{position:absolute;top:10px;inset-inline-end:10px;width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;color:var(--ink-soft)}
.facdel:hover{border-color:var(--coral);color:var(--coral)}
.doccard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:28px}
.docitem{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);font-weight:600}
.docitem:last-child{border-bottom:none}
.docitem .dchk{width:34px;height:34px;border-radius:10px;background:#e8f8f1;color:#0a7a52;display:grid;place-items:center;flex-shrink:0}
.prepcard{background:linear-gradient(155deg,var(--teal),var(--teal-d));color:#fff;border-radius:var(--r);padding:28px;position:relative;overflow:hidden}
.prepcard::before{content:"";position:absolute;inset:0;background-image:url("${STAR}");background-size:64px;opacity:.5}
.preplang{position:relative;display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.preplang span{background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.4);border-radius:999px;padding:8px 16px;font-weight:700;font-size:.9rem}
/* ADMIN */
.admin-wrap{min-height:100vh;background:var(--bg2);padding:30px 0}
.login{max-width:420px;margin:6vh auto;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:38px;box-shadow:var(--sh)}
.login .lk{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--teal),var(--teal-l));color:#fff;display:grid;place-items:center;margin-bottom:18px}
.atop{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;margin-bottom:22px}
.tabs{display:flex;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px;flex-wrap:wrap}
.tab{border:none;background:none;padding:9px 16px;border-radius:999px;font-weight:700;color:var(--ink-soft);font-size:.9rem}
.tab.on{background:var(--teal);color:#fff}
.acard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;margin-bottom:14px}
.arow{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:space-between}
.athumb{width:64px;height:64px;border-radius:12px;object-fit:cover;flex-shrink:0;background:var(--bg2)}
.aname{font-weight:800;font-size:1.06rem}.amini{color:var(--ink-soft);font-size:.86rem;font-weight:600}
.iconbtn{width:40px;height:40px;border-radius:11px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;color:var(--ink-soft)}
.iconbtn:hover{border-color:var(--teal);color:var(--teal)}
.iconbtn.danger:hover{border-color:var(--coral);color:var(--coral)}
.amodal{position:fixed;inset:0;z-index:90;background:rgba(14,42,44,.55);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow:auto}
.aform{background:var(--card);border-radius:22px;padding:28px;max-width:640px;width:100%;margin:auto;box-shadow:0 40px 80px -30px rgba(0,0,0,.5)}
.aform h3{font-size:1.35rem;margin-bottom:18px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.checkgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
.checkitem{display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:11px;padding:10px 12px;font-weight:600;font-size:.92rem;cursor:pointer}
.checkitem.on{background:var(--teal);color:#fff;border-color:var(--teal)}
.uploadbox{display:flex;align-items:center;gap:14px}
.uprev{width:90px;height:64px;border-radius:11px;object-fit:cover;border:1px solid var(--line);background:var(--bg2)}
.uprev.empty{display:grid;place-items:center;color:var(--ink-soft)}
.facedit{border:1px solid var(--line);border-radius:13px;padding:12px;margin-bottom:10px;position:relative}
.facgrid{display:grid;grid-template-columns:1.4fr .7fr 1.2fr 1fr auto;gap:8px;align-items:center}
.facgrid input{border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:.9rem;font-family:inherit;outline:none;background:var(--bg);width:100%}
.facgrid input:focus{border-color:var(--teal);background:var(--card)}
.combo{position:relative}
.combo input{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font-size:.92rem;font-family:inherit;outline:none;background:var(--bg);color:var(--ink)}
.combo input:focus{border-color:var(--teal);background:var(--card)}
.facedit > .combo input{padding-right:40px}
.combo-item small{color:var(--ink-soft)}
.combo-pop{position:absolute;top:calc(100% + 4px);inset-inline:0;z-index:40;background:var(--card);border:1px solid var(--line);border-radius:11px;box-shadow:0 20px 44px -18px rgba(14,42,44,.4);padding:5px;max-height:230px;overflow:auto}
.combo-item{display:block;width:100%;text-align:start;background:none;border:none;padding:9px 11px;border-radius:8px;font-size:.9rem;font-family:inherit;color:var(--ink)}
.combo-item:hover{background:var(--bg2)}
.combo-item b{color:var(--teal)}
.iconbtn.starred{background:var(--amber);border-color:var(--amber);color:#3a2a00}
.toast{position:fixed;bottom:26px;inset-inline:0;margin:auto;width:fit-content;background:var(--ink);color:#fff;padding:13px 22px;border-radius:999px;font-weight:700;z-index:100;display:flex;align-items:center;gap:9px;box-shadow:var(--sh);animation:fade .3s}
.itable{background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.irow{display:grid;grid-template-columns:1fr 1.2fr 2fr .9fr;gap:14px;padding:15px 18px;border-bottom:1px solid var(--line);font-size:.92rem;align-items:center}
.irow:last-child{border-bottom:none}
.irow.h{background:var(--bg2);font-weight:800;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-soft)}
.setcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:26px;max-width:620px}
.reveal{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
@keyframes fade{from{opacity:0}to{opacity:1}}
.partner-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.partner-auth{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:24px;box-shadow:var(--sh)}
.pa-tabs{display:flex;gap:6px;background:var(--bg2);border-radius:12px;padding:4px;margin-bottom:14px}
.pa-tabs button{flex:1;padding:9px;border:none;background:none;border-radius:9px;font-weight:700;color:var(--ink-soft);cursor:pointer}
.pa-tabs button.on{background:var(--teal);color:#fff}
.cab-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.cab-code{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.cab-bal{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ptable{width:100%;border-collapse:collapse;font-size:.9rem}
.ptable th{text-align:left;padding:12px 16px;background:var(--bg2);color:var(--ink-soft);font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}
.ptable td{padding:12px 16px;border-top:1px solid var(--line);white-space:nowrap}
.pmodal-back{position:fixed;inset:0;z-index:95;background:rgba(14,42,44,.6);display:flex;align-items:center;justify-content:center;padding:20px;animation:fade .2s}
.pmodal{background:var(--card);border-radius:var(--r);width:100%;max-width:440px;box-shadow:var(--sh);animation:fade .25s}
.pmodal-head{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--line)}
.pmodal-head .x{background:none;border:none;cursor:pointer;color:var(--ink-soft)}
@media(max-width:900px){.partner-hero{grid-template-columns:1fr;gap:30px}.cab-bal{grid-template-columns:1fr}}
@media(max-width:900px){.hero-in{grid-template-columns:1fr;gap:34px;padding-top:48px;padding-bottom:60px}.about-grid,.contact-grid{grid-template-columns:1fr}.g3,.g4{grid-template-columns:repeat(2,1fr)}.foot-grid{grid-template-columns:1fr 1fr}.step .arrow{display:none}.fgrid{grid-template-columns:1fr}.irow{grid-template-columns:1fr 1fr;gap:8px}.facgrid{grid-template-columns:1fr 1fr;gap:8px}.facrow-d{grid-template-columns:1fr 1fr;gap:6px}.facrow-d.h{display:none}}
@media(max-width:560px){.g3,.g4,.g2{grid-template-columns:1fr}.facc-prices{grid-template-columns:1fr}.foot-grid{grid-template-columns:1fr}.section{padding:54px 0}.band{padding:40px 24px}.brand-sub{display:none}}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}.btn:hover,.adv-card:hover,.ucard:hover,.chip:hover{transform:none}}
`;

const ADV_COLORS = ["linear-gradient(135deg,#0B8A8C,#13B0B2)", "linear-gradient(135deg,#FF5A5A,#E8453F)", "linear-gradient(135deg,#FFC233,#F5A623)", "linear-gradient(135deg,#13B0B2,#0A6E70)", "linear-gradient(135deg,#7C5CFF,#5B3FD6)", "linear-gradient(135deg,#FF8A3D,#F25F2A)"];
const ADV_ICONS = [Award, Wallet, ShieldCheck, GraduationCap, Sparkles, Plane];
const BEN_ICONS = [Building2, Wallet, Plane, Globe];

function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach(e => io.observe(e));
    // safety net: if anything is on-screen but still hidden shortly after render, show it
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) e.classList.add("in");
      });
    }, 900);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [dep]);
}

/* ================================================================== */
const PAGE_LIST = ["home", "universities", "documents", "partner", "about", "contact", "admin"];
function pageFromHash() {
  const h = (typeof window !== "undefined" ? (window.location.hash || "") : "").replace(/^#\/?/, "").toLowerCase();
  if (h.includes("admin")) return "admin";
  return PAGE_LIST.includes(h) ? h : "home";
}

export default function App() {
  const [lang, setLang] = useState("tr");
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("savura:theme") || "light"; } catch { return "light"; } });
  useEffect(() => { try { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("savura:theme", theme); } catch {} }, [theme]);
  const [page, setPage] = useState(pageFromHash());
  const [menu, setMenu] = useState(false);
  const [langPop, setLangPop] = useState(false);
  const [unis, setUnis] = useState(SEED);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [applyCtx, setApplyCtx] = useState(null);
  const t = T[lang];
  const rtl = lang === "ar";
  const langRef = useRef(null);
  const tap = useRef({ n: 0, t: 0 });

  useReveal(page + "|" + filter + "|" + query + "|" + (loaded ? 1 : 0) + "|" + unis.length);

  useEffect(() => {
    (async () => {
      const u = await store.get("savura:universities:v4");
      if (u && Array.isArray(u) && u.length) setUnis(u);
      else { setUnis(SEED); store.set("savura:universities:v4", SEED); }
      const c = await store.get("savura:company:v1");
      if (c) setCompany({ ...DEFAULT_COMPANY, ...c });
      setLoaded(true);
    })();
  }, []);

  // URL hash routing: browser back/forward and page refresh keep the current page
  useEffect(() => {
    captureRef();
    const sync = () => { setPage(pageFromHash()); setMenu(false); setDetail(null); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // secret admin via keyboard: just type the word "admin"
  useEffect(() => {
    let buf = "";
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!e.key || e.key.length !== 1) return;
      buf = (buf + e.key).slice(-5).toLowerCase();
      if (buf === "admin") { buf = ""; window.location.hash = "admin"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const h = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangPop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = useCallback((p) => {
    setMenu(false);
    const cur = window.location.hash || "";
    const sameHome = p === "home" && (cur === "" || cur === "#home");
    if (cur === "#" + p || sameHome) {
      setPage(p); setDetail(null); window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = p; // triggers hashchange -> sync()
    }
  }, []);
  const goField = (f) => { setFilter(f); setQuery(""); go("universities"); };
  const fieldName = (k) => t.fields.names[k] || k;

  // secret tap on footer copyright -> open admin (4 taps within 4s)
  const secretTap = () => {
    const now = Date.now();
    if (now - tap.current.t > 4000) tap.current.n = 0;
    tap.current.t = now; tap.current.n += 1;
    if (tap.current.n >= 4) { tap.current.n = 0; go("admin"); }
  };

  return (
    <div className="sv-root" dir={rtl ? "rtl" : "ltr"}>
      <style>{CSS}</style>

      <header className="nav">
        <div className="wrap nav-in">
          <button className="brand" onClick={() => go("home")}>
            <span className="brand-mark"><GraduationCap size={24} /></span>
            <span className="brand-name">Savura <b>EDU</b></span>
          </button>
          <div className="nav-right">
            <button className="theme-btn" onClick={() => setTheme(th => th === "dark" ? "light" : "dark")} aria-label="theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div ref={langRef} style={{ position: "relative" }}>
              <button className="lang-btn" onClick={() => setLangPop(v => !v)}>
                <span style={{ fontSize: "1.1rem" }}>{LANGS.find(l => l.code === lang).flag}</span><Globe size={16} />
              </button>
              {langPop && (
                <div className="lang-pop">
                  {LANGS.map(l => (
                    <button key={l.code} className={"lang-item" + (l.code === lang ? " on" : "")} onClick={() => { setLang(l.code); setLangPop(false); }}>
                      <span style={{ fontSize: "1.2rem" }}>{l.flag}</span>{l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="burger" onClick={() => setMenu(true)} aria-label="menu"><Menu size={22} /></button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="overlay">
          <div className="wrap ov-top">
            <button className="brand" onClick={() => go("home")} style={{ color: "#fff" }}>
              <span className="brand-mark" style={{ background: "rgba(255,255,255,.18)" }}><GraduationCap size={24} /></span>
              <span className="brand-name" style={{ color: "#fff" }}>Savura <b style={{ color: "var(--amber)" }}>EDU</b></span>
            </button>
            <button className="ov-x" onClick={() => setMenu(false)} aria-label="close"><X size={22} /></button>
          </div>
          <div className="wrap ov-links">
            {[["home", t.nav.home], ["universities", t.nav.universities], ["documents", t.proc.nav], ["partner", t.partner.nav], ["about", t.nav.about], ["contact", t.nav.contact]].map(([p, label], i) => (
              <button key={p} className="ov-link" onClick={() => go(p)}><span className="num">0{i + 1}</span>{label}</button>
            ))}
          </div>
          <div className="wrap ov-foot">
            <div className="ov-soc">
              <a className="soc" href={company.instagram} target="_blank" rel="noreferrer"><InstagramIcon size={20} /></a>
              <a className="soc" href={company.telegram} target="_blank" rel="noreferrer"><TelegramIcon size={20} /></a>
            </div>
            <span>© {new Date().getFullYear()} Savura EDU</span>
          </div>
        </div>
      )}

      {page === "home" && <Home t={t} go={go} goField={goField} unis={unis} fieldName={fieldName} openDetail={setDetail} company={company} />}
      {page === "universities" && <Universities t={t} unis={unis} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} fieldName={fieldName} openDetail={setDetail} />}
      {page === "documents" && <Process t={t} go={go} />}
      {page === "partner" && <PartnerPage t={t} company={company} />}
      {page === "about" && <About t={t} go={go} />}
      {page === "contact" && <Contact t={t} company={company} applyCtx={applyCtx} clearApply={() => setApplyCtx(null)} />}
      {page === "admin" && <Admin t={t} unis={unis} setUnis={setUnis} company={company} setCompany={setCompany} fieldName={fieldName} go={go} />}

      {detail && <Detail u={detail} t={t} lang={lang} fieldName={fieldName} onClose={() => setDetail(null)} onApply={(facName) => { setApplyCtx({ uni: detail.name, faculty: facName || "" }); setDetail(null); go("contact"); }} />}

      {page !== "admin" && <Footer t={t} go={go} company={company} secretTap={secretTap} />}
    </div>
  );
}

/* ---------------- HOME ---------------- */
function Home({ t, go, goField, unis, fieldName, openDetail, company }) {
  const featured = unis.filter(u => u.featured);
  const shown = featured.length ? featured : unis.slice(0, 3);
  const price = (company && company.priceFrom) || "800";
  return (
    <main>
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <span className="badge"><Sparkles size={15} />{t.hero.badge.replace(/800/, price)}</span>
            <h1>{t.hero.title1} <span className="hl">{t.hero.title2}</span></h1>
            <p className="lead">{t.hero.subtitle}</p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => go("contact")}>{t.cta.consult}<ArrowRight size={18} /></button>
              <button className="btn btn-ghost" onClick={() => go("universities")}>{t.cta.browse}</button>
            </div>
            <div className="hero-stats">
              <div className="hstat"><div className="n">50+</div><div className="l">{t.hero.s1}</div></div>
              <div className="hstat"><div className="n">2000+</div><div className="l">{t.hero.s2}</div></div>
              <div className="hstat"><div className="n">98%</div><div className="l">{t.hero.s3}</div></div>
            </div>
          </div>
          <div className="hero-card">
            <div className="passport">
              <div className="pp-top">
                <div><div style={{ fontSize: ".72rem", letterSpacing: ".1em", color: "var(--ink-soft)", fontWeight: 700 }}>SAVURA · EDU</div><div style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: 2 }}>Acceptance</div></div>
                <div className="pp-stamp">SAVURA<br />OK ✓</div>
              </div>
              <div className="pp-row"><span className="pp-ic"><FileText size={18} /></span><div><div className="k">{t.process.steps[1].t}</div><div className="v">100%</div></div></div>
              <div className="pp-row"><span className="pp-ic"><GraduationCap size={18} /></span><div><div className="k">{t.hero.s1}</div><div className="v">50+ ✓</div></div></div>
              <div className="pp-row"><span className="pp-ic"><Wallet size={18} /></span><div><div className="k">{t.cta.consult}</div><div className="v" style={{ color: "var(--coral)" }}>{"$" + price + "+"}</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.adv.eyebrow}</span>
            <h2>{t.adv.title}</h2><p>{t.adv.sub}</p>
          </div>
          <div className="grid g3">
            {t.adv.items.map((it, i) => { const Ic = ADV_ICONS[i]; return (
              <div className="adv-card reveal" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="adv-ic" style={{ background: ADV_COLORS[i] }}><Ic size={26} /></div>
                <h3>{it.t}</h3><p>{it.d.replace(/800/, price)}</p>
              </div>); })}
          </div>
        </div>
      </section>

      <section style={{ background: "linear-gradient(155deg,var(--teal),var(--teal-d))", color: "#fff", position: "relative", overflow: "hidden", padding: "72px 0" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 64, opacity: .5 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="sec-head center reveal">
            <span className="eyebrow" style={{ color: "var(--amber)", justifyContent: "center" }}><span style={{ width: 18, height: 2, background: "var(--amber)" }} />{t.benefits.eyebrow}</span>
            <h2 style={{ color: "#fff" }}>{t.benefits.title}</h2>
            <p style={{ color: "rgba(255,255,255,.9)" }}>{t.benefits.sub}</p>
          </div>
          <div className="grid g4">
            {t.benefits.items.map((it, i) => { const Ic = BEN_ICONS[i] || Sparkles; return (
              <div className="reveal" key={i} style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 18, padding: "26px 22px", transitionDelay: `${i * 70}ms` }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--amber)", color: "#3a2a00", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Ic size={26} /></div>
                <h3 style={{ fontSize: "1.06rem", marginBottom: 8, color: "#fff" }}>{it.t}</h3>
                <p style={{ color: "rgba(255,255,255,.88)", fontSize: ".95rem", lineHeight: 1.6 }}>{it.d}</p>
              </div>); })}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.fields.eyebrow}</span>
            <h2>{t.fields.title}</h2><p>{t.fields.sub}</p>
          </div>
          <div className="chips reveal">
            {FIELDS.map(f => { const Ic = f.icon; return (
              <button key={f.key} className="chip" onClick={() => goField(f.key)}><span className="chip-ic"><Ic size={18} /></span>{fieldName(f.key)}</button>); })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.process.eyebrow}</span>
            <h2>{t.process.title}</h2>
          </div>
          <div className="grid g4">
            {t.process.steps.map((s, i) => (
              <div className="step reveal" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="sn">0{i + 1}</div><h3>{s.t}</h3><p>{s.d}</p>
                {i < 3 && <ChevronRight className="arrow" size={26} />}
              </div>))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.docs.eyebrow}</span>
            <h2>{t.docs.title}</h2><p>{t.docs.sub}</p>
          </div>
          <div className="grid g2">
            <div className="doccard reveal">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.2rem", marginBottom: 8 }}><FileText size={20} color="#0B8A8C" />{t.docs.docsTitle}</h3>
              {t.docs.docs.map((d, i) => (
                <div className="docitem" key={i}><span className="dchk"><Check size={18} /></span>{d}</div>
              ))}
            </div>
            <div className="prepcard reveal">
              <h3 style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, fontSize: "1.2rem", marginBottom: 10, color: "#fff" }}><Sparkles size={20} />{t.docs.prepTitle}</h3>
              <p style={{ position: "relative", color: "rgba(255,255,255,.92)" }}>{t.docs.prepText}</p>
              <div className="preplang"><span>🇹🇷 {t.detail.langTr}</span><span>🇬🇧 {t.detail.langEn}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "100%", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.nav.universities}</span>
              <h2 style={{ marginTop: 12 }}>{t.featured.title}</h2>
              <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>{t.featured.sub}</p>
            </div>
            <button className="btn btn-out" onClick={() => go("universities")}>{t.cta.viewAll}<ArrowRight size={17} /></button>
          </div>
          <div className="grid g3">{shown.map(u => <UniCard key={u.id} u={u} t={t} fieldName={fieldName} openDetail={openDetail} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="reveal" style={{ background: "linear-gradient(135deg,#0E2A2C,var(--teal-d))", borderRadius: "var(--r)", padding: "clamp(32px,5vw,52px)", position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr auto", gap: 26, alignItems: "center" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 60, opacity: .35 }} />
            <div style={{ position: "relative" }}>
              <span className="eyebrow" style={{ color: "var(--amber)" }}><span style={{ width: 18, height: 2, background: "var(--amber)" }} />{t.partner.heroEyebrow}</span>
              <h2 style={{ color: "#fff", fontSize: "clamp(1.5rem,3vw,2.1rem)", margin: "12px 0 10px", maxWidth: 620 }}>{t.partner.earnTitle}</h2>
              <p style={{ color: "rgba(255,255,255,.85)", maxWidth: 560, marginBottom: 4 }}>{t.partner.earnSub}</p>
            </div>
            <div style={{ position: "relative", textAlign: "center" }}>
              <button className="btn" style={{ background: "var(--amber)", color: "#3a2a00", fontWeight: 800, fontSize: "1rem", padding: "15px 28px" }} onClick={() => go("partner")}>{t.partner.earnCta}<ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap reveal">
          <div className="band">
            <h2>{t.band.title}</h2><p>{t.band.sub}</p>
            <button className="btn btn-ghost" onClick={() => go("contact")} style={{ borderColor: "#fff" }}>{t.cta.contactUs}<ArrowRight size={18} /></button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- UNI CARD ---------------- */
function UniCard({ u, t, fieldName, openDetail }) {
  return (
    <div className="ucard reveal" onClick={() => openDetail(u)}>
      <div className={"cap" + (u.image ? " has-img" : "")}>
        {u.image ? <img src={u.image} alt={u.name} /> : null}
        <div className="ovl" />
        {u.featured && <span className="feat"><Star size={12} fill="#3a2a00" /></span>}
        {!u.image && <span className="ini">{u.name.charAt(0)}</span>}
      </div>
      <div className="body">
        <h3>{u.name}</h3>
        <div className="city"><MapPin size={14} />{u.city}</div>
        <div className="tags">
          {(u.fields || []).slice(0, 3).map(f => <span className="tag" key={f}>{fieldName(f)}</span>)}
          {(u.fields || []).length > 3 && <span className="tag">+{u.fields.length - 3}</span>}
        </div>
        <div className="uprice">
          <div className="p">${cardPrice(u).toLocaleString()} <small>{t.unis.from}</small></div>
          <button className="btn btn-teal" style={{ padding: "10px 18px", fontSize: ".88rem" }} onClick={(e) => { e.stopPropagation(); openDetail(u); }}>{t.cta.details}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DETAIL MODAL ---------------- */
function Detail({ u, t, lang, fieldName, onClose, onApply }) {
  const facs = u.faculties || [];
  const admLabel = (v) => v === "closed" ? t.detail.admClosed : (v === "open" ? t.detail.admOpen : v);
  const langTag = (v) => v === "en"
    ? <span className="langbadge en">🇬🇧 {t.detail.langEn}</span>
    : <span className="langbadge tr">🇹🇷 {t.detail.langTr}</span>;
  return (
    <div className="dmodal" onClick={(e) => { if (e.target.className === "dmodal") onClose(); }}>
      <div className="dcard">
        <div className="dhead">
          {u.image ? <img src={u.image} alt={u.name} /> : null}
          <div className="ovl" />
          {!u.image && <span className="ini">{u.name.charAt(0)}</span>}
          <button className="dx" onClick={onClose}><X size={20} /></button>
          <div className="dtitle">
            <h2>{u.name}</h2>
            <div className="dcity"><MapPin size={15} />{u.city}</div>
          </div>
        </div>
        <div className="dbody">
          {u.desc && <p className="ddesc">{u.desc}</p>}
          <div className="tags" style={{ marginBottom: 18 }}>
            {(u.fields || []).map(f => <span className="tag" key={f}>{fieldName(f)}</span>)}
          </div>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.1rem", marginBottom: 12 }}><Layers size={18} color="#0B8A8C" />{t.detail.faculties}</h3>
          {facs.length ? (
            <div className="faclist">
              {facs.map((f, i) => {
                const annual = Number(f.price) || 0;
                const schol = Number(f.price5) || 0;
                const save = schol > 0 && annual > 0 ? (annual * 5 - schol) : 0;
                return (
                  <div className="faccard" key={i}>
                    <div className="facc-top">
                      <div>
                        <div className="facc-name">{facLabel(f.name, lang)}</div>
                        <div className="facc-meta">{langTag(f.language)}<span className="facc-loc"><MapPin size={12} />{f.location || "—"}</span></div>
                      </div>
                      <span className={"adm-pill" + (f.admission === "closed" ? " closed" : "")}>{admLabel(f.admission)}</span>
                    </div>
                    <div className="facc-prices">
                      <div className="pcell">
                        <div className="pk">{t.detail.annual}</div>
                        <div className="pv">${annual.toLocaleString()} <small>{t.detail.perYear}</small></div>
                      </div>
                      {schol > 0 && (
                        <div className="pcell schol">
                          <div className="pk">{t.detail.scholarship}</div>
                          <div className="pv">${schol.toLocaleString()}</div>
                          {save > 0 && <div className="save">−${save.toLocaleString()} {t.detail.save}</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <button className="btn btn-teal" style={{ padding: "8px 16px", fontSize: ".84rem" }} onClick={() => onApply(facLabel(f.name, lang))}>{t.cta.apply}<ArrowRight size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p style={{ color: "var(--ink-soft)", marginBottom: 18 }}>{t.detail.noFac}</p>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-out" onClick={onClose}>{t.detail.close}</button>
            <button className="btn btn-primary" onClick={() => onApply("")}>{t.cta.apply}<ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UNIVERSITIES PAGE ---------------- */
function Universities({ t, unis, filter, setFilter, query, setQuery, fieldName, openDetail }) {
  const q = query.trim().toLowerCase();
  const list = unis.filter(u => {
    const okF = filter === "all" || (u.fields || []).includes(filter);
    const okQ = !q || u.name.toLowerCase().includes(q) || (u.city || "").toLowerCase().includes(q);
    return okF && okQ;
  }).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return (
    <main>
      <section style={{ background: "linear-gradient(155deg,var(--teal),var(--teal-d))", color: "#fff", padding: "56px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 64, opacity: .5 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <span className="eyebrow" style={{ color: "var(--amber)" }}><span style={{ width: 18, height: 2, background: "var(--amber)" }} />{t.nav.universities}</span>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "12px 0 10px" }}>{t.unis.title}</h1>
          <p style={{ color: "rgba(255,255,255,.9)", maxWidth: 560, fontSize: "1.06rem" }}>{t.unis.sub}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="fbar">
            <div className="searchbox"><Search size={18} color="#0B8A8C" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.unis.search} /></div>
          </div>
          <div className="fpills" style={{ marginBottom: 28 }}>
            <button className={"fpill" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>{t.unis.all}</button>
            {FIELDS.map(f => { const Ic = f.icon; return <button key={f.key} className={"fpill" + (filter === f.key ? " on" : "")} onClick={() => setFilter(f.key)}><Ic size={14} />{fieldName(f.key)}</button>; })}
          </div>
          {list.length ? (
            <div className="grid g3">{list.map(u => <UniCard key={u.id} u={u} t={t} fieldName={fieldName} openDetail={openDetail} />)}</div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-soft)" }}><Search size={40} style={{ opacity: .4, marginBottom: 12 }} /><p style={{ fontWeight: 700 }}>{t.unis.none}</p></div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ---------------- ABOUT ---------------- */
/* ---------------- DOCUMENTS & ADMISSION ---------------- */
function Process({ t, go }) {
  const [lvl, setLvl] = useState("bachelor");
  const p = t.proc;
  return (
    <main>
      <section style={{ background: "linear-gradient(155deg,var(--teal),var(--teal-d))", color: "#fff", padding: "56px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 64, opacity: .5 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <span className="eyebrow" style={{ color: "var(--amber)" }}><span style={{ width: 18, height: 2, background: "var(--amber)" }} />{p.nav}</span>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "12px 0 10px" }}>{p.title}</h1>
          <p style={{ color: "rgba(255,255,255,.9)", maxWidth: 620, fontSize: "1.06rem" }}>{p.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="tabs" style={{ width: "fit-content", marginBottom: 22 }}>
            {["bachelor", "master", "doctorate"].map(k => (
              <button key={k} className={"tab" + (lvl === k ? " on" : "")} onClick={() => setLvl(k)}>{p[k]}</button>
            ))}
          </div>
          <div className="doccard reveal">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.2rem", marginBottom: 8 }}><FileText size={20} color="#0B8A8C" />{p[lvl]} — {p.levelsTitle}</h3>
            {p.docs[lvl].map((d, i) => (
              <div className="docitem" key={i}><span className="dchk" style={{ fontWeight: 800, fontSize: ".9rem" }}>{i + 1}</span>{d}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head center reveal"><h2>{p.extrasTitle}</h2></div>
          <div className="grid g2">
            <div className="doccard reveal">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", marginBottom: 8 }}><FileText size={19} color="#0B8A8C" />{p.motivation.t}</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 12 }}>{p.motivation.d}</p>
              {p.motivation.points.map((pt, i) => (
                <div className="docitem" key={i}><span className="dchk"><Check size={17} /></span>{pt}</div>
              ))}
            </div>
            <div className="doccard reveal">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", marginBottom: 8 }}><FileText size={19} color="#0B8A8C" />{p.reference.t}</h3>
              <p style={{ color: "var(--ink-soft)" }}>{p.reference.d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head center reveal"><h2>{p.stagesTitle}</h2></div>
          <div className="grid g3">
            {p.stages.map((s, i) => (
              <div className="step reveal" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="sn">0{i + 1}</div><h3 style={{ fontSize: "1.1rem", margin: "10px 0 8px" }}>{s.t}</h3><p style={{ color: "var(--ink-soft)", fontSize: ".95rem" }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => go("contact")}>{t.cta.consult}<ArrowRight size={18} /></button>
          </div>
        </div>
      </section>
    </main>
  );
}

function About({ t, go }) {
  const VI = [ShieldCheck, Sparkles, Heart];
  return (
    <main>
      <section className="section">
        <div className="wrap">
          <div className="about-grid">
            <div className="reveal">
              <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.nav.about}</span>
              <h1 style={{ fontSize: "clamp(2rem,4vw,2.9rem)", margin: "14px 0 18px" }}>{t.about.title}</h1>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.08rem", marginBottom: 16 }}>{t.about.p1}</p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.08rem", marginBottom: 26 }}>{t.about.p2}</p>
              <button className="btn btn-primary" onClick={() => go("contact")}>{t.cta.consult}<ArrowRight size={18} /></button>
            </div>
            <div className="about-card reveal">
              <h3 style={{ position: "relative", fontSize: "1.4rem", marginBottom: 8, color: "#fff" }}>{t.about.vTitle}</h3>
              {t.about.values.map((v, i) => { const Ic = VI[i]; return (
                <div className="vrow" key={i}><span className="vi"><Ic size={20} /></span><div><h4>{v.t}</h4><p>{v.d}</p></div></div>); })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact({ t, company, applyCtx, clearApply }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", msg: "", referral: getRef() });
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!form.name || (!form.phone && !form.email)) return;
    const lead = { ...form, uni: (applyCtx && applyCtx.uni) || "", faculty: (applyCtx && applyCtx.faculty) || "" };
    await addLead(lead);
    setSent(true); setForm({ name: "", email: "", phone: "", msg: "", referral: getRef() });
    if (clearApply) clearApply();
  };
  const hasCtx = applyCtx && (applyCtx.uni || applyCtx.faculty);
  return (
    <main>
      <section className="section">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow"><span style={{ width: 18, height: 2, background: "var(--teal)" }} />{t.nav.contact}</span>
            <h1 style={{ fontSize: "clamp(2rem,4vw,2.9rem)", margin: "12px 0 10px" }}>{t.contact.title}</h1><p>{t.contact.sub}</p>
          </div>
          <div className="contact-grid">
            <div className="form reveal">
              {sent && <div className="ok"><Check size={18} />{t.contact.ok}</div>}
              {!sent && hasCtx && (
                <div className="ok" style={{ background: "#FFF7E6", color: "#7a5b00", borderColor: "#FFE3A3" }}>
                  <Star size={16} fill="#FFC233" color="#FFC233" /><span>{t.cta.apply}: <b>{applyCtx.uni}{applyCtx.faculty ? " — " + applyCtx.faculty : ""}</b></span>
                </div>
              )}
              <div className="field"><label>{t.contact.name}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="fgrid">
                <div className="field"><label>{t.contact.email}</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="field"><label>{t.contact.phone}</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="field"><label>{t.contact.msg}</label><textarea rows={4} value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} /></div>
              <div className="field"><label>{t.partner.refField}</label><input dir="ltr" value={form.referral} onChange={e => setForm({ ...form, referral: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={submit} style={{ justifyContent: "center" }}><Send size={17} />{t.contact.send}</button>
            </div>
            <div className="cinfo reveal">
              <a className="cibox" href={`tel:${company.phone.replace(/\s/g, "")}`}><span className="ci"><Phone size={20} /></span><div><div className="k">{t.contact.phone}</div><div className="v" dir="ltr">{company.phone}</div></div></a>
              <a className="cibox" href={`mailto:${company.email}`}><span className="ci"><Mail size={20} /></span><div><div className="k">{t.contact.email}</div><div className="v" dir="ltr">{company.email}</div></div></a>
              <a className="cibox" href={company.instagram} target="_blank" rel="noreferrer"><span className="ci"><InstagramIcon size={20} /></span><div><div className="k">Instagram</div><div className="v" dir="ltr">{company.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}</div></div></a>
              <a className="cibox" href={company.telegram} target="_blank" rel="noreferrer"><span className="ci"><TelegramIcon size={20} /></span><div><div className="k">Telegram</div><div className="v" dir="ltr">{company.telegram.replace(/^https?:\/\/(www\.)?t\.me\//, "@").replace(/\/$/, "")}</div></div></a>
              <div className="cibox"><span className="ci"><MapPin size={20} /></span><div><div className="k">{t.contact.addressLabel}</div><div className="v">{company.address}</div></div></div>
              <div className="cibox"><span className="ci"><Clock size={20} /></span><div><div className="k">{t.contact.hours}</div><div className="v">{company.hours}</div></div></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer({ t, go, company, secretTap }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <button className="brand" onClick={() => go("home")} style={{ marginBottom: 14 }}>
              <span className="brand-mark"><GraduationCap size={22} /></span>
              <span className="brand-name" style={{ color: "#fff" }}>Savura <b style={{ color: "var(--amber)" }}>EDU</b></span>
            </button>
            <p style={{ maxWidth: 320 }}>{t.footer.tagline}</p>
            <div className="fsoc">
              <a href={company.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={20} /></a>
              <a href={company.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><TelegramIcon size={20} /></a>
            </div>
          </div>
          <div>
            <h4>{t.footer.quick}</h4>
            <button className="flink" onClick={() => go("home")}>{t.nav.home}</button>
            <button className="flink" onClick={() => go("universities")}>{t.nav.universities}</button>
            <button className="flink" onClick={() => go("documents")}>{t.proc.nav}</button>
            <button className="flink" onClick={() => go("about")}>{t.nav.about}</button>
            <button className="flink" onClick={() => go("contact")}>{t.nav.contact}</button>
          </div>
          <div>
            <h4>{t.nav.contact}</h4>
            <p dir="ltr" style={{ margin: "6px 0" }}>{company.phone}</p>
            <p dir="ltr" style={{ margin: "6px 0" }}>{company.email}</p>
            <p style={{ margin: "6px 0" }}>{company.address}</p>
          </div>
        </div>
        <div className="fbot">
          <span className="copy" onClick={secretTap}>© {new Date().getFullYear()} Savura EDU. {t.footer.rights}</span>
          <span>İstanbul · Toshkent · 🌍</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- ADMIN ---------------- */
/* Admin password is stored only as a SHA-256 hash — the plaintext never appears
   in the source code or the shipped bundle. To change it, run in any terminal:
   node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"
   and paste the result below. */
const PASSWORD_HASH = "4d27e43300c3f9080ad18a0f8da3dbba99cc8f7aff3bc9d73f9e97bd7414e0ac";

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
const emptyUni = { id: "", name: "", city: "", image: "", desc: "", fields: [], featured: false, faculties: [] };

function FacultyNameInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const q = (value || "").trim().toLowerCase();
  const list = (q
    ? FACULTY_OPTIONS.filter(f => f.toLowerCase().includes(q))
      .sort((a, b) => (a.toLowerCase().startsWith(q) ? 0 : 1) - (b.toLowerCase().startsWith(q) ? 0 : 1))
    : FACULTY_OPTIONS
  ).slice(0, 10);
  return (
    <div className="combo" ref={ref}>
      <input value={value} placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} />
      {open && list.length > 0 && (
        <div className="combo-pop">
          {list.map(f => (
            <button type="button" key={f} className="combo-item"
              onMouseDown={(e) => { e.preventDefault(); onChange(f); setOpen(false); }}>{f}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function UniNameInput({ value, onText, onPick, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const q = (value || "").trim().toLowerCase();
  const list = (q
    ? UNI_DB.filter(u => u.name.toLowerCase().includes(q))
      .sort((a, b) => (a.name.toLowerCase().startsWith(q) ? 0 : 1) - (b.name.toLowerCase().startsWith(q) ? 0 : 1))
    : UNI_DB
  ).slice(0, 100);
  return (
    <div className="combo" ref={ref}>
      <input value={value} placeholder={placeholder}
        onChange={e => { onText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} />
      {open && list.length > 0 && (
        <div className="combo-pop">
          {list.map(u => (
            <button type="button" key={u.name} className="combo-item"
              onMouseDown={(e) => { e.preventDefault(); onPick(u); setOpen(false); }}>
              <span style={{ fontWeight: 700 }}>{u.name}</span> <small>· {u.city}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== PARTNER (referral) PLATFORM ============== */
function PField({ label, ...props }) {
  return (<div className="field" style={{ marginBottom: 12 }}><label>{label}</label><input {...props} /></div>);
}
function PassField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field" style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={onChange} style={{ paddingInlineEnd: 42, width: "100%" }} />
        <button type="button" onClick={() => setShow(s => !s)} aria-label="toggle password" style={{ position: "absolute", top: "50%", insetInlineEnd: 10, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4, display: "flex" }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PartnerLanding({ t, company, mode, setMode, onAuthed }) {
  const P = t.partner;
  const reward = (company && company.partnerReward) || "50";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", audience: "" });
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const HOW_ICONS = [Users, Send, Wallet, ArrowRight];
  const submit = async () => {
    setErr(""); setNotice("");
    if (mode === "join") {
      if (!form.name || !form.email || !form.password) return;
      if (form.password.length < 6) { setErr(P.passShort); return; }
      if (form.password !== form.confirm) { setErr(P.passMismatch); return; }
      setBusy(true);
      const r = await partner.register(form); setBusy(false);
      if (r.ok && r.needConfirm) { setNotice(P.checkEmail); setMode("login"); return; }
      if (r.ok) { onAuthed(); return; }
      setErr(P.regErr);
    } else {
      setBusy(true);
      const r = await partner.signIn(form.email, form.password); setBusy(false);
      if (r.ok) { onAuthed(); return; }
      setErr(P.loginErr);
    }
  };
  return (
    <main>
      <section style={{ background: "linear-gradient(155deg,var(--teal),var(--teal-d))", color: "#fff", position: "relative", overflow: "hidden", padding: "72px 0 60px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 64, opacity: .5 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="partner-hero">
            <div className="reveal in">
              <span className="eyebrow" style={{ color: "var(--amber)" }}><span style={{ width: 18, height: 2, background: "var(--amber)" }} />{P.heroEyebrow}</span>
              <h1 style={{ color: "#fff", fontSize: "clamp(2rem,4.5vw,3rem)", margin: "12px 0 14px", lineHeight: 1.12 }}>{P.heroTitle}</h1>
              <p style={{ color: "rgba(255,255,255,.9)", fontSize: "1.05rem", maxWidth: 540 }}>{P.heroSub}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 22, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 16, padding: "15px 22px" }}>
                <Wallet size={26} color="var(--amber)" />
                <span style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700 }}>{P.earnForEach}</span>
              </div>
            </div>
            <div className="partner-auth reveal in">
              <div className="pa-tabs">
                <button className={mode === "join" ? "on" : ""} onClick={() => { setMode("join"); setErr(""); setNotice(""); }}>{P.regBtn}</button>
                <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); setNotice(""); }}>{P.loginBtn}</button>
              </div>
              <h3 style={{ margin: "4px 0 16px", color: "var(--ink)" }}>{mode === "join" ? P.regTitle : P.loginTitle}</h3>
              {mode === "join" && <>
                <PField label={P.fName} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <PField label={P.fPhone} dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </>}
              <PField label={P.fEmail} type="email" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <PassField label={P.fPass} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              {mode === "join" && <PassField label={P.fConfirm} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />}
              {mode === "join" && <PField label={P.fAudience} value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />}
              {notice && <div style={{ color: "#0A6E70", background: "var(--bg2)", border: "1px solid var(--teal-l)", borderRadius: 10, padding: "10px 12px", fontSize: ".86rem", marginBottom: 10 }}>{notice}</div>}
              {err && <div style={{ color: "var(--coral)", fontSize: ".88rem", marginBottom: 10 }}>{err}</div>}
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy} onClick={submit}>{busy ? "…" : (mode === "join" ? P.regBtn : P.loginBtn)}</button>
              <p style={{ textAlign: "center", marginTop: 12, fontSize: ".9rem", color: "var(--ink-soft)" }}>
                {mode === "join" ? P.haveAcc : P.noAcc}{" "}
                <button onClick={() => { setMode(mode === "join" ? "login" : "join"); setErr(""); }} style={{ color: "var(--teal)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>{mode === "join" ? P.loginBtn : P.regBtn}</button>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="sec-head center reveal in"><h2>{P.nav}</h2></div>
          <div className="grid g4">
            {P.how.map((h, i) => { const Ic = HOW_ICONS[i] || Sparkles; return (
              <div className="card reveal in" key={i} style={{ padding: "26px 22px", transitionDelay: `${i * 70}ms` }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: "var(--teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, position: "relative" }}>
                  <Ic size={24} /><span style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "var(--amber)", color: "#3a2a00", fontSize: ".8rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                </div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: 8 }}>{h.t}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: ".94rem", lineHeight: 1.6 }}>{h.d}</p>
              </div>); })}
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="wrap">
          <div className="sec-head center reveal in"><h2>{P.whoTitle}</h2></div>
          <div className="grid g4">
            {P.who.map((w, i) => (
              <div className="card reveal in" key={i} style={{ padding: "22px", textAlign: "center", transitionDelay: `${i * 60}ms` }}>
                <Star size={22} color="var(--amber)" fill="var(--amber)" style={{ marginBottom: 8 }} />
                <p style={{ fontWeight: 600 }}>{w}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <button className="btn btn-primary" onClick={() => { setMode("join"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{P.ctaJoin}<ArrowRight size={18} /></button>
          </div>
        </div>
      </section>
    </main>
  );
}

function WithdrawModal({ t, me, max, onClose, onDone }) {
  const P = t.partner;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [details, setDetails] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const methods = [["card", P.mCard], ["iban", P.mIban], ["bank", P.mBank], ["trc20", P.mTrc]];
  const submit = async () => {
    setErr("");
    const amt = Number(amount);
    if (!amt || amt <= 0 || !details) return;
    if (amt > max) { setErr(P.minBal); return; }
    setBusy(true);
    const ok = await partner.requestPayout({ partner_id: me.id, amount: amt, method, details });
    setBusy(false);
    if (ok) onDone(); else setErr(P.minBal);
  };
  return (
    <div className="pmodal-back" onClick={onClose}>
      <div className="pmodal" onClick={e => e.stopPropagation()}>
        <div className="pmodal-head"><h3>{P.wTitle}</h3><button className="x" onClick={onClose}><X size={20} /></button></div>
        <div style={{ padding: 22 }}>
          <div className="field" style={{ marginBottom: 12 }}><label>{P.wAmount}</label><input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`max $${max}`} /></div>
          <div className="field" style={{ marginBottom: 12 }}><label>{P.wMethod}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {methods.map(([k, lbl]) => (
                <button key={k} onClick={() => setMethod(k)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)", background: method === k ? "var(--teal)" : "var(--card)", color: method === k ? "#fff" : "var(--ink)", cursor: "pointer", fontWeight: 600 }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div className="field" style={{ marginBottom: 14 }}><label>{P.wDetails}</label><input value={details} dir="ltr" onChange={e => setDetails(e.target.value)} /></div>
          {err && <div style={{ color: "var(--coral)", fontSize: ".88rem", marginBottom: 10 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy} onClick={submit}>{busy ? "…" : P.wSubmit}<Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function CodeEditor({ t, current, onSaved }) {
  const P = t.partner;
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(current);
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const check = async (v) => {
    setVal(v);
    if (!v) { setState(""); return; }
    if (!/^[A-Za-z0-9]+$/.test(v)) { setState("invalid"); return; }
    if (v.length < 6) { setState("short"); return; }
    if (v.toLowerCase() === current.toLowerCase()) { setState(""); return; }
    setState("checking");
    const ok = await partner.checkCode(v);
    setState(ok ? "ok" : "taken");
  };
  const save = async () => {
    if (!/^[A-Za-z0-9]{6,}$/.test(val)) { setState(val.length < 6 ? "short" : "invalid"); return; }
    if (val.toLowerCase() !== current.toLowerCase() && state !== "ok") return;
    setBusy(true);
    const r = await partner.setCode(val); setBusy(false);
    if (r.ok) { setState("saved"); onSaved(val); setTimeout(() => setOpen(false), 1000); }
    else setState(r.error === "taken" ? "taken" : "invalid");
  };
  const msg = { checking: ["…", "var(--ink-soft)"], ok: [P.codeOk, "#0B8A8C"], taken: [P.codeTaken, "#FF5A5A"], short: [P.codeShort, "#FF5A5A"], invalid: [P.codeInvalid, "#FF5A5A"], saved: [P.codeSaved, "#0B8A8C"] }[state];
  if (!open) return <button onClick={() => { setOpen(true); setVal(current); setState(""); }} style={{ marginTop: 8, background: "none", border: "none", color: "var(--teal)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}><Pencil size={13} />{P.editCode}</button>;
  return (
    <div style={{ marginTop: 10, textAlign: "start" }}>
      <input value={val} dir="ltr" maxLength={20} onChange={e => check(e.target.value.replace(/\s/g, ""))} placeholder={P.codeLabel}
        style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, fontFamily: "monospace", letterSpacing: 1, textTransform: "uppercase" }} />
      <div style={{ fontSize: ".75rem", color: "var(--ink-soft)", marginTop: 4 }}>{P.codeHint}</div>
      {msg && <div style={{ fontSize: ".8rem", color: msg[1], marginTop: 4, fontWeight: 700 }}>{msg[0]}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn-teal" style={{ padding: "7px 14px" }} disabled={busy} onClick={save}>{P.save}</button>
        <button className="btn btn-out" style={{ padding: "7px 14px" }} onClick={() => setOpen(false)}>{P.cancel}</button>
      </div>
    </div>
  );
}

function PartnerCabinet({ t, me, company, onLogout }) {
  const P = t.partner;
  const reward = Number((company && company.partnerReward) || 0);
  const estMonthly = reward * 100;
  const [refs, setRefs] = useState([]);
  const [pays, setPays] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [code, setCode] = useState(me.code);
  const [copied, setCopied] = useState(false);
  const [wOpen, setWOpen] = useState(false);
  const load = async () => { setRefs(await partner.referrals()); setPays(await partner.payouts()); setMsgs(await partner.messages()); };
  useEffect(() => { load(); }, []);
  const link = `${window.location.origin}/?ref=${code}`;
  const copy = () => { try { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} };
  const num = (x) => Number(x) || 0;
  const inProc = (st) => ["new", "thinking", "in_payment"].includes(st);
  const counts = {
    referred: refs.length,
    process: refs.filter(r => inProc(r.status)).length,
    paid: refs.filter(r => r.status === "paid").length,
    cancelled: refs.filter(r => r.status === "cancelled").length,
  };
  const earned = refs.filter(r => r.status === "paid").reduce((s, r) => s + num(r.reward_usd), 0);
  const paidOut = pays.filter(p => p.status === "paid").reduce((s, p) => s + num(p.amount_usd), 0);
  const balance = Math.max(0, earned - paidOut);
  const pending = refs.filter(r => inProc(r.status)).reduce((s, r) => s + num(r.reward_usd), 0);
  const stLabel = (st) => ({ new: P.sNew, thinking: P.sThinking, in_payment: P.sInpay, paid: P.sPaid, cancelled: P.sCancelled }[st] || st);
  const stColor = (st) => ({ new: "#6b7280", thinking: "#F5A623", in_payment: "#3b82f6", paid: "#0B8A8C", cancelled: "#FF5A5A" }[st] || "#6b7280");
  const initials = (me.name || "S").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const STAT = [
    { lbl: P.stReferred, val: counts.referred, col: "#0B8A8C", Ic: Users },
    { lbl: P.stProcess, val: counts.process, col: "#3b82f6", Ic: Clock },
    { lbl: P.stPaid, val: counts.paid, col: "#F5A623", Ic: CheckCircle2 },
    { lbl: P.stCancelled, val: counts.cancelled, col: "#FF5A5A", Ic: XCircle },
  ];
  return (
    <main>
      <section style={{ background: "linear-gradient(150deg,var(--teal),var(--teal-d))", color: "#fff", position: "relative", overflow: "hidden", padding: "40px 0 92px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${STAR}")`, backgroundSize: 60, opacity: .4 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800 }}>{initials}</div>
              <div>
                <div style={{ opacity: .85, fontSize: ".9rem" }}>{P.hello}</div>
                <h1 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", margin: 0 }}>{me.name || ""}</h1>
              </div>
            </div>
            <button className="btn" style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }} onClick={onLogout}><LogOut size={16} />{P.logout}</button>
          </div>
        </div>
      </section>
      <section style={{ marginTop: -64, paddingBottom: 64, position: "relative", zIndex: 2 }}>
        <div className="wrap">
          <div className="card" style={{ padding: 24, marginBottom: 18, boxShadow: "var(--sh)" }}>
            <div className="cab-code">
              <div style={{ background: "var(--bg2)", borderRadius: 14, padding: "14px 22px", textAlign: "center" }}>
                <div style={{ fontSize: ".72rem", color: "var(--ink-soft)", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>{P.myCode}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--teal)", letterSpacing: 3, fontFamily: "monospace" }}>{code}</div>
                <CodeEditor t={t} current={code} onSaved={(c) => setCode(c)} />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Link2 size={15} />{P.myLink}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value={link} dir="ltr" onFocus={e => e.target.select()} style={{ flex: 1, padding: "11px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)", fontSize: ".85rem", minWidth: 0, color: "var(--ink-soft)" }} />
                  <button className="btn btn-teal" onClick={copy} style={{ whiteSpace: "nowrap" }}>{copied ? <><Check size={16} />{P.copied}</> : <><Copy size={16} />{P.copy}</>}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="cab-bal" style={{ marginBottom: 18 }}>
            <div className="card" style={{ padding: 22, borderTop: "3px solid var(--amber)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,166,35,.15)", color: "var(--amber-d)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Wallet size={22} /></div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>${reward.toLocaleString()}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginTop: 4 }}>{P.rwPerStudent}</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 22, borderTop: "3px solid var(--teal)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(11,138,140,.12)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><TrendingUp size={22} /></div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--teal)", lineHeight: 1 }}>${estMonthly.toLocaleString()}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginTop: 4 }}>{P.rwEstMonthly}</div>
                </div>
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--ink-soft)", marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>{P.rwUpTo100}</div>
            </div>
          </div>
          <div className="grid g4" style={{ marginBottom: 18 }}>
            {STAT.map((st, i) => { const Ic = st.Ic; return (
              <div className="card" key={i} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, borderTop: `3px solid ${st.col}` }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: st.col + "18", color: st.col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={22} /></div>
                <div>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{st.val}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginTop: 3 }}>{st.lbl}</div>
                </div>
              </div>); })}
          </div>
          <div className="cab-bal">
            <div className="card" style={{ padding: 26, background: "linear-gradient(150deg,#0E2A2C,var(--teal-d))", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", insetInlineEnd: -12, top: -8, opacity: .14 }}><Wallet size={96} /></div>
              <div style={{ fontSize: ".9rem", opacity: .85, position: "relative" }}>{P.balance}</div>
              <div style={{ fontSize: "2.7rem", fontWeight: 800, margin: "6px 0 16px", position: "relative" }}>${balance.toLocaleString()}</div>
              <button className="btn" style={{ background: "var(--amber)", color: "#3a2a00", fontWeight: 800, opacity: balance <= 0 ? .5 : 1, position: "relative" }} onClick={() => balance > 0 && setWOpen(true)} disabled={balance <= 0}><Wallet size={17} />{P.withdraw}</button>
            </div>
            <div className="card" style={{ padding: 26, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", insetInlineEnd: -12, top: -8, opacity: .09, color: "var(--teal)" }}><TrendingUp size={96} /></div>
              <div style={{ fontSize: ".9rem", color: "var(--ink-soft)" }}>{P.pending}</div>
              <div style={{ fontSize: "2.7rem", fontWeight: 800, margin: "6px 0", color: "var(--ink)" }}>${pending.toLocaleString()}</div>
              <div style={{ fontSize: ".85rem", color: "var(--ink-soft)" }}>{counts.process} · {P.stProcess}</div>
            </div>
          </div>
          <h3 style={{ margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}><Users size={18} color="var(--teal)" />{P.stReferred}</h3>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {refs.length === 0 ? <div style={{ padding: 36, textAlign: "center", color: "var(--ink-soft)" }}>{P.noRefs}</div> : (
              <div style={{ overflowX: "auto" }}>
                <table className="ptable">
                  <thead><tr><th>{P.tName}</th><th>{P.tUni}</th><th>{P.tStatus}</th><th>{P.tReward}</th><th>{P.tDate}</th></tr></thead>
                  <tbody>{refs.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name || "—"}</td>
                      <td style={{ color: "var(--ink-soft)" }}>{r.uni || "—"}</td>
                      <td><span style={{ background: stColor(r.status) + "22", color: stColor(r.status), padding: "4px 11px", borderRadius: 20, fontSize: ".8rem", fontWeight: 700 }}>{stLabel(r.status)}</span></td>
                      <td style={{ fontWeight: 700 }}>${num(r.reward_usd)}</td>
                      <td style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
          <h3 style={{ margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}><Wallet size={18} color="var(--teal)" />{P.wHistory}</h3>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {pays.length === 0 ? <div style={{ padding: 36, textAlign: "center", color: "var(--ink-soft)" }}>{P.noPayouts}</div> : (
              <div style={{ overflowX: "auto" }}>
                <table className="ptable">
                  <thead><tr><th>{P.wAmount}</th><th>{P.wMethod}</th><th>{P.tStatus}</th><th>{P.tDate}</th></tr></thead>
                  <tbody>{pays.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>${num(p.amount_usd)}</td>
                      <td>{p.method}</td>
                      <td><span style={{ color: p.status === "paid" ? "var(--teal)" : "var(--amber-d)", fontWeight: 700 }}>{p.status === "paid" ? P.wPaid : P.wRequested}</span></td>
                      <td style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
          <h3 style={{ margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}><Mail size={18} color="var(--teal)" />{P.msgsTitle}</h3>
          {msgs.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: "center", color: "var(--ink-soft)" }}>{P.noMsgs}</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {msgs.map(m => (
                <div className="card" key={m.id} style={{ padding: 18, borderInlineStart: "4px solid var(--amber)" }}>
                  {m.title && <div style={{ fontWeight: 800, marginBottom: 4 }}>{m.title}</div>}
                  <div style={{ color: "var(--ink-soft)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{m.body}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--ink-soft)", marginTop: 8 }}>{new Date(m.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {wOpen && <WithdrawModal t={t} me={me} max={balance} onClose={() => setWOpen(false)} onDone={() => { setWOpen(false); load(); }} />}
    </main>
  );
}

function PartnerPage({ t, company }) {
  const [sess, setSess] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("join");
  const refresh = async () => {
    const s = await partner.session();
    setSess(s);
    if (s) { setMe(await partner.me()); } else setMe(null);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  if (loading) return <main><section className="section"><div className="wrap" style={{ textAlign: "center", padding: "70px 0", color: "var(--ink-soft)" }}>…</div></section></main>;
  if (sess && me) return <PartnerCabinet t={t} me={me} company={company} onLogout={async () => { await partner.signOut(); setSess(null); setMe(null); }} />;
  return <PartnerLanding t={t} company={company} mode={mode} setMode={setMode} onAuthed={refresh} />;
}

function Admin({ t, unis, setUnis, company, setCompany, fieldName, go }) {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("admin@savura.edu");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("u");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [leads, setLeads] = useState([]);
  const [partners, setPartners] = useState([]);
  const [pays, setPays] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [msgTo, setMsgTo] = useState("");
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [co, setCo] = useState(company);
  const fileRef = useRef(null);

  useEffect(() => { setCo(company); }, [company]);
  useEffect(() => { (async () => { if (await auth.session() && await auth.isAdmin()) setAuthed(true); })(); }, []);
  useEffect(() => { if (authed) (async () => { setLeads(await getLeads()); setPartners(await admin.partners()); setPays(await admin.payouts()); setMsgs(await admin.messages()); })(); }, [authed]);
  const reloadCRM = async () => { setLeads(await getLeads()); setPartners(await admin.partners()); setPays(await admin.payouts()); setMsgs(await admin.messages()); };
  const setLeadStatus = async (id, status) => { await admin.updateLeadStatus(id, status); await reloadCRM(); };
  const markPayoutPaid = async (id) => { await admin.markPayoutPaid(id); await reloadCRM(); };
  const sendMessage = async () => {
    if (!msgBody.trim() && !msgTitle.trim()) return;
    await admin.sendMessage({ partner_id: msgTo ? Number(msgTo) : null, title: msgTitle, body: msgBody });
    setMsgTitle(""); setMsgBody(""); setMsgTo(""); await reloadCRM();
  };
  const dayLabel = (iso) => {
    const d = new Date(iso); const now = new Date();
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (sameDay(d, now)) return t.admin.today;
    if (sameDay(d, yest)) return t.admin.yesterday;
    return d.toLocaleDateString();
  };
  const downloadExcel = () => {
    const head = [t.partner.tName, t.admin.coPhone, t.admin.coEmail, t.partner.tUni, t.admin.facName, t.admin.iMsg, t.admin.iRef, t.admin.tabP, t.partner.tReward, t.partner.tStatus, t.partner.tDate];
    const rows = filteredLeads.map(l => {
      const pr = l.partner_id ? pById[l.partner_id] : null;
      return [l.name || "", l.phone || "", l.email || "", l.uni || "", l.faculty || "", l.msg || "", l.referral || "", pr ? pr.name : "", Number(l.reward_usd) || 0, stLabelA(l.status), new Date(l.date || l.created_at).toLocaleString()];
    });
    const ws = XLSX.utils.aoa_to_sheet([head, ...rows]);
    ws["!cols"] = head.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Savura");
    XLSX.writeFile(wb, `savura-arizalar-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const pById = Object.fromEntries(partners.map(p => [p.id, p]));
  const STATUS_OPTS = ["new", "thinking", "in_payment", "paid", "cancelled"];
  const stLabelA = (st) => ({ new: t.partner.sNew, thinking: t.partner.sThinking, in_payment: t.partner.sInpay, paid: t.partner.sPaid, cancelled: t.partner.sCancelled }[st] || st);
  const stColorA = (st) => ({ new: "#6b7280", thinking: "#F5A623", in_payment: "#3b82f6", paid: "#0B8A8C", cancelled: "#FF5A5A" }[st] || "#6b7280");
  const partnerStats = (pid) => {
    const myLeads = leads.filter(l => l.partner_id === pid);
    const earned = myLeads.filter(l => l.status === "paid").reduce((s, l) => s + (Number(l.reward_usd) || 0), 0);
    const paidOut = pays.filter(p => p.partner_id === pid && p.status === "paid").reduce((s, p) => s + (Number(p.amount_usd) || 0), 0);
    return { refs: myLeads.length, balance: Math.max(0, earned - paidOut) };
  };
  const filteredLeads = leads.filter(l => {
    if (fStatus !== "all" && l.status !== fStatus) return false;
    if (!q.trim()) return true;
    const hay = [l.name, l.phone, l.email, l.uni, l.faculty, l.referral].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });
  const groupedLeads = (() => {
    const groups = []; const map = {};
    filteredLeads.forEach(l => {
      const key = new Date(l.date || l.created_at).toDateString();
      if (!map[key]) { map[key] = { key, iso: l.date || l.created_at, items: [] }; groups.push(map[key]); }
      map[key].items.push(l);
    });
    return groups;
  })();

  const doLogout = async () => { await auth.signOut(); setAuthed(false); setPw(""); go("home"); };

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const KEY = "savura:universities:v4";
  const toggleFeatured = async (id) => {
    const next = await store.update(KEY, arr => arr.map(u => u.id === id ? { ...u, featured: !u.featured } : u), unis);
    setUnis(next);
  };

  const saveUni = async () => {
    if (!editing.name) return;
    const ed = editing.id ? editing : { ...editing, id: "u" + Date.now() };
    const next = await store.update(KEY, arr => (editing.id ? arr.map(u => u.id === ed.id ? ed : u) : [...arr, ed]), unis);
    setUnis(next); setEditing(null); flash(t.admin.saved);
  };
  const delUni = async (id) => {
    if (!window.confirm(t.admin.confirm)) return;
    const next = await store.update(KEY, arr => arr.filter(u => u.id !== id), unis);
    setUnis(next);
  };

  const onUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { const data = await fileToImage(file); setEditing(p => ({ ...p, image: data })); } catch (er) {}
    e.target.value = "";
  };

  const saveCompany = () => { setCompany(co); store.set("savura:company:v1", co); flash(t.admin.saved); };

  // faculties helpers
  const addFac = () => setEditing(p => ({ ...p, faculties: [...(p.faculties || []), { name: "", language: "tr", price: "", price5: "", location: "", admission: "open" }] }));
  const pickUni = (u) => setEditing(p => ({
    ...p,
    name: u.name,
    city: u.city,
    fields: deriveFields(u.faculties),
    faculties: u.faculties.map(fn => ({ name: fn, language: "tr", price: "", price5: "", location: u.city, admission: "open" })),
  }));
  const updFac = (i, k, v) => setEditing(p => ({ ...p, faculties: p.faculties.map((f, idx) => idx === i ? { ...f, [k]: v } : f) }));
  const rmFac = (i) => setEditing(p => ({ ...p, faculties: p.faculties.filter((_, idx) => idx !== i) }));

  const tryLogin = async () => {
    const r = await auth.signIn(email, pw);
    if (r.ok && await auth.isAdmin()) { setAuthed(true); setErr(false); }
    else { await auth.signOut(); setErr(true); }
  };

  if (!authed) {
    return (
      <main className="admin-wrap">
        <div className="login">
          <div className="lk"><Lock size={26} /></div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 6 }}>{t.admin.login}</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginBottom: 18 }}>{t.admin.hint}</p>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t.admin.email}</label>
            <input type="email" dir="ltr" value={email} autoFocus onChange={e => { setEmail(e.target.value); setErr(false); }}
              onKeyDown={e => { if (e.key === "Enter") tryLogin(); }} />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>{t.admin.pass}</label>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
              onKeyDown={e => { if (e.key === "Enter") tryLogin(); }} />
          </div>
          {err && <div style={{ color: "var(--coral)", fontWeight: 700, marginBottom: 12 }}>{t.admin.wrong}</div>}
          <button className="btn btn-teal" style={{ width: "100%", justifyContent: "center" }} onClick={tryLogin}>{t.admin.enter}</button>
          <button className="flink" style={{ color: "var(--ink-soft)", marginTop: 14 }} onClick={() => go("home")}>← {t.nav.home}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-wrap">
      <div className="wrap">
        <div className="atop">
          <div>
            <h2 style={{ fontSize: "1.7rem" }}>{t.admin.title}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: ".86rem" }}>{t.admin.shared}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div className="tabs">
              <button className={"tab" + (tab === "u" ? " on" : "")} onClick={() => setTab("u")}>{t.admin.tabU} ({unis.length})</button>
              <button className={"tab" + (tab === "i" ? " on" : "")} onClick={() => setTab("i")}>{t.admin.tabI} ({leads.length})</button>
              <button className={"tab" + (tab === "p" ? " on" : "")} onClick={() => setTab("p")}>{t.admin.tabP} ({partners.length})</button>
              <button className={"tab" + (tab === "m" ? " on" : "")} onClick={() => setTab("m")}>{t.admin.tabM}</button>
              <button className={"tab" + (tab === "s" ? " on" : "")} onClick={() => setTab("s")}>{t.admin.tabS}</button>
            </div>
            <button className="btn btn-out" onClick={doLogout}><LogOut size={16} />{t.admin.logout}</button>
          </div>
        </div>

        {tab === "u" && (<>
          <button className="btn btn-teal" style={{ marginBottom: 18 }} onClick={() => setEditing({ ...emptyUni })}><Plus size={18} />{t.admin.add}</button>
          {unis.map(u => (
            <div className="acard" key={u.id}>
              <div className="arow">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {u.image ? <img className="athumb" src={u.image} alt="" /> : <div className="athumb" style={{ display: "grid", placeItems: "center", color: "var(--teal)", fontWeight: 800, fontSize: "1.4rem" }}>{u.name.charAt(0)}</div>}
                  <div>
                    <div className="aname">{u.name} {u.featured && <Star size={14} fill="var(--amber)" color="var(--amber)" style={{ verticalAlign: "middle" }} />}</div>
                    <div className="amini">{u.city} · ${cardPrice(u).toLocaleString()} {t.unis.from} · {(u.faculties || []).length} {t.detail.faculties.toLowerCase()}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={"iconbtn" + (u.featured ? " starred" : "")} title={t.admin.fFeatured} onClick={() => toggleFeatured(u.id)}><Star size={17} fill={u.featured ? "#3a2a00" : "none"} /></button>
                  <button className="iconbtn" onClick={() => setEditing({ ...u, faculties: u.faculties || [], fields: u.fields || [] })}><Pencil size={17} /></button>
                  <button className="iconbtn danger" onClick={() => delUni(u.id)}><Trash2 size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </>)}

        {tab === "i" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: "absolute", insetInlineStart: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.admin.search} style={{ width: "100%", padding: "11px 14px", paddingInlineStart: 38, border: "1px solid var(--line)", borderRadius: 12 }} />
              </div>
              <button className="btn btn-teal" onClick={downloadExcel} disabled={!filteredLeads.length} style={{ whiteSpace: "nowrap" }}><FileText size={16} />{t.admin.dlExcel}</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {["all", ...STATUS_OPTS].map(st => {
                const on = fStatus === st; const col = st === "all" ? "#0B8A8C" : stColorA(st);
                return (
                  <button key={st} onClick={() => setFStatus(st)}
                    style={{ padding: "6px 13px", borderRadius: 20, border: "1px solid " + (on ? col : "var(--line)"), background: on ? col : "var(--card)", color: on ? "#fff" : "var(--ink-soft)", cursor: "pointer", fontSize: ".82rem", fontWeight: 700 }}>
                    {st === "all" ? t.admin.fAll : stLabelA(st)}
                  </button>
                );
              })}
            </div>
            {groupedLeads.length ? groupedLeads.map(g => (
              <div key={g.key} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, color: "var(--ink)" }}>{dayLabel(g.iso)}</span>
                  <span style={{ height: 1, flex: 1, background: "var(--line)" }} />
                  <span style={{ fontSize: ".8rem", color: "var(--ink-soft)", fontWeight: 700 }}>{g.items.length}</span>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {g.items.map((l) => {
                    const pr = l.partner_id ? pById[l.partner_id] : null;
                    return (
                      <div className="card" key={l.id} style={{ padding: 18, borderInlineStart: `4px solid ${stColorA(l.status)}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                          <div style={{ minWidth: 200, flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{l.name || "—"}</div>
                            <div dir="ltr" style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginTop: 2 }}>{l.phone || l.email || "—"}</div>
                            {(l.uni || l.faculty) && <div style={{ color: "var(--teal)", fontWeight: 700, fontSize: ".9rem", marginTop: 6 }}>{l.uni}{l.faculty ? " · " + l.faculty : ""}</div>}
                            {l.msg && <div style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginTop: 6 }}>{l.msg}</div>}
                          </div>
                          <div style={{ textAlign: "end", minWidth: 150 }}>
                            <div style={{ fontSize: ".78rem", color: "var(--ink-soft)" }}>{new Date(l.date || l.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                            {(l.referral || pr) && (
                              <div style={{ marginTop: 6, fontSize: ".82rem" }}>
                                <span style={{ color: "var(--ink-soft)" }}>{t.admin.iRef}: </span>
                                {l.referral ? <b style={{ fontFamily: "monospace", color: "var(--teal-d)" }}>{l.referral}</b> : null}
                                {pr ? <span style={{ color: "var(--ink)" }}> · {pr.name}</span> : null}
                                {Number(l.reward_usd) > 0 && <span style={{ color: "var(--amber-d)", fontWeight: 700 }}> · ${Number(l.reward_usd)}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                          <span style={{ fontSize: ".82rem", color: "var(--ink-soft)" }}>{t.partner.tStatus}:</span>
                          {STATUS_OPTS.map(st => (
                            <button key={st} onClick={() => setLeadStatus(l.id, st)}
                              style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid " + (l.status === st ? stColorA(st) : "var(--line)"), background: l.status === st ? stColorA(st) : "var(--card)", color: l.status === st ? "#fff" : "var(--ink-soft)", cursor: "pointer", fontSize: ".8rem", fontWeight: 700 }}>
                              {stLabelA(st)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : <div style={{ textAlign: "center", padding: "50px", color: "var(--ink-soft)", fontWeight: 700 }}>{t.admin.noI}</div>}
          </>
        )}

        {tab === "p" && (
          <div style={{ display: "grid", gap: 22 }}>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", marginBottom: 14 }}><Users size={19} color="#0B8A8C" />{t.admin.tabP}</h3>
              {partners.length ? (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="ptable">
                      <thead><tr><th>{t.partner.tName}</th><th>{t.contact.phone}</th><th>{t.partner.myCode}</th><th>{t.admin.crmRef}</th><th>{t.admin.crmBal}</th></tr></thead>
                      <tbody>{partners.map(p => { const st = partnerStats(p.id); return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.name || "—"}</td>
                          <td dir="ltr" style={{ color: "var(--ink-soft)" }}>{p.phone || "—"}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--teal-d)", fontWeight: 700 }}>{p.code}</td>
                          <td>{st.refs}</td>
                          <td style={{ fontWeight: 800, color: "var(--teal)" }}>${st.balance}</td>
                        </tr>); })}</tbody>
                    </table>
                  </div>
                </div>
              ) : <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--ink-soft)" }}>{t.admin.noPartners}</div>}
            </div>
            <div>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", marginBottom: 14 }}><Wallet size={19} color="#0B8A8C" />{t.admin.payReqs}</h3>
              {pays.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {pays.map(p => {
                    const pn = (p.partners && p.partners.name) || (pById[p.partner_id] && pById[p.partner_id].name) || "—";
                    return (
                      <div className="card" key={p.id} style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>${Number(p.amount_usd) || 0} <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--ink-soft)" }}>· {p.method}</span></div>
                          <div style={{ color: "var(--ink-soft)", fontSize: ".85rem", marginTop: 2 }}>{pn}</div>
                          <div dir="ltr" style={{ color: "var(--ink-soft)", fontSize: ".82rem", marginTop: 2, wordBreak: "break-all" }}>{p.details}</div>
                        </div>
                        <div style={{ textAlign: "end" }}>
                          {p.status === "paid"
                            ? <span style={{ color: "var(--teal)", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={17} />{t.partner.wPaid}</span>
                            : <button className="btn btn-teal" onClick={() => markPayoutPaid(p.id)}><Check size={16} />{t.admin.markPaid}</button>}
                          <div style={{ color: "var(--ink-soft)", fontSize: ".78rem", marginTop: 6 }}>{new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--ink-soft)" }}>{t.admin.noPayReq}</div>}
            </div>
          </div>
        )}

        {tab === "m" && (
          <div style={{ display: "grid", gap: 22 }}>
            <div className="setcard">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", marginBottom: 16 }}><Send size={18} color="#0B8A8C" />{t.admin.tabM}</h3>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>{t.admin.mTo}</label>
                <select value={msgTo} onChange={e => setMsgTo(e.target.value)} style={{ width: "100%", padding: "11px 12px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--card)", color: "var(--ink)" }}>
                  <option value="">{t.admin.mAll}</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name} · {p.code}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 12 }}><label>{t.admin.mTitleF}</label><input value={msgTitle} onChange={e => setMsgTitle(e.target.value)} /></div>
              <div className="field" style={{ marginBottom: 14 }}><label>{t.admin.mBodyF}</label><textarea rows={4} value={msgBody} onChange={e => setMsgBody(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={sendMessage} disabled={!msgBody.trim() && !msgTitle.trim()}><Send size={16} />{t.admin.mSend}</button>
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>{t.admin.mSentTitle}</h3>
              {msgs.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {msgs.map(m => (
                    <div className="card" key={m.id} style={{ padding: 16, borderInlineStart: "4px solid var(--amber)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".78rem", fontWeight: 700, color: m.partner_id ? "var(--teal)" : "var(--amber-d)" }}>
                          {m.partner_id ? ((m.partners && m.partners.name) || (pById[m.partner_id] && pById[m.partner_id].name) || "—") : t.admin.bcast}
                        </span>
                        <span style={{ fontSize: ".78rem", color: "var(--ink-soft)" }}>{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      {m.title && <div style={{ fontWeight: 800, marginTop: 4 }}>{m.title}</div>}
                      <div style={{ color: "var(--ink-soft)", whiteSpace: "pre-wrap", marginTop: 2 }}>{m.body}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--ink-soft)" }}>{t.admin.mNoSent}</div>}
            </div>
          </div>
        )}

        {tab === "s" && (
          <div className="setcard">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.2rem", marginBottom: 18 }}><Settings size={20} color="#0B8A8C" />{t.admin.coTitle}</h3>
            <div className="fgrid">
              <div className="field"><label>{t.admin.coPhone}</label><input value={co.phone} onChange={e => setCo({ ...co, phone: e.target.value })} /></div>
              <div className="field"><label>{t.admin.coEmail}</label><input value={co.email} onChange={e => setCo({ ...co, email: e.target.value })} /></div>
            </div>
            <div className="fgrid" style={{ marginTop: 14 }}>
              <div className="field"><label>{t.admin.coAddr}</label><input value={co.address} onChange={e => setCo({ ...co, address: e.target.value })} /></div>
              <div className="field"><label>{t.admin.coHours}</label><input value={co.hours} onChange={e => setCo({ ...co, hours: e.target.value })} /></div>
            </div>
            <div className="fgrid" style={{ marginTop: 14, marginBottom: 18 }}>
              <div className="field"><label>{t.admin.coIg}</label><input value={co.instagram} onChange={e => setCo({ ...co, instagram: e.target.value })} placeholder="https://instagram.com/..." /></div>
              <div className="field"><label>{t.admin.coTg}</label><input value={co.telegram} onChange={e => setCo({ ...co, telegram: e.target.value })} placeholder="https://t.me/..." /></div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div className="field" style={{ flex: 1, minWidth: 200 }}><label>{t.admin.coPrice}</label><input value={co.priceFrom || ""} onChange={e => setCo({ ...co, priceFrom: e.target.value.replace(/[^0-9]/g, "") })} placeholder="800" inputMode="numeric" /></div>
              <div className="field" style={{ flex: 1, minWidth: 200 }}><label>{t.admin.coReward}</label><input value={co.partnerReward || ""} onChange={e => setCo({ ...co, partnerReward: e.target.value.replace(/[^0-9]/g, "") })} placeholder="50" inputMode="numeric" /></div>
            </div>
            <button className="btn btn-teal" onClick={saveCompany}><Save size={17} />{t.admin.saveCo}</button>
          </div>
        )}
      </div>

      {editing && (
        <div className="amodal" onClick={(e) => { if (e.target.className === "amodal") setEditing(null); }}>
          <div className="aform">
            <h3>{editing.id ? t.admin.edit : t.admin.add}</h3>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>{t.admin.fName}</label>
              <UniNameInput value={editing.name} placeholder={t.admin.fName}
                onText={(v) => setEditing({ ...editing, name: v })}
                onPick={pickUni} />
              <div style={{ fontSize: ".78rem", color: "var(--ink-soft)", marginTop: 6 }}>{t.admin.uniHint}</div>
            </div>
            <div className="field" style={{ marginBottom: 14 }}><label>{t.admin.fCity}</label><input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} /></div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>{t.admin.fImg}</label>
              <div className="uploadbox">
                {editing.image ? <img className="uprev" src={editing.image} alt="" /> : <div className="uprev empty"><ImageIcon size={20} /></div>}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onUpload} />
                <button className="btn btn-out" type="button" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={16} />{t.admin.upload}</button>
                {editing.image && <button className="iconbtn danger" type="button" onClick={() => setEditing({ ...editing, image: "" })}><Trash2 size={16} /></button>}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--ink-soft)", marginTop: 6 }}>{t.admin.imgHint}</div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}><label>{t.admin.fDesc}</label><textarea rows={2} value={editing.desc} onChange={e => setEditing({ ...editing, desc: e.target.value })} /></div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>{t.admin.fFields}</label>
              <div className="checkgrid">
                {FIELDS.map(f => {
                  const on = (editing.fields || []).includes(f.key);
                  return (
                    <div key={f.key} className={"checkitem" + (on ? " on" : "")} onClick={() => setEditing({ ...editing, fields: on ? editing.fields.filter(x => x !== f.key) : [...(editing.fields || []), f.key] })}>
                      {on ? <Check size={15} /> : <f.icon size={15} />}{fieldName(f.key)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7 }}><Layers size={15} color="#0B8A8C" />{t.admin.facTitle}</label>
              {(editing.faculties || []).map((f, i) => (
                <div className="facedit" key={i}>
                  <button className="facdel" type="button" onClick={() => rmFac(i)}><Trash2 size={14} /></button>
                  <FacultyNameInput value={f.name} placeholder={t.admin.facName} onChange={(v) => updFac(i, "name", v)} />
                  <div className="facsub">
                    <select value={f.language || "tr"} onChange={e => updFac(i, "language", e.target.value)} title={t.admin.facLang}>
                      <option value="tr">🇹🇷 {t.detail.langTr}</option>
                      <option value="en">🇬🇧 {t.detail.langEn}</option>
                    </select>
                    <select value={f.admission || "open"} onChange={e => updFac(i, "admission", e.target.value)} title={t.admin.facAdm}>
                      <option value="open">{t.detail.admOpen}</option>
                      <option value="closed">{t.detail.admClosed}</option>
                    </select>
                    <input placeholder={t.admin.facPrice + " ($)"} type="number" value={f.price} onChange={e => updFac(i, "price", e.target.value)} />
                    <input placeholder={t.admin.facSchol + " ($)"} type="number" value={f.price5 || ""} onChange={e => updFac(i, "price5", e.target.value)} />
                    <input style={{ gridColumn: "1 / -1" }} placeholder={t.admin.facLoc} value={f.location} onChange={e => updFac(i, "location", e.target.value)} />
                  </div>
                </div>
              ))}
              <button className="btn btn-out" type="button" style={{ marginTop: 6 }} onClick={addFac}><Plus size={15} />{t.admin.addFac}</button>
            </div>

            <label className="checkitem" style={{ marginBottom: 18, width: "fit-content", background: editing.featured ? "var(--amber)" : "var(--card)", borderColor: editing.featured ? "var(--amber)" : "var(--line)", color: editing.featured ? "#3a2a00" : "var(--ink)" }} onClick={() => setEditing({ ...editing, featured: !editing.featured })}>
              <Star size={15} fill={editing.featured ? "#3a2a00" : "none"} />{t.admin.fFeatured}
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-out" onClick={() => setEditing(null)}>{t.admin.cancel}</button>
              <button className="btn btn-teal" onClick={saveUni}><Check size={17} />{t.admin.save}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </main>
  );
}
