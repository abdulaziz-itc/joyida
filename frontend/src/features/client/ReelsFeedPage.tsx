import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, MessageCircle, Heart, Share2, MapPin, Star, VideoOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';

const ReelsFeedPage = () => {
  const { t } = useTranslation();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await apiClient.get('/projects/public');
        setReels(response.data);
      } catch (err) {
        console.error("Error fetching reels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#020205] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#020205] overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      
      {/* Global Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-24 right-8 z-50 p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-premium group"
      >
        {isMuted ? <VolumeX className="group-hover:scale-110 transition-transform" /> : <Volume2 className="group-hover:scale-110 transition-transform" />}
      </button>

      {reels.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-glow-primary">
            <VideoOff className="w-12 h-12 text-foreground/30" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{t('reels.no_videos')}</h2>
          <p className="text-foreground/40 max-w-sm font-medium leading-relaxed">
            {t('reels.no_videos_desc')}
          </p>
        </div>
      ) : (
        reels.map((reel, idx) => (
          <div key={reel.id} className="w-full h-full snap-start relative flex justify-center items-center bg-black">
            
            {/* Main Video Container */}
            <div className="relative w-full max-w-xl h-full bg-black md:border-x border-white/5 overflow-hidden shadow-2xl group">
              <video 
                src={reel.video_url || ''} 
                autoPlay 
                loop 
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              
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
                        {reel.expert?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-black text-lg tracking-tight">@{reel.expert?.full_name?.toLowerCase().replace(' ', '_') || 'expert'}</h3>
                        <p className="text-primary text-xs font-bold uppercase tracking-widest">{reel.expert?.profession || t('reels.profession_fallback')}</p>
                      </div>
                      <button className="ml-4 px-4 py-1.5 bg-primary text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-primary-hover transition-colors">
                        {t('reels.follow')}
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-bold text-xl mb-2 tracking-tight">{reel.title || t('reels.fallback_title')}</h4>
                      <p className="text-white/60 text-sm leading-relaxed max-w-md line-clamp-3 mb-6">
                        {reel.description || t('reels.fallback_desc')}
                      </p>
                      <div className="flex items-center gap-3">
                         <div className="px-4 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={14} className="text-primary" /> {t('reels.location_fallback')}
                         </div>
                         <div className="px-4 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
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
  );
};

const ReelActionButton = ({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) => (
  <button className={`flex flex-col items-center gap-1 group transition-all`}>
    <div className={`w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-white/10 ${color} group-hover:scale-110 shadow-premium`}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">{label}</span>
  </button>
);

export default ReelsFeedPage;
