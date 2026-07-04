'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Star,
  CheckCircle,
  EyeOff,
  Trash2,
  CornerDownRight,
  Send,
  Loader2,
  X
} from 'lucide-react';

interface Review {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending' | 'Hidden';
  reply?: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch (e) {
      toast.error('Failed to load review logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: Review['status']) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(`Review set to ${nextStatus}`);
        fetchReviews();
      } else {
        toast.error('Failed to moderate review');
      }
    } catch (e) {
      toast.error('Request failed');
    }
  };

  const handleSendReply = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        toast.success('Reply published!');
        setReplyingId(null);
        setReplyText('');
        fetchReviews();
      } else {
        toast.error('Failed to publish reply');
      }
    } catch (e) {
      toast.error('Error posting reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted');
        fetchReviews();
      } else {
        toast.error('Failed to delete review');
      }
    } catch (e) {
      toast.error('Request failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground/80">Loading catalog reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl flex items-center gap-2">
            Reviews Moderation <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
            Moderate product reviews, approve buyer feedback, hide inappropriate content, and reply directly.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-w-5xl">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:border-slate-800 dark:bg-foreground text-background/60"
          >
            {/* Upper row: Name, rating, status */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/30 dark:border-slate-850 pb-3 mb-3">
              <div>
                <span className="font-bold text-foreground dark:text-white">{rev.customerName}</span>
                <span className="text-xs text-muted-foreground/80"> on </span>
                <span className="text-xs font-bold text-muted-foreground/80 font-mono">{rev.productName}</span>
              </div>

              {/* Stars rendering */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rev.rating
                          ? 'text-indigo-400 fill-indigo-405' // Wait, fill-indigo-405 -> fill-indigo-400
                          : 'text-slate-350 dark:text-foreground/90'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  rev.status === 'Approved'
                    ? 'bg-primary/100/10 text-primary'
                    : rev.status === 'Pending'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-card/500/10 text-muted-foreground'
                }`}>{rev.status}</span>
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-foreground/90 dark:text-muted-foreground/50 leading-relaxed font-medium">"{rev.comment}"</p>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1.5">
              Logged: {new Date(rev.createdAt).toLocaleString()}
            </span>

            {/* Render Reply if exists */}
            {rev.reply && (
              <div className="mt-4 pl-4 border-l-2 border-slate-500 flex items-start gap-2 text-xs">
                <CornerDownRight className="h-4 w-4 text-muted-foreground/80 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground dark:text-muted-foreground/80">Admin Response:</span>
                  <p className="text-muted-foreground/80 mt-1 font-medium">"{rev.reply}"</p>
                </div>
              </div>
            )}

            {/* Moderation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 dark:border-slate-850 pt-3 mt-4">
              <div className="flex items-center gap-2">
                {rev.status !== 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'Approved')}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/100/10 border border-teal-500/20 px-2.5 py-1 rounded-lg"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {rev.status !== 'Hidden' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'Hidden')}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/80 hover:bg-card/500/10 border border-slate-500/15 px-2.5 py-1 rounded-lg"
                  >
                    <EyeOff className="h-3.5 w-3.5" /> Hide
                  </button>
                )}
                {!rev.reply && replyingId !== rev.id && (
                  <button
                    onClick={() => setReplyingId(rev.id)}
                    className="text-[11px] font-bold text-muted-foreground/80 hover:underline px-2"
                  >
                    Reply
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-1 rounded-lg text-muted-foreground/80 hover:text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Reply Input Form */}
            {replyingId === rev.id && (
              <form onSubmit={(e) => handleSendReply(e, rev.id)} className="mt-4 border-t border-border/30 dark:border-slate-800 pt-3 flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type administrative reply..."
                  className="flex-1 text-xs rounded-xl border border-border bg-card/50 px-3 py-2 focus:outline-none dark:border-slate-850 dark:bg-slate-950 text-foreground dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="rounded-xl bg-slate-600 px-3 text-white flex items-center justify-center"
                >
                  {submittingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyingId(null)}
                  className="p-2 text-muted-foreground/80 hover:text-border"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            )}

          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground/80 text-center py-8">No reviews submitted yet.</p>
        )}
      </div>

    </div>
  );
}
