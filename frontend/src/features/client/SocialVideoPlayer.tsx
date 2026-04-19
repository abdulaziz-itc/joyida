import React, { useState, useEffect, useRef } from 'react';
import { VideoOff, Loader2 } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface SocialVideoPlayerProps {
  url: string;
  isMuted: boolean;
  isPlaying?: boolean;
}

declare global {
  interface Window {
    instgrm?: any;
  }
}

const SocialVideoPlayer = ({ url, isMuted, isPlaying = false }: SocialVideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [directUrl, setDirectUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getPlatform = (link: string) => {
    if (link.includes('instagram.com')) return 'instagram';
    if (link.includes('tiktok.com')) return 'tiktok';
    if (link.includes('youtube.com') || link.includes('youtu.be')) return 'youtube';
    return 'native';
  };

  const platform = getPlatform(url);

  // Resolve Instagram Direct URL
  useEffect(() => {
    let isMounted = true;
    if (platform === 'instagram') {
      setIsLoading(true);
      apiClient.get(`/utils/resolve-instagram?url=${encodeURIComponent(url)}`)
        .then(res => {
          if (isMounted && res.data.direct_url) {
            setDirectUrl(res.data.direct_url);
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error("IG Resolve failed, falling back to iframe", err);
          if (isMounted) {
            setIsLoading(false);
            // We don't set error here, we'll just fall back to iframe
          }
        });
    } else {
      setDirectUrl(null);
    }
    return () => { isMounted = false; };
  }, [url, platform]);

  // Load Instagram Embed Script (Fallback)
  useEffect(() => {
    if (platform === 'instagram' && !directUrl) {
      if (!window.instgrm) {
        const script = document.createElement('script');
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = () => {
          if (window.instgrm) window.instgrm.Embeds.process();
        };
      } else {
        window.instgrm.Embeds.process();
      }
    }
  }, [url, platform, directUrl]);

  // Handle Play/Pause for Native Video
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.debug("Autoplay blocked or failed", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, directUrl, url]);

  const getInstagramEmbedUrl = (link: string) => {
    let cleanUrl = link.split('?')[0];
    if (cleanUrl.includes('/reels/')) {
        cleanUrl = cleanUrl.replace('/reels/', '/p/');
    }
    const slash = cleanUrl.endsWith('/') ? '' : '/';
    return `${cleanUrl}${slash}embed/captioned/`;
  };

  const getTikTokEmbedUrl = (link: string) => {
    const match = link.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}?autoplay=${isPlaying ? 1 : 0}`;
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
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1`;
  };

  if (hasError) {
    return (
      <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-white/20 gap-4">
        <VideoOff size={48} />
        <span className="text-xs font-black uppercase tracking-widest text-center">Video o'ynatilmadi</span>
      </div>
    );
  }

  // Use native video player if it's a direct file or a successfully resolved Instagram video
  const isDirectPlayable = platform === 'native' || (platform === 'instagram' && !!directUrl);

  return (
    <div className="w-full h-full relative bg-black/20 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {isDirectPlayable && (
        <video 
          ref={videoRef}
          src={directUrl || url} 
          loop 
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
              if (platform === 'instagram') {
                  setDirectUrl(null); // Fallback to iframe if direct mp4 fails to load
              } else {
                  setHasError(true);
              }
          }}
          className="w-full h-full object-cover"
        />
      )}

      {!isDirectPlayable && platform === 'instagram' && (
        <iframe
          key={`insta-${isPlaying}`}
          src={getInstagramEmbedUrl(url)}
          className="w-full h-[105%] border-none -mt-4"
          allowTransparency
          allowFullScreen
          scrolling="no"
          allow="autoplay"
          onLoad={() => {
            setIsLoading(false);
            if (window.instgrm) window.instgrm.Embeds.process();
          }}
          onError={() => setHasError(true)}
        />
      )}

      {platform === 'tiktok' && (
        <iframe
          key={`tiktok-${isPlaying}`}
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
          key={`yt-${isPlaying}`}
          src={getYoutubeEmbedUrl(url)}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default SocialVideoPlayer;
