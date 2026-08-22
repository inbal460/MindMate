import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  BrainCircuit,
  Smile
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { getGreeting } from '../utils/genderHelper';

interface MindMateAIChatProps {
  userProfile?: UserProfile | null;
}

export const MindMateAIChat: React.FC<MindMateAIChatProps> = ({ userProfile }) => {
  const defaultGreeting = userProfile?.name
    ? `היי ${userProfile.name}! ${userProfile.avatarEmoji || '👋'} אני MindMate, העוזר האישי שלך לבית הספר. אני כאן כדי לעזור לך לפרק משימות קשות לצעדים פשוטים, לארגן את הציוד בתיק, או לתת טיפ מהיר ללמידה. מה נעשה עכשיו?`
    : 'היי! אני MindMate, העוזר האישי שלך לבית הספר 😊 אני כאן כדי לעזור לך לפרק משימות קשות לצעדים פשוטים, לארגן את הציוד בתיק, או לתת טיפ מהיר ללמידה. מה נעשה עכשיו?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: defaultGreeting,
      timestamp: 'עכשיו',
      quickActions: [
        'איך לארגן את התיק למחר ברוגע? 🎒',
        'פרק לי עבודה גדולה ל-3 שלבים 📝',
        'טיפ ללמידה למבחן בלי לחץ 🧠',
        'אני מרגיש עמוס ומבולבל עכשיו 🌿',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    audioSynth.playChime();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userContext: {
            name: userProfile?.name || 'תלמיד',
            gender: userProfile?.gender || 'boy',
            grade: userProfile?.grade || 'ט׳',
            school: 'חטיבת ביניים ותיכון',
          },
        }),
      });

      const data = await response.json();
      const aiReply = data?.reply || 'אני כאן איתך! בוא נעשה צעד אחד בכל פעם.';

      audioSynth.playSuccessBeep();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'אני כאן איתך! בוא נפרק את הדברים צעד צעד: מה הדבר הכי חשוב שצריך לעשות קודם?',
          timestamp: 'עכשיו',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
              <span>MindMate AI Assistant</span>
              <span className="text-[10px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-extrabold">
                מקוון
              </span>
            </h3>
            <p className="text-xs text-indigo-100">
              עוזר שיחה חכם ומונגש: פירוק משימות, רוגע וסדר בראש
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-reset',
                sender: 'ai',
                text: defaultGreeting,
                timestamp: 'עכשיו',
              },
            ]);
            audioSynth.playSuccessBeep();
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="אפס שיחה"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm text-sm">
                  🤖
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-sm text-right space-y-2 ${
                  isAI
                    ? 'bg-white text-slate-800 border border-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <p className="whitespace-pre-line font-medium">{msg.text}</p>

                {/* Quick actions chips if provided */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                    {msg.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors text-right cursor-pointer"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] ${
                    isAI ? 'text-slate-400' : 'text-indigo-200'
                  } text-left font-mono`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm text-sm">
                  {userProfile?.avatarEmoji || '👦'}
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
              <span className="text-xs text-slate-500 font-semibold mr-1">MindMate חושב...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל משהו, בקש עזרה בפירוק משימה או ארגון התיק..."
            className="flex-1 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 shadow-md shadow-indigo-200 transition-transform active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
