import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Menu as MenuIcon, X, User as UserIcon, Shield, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#3E2723]/95 backdrop-blur-md text-[#FFF8F2] shadow-lg border-b border-[#5D4037]/40 py-3'
          : 'bg-transparent text-[#3E2723] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          id="nav-brand-btn"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left transition-transform active:scale-95 focus:outline-none"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isScrolled
                ? 'bg-[#EFEBE9] text-[#3E2723]'
                : 'bg-[#4E342E] text-[#FFF8F2] group-hover:bg-[#3E2723]'
            }`}
          >
            <Coffee className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </div>
          <div>
            <span
              className={`font-serif-title font-bold text-xl tracking-tight block ${
                isScrolled ? 'text-[#FFF8F2]' : 'text-[#3E2723]'
              }`}
            >
              Velvet Bean
            </span>
            <span
              className={`text-[10px] tracking-widest uppercase font-medium block -mt-1 ${
                isScrolled ? 'text-[#D7CCC8]' : 'text-[#795548]'
              }`}
            >
              Artisan Café • Est. 2018
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? isScrolled
                      ? 'bg-[#FFF8F2] text-[#3E2723] shadow-sm font-semibold'
                      : 'bg-[#4E342E] text-[#FFF8F2] shadow-sm font-semibold'
                    : isScrolled
                    ? 'text-[#EFEBE9] hover:text-white hover:bg-white/10'
                    : 'text-[#4E342E] hover:text-[#3E2723] hover:bg-[#5D4037]/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Cart Trigger */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className={`relative p-2.5 rounded-full transition-all duration-200 focus:outline-none ${
              isScrolled
                ? 'bg-white/10 text-[#FFF8F2] hover:bg-white/20'
                : 'bg-[#5D4037]/10 text-[#3E2723] hover:bg-[#5D4037]/20'
            }`}
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale"
              >
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="nav-user-dropdown-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isScrolled
                    ? 'border-[#795548] bg-white/10 text-white hover:bg-white/20'
                    : 'border-[#A1887F] bg-white text-[#3E2723] hover:bg-[#EFEBE9]'
                }`}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-300"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-amber-700" />
                )}
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <span className="bg-[#795548] text-[#FFF8F2] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                    Admin
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#FFF8F2] text-[#3E2723] rounded-2xl shadow-xl border border-[#D7CCC8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#EFEBE9]">
                    <p className="text-xs text-[#795548] font-medium">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-[#3E2723]">{user.name}</p>
                    <p className="text-xs text-[#8D6E63] truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <button
                      id="dropdown-admin-dashboard"
                      onClick={() => {
                        handleNavClick('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] flex items-center gap-2 font-medium"
                    >
                      <Shield className="w-4 h-4 text-[#795548]" />
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    id="dropdown-customer-dashboard"
                    onClick={() => {
                      handleNavClick('customer-dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] flex items-center gap-2 font-medium"
                  >
                    <Coffee className="w-4 h-4 text-[#795548]" />
                    My Coffee Lounge
                  </button>

                  <button
                    id="dropdown-my-orders"
                    onClick={() => {
                      handleNavClick('customer-dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] flex items-center gap-2 font-medium"
                  >
                    <Clock className="w-4 h-4 text-[#795548]" />
                    Order History
                  </button>

                  <div className="border-t border-[#EFEBE9] my-1"></div>

                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenAuth}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                isScrolled
                  ? 'bg-[#FFF8F2] text-[#3E2723] hover:bg-white'
                  : 'bg-[#4E342E] text-[#FFF8F2] hover:bg-[#3E2723]'
              }`}
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-white hover:bg-white/10' : 'text-[#3E2723] hover:bg-[#5D4037]/10'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#3E2723] text-[#FFF8F2] px-5 pt-3 pb-6 border-b border-[#5D4037] shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-4 py-2.5 rounded-xl font-medium text-base transition-colors ${
                  currentTab === link.id
                    ? 'bg-[#FFF8F2] text-[#3E2723] font-bold'
                    : 'text-[#EFEBE9] hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isAuthenticated && user && (
              <>
                <div className="border-t border-[#5D4037] my-2 pt-2">
                  <p className="text-xs uppercase text-[#A1887F] font-bold px-4 mb-1">My Account</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full text-left px-4 py-2 text-sm text-[#FFD54F] font-medium flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('customer-dashboard')}
                    className="w-full text-left px-4 py-2 text-sm text-white font-medium flex items-center gap-2"
                  >
                    <Coffee className="w-4 h-4" /> My Coffee Lounge
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-300 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
