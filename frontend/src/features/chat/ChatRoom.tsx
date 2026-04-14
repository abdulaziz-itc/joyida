import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Phone, ShieldCheck, MoreVertical, 
  ArrowLeft, Paperclip, Smile, ShieldAlert,
  CheckCircle, XCircle, Info, UserX
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'me' | 'other' | 'system';
  text: string;
  type: 'text' | 'offer' | 'system';
  timestamp: string;
  metadata?: any;
}

const ChatRoom: React.FC<{ roomName: string, onBack: () => void }> = ({ roomName, onBack }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'other', text: 'Assalomu alaykum, quvurda qanday muammo bor?', type: 'text', timestamp: '10:30' },
    { id: 2, sender: 'me', text: 'Vaalaykum assalom. Suv sizib chiqyapti, tezroq tuzatish kerak.', type: 'text', timestamp: '10:32' },
    { 
      id: 3, 
      sender: 'other', 
      text: 'Men borib ko\'rib, tuzatishim mumkin.', 
      type: 'offer', 
      timestamp: '10:35',
      metadata: { price: '80,000 UZS', desc: 'Quvurni almashtirish va germetiklash' }
    },
    { id: 4, sender: 'system', text: t('chat.safety_tip'), type: 'system', timestamp: '10:36' }
  ]);
  const [inputText, setInputText] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col md:max-w-4xl md:mx-auto md:my-10 md:rounded-[40px] md:shadow-2xl md:border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className="relative">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                   {privacyConsent ? <img src="https://i.pravatar.cc/150?u=12" className="w-full h-full rounded-full" /> : <UserX className="w-6 h-6 text-purple-400" />}
                </div>
                {privacyConsent && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />}
             </div>
             <div>
                <h3 className="font-bold flex items-center gap-2">
                   {privacyConsent ? "Anvar Toshov" : `${t('chat.expert_placeholder')} #382`}
                   {privacyConsent && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                </h3>
                <p className="text-xs text-green-400 font-medium">Online</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setPrivacyConsent(!privacyConsent)} className={`p-3 rounded-xl border transition-all ${privacyConsent ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
              <ShieldAlert className="w-5 h-5" />
           </button>
           <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Phone className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-purple-900/5">
        <div className="flex justify-center">
           <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              {t('chat.encrypted')}
           </div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : m.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            {m.type === 'system' ? (
              <div className="max-w-md bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-4">
                 <Info className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
                 <p className="text-sm text-orange-200/80 leading-relaxed font-medium">{m.text}</p>
              </div>
            ) : m.type === 'offer' ? (
              <div className="max-w-xs w-full glass-card p-6 border-purple-500/30">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold">{t('chat.official_offer')}</h4>
                 </div>
                 <p className="text-sm text-gray-400 mb-4">{m.metadata.desc}</p>
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t('chat.price_label')}</span>
                    <span className="text-xl font-black text-green-400">{m.metadata.price}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold text-gray-400">{t('chat.reject')}</button>
                    <button className="glow-button py-2.5 rounded-xl text-xs font-bold">{t('chat.accept')}</button>
                 </div>
              </div>
            ) : (
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl relative ${
                m.sender === 'me' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1.5 opacity-40 font-bold ${m.sender === 'me' ? 'text-right' : 'text-left'}`}>
                   {m.timestamp} {m.sender === 'me' && `• ${t('chat.read')}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-2xl">
        <div className="relative flex items-end gap-4">
           <div className="flex gap-2 pb-2">
              <button className="p-2 text-gray-500 hover:text-purple-400 transition-all"><Paperclip className="w-6 h-6" /></button>
           </div>
           <div className="flex-1 relative">
              <textarea 
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('chat.placeholder')} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm resize-none pr-14"
              />
              <button className="absolute right-4 bottom-3 p-2 text-gray-500 hover:text-white transition-all">
                 <Smile className="w-6 h-6" />
              </button>
           </div>
           <button 
             onClick={handleSend}
             className="w-14 h-14 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all active:scale-95"
           >
              <Send className="w-6 h-6" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
