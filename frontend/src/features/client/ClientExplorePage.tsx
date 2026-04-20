import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const ClientExplorePage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRealMap, setShowRealMap] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [searchRadius, setSearchRadius] = useState(500);
  const [searchStatus, setSearchStatus] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.311081, 69.240562]);

  const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  
  // Observe theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setCurrentTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowRealMap(true);
    setSelectedSpecialist(null);
    setSpecialists([]);

    const thresholds = [500, 1000, 5000, 10000];
    const zooms = [15.5, 14.5, 12, 10.5];

    for (let i = 0; i < thresholds.length; i++) {
        setSearchRadius(thresholds[i]);
        const radiusVal = thresholds[i] >= 1000 ? thresholds[i]/1000 : thresholds[i];
        const statusText = thresholds[i] >= 1000 
          ? t('explore.searching_in_km', { radius: radiusVal })
          : t('explore.searching_in', { radius: radiusVal });
          
        setSearchStatus(statusText);
        
        try {
            const response = await apiClient.get('/experts/nearby', {
                params: { 
                    lat: userLocation[0], 
                    lon: userLocation[1], 
                    radius: thresholds[i] / 1000,
                    category: searchQuery
                }
            });
            
            if (response.data.length > 0) {
                setSpecialists(response.data);
                break;
            }
        } catch (error) {
            console.error("Search error", error);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    setIsSearching(false);
    setSearchStatus('');
  };

  // Custom marker icon creator
  const createCustomIcon = (price: number) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex flex-col items-center">
          <div class="bg-primary px-2 py-1 rounded-lg border-2 border-white shadow-xl text-white text-[10px] font-black whitespace-nowrap">
            $${price}
          </div>
          <div class="w-2 h-2 bg-primary rounded-full mt-[-2px] border border-white shadow-md"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 30]
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-theme(spacing.16))] md:h-screen overflow-hidden bg-background">
      
      {/* Full-screen Background Layer */}
      <motion.div 
        key={currentTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ 
          backgroundImage: currentTheme === 'light' ? 'url("/assets/specialist-map-light.png")' : 'url("/assets/globe-realistic.png")',
        }}
      />
      
      {/* Background Overlays for Depth and Contrast */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ${
        currentTheme === 'light' 
          ? 'bg-gradient-to-b from-white/40 via-transparent to-white/40' 
          : 'bg-gradient-to-b from-black/60 via-transparent to-black/80'
      }`} />
      <div className="fixed inset-0 z-0 backdrop-blur-[1px] pointer-events-none" />

      {/* Real Map Layer */}
      <AnimatePresence>
        {showRealMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0"
          >
            <MapContainer 
               center={userLocation} 
               zoom={13} 
               style={{ width: '100%', height: '100%', background: currentTheme === 'light' ? '#f1f5f9' : '#050505' }}
               zoomControl={false}
            >
              <ChangeView center={userLocation} zoom={isSearching ? 12 : 14} />
              <TileLayer
                url={currentTheme === 'light' 
                  ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                }
              />
              {specialists.map(spec => (
                <Marker 
                  key={spec.id} 
                  position={[spec.latitude, spec.longitude]}
                  icon={createCustomIcon(spec.hourly_rate || 0)}
                  eventHandlers={{
                    click: () => setSelectedSpecialist(spec),
                  }}
                />
              ))}
              {isSearching && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none">
                   <div className="w-64 h-64 rounded-full border-2 border-primary/20 bg-primary/5 animate-ping opacity-20" />
                   <div className="absolute inset-0 flex items-center justify-center text-primary font-black animate-pulse whitespace-nowrap">
                      {searchStatus}
                   </div>
                </div>
              )}
            </MapContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foreground UI Layer */}
      <div className="relative z-20 flex flex-col h-full pointer-events-none">
        
        {/* Top Search Area */}
        <div className={`p-8 w-full max-w-4xl mx-auto transition-all duration-1000 ${showRealMap ? 'opacity-90 pt-12' : 'mt-[22vh]'}`}>
          {!showRealMap && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               className="text-center mb-16 pointer-events-auto relative px-12 py-16 rounded-[4rem] bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group/hero overflow-hidden"
             >
                {/* Dynamic background glow inside the glass island */}
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 transition-opacity duration-1000`} />
                <div className={`absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full animate-pulse`} />
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`text-8xl md:text-9xl font-black mb-6 text-transparent bg-clip-text font-display tracking-tighter drop-shadow-2xl ${
                    currentTheme === 'light'
                      ? 'bg-gradient-to-b from-primary/90 via-primary to-primary-hover drop-shadow-[0_10px_20px_rgba(var(--primary-val),0.2)]'
                      : 'bg-gradient-to-b from-white via-white to-primary/60 drop-shadow-[0_0_50px_var(--color-primary-glow)]'
                  }`}
                >
                  Joyida
                </motion.h1>
                <p className={`text-xl font-bold tracking-[3px] max-w-2xl mx-auto leading-relaxed uppercase transition-colors duration-500 drop-shadow-md ${
                  currentTheme === 'light' ? 'text-foreground' : 'text-foreground/80'
                }`}>
                  {t('explore.headline')}
                </p>
             </motion.div>
          )}

          <form onSubmit={handleSearch} className="pointer-events-auto relative group max-w-2xl mx-auto">
            <div className={`absolute inset-0 bg-primary/20 rounded-3xl blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700`} />
            <div className="relative flex items-center bg-glass-bg backdrop-blur-3xl border border-glass-border p-2.5 rounded-3xl shadow-premium group-hover:border-primary/30 transition-all">
              <div className="pl-6">
                <Search className={`w-6 h-6 ${isSearching ? 'text-primary animate-spin' : 'text-foreground/40'}`} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('explore.placeholder')}
                className={`flex-1 bg-transparent border-none focus:ring-0 text-foreground px-6 py-5 text-xl placeholder:text-foreground/40`}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="glow-button !px-10 !py-5 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSearching ? '...' : t('explore.find')}
              </button>
            </div>
          </form>
        </div>

        {/* Selected Specialist Overlay Card */}
        <AnimatePresence>
          {showRealMap && selectedSpecialist && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-8 right-8 w-96 pointer-events-auto"
            >
              <div className="glass-card p-6 border-white/10 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                <button 
                  onClick={() => setSelectedSpecialist(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-foreground/50 hover:text-white transition-colors z-10"
                >
                  &times;
                </button>
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-primary/20 flex items-center justify-center text-xl font-bold">
                     {selectedSpecialist.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedSpecialist.full_name || t('explore.fallback_expert')}</h3>
                    <p className="text-primary text-sm font-medium">{selectedSpecialist.profession || t('explore.fallback_profession')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" /> {selectedSpecialist.rating || t('explore.new')}
                  </div>
                  <div className="text-foreground/60 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {t('explore.nearby')}
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                  {t('explore.view_profile')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ClientExplorePage;
