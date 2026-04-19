import React from 'react';

interface SocialVideoPlayerProps {
  url: string;
  isMuted: boolean;
}

const SocialVideoPlayer = ({ url, isMuted }: SocialVideoPlayerProps) => {
  // Helper to detect platform
  const getPlatform = (link: string) => {
    if (link.includes('instagram.com')) return 'instagram';
    if (link.includes('tiktok.com')) return 'tiktok';
    return 'native';
  };

  const platform = getPlatform(url);

  // Transform Instagram link to embed URL
  const getInstagramEmbedUrl = (link: string) => {
    const cleanUrl = link.split('?')[0];
    const slash = cleanUrl.endsWith('/') ? '' : '/';
    return `${cleanUrl}${slash}embed/captioned/`;
  };

  // Transform TikTok link to embed URL
  const getTikTokEmbedUrl = (link: string) => {
    // Basic extraction of ID
    const match = link.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`;
    }
    return link;
  };

  if (platform === 'instagram') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <iframe
          src={getInstagramEmbedUrl(url)}
          className="w-full h-full border-none"
          allowTransparency
          allowFullScreen
          scrolling="no"
        />
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <iframe
          src={getTikTokEmbedUrl(url)}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  // Native Video Player
  return (
    <video 
      src={url} 
      autoPlay 
      loop 
      muted={isMuted}
      playsInline
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
    />
  );
};

export default SocialVideoPlayer;
