import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Phone, MessageSquare, List, Map as MapIcon, X, ChevronRight, ShieldCheck, Gem } from 'lucide-react';
import ExpertDetails from './ExpertDetails';
import { useAuthStore } from '../../store/authStore';

interface Expert {
  id: number;
  name: string;
  profession: string;
  distance: string;
  rating: number;
  reviews: number;
  image: string;
  phone?: string;
  isVerified?: boolean;
  isPro?: boolean;
}

const ExpertCard = ({ expert, onClick }: { expert: Expert, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className={`group cursor-pointer p-5 rounded-[32px] border transition-all flex gap-6 relative overflow-hidden ${
      expert.isPro 
      ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30' 
      : 'bg-white/5 border-white/10 hover:border-purple-500/50'
    }`}
  >
    {expert.isPro && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />}
    
    <div className="relative w-32 h-32 shrink-0 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/5">
      <img src={expert.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={expert.name} />
    </div>

    <div className="flex-1 flex flex-col justify-between py-1">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <h3 className={`font-bold text-xl transition-colors ${expert.isPro ? 'text-amber-400' : 'group-hover:text-purple-400'}`}>{expert.name}</h3>
           <div className="flex gap-1">
             {expert.isVerified && <ShieldCheck className="w-4 h-4 text-purple-400 fill-purple-400/20" />}
             {expert.isPro && <Gem className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
           </div>
        </div>
        <p className="text-gray-400 font-medium mb-1">{expert.profession}</p>
        <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
           <Phone className="w-4 h-4" /> 
           <span className="text-sm">+998 90 *** ** **</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
           <MapPin className="w-4 h-4 text-purple-500" /> 
           <span>Distance: <b>{expert.distance}</b></span>
        </div>
        <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
           <Star className="w-4 h-4 fill-current" /> 
           <span>Rate: {expert.rating} ({expert.reviews} reviews)</span>
        </div>
      </div>
    </div>

    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
       <div className="p-2 rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/40">
          <ChevronRight className="w-5 h-5" />
       </div>
    </div>
  </motion.div>
);

const AuthGuardAlert = ({ onCancel, onConfirm }: { onCancel: () => void, onConfirm: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card max-w-sm w-full p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-6">
         <X className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-4">Registration Required</h3>
      <p className="text-gray-400 mb-8 text-sm leading-relaxed">Detailed information can only be viewed after registration. Do you want to register?</p>
      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold">No</button>
        <button onClick={onConfirm} className="glow-button px-6 py-3 rounded-xl text-sm font-bold">Yes</button>
      </div>
    </motion.div>
  </motion.div>
);

const ExpertExplorer: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(null);

  const experts: Expert[] = [
    { id: 1, name: 'Anvar Toshov', profession: 'Santexnik', distance: '450 metr', rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=400&h=400&fit=crop', isVerified: true, isPro: true },
    { id: 2, name: 'Dilnoza Aliyeva', profession: 'Advokat', distance: '1200 metr', rating: 4.8, reviews: 89, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', isVerified: true, isPro: false },
    { id: 3, name: 'Aziz Rahmonov', profession: 'Elektrik', distance: '800 metr', rating: 4.7, reviews: 56, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', isVerified: false, isPro: false },
    { id: 4, name: 'Nigora Karimova', profession: 'Ustoz (Matematika)', distance: '2500 metr', rating: 5.0, reviews: 210, image: 'https://images.unsplash.com/photo-1580894732444-8ecdead79733?w=400&h=400&fit=crop', isVerified: false, isPro: false },
  ];

  const handleExpertClick = (id: number) => {
    if (!isAuthenticated) {
      setShowAlert(true);
    } else {
      setSelectedExpertId(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col relative">
      <AnimatePresence>
        {showAlert && <AuthGuardAlert onCancel={() => setShowAlert(false)} onConfirm={() => { setShowAlert(false); }} />}
        {selectedExpertId && <ExpertDetails expertId={selectedExpertId} onBack={() => setSelectedExpertId(null)} />}
      </AnimatePresence>

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expert Explorer</h1>
          <p className="text-gray-400">Discover top-rated professionals right in your neighborhood.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'list' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'map' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        <div className={`flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar ${view === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by profession or name..." 
              className="input-field pl-12 mb-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {experts.map(expert => (
              <ExpertCard key={expert.id} expert={expert} onClick={() => handleExpertClick(expert.id)} />
            ))}
          </div>
        </div>

        <div className={`flex-1 rounded-3xl overflow-hidden glass-card relative min-h-[400px] ${view === 'list' ? 'hidden lg:block lg:flex-[0.8]' : 'block flex-1'}`}>
          <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <MapPin className="w-12 h-12 animate-bounce text-purple-500" />
              <p className="font-medium">Interactive Map Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertExplorer;
