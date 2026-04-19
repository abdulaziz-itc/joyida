import React, { useState } from 'react';
import { VideoOff, Loader2 } from 'lucide-react';

interface SocialVideoPlayerProps {
  url: string;
  isMuted: boolean;
}

const SocialVideoPlayer = ({ url, isMuted }: SocialVideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to detect platform
  const getPlatform = (link: string) => {
    if (link.includes('instagram.com')) return 'instagram';
    if (link.includes('tiktok.com')) return 'tiktok';
    if (link.includes('youtube.com') || link.includes('youtu.be')) return 'youtube';
    return 'native';
  };

  const platform = getPlatform(url);

  const getInstagramEmbedUrl = (link: string) => {
    const cleanUrl = link.split('?')[0];
    const slash = cleanUrl.endsWith('/') ? '' : '/';
    return `${cleanUrl}${slash}embed`;
  };

  const getTikTokEmbedUrl = (link: string) => {
    const match = link.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
    return link;
  };

  const getYoutubeEmbedUrl = (link: string) => {
    let videoId = '';
    if (link.includes('shorts/')) {
      videoId = link.split('shorts/')[1]?.split('?')[0];
    } else if (link.includes('v=')) {
      videoId = link.split('v=')[1]?.split('&')[0];
    } else if (link.includes('youtu.be/')) {
      videoId = link.split('youtu.be/')[1]?.split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}`;
  };

  if (hasError) {
    return (
      <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-white/20 gap-4">
        <VideoOff size={48} />
        <span className="text-xs font-black uppercase tracking-widest">Video Topilmadi</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black/20">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {platform === 'instagram' && (
        <iframe
          src={getInstagramEmbedUrl(url)}
          className="w-full h-full border-none"
          allowTransparency
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}

      {platform === 'tiktok' && (
        <iframe
          src={getTikTokEmbedUrl(url)}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}

      {platform === 'youtube' && (
        <iframe
          src={getYoutubeEmbedUrl(url)}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}

      {platform === 'native' && (
        <video 
          src={url} 
          autoPlay 
          loop 
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default SocialVideoPlayer;
