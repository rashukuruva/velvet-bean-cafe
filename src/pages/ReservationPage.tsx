import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Coffee, Sparkles, CheckCircle2, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Reservation } from '../types/index.ts';

interface ReservationPageProps {
  onNavigateToDashboard?: () => void;
}

export const ReservationPage: React.FC<ReservationPageProps> = ({ onNavigateToDashboard }) => {
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [guests, setGuests] = useState<number>(2);
  const [seatingType, setSeatingType] = useState<string>('Cozy Indoor Lounge');
  const [specialRequest, setSpecialRequest] = useState<string>('');

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [slots, setSlots] = useState<Array<{ time: string; available: boolean; remainingTables: number }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  const fetchSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const res = await fetch(`/api/reservations/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
        // If current selectedTime not available, default to first available
        const firstAvail = data.find((s: any) => s.available);
        if (firstAvail && !data.find((s: any) => s.time === selectedTime && s.available)) {
          setSelectedTime(firstAvail.time);
        }
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please provide your name and contact email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('velvet_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          reservation_date: selectedDate,
          reservation_time: selectedTime,
          guests,
          seating_type: seatingType,
          special_request: specialRequest,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reserve table.');
        return;
      }

      setConfirmedReservation(data.reservation);
    } catch (err) {
      setError('Network error while booking table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const seatingOptions = [
    { id: 'Cozy Indoor Lounge', desc: 'Plush velvet armchairs & warm reading lamps' },
    { id: 'Sunlit Garden Patio', desc: 'Breezy outdoor courtyard framed by potted jasmine' },
    { id: 'Window Nook Table', desc: 'Sun-drenched bay window overlooking Blossom Lane' },
    { id: 'Quiet Study Corner', desc: 'Dedicated charging sockets & low background music' },
  ];

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE9] text-[#795548] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Warm Hospitality & Reserved Spaces</span>
        </div>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          Reserve a Café Table
        </h1>
        <p className="text-sm sm:text-base text-[#5D4037] leading-relaxed">
          Whether for intimate conversations over espresso or productive remote working mornings, we hold your space with warm care.
        </p>
      </div>

      {confirmedReservation ? (
        /* Aesthetic Confirmation Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D7CCC8] shadow-lg max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#EFEBE9] flex items-center justify-center relative">
            <Coffee className="w-10 h-10 text-[#4E342E]" />
            <CheckCircle2 className="w-6 h-6 text-emerald-600 absolute bottom-0 right-0 bg-white rounded-full" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#3E2723]">
              Your Table is Reserved! ☕✨
            </h2>
            <p className="text-xs sm:text-sm text-[#795548]">
              We look forward to welcoming you to Velvet Bean Café.
            </p>
          </div>

          <div className="bg-[#FFF8F2] p-5 rounded-2xl border border-[#EFEBE9] text-xs space-y-2.5 text-left text-[#5D4037]">
            <div className="flex justify-between border-b border-[#EFEBE9] pb-2">
              <span className="text-[#8D6E63]">Reservation ID:</span>
              <span className="font-mono font-bold text-[#3E2723]">#{confirmedReservation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8D6E63]">Date & Time:</span>
              <span className="font-semibold text-[#3E2723]">
                {confirmedReservation.reservation_date} at {confirmedReservation.reservation_time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8D6E63]">Party Size:</span>
              <span className="font-semibold text-[#3E2723]">{confirmedReservation.guests} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8D6E63]">Seating Zone:</span>
              <span className="font-semibold text-[#3E2723]">{confirmedReservation.seating_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8D6E63]">Reserved for:</span>
              <span className="font-semibold text-[#3E2723]">{confirmedReservation.customer_name}</span>
            </div>
            {confirmedReservation.special_request && (
              <div className="border-t border-[#EFEBE9] pt-2 text-[#795548]">
                <span className="font-semibold text-[#3E2723]">Special Note:</span> {confirmedReservation.special_request}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                if (onNavigateToDashboard) onNavigateToDashboard();
              }}
              className="flex-1 bg-[#4E342E] hover:bg-[#3E2723] text-white py-3 rounded-full text-xs font-bold transition-colors shadow-sm"
            >
              View in My Coffee Lounge
            </button>
            <button
              onClick={() => setConfirmedReservation(null)}
              className="flex-1 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#3E2723] py-3 rounded-full text-xs font-semibold transition-colors"
            >
              Book Another Table
            </button>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <form onSubmit={handleBooking} className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D7CCC8] shadow-sm space-y-8">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Section 1: Date & Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-serif-title font-bold text-sm text-[#3E2723] flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#795548]" />
                Select Date
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>

            <div className="space-y-2">
              <label className="font-serif-title font-bold text-sm text-[#3E2723] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#795548]" />
                Party Size (Guests)
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuests(num)}
                    className={`w-11 h-11 rounded-2xl font-bold text-xs shrink-0 transition-all ${
                      guests === num
                        ? 'bg-[#4E342E] text-white shadow-xs scale-105'
                        : 'bg-[#FFF8F2] text-[#5D4037] border border-[#D7CCC8] hover:bg-[#EFEBE9]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Time Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-serif-title font-bold text-sm text-[#3E2723] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#795548]" />
                Available Time Slots
              </label>
              {loadingSlots && <span className="text-xs text-[#A1887F]">Checking tables...</span>}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-semibold transition-all text-center border ${
                    !slot.available
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                      : selectedTime === slot.time
                      ? 'bg-[#4E342E] text-white border-[#4E342E] shadow-xs scale-105'
                      : 'bg-[#FFF8F2] text-[#5D4037] border-[#D7CCC8] hover:bg-[#EFEBE9]'
                  }`}
                >
                  <div className="font-bold">{slot.time}</div>
                  <div className="text-[10px] opacity-75">
                    {slot.available ? `${slot.remainingTables} left` : 'Booked'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Seating Preference */}
          <div className="space-y-3">
            <label className="font-serif-title font-bold text-sm text-[#3E2723] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#795548]" />
              Atmosphere & Seating Choice
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seatingOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeatingType(opt.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    seatingType === opt.id
                      ? 'bg-[#EFEBE9] border-[#795548] shadow-xs'
                      : 'bg-[#FFF8F2] border-[#D7CCC8] hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-[#3E2723]">{opt.id}</div>
                  <div className="text-[11px] text-[#795548] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Contact & Special Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3E2723]">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Clara Higgins"
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3E2723]">Email *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="clara@example.com"
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3E2723]">Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#3E2723]">Special Request (Optional)</label>
            <textarea
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="e.g. Quiet corner table for laptop work, high chair needed, anniversary surprise..."
              className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
            />
          </div>

          <button
            id="submit-table-reservation-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#4E342E] hover:bg-[#3E2723] disabled:opacity-50 text-white rounded-full font-bold text-sm shadow-md hover:shadow-xl transition-all"
          >
            {isSubmitting ? 'Confirming with Barista...' : `Confirm Reservation (${guests} Guests • ${selectedTime}) ☕`}
          </button>
        </form>
      )}
    </div>
  );
};
