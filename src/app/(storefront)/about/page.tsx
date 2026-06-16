'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Truck,
  Star,
  MapPin,
  Sparkles,
  Award,
  Users,
  Package,
  ArrowRight,
} from 'lucide-react';

const VALUES = [
  {
    icon: <Star className="h-5 w-5 text-amber-500" />,
    title: 'Premium Quality',
    desc: 'Every piece is hand-picked for exceptional fabric quality, fine stitching, and lasting comfort.',
  },
  {
    icon: <Truck className="h-5 w-5 text-slate-500" />,
    title: 'All India Delivery',
    desc: 'From Kashmir to Kanyakumari — we deliver to every corner of India with care and speed.',
  },
  {
    icon: <Heart className="h-5 w-5 text-rose-500" />,
    title: 'Designed with Passion',
    desc: 'Each collection reflects Rushali\'s personal eye for style — bold, modern, and deeply Indian.',
  },
  {
    icon: <Users className="h-5 w-5 text-slate-500" />,
    title: 'Customer First',
    desc: 'Easy returns, responsive support, and transparent policies — because you deserve the best experience.',
  },
];



export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-700 via-slate-700 to-slate-900 text-white overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-slate-500/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-slate-400/10 blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-slate-200" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight mb-5">
            Fashion Born in<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-200">Ahmedabad.</span>
            <br />Worn Across India.
          </h1>
          <p className="text-slate-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Rush Fashion is more than a brand — it's a vision crafted by one passionate designer to make premium fashion accessible to every Indian.
          </p>
        </div>
      </section>



      {/* FOUNDER SECTION */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Founder Photo / Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80"
                alt="Rushali Jivrajani - Founder of Rush Fashion"
                className="w-full h-full object-cover"
              />
              {/* Overlay tag */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/60 shadow-lg">
                <p className="font-black text-slate-900 text-base">Rushali Jivrajani</p>
                <p className="text-xs text-slate-600 font-semibold">Founder & Creative Director</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ahmedabad, Gujarat, India</p>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-600/30 rotate-12">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Founder Story */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Meet the Founder & Engineer</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                Designed & Built by<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-600">Rushali Jivrajani</span>
              </h2>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Rushali Jivrajani is the heart, soul, and brains behind Rush Fashion. As a <span className="font-bold text-slate-600">Software Engineer</span> turned fashion entrepreneur, she didn't just design the clothes — she wrote the code and built this entire platform from the ground up!
              </p>
              <p>
                Born in Ahmedabad, Gujarat, Rushali combined her technical expertise with her love for design to create a startup that breaks boundaries. Her vision is simple but powerful: <span className="font-bold text-slate-900">budget-friendly, high-quality fashion should be accessible to everyone</span>.
              </p>
              <p>
                As a female founder in tech and fashion, her journey is dedicated to inspiring young girls everywhere to dream big. Whether you're writing code or sketching designs, you can build your own empire. Rush Fashion is proof that with passion, grit, and vision, you can create something extraordinary.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium px-3">— Rushali Jivrajani, Founder</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
        </div>
      </section>



      {/* VALUES */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">What We Stand For</p>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Core Values</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 mb-4">
                {v.icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2">{v.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ALL INDIA DELIVERY */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-slate-400" />
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">All India Delivery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
            Delivering Style to<br />Every Corner of India
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Whether you're in Mumbai, Delhi, Bengaluru, Kolkata, or a small town in Rajasthan — Rush Fashion delivers premium fashion right to your doorstep, across all 28 states and 8 Union Territories of India.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs">
            {['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Andhra Pradesh', '+ 18 more states'].map((state) => (
              <span key={state} className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-slate-300">
                {state}
              </span>
            ))}
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 hover:bg-slate-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-600/30 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Now — All India Delivery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
