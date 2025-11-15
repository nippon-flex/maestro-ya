'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  message: string;
  createdAt: string;
  sender: {
    clerkUserId: string;
    name: string;
    photoUrl: string | null;
  };
}

interface ChatProps {
  jobId: string;
}

export default function Chat({ jobId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setCurrentUserId(data.currentUserId);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-500/20">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Chat en Vivo
        </h3>
      </div>

      <div className="h-96 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No hay mensajes aún. ¡Inicia la conversación! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender.clerkUserId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    {msg.sender.photoUrl ? (
                      <img
                        src={msg.sender.photoUrl}
                        alt={msg.sender.name}
                        className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {msg.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={`text-xs mb-1 ${isOwn ? 'text-right' : 'text-left'} text-gray-500`}>
                      {msg.sender.name}
                    </p>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-right' : 'text-left'} text-gray-600`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-3">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder:text-gray-500 resize-none p-3 focus:outline-none focus:border-cyan-500"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 rounded-xl disabled:opacity-50 transition-all"
        >
          {sending ? '...' : '📤'}
        </button>
      </form>

      <p className="text-xs text-gray-600 mt-2 text-center">
        Presiona Enter para enviar • Shift+Enter para nueva línea
      </p>
    </div>
  );
}