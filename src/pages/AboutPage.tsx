import React from 'react';
import { Coffee, Award, Sparkles, Heart, Users, Compass, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFEBE9] text-[#795548] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Our Origin & Philosophy</span>
        </div>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          The Velvet Bean Story
        </h1>
        <p className="text-base sm:text-lg text-[#5D4037] leading-relaxed">
          Founded in 2018 with a modest cast-iron drum roaster, Velvet Bean Café was born from a simple devotion: to create a sanctuary where time slows down and every cup feels like a warm embrace.
        </p>
      </div>

      {/* 2. Story Feature with Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-[#D7CCC8] shadow-xs">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
            Farm to Hearth
          </span>
          <h2 className="font-serif-title text-3xl font-bold text-[#3E2723]">
            More Than Just Coffee — A Daily Ritual of Mindfulness
          </h2>
          <p className="text-sm text-[#5D4037] leading-relaxed">
            We partner directly with multi-generational coffee families in Sidama (Ethiopia), Huila (Colombia), and Antigua (Guatemala). By paying well above fair-trade minimums, we foster regenerative agriculture while sourcing the sweetest, densest Arabica cherries grown at altitude.
          </p>
          <p className="text-sm text-[#5D4037] leading-relaxed">
            Back in our roastery, we approach roasting as both science and culinary art. We track convection heat, drum rotation, and temperature curve by curve to gently highlight floral bergamot, ripe stone fruits, and caramelized honey notes.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border-l-2 border-[#795548] pl-3.5">
              <span className="font-serif-title text-2xl font-bold text-[#3E2723]">100%</span>
              <p className="text-xs text-[#795548]">Direct Fair Trade</p>
            </div>
            <div className="border-l-2 border-[#795548] pl-3.5">
              <span className="font-serif-title text-2xl font-bold text-[#3E2723]">5:30 AM</span>
              <p className="text-xs text-[#795548]">Fresh Pastry Baking</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] relative">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
              alt="Inside Velvet Bean Café"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="font-handwriting text-2xl">"Every bean has a story of rain, soil, and human hands."</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 4-Step Craft Process */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
            The Alchemy
          </span>
          <h2 className="font-serif-title text-3xl font-bold text-[#3E2723]">
            Our 4-Step Brewing Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Curated Harvest',
              desc: 'Hand-picked red ripe cherries grown in high-elevation volcanic soils.',
            },
            {
              step: '02',
              title: 'Artisan Roasting',
              desc: 'Slow drum-roasted twice a week in 5kg batches to balance body and acidity.',
            },
            {
              step: '03',
              title: 'Mineralized Water',
              desc: 'Filtered through multi-stage volcanic stone for optimal mineral extraction balance.',
            },
            {
              step: '04',
              title: 'Barista Extraction',
              desc: 'Extracted at 9 bars of pressure with calibrated temperature stability.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-3xl border border-[#EFEBE9] hover:border-[#D7CCC8] shadow-xs space-y-3"
            >
              <span className="font-serif-title text-3xl font-black text-[#D7CCC8]">
                {item.step}
              </span>
              <h3 className="font-serif-title font-bold text-base text-[#3E2723]">{item.title}</h3>
              <p className="text-xs text-[#795548] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Meet the Craft Team */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
            The Artisans
          </span>
          <h2 className="font-serif-title text-3xl font-bold text-[#3E2723]">
            Meet the Heart of Velvet Bean
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              name: 'Liam Vance',
              role: 'Founder & Master Roaster',
              image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
              bio: '12 years traveling through Latin America mastering micro-lot selection and drum temperature profiling.',
            },
            {
              name: 'Elena Rostova',
              role: 'Head Pastry Chef',
              image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
              bio: 'Paris-trained patissier dedicated to 72-hour cultured butter lamination and sourdough fermentation.',
            },
            {
              name: 'Marcus Chen',
              role: 'Lead Barista & Educator',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
              bio: 'Regional Latte Art Champion obsessed with micro-foam silky textures and precision pour-overs.',
            },
          ].map((member, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden border border-[#EFEBE9] hover:border-[#D7CCC8] shadow-xs text-center space-y-4 p-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#D7CCC8] shadow-sm">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-lg text-[#3E2723]">{member.name}</h3>
                <p className="text-xs font-semibold text-[#795548]">{member.role}</p>
                <p className="text-xs text-[#8D6E63] mt-2 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
