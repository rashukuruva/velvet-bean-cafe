import React, { useState } from 'react';
import { Camera, Sparkles, X, Heart, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  category: 'Coffee' | 'Interior' | 'Desserts' | 'Brewing';
  url: string;
  caption: string;
}

const GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 1,
    title: 'Morning Sun at the Espresso Bar',
    category: 'Interior',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
    caption: 'Golden morning light illuminating our custom matte brass espresso machines and reclaimed oak wood bar.',
  },
  {
    id: 2,
    title: 'Velvet Rosette Latte Art',
    category: 'Coffee',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    caption: 'Silky micro-foam poured with precision by our head barista on our signature house blend.',
  },
  {
    id: 3,
    title: 'Freshly Flaked Butter Croissants',
    category: 'Desserts',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
    caption: 'Laminated with cultured Normandy butter and baked fresh every single morning at 5:30 AM.',
  },
  {
    id: 4,
    title: 'Manual Pour-Over Extraction',
    category: 'Brewing',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    caption: 'Slow concentric bloom brewing single-origin Yirgacheffe coffee in Japanese ceramic drippers.',
  },
  {
    id: 5,
    title: 'Cozy Library Nook & Velvet Armchairs',
    category: 'Interior',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
    caption: 'Our beloved reading corner stacked with art books, vintage vinyl records, and soft linen pillows.',
  },
  {
    id: 6,
    title: 'Decadent Dark Truffle Cake',
    category: 'Desserts',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    caption: 'Belgian 70% dark chocolate sponge glazed with espresso ganache and fresh garden raspberries.',
  },
  {
    id: 7,
    title: 'Iced Cinnamon Cold Foam Brew',
    category: 'Coffee',
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80',
    caption: 'Steeped for 18 hours in cold filtered spring water and crowned with velvety spiced cinnamon foam.',
  },
  {
    id: 8,
    title: 'Sunlit Garden Courtyard',
    category: 'Interior',
    url: 'https://images.unsplash.com/photo-1445116572660-23842988c770?auto=format&fit=crop&w=900&q=80',
    caption: 'Breezy brick patio shaded by blooming lemon trees and climbing fragrant jasmine.',
  },
  {
    id: 9,
    title: 'Drum Roasting Ethiopian Beans',
    category: 'Brewing',
    url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=900&q=80',
    caption: 'Mastering the first crack profile to preserve sweet jasmine and stone-fruit aromatics.',
  },
];

export const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filters = ['All', 'Coffee', 'Desserts', 'Interior', 'Brewing'];

  const filteredPhotos =
    activeFilter === 'All'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeFilter);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE9] text-[#795548] text-xs font-semibold">
          <Camera className="w-3.5 h-3.5 text-amber-700" />
          <span>Moments Captured in Warm Amber</span>
        </div>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          Café Visual Journal
        </h1>
        <p className="text-sm sm:text-base text-[#5D4037] leading-relaxed">
          Glimpses into our daily coffee craft, dawn-baked patisserie, and the cozy sunlight spilling across our artisan lounge.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              activeFilter === f
                ? 'bg-[#4E342E] text-white shadow-xs'
                : 'bg-white text-[#5D4037] border border-[#D7CCC8] hover:bg-[#EFEBE9]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer bg-[#3E2723] shadow-xs hover:shadow-xl transition-all duration-300 aspect-[4/3]"
          >
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-95 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-[10px] uppercase tracking-widest text-[#FFD54F] font-bold">
                {photo.category}
              </span>
              <h3 className="font-serif-title font-bold text-white text-base mt-1">
                {photo.title}
              </h3>
              <p className="text-xs text-[#D7CCC8] mt-1 line-clamp-2">{photo.caption}</p>
              <div className="mt-3 flex items-center text-xs font-semibold text-white/90 gap-1">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Click to view</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[#FFF8F2] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#D7CCC8] flex flex-col relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[60vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#795548] tracking-widest">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif-title font-bold text-xl text-[#3E2723]">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
