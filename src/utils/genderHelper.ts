import { UserProfile, Gender } from '../types';

export const GENDER_CONFIG: Record<Gender, { label: string; icon: string; defaultAvatar: string }> = {
  boy: { label: 'בן', icon: '👦', defaultAvatar: '👦' },
  girl: { label: 'בת', icon: '👧', defaultAvatar: '👧' },
  other: { label: 'אחר / לכולם', icon: '✨', defaultAvatar: '🌟' },
};

export const GENDER_EMOJIS: string[] = [
  '👦', '👧', '🌟', '🚀', '⚡', '🎧', '🎮', '🎨', '⚽', '🦄', '🦁', '🦉', '💡'
];

export function getGreeting(profile?: UserProfile | null): string {
  if (!profile || !profile.name) return 'שלום! 👋';
  const name = profile.name.trim();

  switch (profile.gender) {
    case 'boy':
      return `ברוך הבא, ${name}! 👋`;
    case 'girl':
      return `ברוכה הבאה, ${name}! 👋`;
    default:
      return `שלום ושמחים שבאת, ${name}! 👋`;
  }
}

export function getGenderText(
  gender: Gender | undefined,
  options: { boy: string; girl: string; other: string }
): string {
  if (!gender) return options.other;
  return options[gender] || options.other;
}

export function getYouAreHereText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'איפה אתה נמצא כרגע?',
    girl: 'איפה את נמצאת כרגע?',
    other: 'איפה המיקום הנוכחי שלך?',
  });
}

export function getDestinationText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'לאן אתה צריך להגיע?',
    girl: 'לאן את צריכה להגיע?',
    other: 'לאן תרצו להגיע?',
  });
}

export function getReadyText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'אתה מוכן פיקס למחר! 🚀',
    girl: 'את מוכנה פיקס למחר! 🚀',
    other: 'הכל מוכן פיקס למחר! 🚀',
  });
}

export function getPackBagActionText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'ארגן את התיק למחר 🎒',
    girl: 'ארגני את התיק למחר 🎒',
    other: 'ארגון התיק למחר 🎒',
  });
}

export function getNavigateActionText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'נווט אותי לכיתה במפה 🗺️',
    girl: 'נווטי אותי לכיתה במפה 🗺️',
    other: 'ניווט לכיתה במפה 🗺️',
  });
}

export function getCheckBagActionText(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'בדוק ציוד בתיק 🎒',
    girl: 'בדקי ציוד בתיק 🎒',
    other: 'בדיקת ציוד בתיק 🎒',
  });
}

export function getStreakCongrats(gender?: Gender): string {
  return getGenderText(gender, {
    boy: 'ארגנת את התיק בזמן והגעת לכל השיעורים בלי להילחץ!',
    girl: 'ארגנת את התיק בזמן והגעת לכל השיעורים בלי להילחץ!',
    other: 'הציוד מאורגן וההגעה לשיעורים חלקה וברוגע!',
  });
}

