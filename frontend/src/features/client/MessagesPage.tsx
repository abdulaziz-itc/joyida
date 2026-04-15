import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, User } from 'lucide-react';
import apiClient from '../../api/apiClient';

const MessagesPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiClient.get('/chat/rooms');
        setRooms(response.data);
      } catch (err) {
        console.error("Error fetching rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="flex w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#050505]">
      {/* Sidebar for chat list */}
      <div className="w-full md:w-80 border-r border-white/5 bg-[#080808] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-bold font-display text-white mb-4">Xabarlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex items-center justify-center p-6 bg-transparent">
               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
          ) : rooms.length === 0 ? (
            <div className="flex items-center justify-center text-foreground/40 text-sm p-6 text-center h-full">
              Hozircha hech qanday xabarlar yo'q. Mutaxassislar bilan suhbatni boshlang.
            </div>
          ) : (
            <div className="flex flex-col">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                     <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                     <h4 className="text-white font-bold text-sm truncate">{room.other_user?.full_name || 'Foydalanuvchi'}</h4>
                     <p className="text-xs text-foreground/50 truncate w-full">{room.other_user?.profession || 'Mijoz'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#030303]">
         <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
           <MessageSquare className="w-10 h-10 text-foreground/20" />
         </div>
         <h3 className="text-xl font-bold text-white mb-2">Suhbatni tanlang</h3>
         <p className="text-foreground/40 text-sm max-w-sm text-center">Xaritadan loyihangiz uchun mos ustani toping va ularga to'g'ridan to'g'ri xabar yo'llang.</p>
      </div>
    </div>
  );
};

export default MessagesPage;
