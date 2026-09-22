import React, { useState } from 'react';
import { X, Coffee, Shield, User, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRole?: (role: 'customer' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessRole }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register extra states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      const res = await register(name, email, phone, password);
      setLoading(false);
      if (res.success) {
        if (onSuccessRole) onSuccessRole('customer');
        onClose();
      } else {
        setError(res.error || 'Failed to register.');
      }
    } else {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.success && res.user) {
        if (onSuccessRole) onSuccessRole(res.user.role);
        onClose();
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'customer') => {
    setError(null);
    setLoading(true);
    let targetEmail = role === 'admin' ? 'admin@velvetbean.com' : 'clara@example.com';
    let targetPass = role === 'admin' ? 'admin123' : 'coffee123';

    const res = await login(targetEmail, targetPass);
    setLoading(false);
    if (res.success && res.user) {
      if (onSuccessRole) onSuccessRole(res.user.role);
      onClose();
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFF8F2] w-full max-w-md rounded-3xl shadow-2xl border border-[#D7CCC8] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3E2723] p-6 text-[#FFF8F2] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#5D4037] flex items-center justify-center mb-3 text-[#FFF8F2] shadow-inner">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title font-bold text-2xl">
            {mode === 'login' ? 'Welcome Back ☕' : 'Join Our Coffee Family 🫘'}
          </h3>
          <p className="text-xs text-[#D7CCC8] mt-1">
            {mode === 'login'
              ? 'Sign in to access your orders, reservations, and favorites.'
              : 'Create an account to order ahead and unlock personalized rewards.'}
          </p>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-[#4E342E] rounded-xl p-1 mt-4 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-[#FFF8F2] text-[#3E2723]' : 'text-[#D7CCC8] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'register' ? 'bg-[#FFF8F2] text-[#3E2723]' : 'text-[#D7CCC8] hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          {forgotSent && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs">
              Password recovery link sent! Check your inbox.
            </div>
          )}

          {/* Demo Quick Logins for Instant Testing */}
          <div className="bg-[#EFEBE9]/60 p-3 rounded-2xl border border-[#D7CCC8]/60 space-y-2">
            <p className="text-[11px] font-semibold text-[#5D4037] flex items-center gap-1">
              <span>⚡ Quick Demo Logins:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-2 bg-white hover:bg-[#EFEBE9] border border-[#D7CCC8] text-[#3E2723] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="py-1.5 px-2 bg-white hover:bg-[#EFEBE9] border border-[#D7CCC8] text-[#3E2723] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-amber-700" />
                Demo Customer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="font-medium text-[#3E2723]">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A1887F] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Clara Higgins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#D7CCC8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E2723]">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A1887F] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#D7CCC8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="font-medium text-[#3E2723]">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A1887F] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#D7CCC8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-[#3E2723]">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1887F] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#D7CCC8] rounded-xl pl-9 pr-9 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#A1887F] hover:text-[#3E2723]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="font-medium text-[#3E2723]">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A1887F] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-[#D7CCC8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-[#5D4037]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#4E342E] focus:ring-[#795548]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-[#795548] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4E342E] hover:bg-[#3E2723] disabled:opacity-50 text-white py-2.5 rounded-full font-bold text-xs shadow-md transition-colors"
            >
              {loading ? (
                <span>Checking aroma... ☕</span>
              ) : mode === 'login' ? (
                'Sign In to Velvet Bean'
              ) : (
                'Create My Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
