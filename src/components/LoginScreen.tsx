import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, ArrowLeft, Check, Trophy, Heart, Smile } from 'lucide-react';
import { UserProfile, Gender } from '../types';
import { GENDER_CONFIG, GENDER_EMOJIS } from '../utils/genderHelper';
import { audioSynth } from '../utils/audioSynth';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, initialProfile }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'boy');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    initialProfile?.avatarEmoji || GENDER_CONFIG[initialProfile?.gender || 'boy'].defaultAvatar
  );
  const [grade, setGrade] = useState<string>(initialProfile?.grade || 'ט׳');
  const [error, setError] = useState<string>('');

  const handleGenderSelect = (g: Gender) => {
    setGender(g);
    setSelectedEmoji(GENDER_CONFIG[g].defaultAvatar);
    audioSynth.playChime();
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    audioSynth.playChime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('בבקשה הכנס את שמך הפרטי כדי שנדע איך לפנות אליך');
      audioSynth.playWarningBeep();
      return;
    }

    audioSynth.playSuccessBeep();
    onLogin({
      name: name.trim(),
      gender,
      avatarEmoji: selectedEmoji,
      grade,
      isLoggedIn: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-100/30 text-right space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Brain className="w-9 h-9" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">MindMate</h1>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              גרסה 2.0
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500">עוזר חכם מונגש לבית הספר</p>

          {/* Intel badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 shadow-2xs mt-1">
            <Trophy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Intel® AI Global Impact Festival 2026 🏆</span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-center space-y-1">
          <h2 className="font-bold text-slate-800 text-base">היי, ברוכים הבאים! 👋</h2>
          <p className="text-xs text-slate-600">
            הכניסו את הפרטים כדי ש-MindMate יפנה אליכם בצורה מותאמת אישית ונעימה
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>איך קוראים לך? (שם פרטי)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="למשל: דניאל, נועה, רועי..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:bg-white bg-slate-50 text-slate-900 font-bold text-base outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 font-bold mt-1">{error}</p>}
          </div>

          {/* Gender Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">איך לפנות אליך באפליקציה?</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(GENDER_CONFIG) as Gender[]).map((gKey) => {
                const isSelected = gender === gKey;
                const config = GENDER_CONFIG[gKey];

                return (
                  <button
                    key={gKey}
                    type="button"
                    onClick={() => handleGenderSelect(gKey)}
                    className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center select-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold shadow-sm scale-102 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-xs">{config.label}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Emoji Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">בחרו את האימוג'י שלכם:</label>
            <div className="flex flex-wrap gap-2 justify-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {GENDER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-indigo-600 text-white shadow-md scale-110 ring-2 ring-indigo-300'
                      : 'bg-white hover:bg-slate-200 shadow-2xs'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Grade selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">באיזו כיתה את/ה לומד/ת?</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
            >
              <option value="ז׳">כיתה ז׳</option>
              <option value="ח׳">כיתה ח׳</option>
              <option value="ט׳">כיתה ט׳ </option>
              <option value="י׳">כיתה י׳</option>
              <option value='י"א'>כיתה י"א</option>
              <option value='י"ב'>כיתה י"ב</option>
            </select>
          </div>

          {/* Enter Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-transform active:scale-98 cursor-pointer"
          >
            <span>היכנס ל-MindMate</span>
            <span className="text-xl">{selectedEmoji}</span>
            <ArrowLeft className="w-5 h-5 mr-1" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400">
          כל המידע נשמר אך ורק באופן מקומי בטלפון שלך • פרטיות מלאה 🔒
        </p>
      </motion.div>
    </div>
  );
};
