import React, { useState, useEffect } from 'react';
import { Coffee, ArrowRight, Star, Heart, Calendar, Sparkles, Clock, ShieldCheck, Flame, Award } from 'lucide-react';
import { MenuItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { addToCart } = useCart();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('Cozy & Relaxed');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data: MenuItem[]) => {
        if (Array.isArray(data)) {
          // Select 4 best sellers
          setFeaturedItems(data.slice(0, 4));
        }
      })
      .catch((err) => console.error('Error fetching featured items:', err));
  }, []);

  const handleQuickAdd = (item: MenuItem) => {
    addToCart(item, 1);
    setAddedNotice(`Added ${item.name} to basket! ☕`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const moods = [
    { title: 'Cozy & Relaxed', drink: 'Vanilla Bean Latte', icon: '🌾' },
    { title: 'Morning Energy', drink: 'Velvet Double Espresso', icon: '⚡' },
    { title: 'Sweet Comfort', drink: 'Café Mocha Royale', icon: '🍫' },
    { title: 'Zen & Focused', drink: 'Ceremonial Green Tea', icon: '🍃' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 sm:pt-40 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[#EFEBE9]/60 via-[#FFF8F2] to-[#FFF8F2]">
        {/* Subtle Decorative Coffee Beans in Background */}
        <div className="absolute top-20 left-10 text-4xl opacity-15 select-none animate-float">🫘</div>
        <div className="absolute top-48 right-16 text-3xl opacity-20 select-none animate-float" style={{ animationDelay: '1.5s' }}>🫘</div>
        <div className="absolute bottom-12 left-1/3 text-2xl opacity-15 select-none animate-float" style={{ animationDelay: '3s' }}>🫘</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEBE9] border border-[#D7CCC8] text-[#5D4037] text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Micro-Roasted Daily • Single-Origin Craft</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3E2723] tracking-tight leading-[1.15]">
                A Little Cup of <br />
                <span className="italic font-serif text-[#795548]">Happiness</span> ☕
              </h1>

              <p className="text-base sm:text-lg text-[#5D4037] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Step into a warm sanctuary of rich aromas, velvety micro-foamed lattes, and slow-fermented French pastries baked fresh every dawn.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-order-now-btn"
                  onClick={() => onNavigate('menu')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#4E342E] hover:bg-[#3E2723] text-[#FFF8F2] rounded-full font-bold text-sm shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  id="hero-explore-menu-btn"
                  onClick={() => onNavigate('menu')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#EFEBE9] text-[#3E2723] border border-[#D7CCC8] rounded-full font-bold text-sm shadow-xs transition-all duration-200"
                >
                  Explore Menu
                </button>

                <button
                  id="hero-book-table-btn"
                  onClick={() => onNavigate('reservations')}
                  className="w-full sm:w-auto px-6 py-3.5 text-[#5D4037] hover:text-[#3E2723] font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-800" />
                  <span>Reserve Table</span>
                </button>
              </div>

              {/* Trust Badge Bar */}
              <div className="pt-6 border-t border-[#EFEBE9] flex items-center justify-center lg:justify-start gap-6 text-xs text-[#795548]">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-[#3E2723]">4.9/5</span>
                  <span>(2,400+ reviews)</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-[#A1887F]"></div>
                <span className="hidden sm:inline">🌱 100% Fair-Trade Arabica</span>
              </div>
            </div>

            {/* Right Visual with Coffee Image & Animated Steam Effect */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-md aspect-square rounded-[36px] overflow-hidden p-3 bg-gradient-to-br from-[#D7CCC8]/40 to-[#A1887F]/20 border border-[#D7CCC8] shadow-2xl">
                {/* Coffee Cup Container with Animated Steam */}
                <div className="w-full h-full rounded-[30px] overflow-hidden relative group">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                    alt="Signature Velvet Bean Espresso Coffee"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 via-transparent to-black/10"></div>

                  {/* Animated Steam Clouds rising above the coffee */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none flex gap-3">
                    <div className="w-3 h-10 rounded-full bg-white/40 blur-xs animate-steam-1"></div>
                    <div className="w-3.5 h-12 rounded-full bg-white/45 blur-xs animate-steam-2"></div>
                    <div className="w-2.5 h-9 rounded-full bg-white/40 blur-xs animate-steam-3"></div>
                  </div>

                  {/* Floating badge inside picture */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-lg text-[#3E2723] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#795548]">
                        Signature Roast
                      </span>
                      <h4 className="font-serif-title font-bold text-sm">Artisan Cappuccino</h4>
                      <p className="text-xs text-[#8D6E63]">₹240 • Fresh cinnamon dust</p>
                    </div>
                    <button
                      onClick={() => onNavigate('menu')}
                      className="w-9 h-9 rounded-full bg-[#4E342E] text-white flex items-center justify-center hover:bg-[#3E2723] transition-colors"
                      title="Order Now"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Add to Cart Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3E2723] text-[#FFF8F2] px-5 py-3 rounded-full shadow-2xl border border-[#795548] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Coffee className="w-4 h-4 text-amber-300" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* 2. VALUE PILLARS / BRAND HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Award,
              title: 'Single-Origin Beans',
              desc: 'Ethically harvested from highland micro-lot farms in Ethiopia and Colombia.',
            },
            {
              icon: Flame,
              title: 'Small Batch Roasting',
              desc: 'Freshly drum-roasted twice weekly in small 5kg batches for peak aromatic crema.',
            },
            {
              icon: Coffee,
              title: 'Artisan Pastry Oven',
              desc: 'Classic French croissants, brownies, and tarts baked every morning at 5:30 AM.',
            },
            {
              icon: Heart,
              title: 'Cozy Community Haven',
              desc: 'Sun-drenched velvet booths, acoustic warmth, fast Wi-Fi, and gentle jazz.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-[#EFEBE9] hover:border-[#D7CCC8] shadow-xs hover:shadow-md transition-all duration-200 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title font-bold text-base text-[#3E2723]">{feature.title}</h3>
              <p className="text-xs text-[#795548] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED MENU SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-[#795548] mb-1">
              Fresh From Our Counter
            </div>
            <h2 className="font-serif-title text-3xl font-bold text-[#3E2723]">
              Today's Popular Brews & Bakes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-sm font-bold text-[#4E342E] hover:text-[#3E2723] inline-flex items-center gap-1.5 group"
          >
            <span>View Complete Menu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#EFEBE9] hover:border-[#D7CCC8] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.badge && (
                  <span className="absolute top-3 left-3 bg-[#3E2723]/90 text-[#FFF8F2] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    {item.badge}
                  </span>
                )}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-[#3E2723] flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{item.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-[#A1887F]">{item.category}</span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                      Vegetarian
                    </span>
                  </div>
                  <h3 className="font-serif-title font-bold text-base text-[#3E2723] mt-1">{item.name}</h3>
                  <p className="text-xs text-[#795548] line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-[#EFEBE9] flex items-center justify-between">
                  <span className="font-serif-title text-lg font-extrabold text-[#3E2723]">
                    ₹{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="px-4 py-2 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full text-xs font-semibold shadow-xs transition-colors active:scale-95"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COFFEE MOOD FINDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#4E342E] to-[#3E2723] rounded-3xl p-8 sm:p-12 text-[#FFF8F2] shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none">☕</div>

          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#D7CCC8] font-bold">
              Personalized Recommendation
            </span>
            <h2 className="font-serif-title text-2xl sm:text-4xl font-bold">
              What's Your Coffee Mood Today? ☕
            </h2>
            <p className="text-sm text-[#D7CCC8] leading-relaxed">
              Every hour calls for a different harmony. Pick how you feel, and let our baristas craft the ideal pairing for your mindset.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {moods.map((m) => (
                <button
                  key={m.title}
                  onClick={() => setSelectedMood(m.title)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedMood === m.title
                      ? 'bg-[#FFF8F2] text-[#3E2723] border-[#FFF8F2] font-bold shadow-md'
                      : 'bg-white/10 text-[#EFEBE9] border-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="text-xs font-bold truncate">{m.title}</div>
                  <div className="text-[10px] opacity-80 truncate">{m.drink}</div>
                </button>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => onNavigate('menu')}
                className="px-6 py-2.5 bg-[#FFF8F2] text-[#3E2723] rounded-full font-bold text-xs hover:bg-white transition-colors shadow-sm"
              >
                Order Recommended Drink
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TABLE RESERVATIONS CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EFEBE9] rounded-3xl p-8 sm:p-12 border border-[#D7CCC8] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#795548]">
              <Calendar className="w-4 h-4 text-amber-800" />
              <span>Quiet Work Nooks & Sunlit Patios</span>
            </div>
            <h2 className="font-serif-title text-3xl font-bold text-[#3E2723]">
              Reserve Your Favorite Corner Table
            </h2>
            <p className="text-sm text-[#5D4037] max-w-xl leading-relaxed">
              Planning a cozy morning study session, coffee tasting date, or afternoon meeting? Reserve a table in advance and let us prepare your spot with fresh flowers and warm pastries.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#4E342E] pt-2">
              <span className="flex items-center gap-1">✨ Instant confirmation</span>
              <span className="flex items-center gap-1">🌿 Indoor & Patio seating</span>
              <span className="flex items-center gap-1">⚡ Dedicated charging outlets</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              id="home-book-table-action"
              onClick={() => onNavigate('reservations')}
              className="w-full sm:w-auto px-8 py-4 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full font-bold text-sm shadow-md hover:shadow-xl transition-all"
            >
              Book a Table Now ☕
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
