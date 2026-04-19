import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, MessageCircle, Heart, Share2, MapPin, Star, VideoOff, Search, Plus, Filter, User } from 'lucide-react';
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
  };

  return (
    <div className="flex w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-background overflow-hidden">
      
      {/* Upload Modal */}
      <UploadReelModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => fetchReels('', activeTab === 'my-works')}
      />

      {/* Sidebar / Controls Area */}
      <div className="w-80 border-r border-glass-border bg-glass-bg backdrop-blur-xl hidden lg:flex flex-col p-8 z-20">
        <h2 className="text-3xl font-black font-display text-foreground mb-8 tracking-tight">{t('reels.title', 'Reels')}</h2>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('reels.search_placeholder', 'Search reels...')}
            className="w-full bg-input-bg border border-input-border rounded-2xl py-4 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
          />
        </form>

        {/* Tabs */}
        <div className="flex flex-col gap-2 mb-8">
           <TabButton 
             active={activeTab === 'explore'} 
             onClick={() => setActiveTab('explore')}
             icon={<Filter size={18} />}
             label={t('reels.explore', 'Explore')}
           />
           {user?.role === 'expert' && (
             <TabButton 
               active={activeTab === 'my-works'} 
               onClick={() => setActiveTab('my-works')}
               icon={<User size={18} />}
               label={t('reels.my_works', 'My Works')}
             />
           )}
        </div>

        {/* Upload Button (Experts Only) */}
        {user?.role === 'expert' && (
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="glow-button w-full mt-auto group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            {t('reels.upload_work', 'Upload Work')}
          </button>
        )}
      </div>

      {/* Main Feed Content */}
      <div className="flex-1 h-full bg-black relative overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        
        {/* Mobile Controls Overlay */}
        <div className="fixed top-24 right-8 z-50 flex flex-col gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 bg-glass-bg backdrop-blur-3xl border border-glass-border rounded-2xl text-foreground hover:bg-primary/10 transition-all shadow-premium group"
          >
            {isMuted ? <VolumeX className="group-hover:scale-110 transition-transform" /> : <Volume2 className="group-hover:scale-110 transition-transform" />}
          </button>
        </div>

        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-background">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow-primary" />
          </div>
        ) : reels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-background">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 border border-primary/10 shadow-glow-primary">
              <VideoOff className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">{t('reels.no_videos')}</h2>
            <p className="text-foreground/60 max-w-sm font-medium leading-relaxed">
              {t('reels.no_videos_desc')}
            </p>
          </div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="w-full h-full snap-start relative flex justify-center items-center bg-black">
              
              {/* Main Video Container */}
              <div className="relative w-full max-w-xl h-full bg-black md:border-x border-white/5 overflow-hidden shadow-2xl group">
                <SocialVideoPlayer url={reel.video_url || ''} isMuted={isMuted} />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 pb-12">
                  <div className="flex items-end justify-between gap-6">
                    
                    {/* Left Side: Info */}
                    <div className="flex-1 text-white">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3 mb-6"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black backdrop-blur-xl">
                          {reel.expert?.full_name?.charAt(0) || reel.owner?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-black text-lg tracking-tight">@{reel.expert?.full_name?.toLowerCase().replace(' ', '_') || reel.owner?.full_name?.toLowerCase().replace(' ', '_') || 'user'}</h3>
                          <p className="text-primary text-xs font-bold uppercase tracking-widest">{reel.category || reel.expert?.profession || t('reels.profession_fallback')}</p>
                        </div>
                        {user?.id !== (reel.owner_id || reel.expert?.id) && (
                          <button className="ml-4 px-4 py-1.5 bg-primary text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-primary-hover transition-colors">
                            {t('reels.follow')}
                          </button>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h4 className="font-bold text-xl mb-2 tracking-tight">{reel.title || t('reels.fallback_title')}</h4>
                        <p className="text-white/70 text-sm leading-relaxed max-w-md line-clamp-3 mb-6">
                          {reel.description || t('reels.fallback_desc')}
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             <MapPin size={14} className="text-primary" /> {t('reels.location_fallback')}
                           </div>
                           <div className="px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             <Star size={14} className="text-amber-400" /> 4.9
                           </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex flex-col gap-6 items-center">
                      <ReelActionButton icon={<Heart size={28} />} label="4.2k" color="hover:text-red-500" />
                      <ReelActionButton icon={<MessageCircle size={28} />} label="128" color="hover:text-blue-500" />
                      <ReelActionButton icon={<Share2 size={28} />} label="24" color="hover:text-green-500" />
                      <div className="w-12 h-12 rounded-full border-2 border-white/20 p-1 animate-spin-slow">
                         <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-secondary" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
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

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
      active 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-primary/10' 
        : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ReelActionButton = ({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) => (
  <button className={`flex flex-col items-center gap-1 group transition-all`}>
    <div className={`w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-white/20 ${color} group-hover:scale-110 shadow-premium`}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{label}</span>
  </button>
);

export default ReelsFeedPage;
