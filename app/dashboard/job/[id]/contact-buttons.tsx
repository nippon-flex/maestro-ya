'use client';

import { Phone, Mail } from 'lucide-react';

interface ContactButtonsProps {
  email: string;
  name: string;
}

export function ContactButtons({ email, name }: ContactButtonsProps) {
  const handleCall = () => {
    alert('💡 Para llamar al maestro:\n\n1. Usa el chat (próximamente)\n2. Contáctalo por email\n\nPronto agregaremos números de teléfono verificados.');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Trabajo - ${name} - Maestro-Ya`);
    const body = encodeURIComponent(`Hola,\n\nMe gustaría coordinar sobre el trabajo.\n\nSaludos!`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={handleCall}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg"
      >
        <Phone className="w-5 h-5" />
        Llamar
      </button>
      <button 
        onClick={handleEmail}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
      >
        <Mail className="w-5 h-5" />
        Enviar Email
      </button>
    </div>
  );
}