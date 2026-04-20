import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, MessageCircle, Heart, Share2, 
  MapPin, Star, VideoOff, Search, Plus, 
  Eye, X, PlayCircle, Play, Pause, Edit2, Trash2, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import UploadReelModal from './UploadReelModal';
import SocialVideoPlayer from './SocialVideoPlayer';

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const encodeId = (n: number) => {
  if (n === 0) return ALPHABET[0];
  let arr = [];
  let num = n;
  const base = ALPHABET.length;
  while (num > 0) {
    arr.push(ALPHABET[num % base]);
    num = Math.floor(num / base);
  }
  return arr.reverse().join('');
};

const getFileUrl = (url: string, reelId?: number, type: 'view' | 'thumb' = 'view') => {
  if (!url) return '';
  if (reelId && !url.startsWith('http')) {
     const baseUrl = (import.meta.env.VITE_API_URL as string)?.split('/api/')[0];
     const hash = encodeId(reelId);
     const prefix = type === 'view' ? 'v' : 't';
     return `${baseUrl}/m/${prefix}/${hash}`;
  }
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL as string)?.split('/api/')[0];
  const cleanPath = url.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
};

const ReelsFeedPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'my-works'>('explore');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [viewedReels, setViewedReels] = useState<Set<number>>(new Set());
  const [selectedReel, setSelectedReel] = useState<any | null>(null);
  const [activeReelId, setActiveReelId] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = async (query = '', owned = false) => {
    setLoading(true);
    try {
      const endpoint = owned ? '/projects/' : '/projects/public';
      const response = await apiClient.get(endpoint, {
        params: { search: query }
      });
      const data = response.data;
      setReels(data);
      if (data.length > 0 && activeTab === 'explore') {
        setActiveReelId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching reels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels(searchQuery, activeTab === 'my-works');
  }, [activeTab]);

  // Setup Intersection Observer for playback control
  useEffect(() => {
    if (activeTab !== 'explore' || loading || reels.length === 0) return;

    const observerOptions = {
      root: containerRef.current,
      threshold: 0.6, // Fire when 60% of the reel is visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-reel-id'));
          setActiveReelId(id);
          handleView(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // We need to wait for DOM to render the reels
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[data-reel-item="true"]');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [reels, activeTab, loading]);

  const handleLike = async (reelId: number) => {
    try {
      const response = await apiClient.post(`/projects/${reelId}/like`);
      const updatedReel = response.data;
      setReels(prev => prev.map(r => r.id === reelId ? { 
        ...r, 
        likes_count: updatedReel.likes_count,
        is_liked: updatedReel.is_liked 
      } : r));
      
      if (selectedReel?.id === reelId) {
        setSelectedReel({ 
          ...selectedReel, 
          likes_count: updatedReel.likes_count,
          is_liked: updatedReel.is_liked 
        });
      }
    } catch (err) {
      console.error("Error liking reel", err);
    }
  };

  const handleView = async (reelId: number) => {
    if (viewedReels.has(reelId)) return;
    try {
      const response = await apiClient.post(`/projects/${reelId}/view`);
      const updatedReel = response.data;
      setReels(prev => prev.map(r => r.id === reelId ? { ...r, views_count: updatedReel.views_count } : r));
      if (selectedReel?.id === reelId) {
        setSelectedReel({ ...selectedReel, views_count: updatedReel.views_count });
      }
      setViewedReels(prev => new Set(prev).add(reelId));
    } catch (err) {
      console.error("Error tracking view", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReels(searchQuery, activeTab === 'my-works');
    setShowSearch(false);
  };

  const copyToClipboard = (reelId: number) => {
    const url = `${window.location.origin}/reels/${reelId}`;
    navigator.clipboard.writeText(url);
  };

  const getReelUrl = (url: string) => getFileUrl(url);

  const handleDeleteReel = async (e: React.MouseEvent, reelId: number) => {
    e.stopPropagation();
    if (!window.confirm(t('reels.confirm_delete', 'Ushbu ish namunasini o\'chirishga ishonchingiz komilmi?'))) return;
    
    try {
      await apiClient.delete(`/projects/${reelId}`);
      setReels(prev => prev.filter(r => r.id !== reelId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEditReel = (e: React.MouseEvent, reel: any) => {
    e.stopPropagation();
    setEditingReel(reel);
    setIsUploadModalOpen(true);
  };

  const handleDownload = (reelId: number, title: string) => {
    const hash = encodeId(reelId);
    const baseUrl = (import.meta.env.VITE_API_URL as string)?.split('/api/')[0];
    const downloadUrl = `${baseUrl}/m/d/${hash}`;
    
    // Direct download trigger without opening a persistent tab
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  };

  const handleThumbnailCapture = async (reelId: number, videoElement: HTMLVideoElement) => {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        await apiClient.post(`/utils/save-thumbnail/${reelId}`, { image: imageData });
        
        // Update local state to show the new thumb
        setReels(prev => prev.map(r => r.id === reelId ? { ...r, thumbnail_url: 'updated' } : r));
    } catch (err) {
        console.debug("Thumbnail capture skipped or failed", err);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#050510] overflow-hidden relative font-outfit">
      
      {/* Background Nebula Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <UploadReelModal 
        isOpen={isUploadModalOpen} 
        editingProject={editingReel}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingReel(null);
        }} 
        onSuccess={() => fetchReels('', activeTab === 'my-works')}
      />

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-10 pointer-events-auto">
          <div className="relative group">
            <button 
              onClick={() => setActiveTab('explore')}
              className={`text-xl font-black tracking-tighter transition-all ${activeTab === 'explore' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              {t('reels.explore')}
            </button>
            {activeTab === 'explore' && (
              <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full shadow-glow-primary" />
            )}
          </div>

          {user && (
            <div className="relative group">
              <button 
                onClick={() => setActiveTab('my-works')}
                className={`text-xl font-black tracking-tighter transition-all ${activeTab === 'my-works' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {t('reels.my_works')}
              </button>
              {activeTab === 'my-works' && (
                <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full shadow-glow-primary" />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-3 bg-white/10 backdrop-blur-3xl rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all shadow-premium"
          >
            <Search size={22} />
          </button>
          {user && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-glow-primary hover:scale-105 transition-all flex items-center gap-2"
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

      <div className="flex-1 h-full bg-black relative overflow-y-auto hide-scrollbar">
        {/* Scroll container */}
        <div 
          ref={containerRef}
          className={`w-full h-full ${activeTab === 'explore' ? 'snap-y snap-mandatory overflow-y-scroll' : ''}`}
        >
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
          ) : activeTab === 'explore' ? (
            reels.map((reel) => (
              <FullReelView 
                key={reel.id}
                reel={reel}
                isMuted={isMuted}
                isPlaying={reel.id === activeReelId}
                user={user}
                t={t}
                getReelUrl={getReelUrl}
                handleLike={handleLike}
                copyToClipboard={copyToClipboard}
                onDownload={() => handleDownload(reel.id, reel.title)}
                onCaptureThumb={(video: any) => {
                    if (!reel.thumbnail_url) handleThumbnailCapture(reel.id, video);
                }}
              />
            ))
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1 p-1 pt-24">
              {reels.map((reel) => (
                <ReelGridCard 
                  key={reel.id} 
                  reel={reel} 
                  showControls={activeTab === 'my-works'}
                  onDelete={(e: any) => handleDeleteReel(e, reel.id)}
                  onEdit={(e: any) => handleEditReel(e, reel)}
                  onClick={() => {
                    setSelectedReel(reel);
                    handleView(reel.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Reel Modal Overlay */}
      <AnimatePresence>
        {selectedReel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setSelectedReel(null)}
              className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[110]"
            >
              <X size={24} />
            </button>
            <div className="w-full max-w-[450px] aspect-[9/16] relative">
              <FullReelView 
                reel={selectedReel}
                isMuted={isMuted}
                isPlaying={true}
                user={user}
                t={t}
                getReelUrl={getReelUrl}
                handleLike={handleLike}
                copyToClipboard={copyToClipboard}
                onDownload={() => handleDownload(selectedReel.id, selectedReel.title)}
                onCaptureThumb={(video: any) => {
                    if (!selectedReel.thumbnail_url) handleThumbnailCapture(selectedReel.id, video);
                }}
                isModal
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FullReelView = ({ reel, isMuted, onClose, onDownload, onCaptureThumb, isPlaying, user, t, getReelUrl, handleLike, copyToClipboard, isModal = false }: any) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const handleTogglePlay = () => {
    setIsPaused(!isPaused);
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);
  };

  const getUserHandle = (u: any) => {
    if (!u) return 'user';
    // Priority 1: Full Name
    if (u.full_name && u.full_name.trim()) {
      return u.full_name.toLowerCase().replace(/\s+/g, '_');
    }
    // Priority 2: First Name
    if (u.first_name && u.first_name.trim()) {
      return u.first_name.toLowerCase();
    }
    // Priority 3: Email Prefix (most robust fallback)
    if (u.email) {
      return u.email.split('@')[0].toLowerCase();
    }
    return 'user';
  };

  const handle = getUserHandle(reel.expert || reel.owner);
  const displayName = (reel.expert?.full_name || reel.owner?.full_name) || handle;

  return (
    <div 
      data-reel-item="true"
      data-reel-id={reel.id}
      className={`w-full h-full ${isModal ? '' : 'snap-start'} relative flex justify-center items-center bg-black overflow-hidden`}
    >
      <div className={`relative w-full ${isModal ? 'h-full' : 'max-w-[450px] h-[95vh] rounded-[2.5rem]'} bg-black overflow-hidden shadow-2xl group border border-white/5`}>
        <div 
            className="absolute inset-0 z-0 cursor-pointer"
            onClick={handleTogglePlay}
        >
          <SocialVideoPlayer 
            url={getReelUrl(reel.video_url)} 
            isMuted={isMuted} 
            isPlaying={isPlaying && !isPaused}
            onLoadedData={onCaptureThumb}
          />

          {/* Play/Pause Center Indicator */}
          <AnimatePresence>
              {showPlayIcon && (
                  <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                  >
                      <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                          {isPaused ? <Play size={40} fill="currentColor" /> : <Pause size={40} fill="currentColor" />}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/95 pointer-events-none z-10" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 pb-10 z-20 pointer-events-none">
          <div className="flex items-end justify-between gap-4 overflow-hidden pointer-events-auto">
            <div className="flex-1 text-white">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black backdrop-blur-3xl shadow-premium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-base tracking-tight">@{handle}</h3>
                  <p className="text-primary/80 text-[9px] font-black uppercase tracking-widest">{reel.category || reel.expert?.profession || t('reels.profession_fallback')}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-[90%]"
              >
                <h4 className="font-bold text-lg mb-1 tracking-tight line-clamp-1 text-white/90">{reel.title || t('reels.fallback_title')}</h4>
                <p className="text-white/40 text-[12px] leading-snug line-clamp-2 mb-4 font-medium">
                  {reel.description || t('reels.fallback_desc')}
                </p>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-white/5 backdrop-blur-3xl border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-white/40">
                      <MapPin size={10} className="text-primary/60" /> {t('reels.location_fallback')}
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-16 z-30 flex flex-col gap-6 items-center pointer-events-auto">
          <ReelInteractionButton 
            icon={<Heart size={28} className={reel.is_liked ? "text-red-500 fill-red-500" : "drop-shadow-glow"} />} 
            label={reel.likes_count || 0} 
            color="hover:text-red-500" 
            onClick={() => handleLike(reel.id)}
          />
          <ReelInteractionButton 
            icon={<MessageCircle size={28} />} 
            label={reel.comments_count || 0} 
            color="hover:text-primary" 
          />
          <ReelInteractionButton 
            icon={<Eye size={28} />} 
            label={reel.views_count || 0} 
            color="hover:text-blue-400" 
          />
          <ReelInteractionButton 
            icon={<Download size={28} className="drop-shadow-glow" />} 
            label="Save" 
            color="hover:text-primary" 
            onClick={onDownload}
          />

          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: reel.title,
                  text: reel.description,
                  url: `${window.location.origin}/reels/${reel.id}`
                }).catch(console.error);
              } else {
                copyToClipboard(reel.id);
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 shadow-premium">
              <Share2 size={28} />
            </div>
            <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">SHARE</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden z-10">
            <motion.div 
              initial={{ width: '0%' }}
              animate={isPlaying ? { width: '100%' } : { width: '0%' }}
              transition={isPlaying ? { duration: 15, repeat: Infinity, ease: 'linear' } : {}}
              className="h-full bg-primary shadow-glow-primary" 
            />
        </div>
      </div>
    </div>
  );
};

const ReelGridCard = ({ reel, onClick, showControls, onEdit, onDelete, onDownload }: any) => {
  const [imgError, setImgError] = useState(false);
  
  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('/uploads/reels/');
  };

  const getThumbnail = (url: string) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1] || url.split('/').pop();
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }
    
    // Instagram
    if (url.includes('instagram.com') || url.includes('instagr.am')) {
        // Try to extract shortcode to get thumbnail via media endpoint
        const parts = url.split('?')[0].split('/');
        // Search for 'p', 'reel', or 'reels' and get the next part
        let shortcode = '';
        if (parts.includes('reel')) shortcode = parts[parts.indexOf('reel') + 1];
        else if (parts.includes('reels')) shortcode = parts[parts.indexOf('reels') + 1];
        else if (parts.includes('p')) shortcode = parts[parts.indexOf('p') + 1];
        
        if (shortcode) {
            return `https://www.instagram.com/p/${shortcode}/media/?size=m`;
        }
    }
    
    return null;
  };

  const thumb = reel.thumbnail_url && reel.thumbnail_url !== 'updated' 
    ? getFileUrl(reel.thumbnail_url, reel.id, 'thumb') 
    : getThumbnail(reel.video_url);

  const isDirectVideo = isVideoUrl(reel.video_url);

  // Auto-capture if thumb is missing and it's a direct video
  useEffect(() => {
    if (!reel.thumbnail_url && isDirectVideo && !imgError) {
      const video = document.createElement('video');
      video.src = getFileUrl(reel.video_url, reel.id, 'view');
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.currentTime = 1; // Seek to 1s
      
      const timeout = setTimeout(() => {
          video.onseeked = async () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              if (ctx && canvas.width > 0) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                await apiClient.post(`/utils/save-thumbnail/${reel.id}`, { image: imageData });
              }
            } catch (e) {
              console.debug("Grid capture failed for project", reel.id, e);
            }
          };
      }, 1500); // Small delay to ensure loading
      
      return () => clearTimeout(timeout);
    }
  }, [reel.id, reel.thumbnail_url, isDirectVideo]);

  return (
    <motion.div 
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      className="aspect-[9/16] relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer group border border-white/5 shadow-premium"
    >
      <div className="absolute inset-0" onClick={onClick}>
        {thumb && !imgError ? (
          <img 
            src={thumb} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-all duration-500" 
            alt={reel.title} 
            onError={() => setImgError(true)}
          />
        ) : isDirectVideo ? (
          <div className="w-full h-full relative">
              <video 
                src={getFileUrl(reel.video_url)} 
                className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-all duration-500"
                preload="metadata"
                muted
                playsInline
              />
          </div>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-2" />
            </div>
        )}
      </div>

      {/* Premium Actions Overlay on Hover */}
      <div className="absolute inset-0 flex items-center justify-center z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="flex flex-col gap-3 scale-90 group-hover:scale-100 transition-transform duration-300 pointer-events-auto">
              <div className="flex gap-3">
                  {showControls && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-primary transition-all border border-white/10 shadow-xl"
                        title="Edit"
                      >
                          <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                        className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/30 shadow-xl"
                        title="Delete"
                      >
                          <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-green-500 transition-all border border-white/10 shadow-xl"
                    title="Download"
                  >
                      <Download size={16} />
                  </button>
              </div>
              <button 
                onClick={onClick}
                className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all shadow-glow-primary"
              >
                OPEN WORK
              </button>
          </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-80 group-hover:opacity-20 transition-opacity z-10 pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
        <h5 className="text-white text-[10px] font-bold truncate mb-1 tracking-tight">{reel.title}</h5>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[8px] text-white/50 font-black uppercase tracking-widest">
                <Eye size={8} className="text-primary" /> {reel.views_count || 0}
            </div>
            {reel.is_downloaded && (
                <div className="w-1 h-1 rounded-full bg-green-500" />
            )}
        </div>
      </div>
    </motion.div>
  );
};

const ReelInteractionButton = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group transition-all pointer-events-auto">
    <div className={`w-14 h-14 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-white/20 ${color} group-hover:scale-110 shadow-premium`}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{label}</span>
  </button>
);

export default ReelsFeedPage;
