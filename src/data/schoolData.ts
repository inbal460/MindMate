import { SubjectInfo, TimetableSlot, SchoolLocation, BreakZone, DayOfWeek } from '../types';

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'sunday', label: 'יום ראשון', short: 'א׳' },
  { key: 'monday', label: 'יום שני', short: 'ב׳' },
  { key: 'tuesday', label: 'יום שלישי', short: 'ג׳' },
  { key: 'wednesday', label: 'יום רביעי', short: 'ד׳' },
  { key: 'thursday', label: 'יום חמישי', short: 'ה׳' },
  { key: 'friday', label: 'יום שישי', short: 'ו׳' },
];

export const PERIOD_TIMES: { period: number; start: string; end: string; isBreakAfter?: boolean; breakName?: string; breakDuration?: number }[] = [
  { period: 1, start: '08:00', end: '08:50', isBreakAfter: true, breakName: 'הפסקה קצרה (5 דקות)', breakDuration: 5 },
  { period: 2, start: '08:55', end: '09:35', isBreakAfter: true, breakName: 'הפסקה קצרה (10 דקות)', breakDuration: 10 },
  { period: 3, start: '09:45', end: '10:30', isBreakAfter: true, breakName: 'הפסקה גדולה (25 דקות)', breakDuration: 25 },
  { period: 4, start: '10:55', end: '11:40', isBreakAfter: true, breakName: 'הפסקה קצרה (10 דקות)', breakDuration: 10 },
  { period: 5, start: '11:50', end: '12:35', isBreakAfter: true, breakName: 'הפסקה קצרה (10 דקות)', breakDuration: 10 },
  { period: 6, start: '12:45', end: '13:30', isBreakAfter: true, breakName: 'הפסקה קצרה (10 דקות)', breakDuration: 10 },
  { period: 7, start: '13:40', end: '14:25' },
];

export const SUBJECTS_CATALOG: Record<string, SubjectInfo> = {
  homeroom: {
    id: 'homeroom',
    name: 'Homeroom & Advisory',
    hebrewName: 'חינוך',
    emoji: '🤝',
    color: 'from-teal-500 to-emerald-600',
    iconName: 'HeartHandshake',
    defaultRoom: 'כיתת אם 101',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'יעל',
    requiredEquipment: [
      { name: 'יומן אישי / פנקס מעקב', emoji: '📔', isMandatory: true },
      { name: 'עט כחול או שחור', emoji: '🖊️' }
    ],
  },
  tanach: {
    id: 'tanach',
    name: 'Bible Studies',
    hebrewName: 'תנ"ך',
    emoji: '📜',
    color: 'from-cyan-600 to-blue-700',
    iconName: 'Scroll',
    defaultRoom: '104',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'לימור',
    requiredEquipment: [
      { name: 'ספר תנ״ך מלא', emoji: '📖', isMandatory: true },
      { name: 'מחברת תנ״ך', emoji: '📝', isMandatory: true },
      { name: 'חוברת עבודה', emoji: '📑' }
    ],
  },
  lashon: {
    id: 'lashon',
    name: 'Hebrew & Grammar',
    hebrewName: 'לשון',
    emoji: '✍️',
    color: 'from-purple-500 to-violet-600',
    iconName: 'Feather',
    defaultRoom: '105',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'תרזה',
    requiredEquipment: [
      { name: 'ספר לשון והבעה', emoji: '📖', isMandatory: true },
      { name: 'מחברת שורות ללשון', emoji: '📝', isMandatory: true },
      { name: 'דפי תרגול ופעלים', emoji: '📄' },
      { name: 'מרקרים ועטים', emoji: '🖍️' }
    ],
  },
  math: {
    id: 'math',
    name: 'Mathematics',
    hebrewName: 'מתמטיקה',
    emoji: '📐',
    color: 'from-blue-600 to-indigo-600',
    iconName: 'Calculator',
    defaultRoom: '204',
    floor: 2,
    building: 'אגף מדעים',
    defaultTeacher: 'שירי',
    requiredEquipment: [
      { name: 'מחברת משבצות גדולה', emoji: '📓', isMandatory: true },
      { name: 'מחשבון מדעי (Casio)', emoji: '🧮', isMandatory: true },
      { name: 'ספר מתמטיקה', emoji: '📘', isMandatory: true },
      { name: 'סרגל ומחוגה', emoji: '📏' },
      { name: 'עפרון HB ומחק איכותי', emoji: '✏️' }
    ],
  },
  tikshuv: {
    id: 'tikshuv',
    name: 'ICT & Computing',
    hebrewName: 'תקשוב',
    emoji: '💻',
    color: 'from-indigo-600 to-cyan-600',
    iconName: 'Code2',
    defaultRoom: 'מעבדת מחשבים',
    floor: 2,
    building: 'אגף טכנולוגיה',
    defaultTeacher: 'ענבל',
    requiredEquipment: [
      { name: 'מחשב נייד / טאבלט טעון', emoji: '💻', isMandatory: true },
      { name: 'מטען וכבל USB', emoji: '🔌', isMandatory: true },
      { name: 'אוזניות אישיות', emoji: '🎧' },
      { name: 'מחברת תקשוב', emoji: '📓' }
    ],
  },
  history: {
    id: 'history',
    name: 'History',
    hebrewName: 'היסטוריה',
    emoji: '🏛️',
    color: 'from-rose-500 to-pink-600',
    iconName: 'BookOpen',
    defaultRoom: '102',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'אלעד',
    requiredEquipment: [
      { name: 'ספר היסטוריה', emoji: '📙', isMandatory: true },
      { name: 'מחברת שורות עבה', emoji: '📒' },
      { name: 'אטלס היסטורי / דפי סיכום', emoji: '🗺️' },
      { name: 'מרקרים לסיכומים', emoji: '🖍️' }
    ],
  },
  pe: {
    id: 'pe',
    name: 'Physical Education',
    hebrewName: 'חנ"ג',
    emoji: '⚽',
    color: 'from-red-500 to-orange-500',
    iconName: 'Dumbbell',
    defaultRoom: 'אולם ספורט',
    floor: 0,
    building: 'מתחם ספורט',
    defaultTeacher: 'שחר',
    requiredEquipment: [
      { name: 'חולצת ספורט בית ספרית', emoji: '👕', isMandatory: true },
      { name: 'נעלי ספורט תקניות', emoji: '👟', isMandatory: true },
      { name: 'בקבוק מים אישי 1 ליטר', emoji: '💧', isMandatory: true },
      { name: 'מגבת פנים קטנה', emoji: '🧖' },
      { name: 'חולצה להחלפה + דאודורנט', emoji: '🧴' }
    ],
  },
  next_step: {
    id: 'next_step',
    name: 'Next Step / Personal Growth',
    hebrewName: 'הצעד הבא',
    emoji: '🚀',
    color: 'from-emerald-500 to-teal-600',
    iconName: 'Sparkles',
    defaultRoom: 'חדר הדרכה 103',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'יונת',
    requiredEquipment: [
      { name: 'מחברת פרויקט אישי', emoji: '📓', isMandatory: true },
      { name: 'קלסר משימות', emoji: '📁' },
      { name: 'כלי כתיבה', emoji: '✏️' }
    ],
  },
  civics: {
    id: 'civics',
    name: 'Civics',
    hebrewName: 'אזרחות',
    emoji: '⚖️',
    color: 'from-amber-600 to-orange-600',
    iconName: 'BookOpen',
    defaultRoom: '106',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'בלה',
    requiredEquipment: [
      { name: 'ספר אזרחות בישראל', emoji: '📘', isMandatory: true },
      { name: 'מחברת אזרחות', emoji: '📝', isMandatory: true },
      { name: 'דפי מושגים ומאמרים', emoji: '📄' }
    ],
  },
  art: {
    id: 'art',
    name: 'Art & Design',
    hebrewName: 'אמנות',
    emoji: '🎨',
    color: 'from-fuchsia-500 to-pink-500',
    iconName: 'Palette',
    defaultRoom: 'סדנת אמנות',
    floor: 0,
    building: 'אגף יצירתיות',
    defaultTeacher: 'לי',
    requiredEquipment: [
      { name: 'בלוק ציור איכותי', emoji: '📄', isMandatory: true },
      { name: 'סט עפרונות רישום ומחק', emoji: '✏️' },
      { name: 'צבעים ומכחולים אישיים', emoji: '🎨', isMandatory: true },
      { name: 'סינר ליצירה', emoji: '🦺' }
    ],
  },
  english: {
    id: 'english',
    name: 'English',
    hebrewName: 'אנגלית',
    emoji: '🇬🇧',
    color: 'from-blue-500 to-cyan-600',
    iconName: 'Languages',
    defaultRoom: '108',
    floor: 1,
    building: 'בניין מרכזי',
    defaultTeacher: 'הדס',
    requiredEquipment: [
      { name: 'ספר לימוד באנגלית / ספר דיגיטלי טעון', emoji: '💻', isMandatory: true },
      { name: 'חוברת אנסינים (Unseens)', emoji: '📑', isMandatory: true },
      { name: 'מחברת אנגלית וסיכומי דקדוק', emoji: '📓', isMandatory: true },
      { name: 'מילונית אלקטרונית / מילון', emoji: '📱' },
      { name: 'מרקרים ועטי כתיבה', emoji: '✏️' }
    ],
  },
  science: {
    id: 'science',
    name: 'Science & Physics',
    hebrewName: 'מדעים',
    emoji: '🧪',
    color: 'from-teal-500 to-emerald-600',
    iconName: 'FlaskConical',
    defaultRoom: 'מעבדה 2',
    floor: 0,
    building: 'אגף מעבדות',
    defaultTeacher: 'ד״ר אילן רוזן',
    requiredEquipment: [
      { name: 'ספר מדעים', emoji: '📗', isMandatory: true },
      { name: 'מחברת מעבדה', emoji: '📓' },
      { name: 'חלוק מעבדה לבן', emoji: '🥼', isMandatory: true }
    ],
  },
};

// Maya's exact personal schedule from school (מערכת אישית - מיה)
export const MAYA_PRESET_TIMETABLE: TimetableSlot[] = [
  // יום ראשון (Sunday)
  { id: 'sun-1', day: 'sunday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'homeroom', subjectName: 'חינוך', teacher: 'יעל', room: '101', building: 'בניין מרכזי', floor: 1 },
  { id: 'sun-2', day: 'sunday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
  { id: 'sun-3', day: 'sunday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
  { id: 'sun-4', day: 'sunday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
  { id: 'sun-5', day: 'sunday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
  { id: 'sun-6', day: 'sunday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },

  // יום שני (Monday)
  { id: 'mon-1', day: 'monday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
  { id: 'mon-2', day: 'monday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
  { id: 'mon-3', day: 'monday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'history', subjectName: 'היסטוריה', teacher: 'אלעד', room: '102', building: 'בניין מרכזי', floor: 1 },
  { id: 'mon-4', day: 'monday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'pe', subjectName: 'חנ"ג', teacher: 'שחר', room: 'אולם ספורט', building: 'מתחם ספורט', floor: 0 },
  { id: 'mon-5', day: 'monday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'next_step', subjectName: 'הצעד הבא', teacher: 'יונת', room: '103', building: 'בניין מרכזי', floor: 1 },
  { id: 'mon-6', day: 'monday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
  { id: 'mon-7', day: 'monday', period: 7, startTime: '13:40', endTime: '14:25', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },

  // יום שלישי (Tuesday)
  { id: 'tue-1', day: 'tuesday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
  { id: 'tue-2', day: 'tuesday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
  { id: 'tue-3', day: 'tuesday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שלומית', room: '204', building: 'אגף מדעים', floor: 2 },
  { id: 'tue-4', day: 'tuesday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'tikshuv', subjectName: 'תקשוב', teacher: 'ענבל', room: 'מעבדת מחשבים', building: 'אגף טכנולוגיה', floor: 2 },
  { id: 'tue-5', day: 'tuesday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'history', subjectName: 'היסטוריה', teacher: 'אלעד', room: '102', building: 'בניין מרכזי', floor: 1 },
  { id: 'tue-6', day: 'tuesday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'art', subjectName: 'אמנות', teacher: 'לי', room: 'סדנת אמנות', building: 'אגף יצירתיות', floor: 0 },
  { id: 'tue-7', day: 'tuesday', period: 7, startTime: '13:40', endTime: '14:25', subjectId: 'art', subjectName: 'אמנות', teacher: 'לי', room: 'סדנת אמנות', building: 'אגף יצירתיות', floor: 0 },

  // יום רביעי (Wednesday)
  { id: 'wed-1', day: 'wednesday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
  { id: 'wed-2', day: 'wednesday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'tanach', subjectName: 'תנ"ך', teacher: 'לימור', room: '104', building: 'בניין מרכזי', floor: 1 },
  { id: 'wed-3', day: 'wednesday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
  { id: 'wed-4', day: 'wednesday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'pe', subjectName: 'חנ"ג', teacher: 'שחר', room: 'אולם ספורט', building: 'מתחם ספורט', floor: 0 },
  { id: 'wed-5', day: 'wednesday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
  { id: 'wed-6', day: 'wednesday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },

  // יום חמישי (Thursday)
  { id: 'thu-1', day: 'thursday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
  { id: 'thu-2', day: 'thursday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'english', subjectName: 'אנגלית', teacher: 'הדס', room: '108', building: 'בניין מרכזי', floor: 1 },
  { id: 'thu-3', day: 'thursday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'מיה', room: '106', building: 'בניין מרכזי', floor: 1 },
  { id: 'thu-4', day: 'thursday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'math', subjectName: 'מתמטיקה', teacher: 'שירי', room: '204', building: 'אגף מדעים', floor: 2 },
  { id: 'thu-5', day: 'thursday', period: 5, startTime: '11:50', endTime: '12:35', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
  { id: 'thu-6', day: 'thursday', period: 6, startTime: '12:45', endTime: '13:30', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },

  // יום שישי (Friday)
  { id: 'fri-1', day: 'friday', period: 1, startTime: '08:00', endTime: '08:50', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
  { id: 'fri-2', day: 'friday', period: 2, startTime: '08:55', endTime: '09:35', subjectId: 'lashon', subjectName: 'לשון', teacher: 'תרזה', room: '105', building: 'בניין מרכזי', floor: 1 },
  { id: 'fri-3', day: 'friday', period: 3, startTime: '09:45', endTime: '10:30', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
  { id: 'fri-4', day: 'friday', period: 4, startTime: '10:55', endTime: '11:40', subjectId: 'civics', subjectName: 'אזרחות', teacher: 'בלה', room: '106', building: 'בניין מרכזי', floor: 1 },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = MAYA_PRESET_TIMETABLE;

export const SCHOOL_LOCATIONS: SchoolLocation[] = [
  // Ground Floor (Floor 0)
  { id: 'loc-gate', name: 'שער ראשי וכניסה', code: 'ENTRANCE', floor: 0, building: 'חזית בית הספר', type: 'yard', x: 50, y: 92, description: 'עמדת שומר, שער כניסה ויציאה', quietLevel: 'active' },
  { id: 'loc-gym', name: 'אולם ספורט וכושר', code: 'GYM', floor: 0, building: 'מתחם ספורט', type: 'gym', x: 18, y: 75, description: 'מגרש כדורסל מקורה, מלתחות ומתקני ספורט', quietLevel: 'active' },
  { id: 'loc-lab2', name: 'מעבדה 2 (מדעים ופיזיקה)', code: 'LAB-2', floor: 0, building: 'אגף מעבדות', type: 'lab', x: 80, y: 70, description: 'מעבדת חקר מצוידת, עמדות כיור ומיקרוסקופים', quietLevel: 'medium' },
  { id: 'loc-art', name: 'סדנת אמנות ועיצוב', code: 'ART-STUDIO', floor: 0, building: 'אגף יצירתיות', type: 'classroom', x: 82, y: 35, description: 'סדנת יצירה עם כני נגרות, צבעים וחימר', quietLevel: 'medium' },
  { id: 'loc-cafeteria', name: 'קפיטריה ופינת אוכל', code: 'CAFE', floor: 0, building: 'רחבת מרכזית', type: 'cafeteria', x: 50, y: 55, description: 'קיוסק בית ספרי, שולחנות פיקניק ובר מים', quietLevel: 'active' },
  { id: 'loc-yard-shade', name: 'חצר מוצלת וספסלי מנוחה', code: 'YARD-SHADE', floor: 0, building: 'חצר מרכזית', type: 'yard', x: 30, y: 50, description: 'ספסלים מתחת לעצי אקליפטוס, פינה נעימה ושקטה', quietLevel: 'high' },
  { id: 'loc-pingpong', name: 'מתחם שולחנות פינג-פונג', code: 'PING-PONG', floor: 0, building: 'חצר מזרחית', type: 'yard', x: 70, y: 52, description: '3 שולחנות טניס שולחן פעילים בהפסקות', quietLevel: 'active' },
  { id: 'loc-stairs-ground', name: 'מדרגות ומעלית מרכזית', code: 'STAIRS-0', floor: 0, building: 'בניין מרכזי', type: 'stairs', x: 50, y: 30, description: 'גישה לקומות 1 ו-2 (כולל מעלית נגישה לתלמידים)', quietLevel: 'medium' },

  // First Floor (Floor 1)
  { id: 'loc-class-9-2', name: 'כיתת אם ט׳2', code: 'CLASS-902', floor: 1, building: 'בניין מרכזי', type: 'classroom', x: 32, y: 40, description: 'כיתת האם שלך, לוקרים אישיים ומקרן', quietLevel: 'medium' },
  { id: 'loc-102', name: 'כיתה 102 (היסטוריה)', code: '102', floor: 1, building: 'בניין מרכזי', type: 'classroom', x: 20, y: 30, description: 'ליד מדרגות אגף מערבי', quietLevel: 'medium' },
  { id: 'loc-104', name: 'כיתה 104 (תנ״ך)', code: '104', floor: 1, building: 'בניין מרכזי', type: 'classroom', x: 32, y: 20, description: 'מסדרון צפוני', quietLevel: 'medium' },
  { id: 'loc-105', name: 'כיתה 105 (ספרות)', code: '105', floor: 1, building: 'בניין מרכזי', type: 'classroom', x: 68, y: 20, description: 'מסדרון צפוני מזרחי', quietLevel: 'medium' },
  { id: 'loc-108', name: 'כיתה 108 (אנגלית)', code: '108', floor: 1, building: 'בניין מרכזי', type: 'classroom', x: 80, y: 32, description: 'מסדרון אגף אנגלית', quietLevel: 'medium' },
  { id: 'loc-counselor', name: 'חדר יועצת ומרחב הכלה', code: 'COUNSELOR', floor: 1, building: 'בניין מרכזי', type: 'counselor', x: 40, y: 70, description: 'חדר שקט ונעים עם כורסאות, תמיד פתוח לשיחה ורגיעה', quietLevel: 'high' },
  { id: 'loc-teachers-room', name: 'חדר מורים ומזכירות', code: 'STAFF', floor: 1, building: 'בניין מרכזי', type: 'teachers_room', x: 60, y: 70, description: 'חדר מורים, מזכירות פדגוגית ומנהל', quietLevel: 'medium' },
  { id: 'loc-bathrooms-1', name: 'שירותים וברזייה קומה 1', code: 'RESTROOM-1', floor: 1, building: 'בניין מרכזי', type: 'bathroom', x: 50, y: 45, description: 'שירותי בנים ובנות + שירותי נגישות + מתקן מים קרים', quietLevel: 'medium' },
  { id: 'loc-stairs-1', name: 'מדרגות ומעלית מרכזית', code: 'STAIRS-1', floor: 1, building: 'בניין מרכזי', type: 'stairs', x: 50, y: 30, description: 'חיבור בין קומת קרקע לקומה 2', quietLevel: 'medium' },

  // Second Floor (Floor 2)
  { id: 'loc-204', name: 'כיתה 204 (מתמטיקה)', code: '204', floor: 2, building: 'אגף מדעים', type: 'classroom', x: 28, y: 35, description: 'כיתת מתמטיקה עם לוחות מחיקים כפולים', quietLevel: 'medium' },
  { id: 'loc-cyber-lab', name: 'מעבדת מחשבים וסייבר ג׳', code: 'LAB-CYBER', floor: 2, building: 'אגף חדשנות', type: 'lab', x: 75, y: 35, description: '30 עמדות מחשב, מסכי פיתוח ולוחות תכנות', quietLevel: 'high' },
  { id: 'loc-library', name: 'הספרייה ומרכז הלמידה השקט', code: 'LIBRARY', floor: 2, building: 'בניין מרכזי', type: 'library', x: 50, y: 65, description: 'מרחב ממוזג שקט, פופים, עמדות מחשב נייד וספרי עיון', quietLevel: 'high' },
  { id: 'loc-clubhouse', name: 'מועדון תלמידים ומשחקי קופסה', code: 'CLUB', floor: 2, building: 'אגף חברתי', type: 'classroom', x: 25, y: 70, description: 'משחקי שולחן, טאקי, שחמט, ספות ומוזיקה שקטה', quietLevel: 'medium' },
  { id: 'loc-stairs-2', name: 'מדרגות ומעלית קומה 2', code: 'STAIRS-2', floor: 2, building: 'בניין מרכזי', type: 'stairs', x: 50, y: 30, description: 'ירידה לקומה 1 וקומת קרקע', quietLevel: 'medium' },

  // Outdoor Special Zones
  { id: 'loc-football', name: 'מגרש כדורגל דשא סינתטי', code: 'PITCH-FB', floor: 0, building: 'מתחם ספורט חיצוני', type: 'yard', x: 12, y: 88, description: 'מגרש כדורגל מגודר ומואר עם שערים וספסלי שחקנים', quietLevel: 'active' },
  { id: 'loc-basketball', name: 'מגרש כדורסל חיצוני', code: 'COURT-BB', floor: 0, building: 'מתחם ספורט חיצוני', type: 'gym', x: 24, y: 88, description: 'מגרש כדורסל אספלט עם 4 סלים וקווים תקניים', quietLevel: 'active' },
  { id: 'loc-patio-middle', name: 'פטיו חט״ב (חטיבת ביניים)', code: 'PATIO-MS', floor: 0, building: 'אגף חט״ב', type: 'yard', x: 38, y: 62, description: 'פטיו ירוק ומקורה עם צמחייה, פופים ופינות ישיבה נעימות לתלמידי חט״ב', quietLevel: 'medium' },
];

export const BREAK_ZONES: BreakZone[] = [
  {
    id: 'zone-football',
    name: 'מגרש כדורגל',
    type: 'sports',
    locationName: 'מתחם ספורט חיצוני (קומת קרקע)',
    floor: 0,
    icon: 'Trophy',
    color: 'from-emerald-600 to-green-700',
    description: 'מגרש דשא סינתטי מרווח, מתאים למשחקונים, מסירות והבקעות',
    vibe: 'אנרגטי, ספורטיבי, תנועתי ומהנה',
    currentCount: 14,
    activeActivities: [
      {
        id: 'act-fb-1',
        studentName: 'איתמר ויואב',
        grade: 'ט׳2',
        activityText: 'משחקים משחקון 5 על 5 במסירות קצרות - חסרים 2 שחקנים ⚽',
        lookingForOthers: true,
        tags: ['כדורגל', 'משחקון', 'כיף'],
        timeAgo: 'לפני 2 דקות'
      },
      {
        id: 'act-fb-2',
        studentName: 'דניאל כ.',
        grade: 'ח׳2',
        activityText: 'מתאמנים בבעיטות עונשין ופנדלים לשער הדרומי',
        lookingForOthers: true,
        tags: ['בעיטות', 'אימון שוערים'],
        timeAgo: 'לפני 5 דקות'
      }
    ]
  },
  {
    id: 'zone-basketball',
    name: 'מגרש כדורסל',
    type: 'sports',
    locationName: 'מגרש כדורסל חיצוני (ליד האולם)',
    floor: 0,
    icon: 'Trophy',
    color: 'from-orange-500 to-amber-600',
    description: 'מגרש כדורסל עם 4 סלים, מעולה לקליעות, 21 ומשחקי חצי מגרש',
    vibe: 'תחרותי קליל, ספורטיבי וחברי',
    currentCount: 9,
    activeActivities: [
      {
        id: 'act-bb-1',
        studentName: 'רועי ש.',
        grade: 'ט׳1',
        activityText: 'משחק 21 ושלשות בסל המערבי, כולם מוזמנים לזרוק 🏀',
        lookingForOthers: true,
        tags: ['כדורסל', 'זריקות לסל', '21'],
        timeAgo: 'לפני 3 דקות'
      }
    ]
  },
  {
    id: 'zone-patio-middle',
    name: 'פטיו חט״ב',
    type: 'outdoor',
    locationName: 'רחבת פטיו חטיבת ביניים (קומה 0)',
    floor: 0,
    icon: 'Trees',
    color: 'from-teal-600 to-cyan-700',
    description: 'פטיו מוצל ונעים של שכבות ז׳-ט׳, עם צמחייה, ספסלים ופופים צבעוניים',
    vibe: 'רגוע, מוגן, אווירה נעימה וחברית',
    currentCount: 8,
    activeActivities: [
      {
        id: 'act-patio-1',
        studentName: 'שירה ונויה',
        grade: 'ח׳3',
        activityText: 'יושבות על הפופים בפטיו, שומעות פלייליסט רגוע ומחליפות מדבקות 🌿',
        lookingForOthers: true,
        tags: ['פטיו', 'רוגע', 'מוזיקה'],
        timeAgo: 'לפני 4 דקות'
      },
      {
        id: 'act-patio-2',
        studentName: 'מתן ב.',
        grade: 'ט׳2',
        activityText: 'פינת פתרון חידות שבועיות וקריאת מגזינים',
        lookingForOthers: false,
        tags: ['שקט', 'קריאה'],
        timeAgo: 'לפני 6 דקות'
      }
    ]
  },
  {
    id: 'zone-pingpong',
    name: 'מתחם הפינג פונג',
    type: 'sports',
    locationName: 'חצר מזרחית (קומת קרקע)',
    floor: 0,
    icon: 'Trophy',
    color: 'from-amber-500 to-orange-600',
    description: 'מקום אנרגטי וכיפי עם 3 שולחנות טניס שולחן',
    vibe: 'תנועתי, כיפי, חברתי',
    currentCount: 8,
    activeActivities: [
      {
        id: 'act-1',
        studentName: 'יואב מ.',
        grade: 'ט׳3',
        activityText: 'מחפשים שחקן 4 לטורניר זוגות בפינג פונג 🏓',
        lookingForOthers: true,
        tags: ['טניס שולחן', 'משחק זוגות', 'זריז'],
        timeAgo: 'לפני 3 דקות'
      },
      {
        id: 'act-2',
        studentName: 'איתי ורון',
        grade: 'ח׳1',
        activityText: 'מתאמנים על סרבים מסובבים, מוזמנים להצטרף',
        lookingForOthers: true,
        tags: ['אימון', 'פתוח לכולם'],
        timeAgo: 'לפני 7 דקות'
      }
    ]
  },
  {
    id: 'zone-library',
    name: 'הספרייה השקטה',
    type: 'quiet',
    locationName: 'ספרייה (קומה 2)',
    floor: 2,
    icon: 'BookOpen',
    color: 'from-indigo-600 to-blue-700',
    description: 'מרחב שקט וממוזג, אידיאלי לוויסות חושי, קריאה או מנוחה',
    vibe: 'רגוע, שקט, מזגן נעים, מותאם לוויסות חושי',
    currentCount: 5,
    activeActivities: [
      {
        id: 'act-3',
        studentName: 'מאיה ש.',
        grade: 'ט׳2',
        activityText: 'יושבת עם אוזניות וקוראת קומיקס, מתאים למי שרוצה פינה שקטה',
        lookingForOthers: false,
        tags: ['שקט', 'קריאה', 'וויסות חושי'],
        timeAgo: 'לפני 5 דקות'
      },
      {
        id: 'act-4',
        studentName: 'נועם ב.',
        grade: 'י׳1',
        activityText: 'פותרים תשבצים וחידות שחמט בפינת הפופים',
        lookingForOthers: true,
        tags: ['שחמט', 'חידות', 'רגוע'],
        timeAgo: 'לפני 10 דקות'
      }
    ]
  },
  {
    id: 'zone-courtyard-shade',
    name: 'הדשא והספסלים בצל',
    type: 'outdoor',
    locationName: 'חצר מרכזית מתחת לעצי האקליפטוס',
    floor: 0,
    icon: 'Trees',
    color: 'from-emerald-600 to-teal-700',
    description: 'אוויר פתוח, צל נעים וספסלים עם חברים',
    vibe: 'קליל, שיחה נעימה, אכילת כריכים יחד',
    currentCount: 12,
    activeActivities: [
      {
        id: 'act-5',
        studentName: 'דנה וטל',
        grade: 'ט׳2',
        activityText: 'יושבות על הדשא, אוכלות כריך ומדברות על מוזיקה 🎵',
        lookingForOthers: true,
        tags: ['שיחה', 'מוזיקה', 'אוכל בכיף'],
        timeAgo: 'לפני 2 דקות'
      },
      {
        id: 'act-6',
        studentName: 'גיא ק.',
        grade: 'ט׳1',
        activityText: 'משחקים קלפי טאקי בצל, חסר עוד קלפן אחד!',
        lookingForOthers: true,
        tags: ['טאקי', 'קלפים', 'משחק מהיר'],
        timeAgo: 'לפני 4 דקות'
      }
    ]
  },
  {
    id: 'zone-clubhouse',
    name: 'מועדון משחקי לוח ורוגע',
    type: 'games',
    locationName: 'חדר מועדון (קומה 2)',
    floor: 2,
    icon: 'Gamepad2',
    color: 'from-purple-600 to-pink-600',
    description: 'ספות, משחקי קטאן, שחמט, טאקי וקלפי אונו',
    vibe: 'מזמין, מובנה, קל להשתלב בלי מבוכה',
    currentCount: 6,
    activeActivities: [
      {
        id: 'act-7',
        studentName: 'אורי ג.',
        grade: 'ח׳3',
        activityText: 'פתחנו לוח שחמט מהיר (בליץ 5 דקות) - מי שרוצה משחק מוזמן',
        lookingForOthers: true,
        tags: ['שחמט', 'משחק לוח'],
        timeAgo: 'לפני 6 דקות'
      },
      {
        id: 'act-8',
        studentName: 'שירה ר.',
        grade: 'ט׳2',
        activityText: 'משחק קטאן מהיר (חסר שחקן רביעי כדי להתחיל!)',
        lookingForOthers: true,
        tags: ['קטאן', 'אסטרטגיה', 'כיף ביחד'],
        timeAgo: 'לפני 8 דקות'
      }
    ]
  },
  {
    id: 'zone-cafeteria',
    name: 'רחבת הקפיטריה',
    type: 'social',
    locationName: 'קפיטריה (קומת קרקע)',
    floor: 0,
    icon: 'Coffee',
    color: 'from-rose-500 to-red-600',
    description: 'מפגש חברים, קניית שתייה וכריכים, אווירה תוססת',
    vibe: 'חברתי, מרכזי, מפגש שכבות',
    currentCount: 15,
    activeActivities: [
      {
        id: 'act-9',
        studentName: 'עומר וליאור',
        grade: 'ט׳3',
        activityText: 'יושבים ליד הברזייה הראשית, קונים כריך ומדברים על הגיימינג בסופ״ש',
        lookingForOthers: true,
        tags: ['חברים', 'גיימינג', 'אוכל'],
        timeAgo: 'לפני 1 דקה'
      }
    ]
  }
];

export const SAMPLE_TEACHER_MESSAGES = [
  {
    id: 'msg-english-exam',
    title: 'הודעת אנגלית: מתכונת, בגרות, 3 אנסינים, חיבור וספרים דיגיטליים',
    sender: 'שרה לוי (מורה לאנגלית כיתה י׳)',
    rawText: `שלום תלמידים יקרים ולמיוחדים שלי בכיתה י' היקרים מאוד,

אני פונה אליכם היום כדי להזכיר ולהדגיש את החשיבות העליונה של ההכנה המוקדמת לקראת מבחן הבגרות הקרוב באנגלית, שכן כידוע לכם היטב היטב, ציון הגשה שלכם מורכב משורה ארוכה של מטלות, משימות, בחנים והגשות שביצעתם או לא ביצעתם לאורך כל המחצית הנוכחית וגם במחצית הקודמת, ולכן כל עיכוב בהגשת עבודות הבית או אי-הגעה לשיעורים הפרטניים מהווה פגיעה ישירה בסיכויים שלכם להצליח לקבל ציון הולם שאתם ראויים לו, ובמיוחד לאור העובדה שחומר העזר למבחן הק prossimo (סליחה, הקרוב) כולל שלושה אנסינים מורכבים במיוחד מתוך מאגר האנסינים הרשמי של משרד החינוך, לצד מטלת כתיבה (Composition) באורך של לפחות מאה ועשרים מילים שחייבת לכלול לפחות שלוש פסקאות מובנות היטב הכנדולות פסקת פתיחה, פסקת גוף ופסקת סיכום ברורה, ולכן אני מבקשת מכל אחד ואחת מכם לעבור היטב על כל המחברות, הסיכומים, דפי העבודה שחולקו בכיתה וכל מילות המפתח שכתבתי על הלוח במהלך שלושת השבועות האחרונים, לוודא שאתם שולטים בכל זמני הפועל באנגלית כולל Present Perfect Simple וגם Past Perfect, וכמובן להגיע לשיעור הבא עם כל החומרים מוכנים על השולחן עוד לפני הצלצול, כי אחרת לא אוכל לאשר את ההשתתפות שלכם במתכונת המלאה שתתקיים בעוד שבועיים בדיוק ביום שלישי בשעה שמונה בבוקר במעבדת המחשבים הישנה ליד חדר המורים, שזה אומר שמי שלא יביא את הספרים הדיגיטליים טעונים במלואם לא יוכל להיבחן ויאלץ לגשת במועד ב' המיוחד שייקבע בחופשת פסח, ולכן אני מצפה מכולם לקחת אחריות אישית, להתארגן בצורה חכמה ויעילה, לשתף פעולה בקבוצות הוואטסאפ הלימודיות, ובמידה ויש לכם שאלות כלשהן אתם מוזמנים לשלוח לי הודעה פרטית אך ורק בין השעות ארבע אחר הצהריים לשש וחצי ערב בימים א'-ה' בלבד, שיהיה לכם המשך יום נפלא ופורם (פורה)!`
  },
  {
    id: 'msg-trip',
    title: 'הודעת מחנכת: פרטי סיור של״ח והכנות ליום שלישי הקרוב',
    sender: 'דניאלה כהן (מחנכת ט׳2)',
    rawText: `שלום לכל תלמידי כיתה ט׳2 וההורים היקרים,
לקראת הסיור הלימודי של של״ח שיתקיים ביום שלישי הקרוב 24/10 בנחל אלכסנדר, להלן מספר דגשים קריטיים שכולם חייבים להכיר.
קודם כל, ההגעה לבית הספר היא בשעה 07:30 בדיוק ברחבת השער הראשי ליד האוטובוסים, לא נאחר כי האוטובוס יוצא ב-07:45 ולא מחכה למאחרים.
לגבי ציוד אישי שחובה להביא בתיק גב קטן: 3 ליטר מים בבקבוקים בלבד (לא פחיות), כובע חובה, נעלי הליכה סגורות בלבד (מי שיגיע עם סנדלים או קרוקס לא יעלה לאוטובוס!), קרם הגנה נגד שמש, ארוחת בוקר וצהריים מהבית כי לא נעצור בקיוסקים, ושקית אישית לפינוי אשפה.
בנוסף, יש להביא כלי כתיבה ודפי עבודה של של״ח שחילקתי ביום ראשון.
תלמידים שטרם העבירו את אישור היציאה החתום בפורטל ההורים - החובה להשלים זאת עד יום ראשון בשעה 16:00, אחרת לא תאושר היציאה.
חזרה משוערת לבית הספר סביב השעה 15:30.
שיהיה לנו סיור מוצלח ומלמד,
דניאלה.`
  },
  {
    id: 'msg-math-project',
    title: 'הודעת מתמטיקה: הנחיות להגשת עבודת חקר ומועד המבחן',
    sender: 'דניאלה כהן (מורה למתמטיקה 5 יח״ל)',
    rawText: `תלמידים יקרים,
שימו לב שבשבוע הבא ביום רביעי ה-01/11 יתקיים מבחן המחצית הראשון במתמטיקה. החומר למבחן כולל: משוואות ריבועיות עם פרמטרים, פונקציה ריבועית וחקר מלא, וגיאומטריה של המישור - דמיון משולשים ומשפט פיתגורס.
חובה להביא למבחן: מחשבון מדעי תקין עם סוללות (לא תתאפשר העברת מחשבונים או שימוש בטלפון), סרגל, עפרון ומחק.
בנוסף, עבודת החקר שהתחלתם בזוגות צריכה להיות מוגשת מודפסת או בקובץ PDF דרך המשו״ב עד יום ראשון הקרוב ב-20:00. עבודה שלא תוגש בזמן תגרור הורדת 5 נקודות לכל יום איחור.
מחר (יום חמישי) בהפסקת עשר אקיים שיעור תגבור למתקשים בכיתה 204.
בהצלחה לכולם!`
  },
  {
    id: 'msg-science-lab',
    title: 'הודעת מעבדה: ניסוי חקר בכימיה וציוד בטיחות חובה',
    sender: 'ד״ר אילן רוזן (רכז מדעים)',
    rawText: `שלום לתלמידי שכבת ט׳,
ביום שני הקרוב נערוך ניסוי מעבדה מעשי מרכזי בנושא תגובות חומצה ובסיס.
על כל תלמיד להגיע למעבדה 2 עם חלוק מעבדה לבן (תלמיד ללא חלוק לא יורשה לבצע את הניסוי ויקבל משימה חלופית בכתב), נעליים סגורות ושיער ארוך אסוף בגומייה.
עליכם לקרוא מראש בעמודים 84-88 בספר הלימוד את שלבי הניסוי ולענות על שאלות טרום-מעבדה במחברת המעבדה.
בסיום השיעור כל זוג יגיש דו״ח ממצאים ראשוני.
שמרו על כללי הבטיחות.`
  }
];

export const ADHD_TIPS = [
  { id: 'tip-1', title: 'כלל ה-3 דברים 🎒', desc: 'בכל מעבר כיתה בדוק רק 3 דברים: תיק סגור, בקבוק מים וקלמר.', icon: 'CheckSquare' },
  { id: 'tip-2', title: 'פירוק משימות ⏱️', desc: 'משימה של חצי שעה נראית גדולה? חלק אותה ל-3 מקטעים של 8 דקות עם דקת מתיחה.', icon: 'Layers' },
  { id: 'tip-3', title: 'הורדת עומס חושי 🌿', desc: 'המסדרון רועש? קח 2 דקות בספרייה בקומה 2 או בפינה שקטה כדי להתאפס.', icon: 'Sparkles' },
  { id: 'tip-4', title: 'חבר לדרך 🤝', desc: 'מתבלבל לאן הולכים? שאל חבר מהכיתה או הצטרף למישהו שהולך לאותו אגף.', icon: 'Users' },
];

