import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient from '../../api/apiClient';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ClientExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRealMap, setShowRealMap] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [specialists, setSpecialists] = useState<any[]>([]);

  // Real backend call to fetch nearby experts (default to Tashkent center or user's location)
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await apiClient.get('/experts/nearby', {
           params: { lat: 41.311081, lon: 69.240562, radius: 50 }
        });
        setSpecialists(response.data);
      } catch (error) {
        console.error("Error fetching experts", error);
      }
    };
    fetchExperts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate network delay and animation transition
    setTimeout(() => {
      setIsSearching(false);
      setShowRealMap(true);
    }, 1500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-theme(spacing.16))] md:h-screen overflow-hidden bg-[#050505]">
      
      {/* Background Layer: Animated 3D Map Illusion (when not showing real map) */}
      <AnimatePresence>
        {!showRealMap && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10" />
            <motion.div 
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute inset-[-50%] opacity-20"
              style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png"), linear-gradient(120deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundSize: '100px 100px, cover',
                filter: 'blur(2px)'
              }}
            />
            {/* Animated glowing nodes */}
            <motion.div 
               animate={{ opacity: [0.2, 0.8, 0.2] }} 
               transition={{ repeat: Infinity, duration: 3 }}
               className="absolute top-[30%] left-[40%] w-32 h-32 bg-primary/30 rounded-full blur-[50px]" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real Map Layer */}
      <AnimatePresence>
        {showRealMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <MapContainer 
               center={[41.311081, 69.240562]} 
               zoom={13} 
               style={{ width: '100%', height: '100%', background: '#050505' }}
               zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {specialists.map(spec => (
                <Marker 
                  key={spec.id} 
                  position={[spec.latitude || 41.311, spec.longitude || 69.24]}
                  eventHandlers={{
                    click: () => setSelectedSpecialist(spec),
                  }}
                >
                </Marker>
              ))}
            </MapContainer>
            {/* Overlay Gradient for seamless UI blending */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Foreground UI Layer */}
      <div className="relative z-20 flex flex-col h-full pointer-events-none">
        
        {/* Top Search Area */}
        <div className={`p-8 w-full max-w-3xl mx-auto transition-all duration-1000 ${showRealMap ? 'opacity-90' : 'mt-[20vh]'}`}>
          {!showRealMap && (
             <div className="text-center mb-8 pointer-events-auto">
               <motion.div 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-blue-400 font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-md"
               >
                 <MapPin className="w-3.5 h-3.5" /> Qidiruv Rejimi
               </motion.div>
               <h1 className="text-5xl font-black text-white font-display tracking-tight mb-4 text-gradient">
                 O'z Ustangizni Toping.
               </h1>
               <p className="text-foreground/60 text-lg">
                 Yaqin atrofingizdagi minglab tasdiqlangan mutaxassislarni qidiring.
               </p>
             </div>
          )}

          <form onSubmit={handleSearch} className="pointer-events-auto relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity ${isSearching ? 'animate-pulse opacity-60' : ''}`} />
            <div className="relative flex items-center bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
              <div className="pl-4">
                <Search className={`w-6 h-6 ${isSearching ? 'text-primary animate-spin' : 'text-foreground/40'}`} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kasb, ism yoki manzil bo'yicha qidirish..."
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-foreground/30"
              />
              <button 
                type="button"
                className="p-3 hover:bg-white/5 rounded-xl transition-colors text-foreground/40 hover:text-white mr-2"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSearching ? 'Qidirilmoqda...' : 'Qidirish'}
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
                    <h3 className="text-xl font-bold text-white">{selectedSpecialist.full_name || 'Mutaxassis'}</h3>
                    <p className="text-primary text-sm font-medium">{selectedSpecialist.profession || 'Usta'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" /> {selectedSpecialist.rating || 'Yangi'}
                  </div>
                  <div className="text-foreground/40 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Yaqin atrofda
                  </div>
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                  Profilni Ko'rish <ArrowRight className="w-4 h-4" />
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
