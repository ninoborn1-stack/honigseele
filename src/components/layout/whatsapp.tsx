'use client';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { site } from '@/content';

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/buchen') || pathname.startsWith('/kasse')) return null;
  return (
    <a
      href={site.settings.contact.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Schreib uns auf WhatsApp"
      className="fixed bottom-24 right-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-card text-honey-950 shadow-lg shadow-honey-950/15 ring-1 ring-line-soft transition-transform hover:scale-105 md:bottom-6 md:right-6"
    >
      <MessageCircle strokeWidth={1.5} className="h-5 w-5" />
    </a>
  );
}
