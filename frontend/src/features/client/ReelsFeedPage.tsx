import React, { useState, useEffect } from 'react';
import { Play, Heart, MessageCircle, Share2, MapPin, VideoOff } from 'lucide-react';
import apiClient from '../../api/apiClient';

const ReelsFeedPage = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="w-full h-screen bg-[#050505] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
       <div className="w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
         <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
           <VideoOff className="w-10 h-10 text-foreground/30" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Hozircha videolar yo'q</h2>
         <p className="text-foreground/50 max-w-md">
           Mutaxassislar hali hech qanday ish namunalarini (reels) joylamagan. Iltimos keyinroq qayta urining.
         </p>
       </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#050505] overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {reels.map((reel) => (
        <div key={reel.id} className="w-full h-full snap-start relative flex justify-center items-center bg-black/50">
          
          {/* Main Video Container */}
          <div className="relative w-full max-w-md h-[90%] md:h-full bg-black md:rounded-2xl overflow-hidden shadow-2xl">
            <video 
              src={reel.video_url || ''} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
            
            {/* Play overlay just for aesthetics */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                 <Play className="w-8 h-8 text-white fill-current ml-1" />
               </div>
            </div>

            {/* Content (Bottom Left) */}
            <div className="absolute bottom-6 left-4 right-16 text-white z-10">
               <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                 {reel.title || 'Loyiha'}
               </h3>
               <p className="text-sm text-gray-200 mb-3">{reel.description || 'Loyiha izohi yo\'q...'}</p>
               <div className="flex items-center gap-2 text-xs font-medium text-white/70 bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                 <MapPin className="w-3.5 h-3.5" /> Joyida Platformasi
               </div>
            </div>

            {/* Actions (Bottom Right) */}
            <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 z-10">
               <button className="flex flex-col items-center gap-1 group">
                 <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                   <Heart className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-white text-xs font-bold">0</span>
               </button>
               
               <button className="flex flex-col items-center gap-1 group">
                 <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                   <MessageCircle className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-white text-xs font-bold">0</span>
               </button>

               <button className="flex flex-col items-center gap-1 group">
                 <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                   <Share2 className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-white text-xs font-bold">Ulashish</span>
               </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelsFeedPage;
