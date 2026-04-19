import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, MessageCircle, Heart, Share2, 
  MapPin, Star, VideoOff, Search, Plus, Filter, User, 
  Eye, Copy, Check 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import UploadReelModal from './UploadReelModal';
import SocialVideoPlayer from './SocialVideoPlayer';

const ReelsFeedPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'my-works'>('explore');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const fetchReels = async (query = '', owned = false) => {
    setLoading(true);
    try {
      const endpoint = owned ? '/projects/' : '/projects/public';
      const response = await apiClient.get(endpoint, {
        params: { search: query }
      });
      setReels(response.data);
    } catch (err) {
      console.error("Error fetching reels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels(searchQuery, activeTab === 'my-works');
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReels(searchQuery, activeTab === 'my-works');
    setShowSearch(false);
  };

  const copyToClipboard = (reelId: number) => {
    const url = `${window.location.origin}/reels/${reelId}`;
    navigator.clipboard.writeText(url);
    // Could add a toast here
  };

  return (
    <div className="flex w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-black overflow-hidden relative">
      
      {/* Upload Modal */}
      <UploadReelModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => fetchReels('', activeTab === 'my-works')}
      />

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`text-lg font-black tracking-tight transition-all ${activeTab === 'explore' ? 'text-white scale-110' : 'text-white/40 hover:text-white/70'}`}
          >
            {t('reels.explore')}
          </button>
          {user?.role === 'expert' && (
            <button 
              onClick={() => setActiveTab('my-works')}
              className={`text-lg font-black tracking-tight transition-all ${activeTab === 'my-works' ? 'text-white scale-110' : 'text-white/40 hover:text-white/70'}`}
            >
              {t('reels.my_works')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-3 bg-white/10 backdrop-blur-3xl rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all"
          >
            <Search size={22} />
          </button>
          {user?.role === 'expert' && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-glow-primary hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> {t('reels.upload_work')}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Search Bar Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-6"
          >
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('reels.search_placeholder')}
                className="w-full bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:border-primary/50 transition-all shadow-2xl"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feed Content */}
      <div className="flex-1 h-full bg-black relative overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        
        {/* Mute Button Overlay */}
        <div className="fixed top-24 right-8 z-40 flex flex-col gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-premium"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>

        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow-primary" />
          </div>
        ) : reels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black text-white">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 border border-primary/10 shadow-glow-primary">
              <VideoOff className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">{t('reels.no_videos')}</h2>
            <p className="text-white/50 max-w-sm font-medium leading-relaxed">
              {t('reels.no_videos_desc')}
            </p>
          </div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="w-full h-full snap-start relative flex justify-center items-center bg-black">
              
              {/* Main Video Area */}
              <div className="relative w-full max-w-[450px] h-[95vh] rounded-[2.5rem] bg-black overflow-hidden shadow-2xl group border border-white/5">
                <SocialVideoPlayer url={reel.video_url || ''} isMuted={isMuted} />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
                
                {/* Info Overlay (Bottom) */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 pb-10">
                   <div className="flex items-end justify-between gap-6 overflow-hidden">
                     
                     {/* Left: Metadata */}
                     <div className="flex-1 text-white">
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-3 mb-5"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black backdrop-blur-xl">
                            {reel.expert?.full_name?.charAt(0) || reel.owner?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-black text-lg tracking-tight">@{reel.expert?.full_name?.toLowerCase().replace(' ', '_') || reel.owner?.full_name?.toLowerCase().replace(' ', '_') || 'user'}</h3>
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest">{reel.category || reel.expert?.profession || t('reels.profession_fallback')}</p>
                          </div>
                          {user?.id !== (reel.owner_id || reel.expert?.id) && (
                            <button className="ml-2 px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-tighter rounded-xl hover:bg-primary hover:text-white transition-all">
                              {t('reels.follow')}
                            </button>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="max-w-[85%]"
                        >
                          <h4 className="font-bold text-xl mb-2 tracking-tight line-clamp-1">{reel.title || t('reels.fallback_title')}</h4>
                          <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-6">
                            {reel.description || t('reels.fallback_desc')}
                          </p>
                          <div className="flex items-center gap-3">
                             <div className="px-4 py-2 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <MapPin size={12} className="text-primary" /> {t('reels.location_fallback')}
                             </div>
                             <div className="px-4 py-2 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <Star size={12} className="text-amber-400" /> 4.9
                             </div>
                          </div>
                        </motion.div>
                     </div>

                   </div>
                </div>

                {/* Vertical Interaction Bar (Right) */}
                <div className="absolute right-4 bottom-24 z-30 flex flex-col gap-6 items-center">
                  <ReelInteractionButton 
                    icon={<Heart size={28} className="drop-shadow-glow" />} 
                    label={reel.likes_count || '2.4k'} 
                    color="hover:text-red-500" 
                  />
                  <ReelInteractionButton 
                    icon={<MessageCircle size={28} />} 
                    label="48" 
                    color="hover:text-primary" 
                  />
                  <ReelInteractionButton 
                    icon={<Eye size={28} />} 
                    label={reel.views_count || '12.1k'} 
                    color="hover:text-blue-400" 
                  />
                  <button 
                    onClick={() => copyToClipboard(reel.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110">
                      <Share2 size={28} />
                    </div>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">SHARE</span>
                  </button>
                  
                  {/* Spinning Vinyl Icon */}
                  <div className="w-12 h-12 rounded-full border-4 border-white/10 p-1 animate-spin-slow mt-4">
                     <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5">
                       <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                       </div>
                     </div>
                  </div>
                </div>

                {/* Progress Bar (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
                   <motion.div 
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      className="h-full bg-primary shadow-glow-primary" 
                   />
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ReelInteractionButton = ({ icon, label, color }: { icon: React.ReactNode, label: string | number, color: string }) => (
  <button className={`flex flex-col items-center gap-1 group transition-all`}>
    <div className={`w-14 h-14 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-white/20 ${color} group-hover:scale-110 shadow-premium`}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{label}</span>
  </button>
);

export default ReelsFeedPage;
