import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Navigation, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-[#795548]">
          Always Here for You
        </span>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          Visit & Say Hello
        </h1>
        <p className="text-sm sm:text-base text-[#5D4037] leading-relaxed">
          Questions about coffee origins, wholesale inquiries, event space rentals, or dietary preferences? Reach out or stop by for a cup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Opening Hours */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-6">
            <h3 className="font-serif-title font-bold text-xl text-[#3E2723]">
              Café Information
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[#5D4037]">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#3E2723]">Our Location</h4>
                  <p className="text-xs text-[#795548] mt-0.5">
                    42 Blossom Lane, Artisan Quarter, Old Town
                  </p>
                  <p className="text-[11px] text-[#A1887F] mt-1">
                    *2 min walk from Central Botanical Square Metro
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#3E2723]">Call or Text</h4>
                  <p className="text-xs text-[#795548] mt-0.5">+1 (555) 234-BEAN (2326)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFEBE9] text-[#4E342E] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#3E2723]">Email Inquiries</h4>
                  <p className="text-xs text-[#795548] mt-0.5">hello@velvetbeancafe.com</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#EFEBE9] pt-4 space-y-2">
              <h4 className="font-serif-title font-bold text-sm text-[#3E2723] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#795548]" />
                Operating Hours
              </h4>
              <div className="text-xs text-[#795548] space-y-1">
                <div className="flex justify-between">
                  <span>Mon – Fri:</span>
                  <span className="font-semibold text-[#3E2723]">7:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold text-[#3E2723]">8:00 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-semibold text-[#3E2723]">8:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Map Simulation */}
          <div className="bg-[#4E342E] p-6 rounded-3xl text-[#FFF8F2] shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#FFD54F]" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#D7CCC8]">
                Getting Here
              </span>
            </div>
            <p className="text-xs text-[#EFEBE9] leading-relaxed">
              Underground parking available at Blossom Plaza. Secure bicycle racks right in front of the café entrance.
            </p>
            <div className="p-3 bg-[#3E2723] rounded-2xl border border-[#5D4037] text-xs flex items-center justify-between">
              <span>📍 Coordinates: 40.7128° N, 74.0060° W</span>
              <span className="text-[#FFD54F] font-bold">Artisan Quarter</span>
            </div>
          </div>
        </div>

        {/* Right: Send a Message Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#795548]" />
            <h3 className="font-serif-title font-bold text-xl text-[#3E2723]">
              Send Us a Friendly Message
            </h3>
          </div>
          <p className="text-xs text-[#795548]">
            We typically reply within 2 to 4 hours during café operating times.
          </p>

          {submitted && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you for your note! A café host will get back to you promptly. ☕</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#3E2723]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#3E2723]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Private Event Reservation / Catering inquiry"
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Your Message *</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts with us..."
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2.5 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#4E342E] hover:bg-[#3E2723] text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
