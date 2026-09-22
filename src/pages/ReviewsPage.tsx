import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Heart, Coffee, Send, CheckCircle2 } from 'lucide-react';
import { Review, MenuItem } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const ReviewsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (user && !authorName) {
      setAuthorName(user.name);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!authorName.trim() || !comment.trim()) {
      setErrorNotice('Please provide your name and review thoughts.');
      return;
    }

    try {
      setSubmitting(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_name: authorName,
          menu_item_name: selectedItemName || undefined,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorNotice(data.error || 'Failed to submit review.');
        return;
      }

      setReviews([data.review, ...reviews]);
      setComment('');
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4000);
    } catch (err) {
      setErrorNotice('Network error while saving review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE9] text-[#795548] text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-rose-700 fill-rose-700" />
          <span>Warm Guest Impressions</span>
        </div>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-[#3E2723]">
          Stories & Community Love
        </h1>
        <p className="text-sm sm:text-base text-[#5D4037] leading-relaxed">
          Read what our café regulars, morning remote workers, and dessert enthusiasts say about their Velvet Bean experiences.
        </p>
      </div>

      {/* Overview Metric Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D7CCC8] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-[#EFEBE9] pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-serif-title font-extrabold text-[#3E2723] block">
            {avgRating}
          </span>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-[#795548]">Based on {reviews.length || 2400} community reviews</p>
        </div>

        <div className="md:col-span-2 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 90;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-[#5D4037] font-semibold flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                </span>
                <div className="flex-1 bg-[#EFEBE9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#795548] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right text-[#8D6E63]">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form & Review Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Write a Review Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#D7CCC8] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#795548]" />
            <h3 className="font-serif-title font-bold text-lg text-[#3E2723]">
              Share Your Experience
            </h3>
          </div>
          <p className="text-xs text-[#795548]">
            Did a barista make your day? We'd cherish hearing about your favorite brew or pastry!
          </p>

          {successNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your review has been lovingly shared. ☕</span>
            </div>
          )}

          {errorNotice && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {errorNotice}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Your Name *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Drink or Dish Enjoyed</label>
              <select
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              >
                <option value="">Select menu item (optional)</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Star Rating</label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-stone-300 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#3E2723] ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#3E2723]">Your Review *</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the aroma, ambiance, and warmth of the team?..."
                className="w-full bg-[#FFF8F2] border border-[#D7CCC8] rounded-xl px-3 py-2 text-xs text-[#3E2723] focus:outline-none focus:ring-1 focus:ring-[#795548]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4E342E] hover:bg-[#3E2723] disabled:opacity-50 text-white py-3 rounded-full font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sharing Thoughts...' : 'Post Customer Review'}</span>
            </button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-serif-title font-bold text-lg text-[#3E2723]">
              Community Reviews ({reviews.length})
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-[#EFEBE9] space-y-2 animate-pulse">
                  <div className="h-4 bg-[#EFEBE9] rounded w-1/3"></div>
                  <div className="h-3 bg-[#EFEBE9] rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center text-[#795548] border border-[#EFEBE9]">
              Be the first to share a review about Velvet Bean!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-3xl border border-[#EFEBE9] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EFEBE9] overflow-hidden border border-[#D7CCC8] flex items-center justify-center font-serif-title font-bold text-sm text-[#4E342E]">
                        {rev.avatar_url ? (
                          <img src={rev.avatar_url} alt={rev.user_name} className="w-full h-full object-cover" />
                        ) : (
                          rev.user_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif-title font-bold text-sm text-[#3E2723]">
                          {rev.user_name}
                        </h4>
                        {rev.menu_item_name && (
                          <span className="text-[11px] text-[#A1887F] flex items-center gap-1 font-medium">
                            <Coffee className="w-3 h-3 text-[#A1887F]" />
                            {rev.menu_item_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="text-[10px] text-[#A1887F] pt-1">
                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
