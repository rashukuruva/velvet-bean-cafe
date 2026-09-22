import React, { useState, useEffect } from 'react';
import { Search, Star, Coffee, Sparkles, Filter, Plus, Check } from 'lucide-react';
import { MenuItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

export const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchMenuItems();
  }, [activeCategory, searchQuery]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/menu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: MenuItem) => {
    addToCart(item, 1);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const categories = [
    { id: 'All', label: 'All Items', icon: '✨' },
    { id: 'Coffee', label: 'Coffee', icon: '☕' },
    { id: 'Tea', label: 'Tea', icon: '🍵' },
    { id: 'Desserts', label: 'Desserts', icon: '🍰' },
    { id: 'Snacks', label: 'Snacks', icon: '🥐' },
  ];

  const displayedItems = menuItems.filter((i) => (vegOnly ? i.is_veg : true));

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
          Crafted with Passion
        </span>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          Our Artisan Café Menu
        </h1>
        <p className="text-sm sm:text-base text-[#5D4037] leading-relaxed">
          From velvety double espressos and slow-simmered spiced chai to butter-flaked croissants and decadent dark chocolate cakes.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search espresso, cake, tea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-[#A1887F] hover:text-[#3E2723]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`category-tab-${cat.id.toLowerCase()}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#4E342E] text-white shadow-xs'
                    : 'bg-[#EFEBE9] text-[#5D4037] hover:bg-[#D7CCC8]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Vegetarian Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#5D4037] select-none self-end md:self-auto">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#4E342E] focus:ring-[#795548]"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              Vegetarian Only
            </span>
          </label>
        </div>
      </div>

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-[#EFEBE9] space-y-3 animate-pulse">
              <div className="h-44 bg-[#EFEBE9] rounded-2xl"></div>
              <div className="h-4 bg-[#EFEBE9] rounded w-3/4"></div>
              <div className="h-3 bg-[#EFEBE9] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#EFEBE9] text-[#795548] flex items-center justify-center mx-auto">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="font-serif-title text-xl font-bold text-[#3E2723]">No menu items found</h3>
          <p className="text-xs text-[#795548]">
            Try adjusting your search terms or selecting another category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedItems.map((item) => {
            const isAdded = addedItemIds[item.id];
            const priceVal = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#EFEBE9] hover:border-[#D7CCC8] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Item Image */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-[#3E2723]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                        {item.badge}
                      </span>
                    )}

                    {/* Vegetarian Indicator */}
                    {item.is_veg && (
                      <div
                        className="absolute top-3 right-3 bg-white/95 p-1 rounded-md shadow-xs"
                        title="Pure Vegetarian"
                      >
                        <div className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-xs">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                        </div>
                      </div>
                    )}

                    {/* Star Rating */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-[#3E2723] flex items-center gap-1 shadow-2xs">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{item.rating}</span>
                    </div>

                    {/* Prep time */}
                    {item.prep_time && (
                      <div className="absolute bottom-3 right-3 bg-[#3E2723]/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-medium text-[#FFF8F2]">
                        {item.prep_time}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-[#A1887F]">
                        {item.category}
                      </span>
                      {item.calories && (
                        <span className="text-[11px] text-[#A1887F]">
                          {item.calories} kcal
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-title font-bold text-base text-[#3E2723] leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-[#795548] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer with Price & Add button */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-[#EFEBE9] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#A1887F] block">Price</span>
                      <span className="font-serif-title text-lg font-extrabold text-[#3E2723]">
                        ₹{priceVal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      id={`menu-add-${item.id}`}
                      onClick={() => handleAdd(item)}
                      disabled={!item.availability}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-xs active:scale-95 ${
                        !item.availability
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#4E342E] hover:bg-[#3E2723] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : !item.availability ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
