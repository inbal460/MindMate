export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type Gender = 'boy' | 'girl' | 'other';

export interface UserProfile {
  name: string;
  gender: Gender;
  avatarEmoji: string;
  grade?: string;
  schoolName?: string;
  isLoggedIn: boolean;
}

export interface SubjectInfo {
  id: string;
  name: string;
  hebrewName: string;
  emoji: string;
  color: string;
  iconName: string;
  defaultRoom: string;
  floor: number;
  building: string;
  defaultTeacher?: string;
  requiredEquipment: Array<{ name: string; emoji: string; isMandatory?: boolean }>;
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  period: number; // 1 to 8
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:45"
  subjectId: string;
  subjectName: string;
  teacher: string;
  room: string;
  building: string;
  floor: number;
  customEquipment?: string[];
  notes?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'books' | 'stationery' | 'digital' | 'sports' | 'general' | 'health';
  icon: string;
  isMandatory: boolean;
  forSubject?: string;
  checked: boolean;
}

export interface SchoolLocation {
  id: string;
  name: string;
  code: string; // e.g. "101", "204", "LAB-1"
  floor: number; // 0 = Ground, 1 = First, 2 = Second
  building: string;
  type: 'classroom' | 'lab' | 'gym' | 'library' | 'cafeteria' | 'bathroom' | 'counselor' | 'stairs' | 'yard' | 'teachers_room';
  x: number; // 0 - 100% relative coordinates on map
  y: number; // 0 - 100%
  description: string;
  quietLevel: 'high' | 'medium' | 'active';
}

export interface BreakZone {
  id: string;
  name: string;
  type: 'quiet' | 'games' | 'sports' | 'outdoor' | 'social' | 'study';
  locationName: string;
  floor: number;
  icon: string;
  color: string;
  description: string;
  vibe: string;
  currentCount: number;
  activeActivities: Array<{
    id: string;
    studentName: string;
    grade: string;
    activityText: string;
    lookingForOthers: boolean;
    tags: string[];
    timeAgo: string;
  }>;
}

export interface AISimplifiedMessage {
  originalText: string;
  sender: string;
  title: string;
  bottomLine: string;
  keyPoints: string[];
  actionItems: Array<{
    id: string;
    text: string;
    deadline?: string;
    isCompleted: boolean;
  }>;
  requiredEquipment: string[];
  importantDates: string[];
  urgency: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quickActions?: string[];
  structuredData?: {
    type: 'checklist' | 'steps' | 'schedule';
    items: string[];
  };
}

export interface UserPreferences {
  name: string;
  grade: string;
  schoolName: string;
  readingRulerEnabled: boolean;
  highContrast: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  simplifiedMode: boolean;
  activeDay: DayOfWeek;
  currentLocationId: string;
  currentZoneId?: string;
}
