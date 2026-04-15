import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, User, ArrowLeft, Phone, MoreVertical, Plus, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';

const MessagesPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const fetchMessages = async (roomId: number) => {
    try {
      const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Polling for new messages in active room
  useEffect(() => {
    if (!activeRoom) return;
    
    fetchMessages(activeRoom.id);
    const interval = setInterval(() => {
      fetchMessages(activeRoom.id);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || isSending) return;

    setIsSending(true);
    try {
      await apiClient.post(`/chat/rooms/${activeRoom.id}/messages`, null, {
        params: { text: newMessage }
      });
      setNewMessage('');
      fetchMessages(activeRoom.id);
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-theme(spacing.16))] md:h-screen bg-[#050505] overflow-hidden">
      
      {/* Sidebar for chat list */}
      <div className={`w-full md:w-96 border-r border-white/5 bg-[#080808] flex flex-col transition-all ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5 bg-[#0a0a0a]">
          <h2 className="text-3xl font-black font-display text-white mb-6 tracking-tight">Xabarlar</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Suhbatlarni qidirish..." 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/30 transition-all placeholder:text-foreground/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="flex items-center justify-center p-12">
               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-foreground/30 text-center p-12 h-64">
              <MessageSquare size={48} className="mb-4 opacity-10" />
              <p className="text-sm">Hozircha suhbatlar yo'q</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  onClick={() => setActiveRoom(room)}
                  className={`flex items-center gap-4 p-6 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${activeRoom?.id === room.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                       {room.other_user?.profile_picture_url ? (
                         <img src={room.other_user.profile_picture_url} className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-6 h-6" />
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#080808]" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="text-white font-bold text-base truncate">{room.other_user?.full_name || 'Noma\'lum'}</h4>
                       <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">
                         {room.last_message?.created_at ? new Date(room.last_message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                       </span>
                     </div>
                     <p className="text-xs text-foreground/40 truncate font-medium">
                       {room.last_message?.text || room.other_user?.profession || 'Mutaxassis'}
                     </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className={`flex-1 flex flex-col bg-[#030303] relative ${!activeRoom ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
         {activeRoom ? (
           <>
             {/* Chat Header */}
             <div className="p-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-3xl sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveRoom(null)} className="md:hidden p-2 text-white/50 hover:text-white mr-2">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 overflow-hidden">
                    {activeRoom.other_user?.profile_picture_url ? (
                         <img src={activeRoom.other_user.profile_picture_url} className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-5 h-5" />
                       )}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">{activeRoom.other_user?.full_name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <p className="text-xs text-green-500/80 font-bold uppercase tracking-wider">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 transition-colors">
                     <Phone size={20} />
                   </button>
                   <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-xl text-primary transition-colors">
                     <MoreVertical size={20} />
                   </button>
                </div>
             </div>

             {/* Messages View */}
             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-foreground/20">
                     <MessageSquare size={64} className="mb-4 opacity-5" />
                     <p className="text-sm font-bold uppercase tracking-widest">Hali xabarlar yo'q</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[70%] p-5 rounded-3xl shadow-xl border ${
                          isMe 
                          ? 'bg-primary border-primary text-white rounded-tr-none' 
                          : 'bg-[#111111] border-white/5 text-foreground/80 rounded-tl-none'
                        }`}>
                          <p className="text-[15px] leading-relaxed font-medium">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-foreground/30 font-bold mt-2 uppercase tracking-tighter">
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-8 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
                   <button type="button" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-foreground/50 transition-colors">
                     <Plus size={24} />
                   </button>
                   <div className="flex-1 relative group">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabaringizni yozing..."
                        className="w-full bg-[#111111] border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                      />
                   </div>
                   <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-5 bg-primary hover:bg-primary-hover text-white rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-glow-primary"
                   >
                     {isSending ? (
                       <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <Send size={24} />
                     )}
                   </button>
                </form>
             </div>
           </>
         ) : (
           <div className="flex flex-col items-center">
             <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 border border-primary/10 relative">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
               <MessageSquare className="w-14 h-14 text-primary relative z-10" />
             </div>
             <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Suhbatni tanlang</h3>
             <p className="text-foreground/40 text-base max-w-sm text-center leading-relaxed font-medium">
               Xaritadan loyihangiz uchun mos ustani toping va ularga to'g'ridan to'g'ri xabar yo'llang.
             </p>
           </div>
         )}
      </div>
    </div>
  );
};

export default MessagesPage;
