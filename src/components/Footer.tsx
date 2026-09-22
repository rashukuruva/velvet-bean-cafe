import React from 'react';
import { Coffee, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-[#3E2723] text-[#EFEBE9] pt-16 pb-12 border-t border-[#5D4037]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EFEBE9] text-[#3E2723] flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif-title font-bold text-2xl text-[#FFF8F2]">Velvet Bean</span>
            </div>
            <p className="text-sm text-[#D7CCC8] leading-relaxed">
              Crafting micro-roasted specialty coffees, slow-fermented French pastries, and moments of quiet bliss in a warm, welcoming community space.
            </p>
            <div className="font-handwriting text-xl text-[#D7CCC8] pt-2">
              "A little cup of happiness, freshly brewed every day." ☕
            </div>
          </div>

          {/* Col 2: Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-serif-title text-lg font-semibold text-[#FFF8F2] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A1887F]" />
              Opening Hours
            </h4>
            <div className="space-y-2 text-sm text-[#D7CCC8]">
              <div className="flex justify-between border-b border-[#5D4037]/50 pb-1.5">
                <span>Monday - Friday</span>
                <span className="font-medium text-[#FFF8F2]">7:00 AM – 8:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-[#5D4037]/50 pb-1.5">
                <span>Saturday</span>
                <span className="font-medium text-[#FFF8F2]">8:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-[#5D4037]/50 pb-1.5">
                <span>Sunday Brunch</span>
                <span className="font-medium text-[#FFF8F2]">8:00 AM – 7:00 PM</span>
              </div>
              <p className="text-xs text-[#A1887F] pt-1">
                *Kitchen closes 45 minutes before closing. Coffee & pastries served till close.
              </p>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-4">
            <h4 className="font-serif-title text-lg font-semibold text-[#FFF8F2]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#D7CCC8]">
              {['Home', 'Menu', 'Reservations', 'Gallery', 'About', 'Reviews', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      setCurrentTab(item.toLowerCase());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FFF8F2] hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="text-[#A1887F] text-xs">🫘</span> {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Visit & Contact */}
          <div className="space-y-4">
            <h4 className="font-serif-title text-lg font-semibold text-[#FFF8F2]">
              Visit Our Café
            </h4>
            <div className="space-y-3 text-sm text-[#D7CCC8]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A1887F] shrink-0 mt-0.5" />
                <span>42 Blossom Lane, Artisan Quarter, Old Town</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A1887F] shrink-0" />
                <span>+1 (555) 234-BEAN (2326)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A1887F] shrink-0" />
                <span>hello@velvetbeancafe.com</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-[#A1887F] font-semibold block mb-2">
                Special Promo
              </span>
              <div className="bg-[#4E342E] p-3 rounded-xl border border-[#5D4037] text-xs">
                Use code <span className="font-mono font-bold text-[#FFD54F]">COZYBEAN10</span> for 10% off your first online order!
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#5D4037] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1887F]">
          <p>© 2026 Velvet Bean Café. All rights reserved. Crafted with care and roasted daily.</p>
          <div className="flex items-center gap-1 text-[#D7CCC8]">
            <span>Brewed with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 mx-0.5 inline" />
            <span>for coffee lovers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
