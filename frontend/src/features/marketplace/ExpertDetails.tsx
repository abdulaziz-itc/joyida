import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, MapPin, Phone, MessageSquare, 
  Play, Image as ImageIcon, MessageCircle, MoreVertical, 
  ChevronRight, Heart, Share2, Award, ShieldAlert
} from 'lucide-react';
import SafetyGuidelines from './SafetyGuidelines';
import ChatRoom from '../chat/ChatRoom';

interface PortfolioItem {
  id: number;
  url: string;
  type: 'image' | 'video';
  thumbnail: string;
}

interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

const ExpertDetails: React.FC<{ expertId: number, onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');
  const [showVideo, setShowVideo] = useState<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [contactType, setContactType] = useState<'call' | 'chat' | null>(null);

  const handleContactClick = (type: 'call' | 'chat') => {
    if (type === 'chat') {
       setShowChat(true);
    } else {
       setContactType(type);
       setShowSafety(true);
    }
  };

  const handleSafetyContinue = () => {
    setShowSafety(false);
    // Execute real contact logic here (e.g. window.location.href for phone)
    console.log(`Continuing with ${contactType}`);
  };

  const portfolio: PortfolioItem[] = [
    { id: 1, type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-plumber-working-with-a-wrench-on-a-pipe-42352-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1581242163695-19d0acfd486f?w=400&h=600&fit=crop' },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop' },
    { id: 3, type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-repairman-fixing-a-sink-drain-42358-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=600&fit=crop' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1621905252507-b354bc2d1rd?w=800&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1621905252507-b354bc2d1rd?w=400&h=400&fit=crop' },
  ];

  const reviews: Review[] = [
    { id: 1, user: 'Jasur M.', avatar: 'https://i.pravatar.cc/150?u=1', rating: 5, comment: 'Juda tez va sifatli xizmat ko\'rsatishdi. Tavsiya qilaman!', date: '2 kun oldin' },
    { id: 2, user: 'Malika K.', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4, comment: 'Yaxshi mutaxassis, o\'z ishining ustasi.', date: '1 hafta oldin' },
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-[#050505] overflow-y-auto overflow-x-hidden pt-16">
      {/* Navbar Overlay */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 max-w-5xl w-full px-8 z-[90] flex justify-between items-center h-16 pointer-events-none">
        <button onClick={onBack} className="p-3 rounded-full glass-card hover:bg-white/10 transition-all pointer-events-auto">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4 pointer-events-auto">
           <button className="p-3 rounded-full glass-card hover:bg-white/10 transition-all"><Share2 className="w-5 h-5" /></button>
           <button className="p-3 rounded-full glass-card hover:bg-white/10 transition-all"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-32">
        {/* Header Section */}
        <div className="relative h-64 rounded-b-[40px] mb-24 -mt-16 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-b border-white/10 overflow-hidden">
           <div className="absolute inset-0 bg-[#050505]/40 backdrop-blur-3xl" />
           <div className="absolute bottom-0 left-8 translate-y-1/2 flex items-end gap-6">
              <div className="w-40 h-40 rounded-[32px] border-4 border-[#050505] bg-white/5 overflow-hidden shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=400&h=400&fit=crop" className="w-full h-full object-cover" />
              </div>
              <div className="mb-4">
                 <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-4xl font-bold">Anvar Toshov</h1>
                    <Award className="w-6 h-6 text-purple-400" />
                 </div>
                 <p className="text-xl text-purple-400 font-medium mb-2">Professional Santexnik</p>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                       <Star className="w-5 h-5 fill-current" /> 4.9 (124 reviews)
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                       <MapPin className="w-5 h-5" /> Yunusobod, Toshkent
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bio & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
           <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Mutaxassis haqida</h2>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                 10 yillik tajribaga ega santexnikman. Har qanday murakkablikdagi suv va kanalizatsiya tizimlarini ta'mirlash, montaj qilish va servis xizmatlarini ko'rsataman. Ishimga to'liq kafolat beraman.
              </p>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-8">
                 <button 
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-4 px-8 font-bold text-lg transition-all relative ${activeTab === 'portfolio' ? 'text-white' : 'text-gray-500'}`}
                 >
                    Portfolio {activeTab === 'portfolio' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full" />}
                 </button>
                 <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 px-8 font-bold text-lg transition-all relative ${activeTab === 'reviews' ? 'text-white' : 'text-gray-500'}`}
                 >
                    Sharhlar {activeTab === 'reviews' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full" />}
                 </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                 {activeTab === 'portfolio' ? (
                    <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {portfolio.map(item => (
                          <div 
                            key={item.id} 
                            onClick={() => item.type === 'video' && setShowVideo(item.url)}
                            className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                          >
                             <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Portfolio" />
                             {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                   <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white border-white/20">
                                      <Play className="w-6 h-6 fill-current" />
                                   </div>
                                </div>
                             )}
                             <div className="absolute top-4 right-4 text-white/50">
                                {item.type === 'video' ? <Play className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 ) : (
                    <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                       {reviews.map(review => (
                          <div key={review.id} className="p-6 glass-card border-white/5">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                   <img src={review.avatar} className="w-12 h-12 rounded-full border border-white/10" />
                                   <div>
                                      <h4 className="font-bold">{review.user}</h4>
                                      <p className="text-xs text-gray-500">{review.date}</p>
                                   </div>
                                </div>
                                <div className="flex gap-0.5 text-yellow-500">
                                   {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                             </div>
                             <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Sidebar: Booking/Contact */}
           <div className="space-y-6">
              <div className="glass-card p-8 border-purple-500/20">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    Bog'lanish <ShieldAlert className="w-5 h-5 text-gray-500" />
                 </h3>
                 <div className="space-y-4">
                    <button 
                      onClick={() => handleContactClick('call')}
                      className="glow-button w-full h-14 flex items-center justify-center gap-3 text-lg"
                    >
                       <Phone className="w-5 h-5" /> Qo'ng'iroq qilish
                    </button>
                    <button 
                      onClick={() => handleContactClick('chat')}
                      className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                       <MessageCircle className="w-5 h-5" /> Chat boshlash
                    </button>
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4 text-sm">
                       <span className="text-gray-400">Xizmat narxi (o'rtacha)</span>
                       <span className="font-bold text-green-400">100,000 UZS dan</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-400">Ish vaqti</span>
                       <span className="font-bold">09:00 - 21:00</span>
                    </div>
                 </div>
              </div>

              <div className="glass-card p-6 border-white/10">
                 <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                       <Award className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="font-bold text-white text-base">Sertifikatlangan mutaxassis</p>
                       <p>Loyiha tomonidan tasdiqlangan</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Fullscreen Video Overlay (Reels Style) */}
      <AnimatePresence>
        {showChat && <ChatRoom roomName="Expert Chat" onBack={() => setShowChat(false)} />}
        {showSafety && <SafetyGuidelines onClose={() => setShowSafety(false)} onContinue={handleSafetyContinue} />}
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <button onClick={() => setShowVideo(null)} className="absolute top-10 right-10 z-[110] p-4 text-white hover:scale-110 transition-all">
               <X className="w-8 h-8" />
            </button>
            
            <div className="relative w-full max-w-lg aspect-[9/16] bg-black">
               <video src={showVideo} autoPlay loop controls className="w-full h-full object-contain" />
               <div className="absolute right-6 bottom-40 flex flex-col gap-8 text-white">
                  <div className="flex flex-col items-center gap-2">
                     <button className="p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"><Heart className="w-6 h-6" /></button>
                     <span className="text-sm font-bold">1.2k</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <button className="p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"><MessageSquare className="w-6 h-6" /></button>
                     <span className="text-sm font-bold">45</span>
                  </div>
                  <button className="p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"><Share2 className="w-6 h-6" /></button>
               </div>
               <div className="absolute left-6 bottom-12 text-white">
                  <div className="flex items-center gap-3 mb-3">
                     <img src="https://i.pravatar.cc/150?u=12" className="w-10 h-10 rounded-full border border-white/20" />
                     <span className="font-bold">Anvar Toshov</span>
                  </div>
                  <p className="text-sm text-gray-300">Yangi o'rnatilgan radiator tizimi! #santexnika #remont</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertDetails;
