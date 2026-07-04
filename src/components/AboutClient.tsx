'use client';

import React from 'react';
import { Award, MapPin, Sparkles, Mail, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeIn from '@/components/FadeIn';
import { AnimatedButton } from '@/components/AnimatedButton';
import Link from 'next/link';

interface Founder {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface ValueItem {
  title: string;
  desc: string;
}

interface AboutData {
  story?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  founders?: Founder[];
  designCredit?: string;
  values?: ValueItem[];
  rawHtml?: string;
}

export default function AboutClient({ data }: { data: AboutData }) {
  // If raw HTML is provided (meaning the admin edited it as plain HTML in the CMS), render it.
  if (data.rawHtml) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: data.rawHtml }}
          />
        </article>
      </div>
    );
  }

  const story = data.story || {
    title: "Fashion Born in Ahmedabad. Worn Across India.",
    subtitle: "Modern. Minimal. Made for the now.",
    description: "VIARO is more than a brand — it's a vision crafted to make premium streetwear and luxury fashion accessible to the modern individual. Own your style."
  };

  const founders = data.founders || [
    {
      name: "Alvish",
      role: "Co-Founder & CEO",
      bio: "Alvish leads VIARO's strategic expansion, establishing our presence in premium streetwear circles.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
    },
    {
      name: "Bhavin",
      role: "Co-Founder & COO",
      bio: "Bhavin oversees product sourcing and retail operations, ensuring premium fabrications and standard of fit.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      name: "Vishwajeet",
      role: "Co-Founder & Creative Lead",
      bio: "Vishwajeet drives the visual identity and campaign drops, staying true to our streetwear-meets-luxury theme.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
    }
  ];

  const designCredit = data.designCredit || "Designed by Rushali Jivrajani";

  const values = data.values || [
    {
      title: "Premium Quality",
      desc: "Every piece is handpicked for exceptional fabric quality, fine stitching, and lasting comfort."
    },
    {
      title: "All India Delivery",
      desc: "From Kashmir to Kanyakumari — we deliver to every corner of India with care and speed."
    },
    {
      title: "Designed with Passion",
      desc: "Each collection reflects Alvish, Bhavin, and Vishwajeet's eye for modern design."
    },
    {
      title: "Customer First",
      desc: "Easy returns, responsive support, and transparent policies — because you deserve the best experience."
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-viaro-charcoal to-viaro-black text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,45,45,0.08),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-card/5 border border-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight"
          >
            {story.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary text-xs sm:text-sm font-bold uppercase tracking-[0.25em]"
          >
            {story.subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light"
          >
            {story.description}
          </motion.p>
        </div>
      </section>

      {/* FOUNDERS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">The Visionaries</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-foreground">Meet the Founders</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              VIARO is guided by a collective mission to redefine high-street luxury.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <FadeIn key={founder.name} direction="up" delay={index * 0.1}>
              <div className="group bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                  <img
                    src={founder.image}
                    alt={`${founder.name} - ${founder.role}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-xs text-muted-foreground/50 font-light leading-relaxed">{founder.bio}</p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md rounded-2xl px-4 py-3 border border-border shadow-lg group-hover:opacity-0 transition-opacity duration-300">
                    <p className="font-bold text-foreground text-sm uppercase tracking-wider">{founder.name}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{founder.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DESIGN & CRAFT CREDITS */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <FadeIn direction="up">
          <div className="rounded-3xl bg-card border border-border/40 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award className="h-32 w-32 text-primary" />
            </div>
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2 text-primary">
                <Award className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">Design & Craftsmanship</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground">
                Creative Direction & UI/UX Design
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every detail of the VIARO digital boutique — from color systems and custom layout blocks to vector logo systems and fluid animations — has been engineered to deliver a seamless shopping experience.
              </p>
            </div>
            <div className="shrink-0 text-center md:text-right border-t md:border-t-0 md:border-l border-border/60 pt-6 md:pt-0 md:pl-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Digital Architecture by</p>
              <p className="text-xl font-black text-foreground tracking-wide mt-1">{designCredit}</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Lead Creative Architect</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Our Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-foreground">Core Values</h2>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <FadeIn key={i} direction="up" delay={i * 0.1}>
              <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">{v.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DELIVERY DETAILS */}
      <section className="bg-gradient-to-br from-viaro-charcoal to-viaro-black text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,45,45,0.06),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center space-y-8">
          <div className="flex items-center justify-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="font-bold text-[10px] uppercase tracking-widest">All India Logistics Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
            Delivering Style to<br />Every Corner of India
          </h2>
          <p className="text-muted-foreground/80 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            From our metropolitan flagships to regional destinations across India, we partner with premier express logistics networks to secure door-to-door delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto text-[10px] font-bold uppercase tracking-wider">
            {['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Andhra Pradesh', '+ 18 states'].map((state) => (
              <span key={state} className="rounded-full bg-card/5 border border-white/10 px-4 py-1.5 text-slate-350">
                {state}
              </span>
            ))}
          </div>
          <div className="pt-4">
            <Link href="/shop">
              <AnimatedButton variant="primary">
                Shop Collection
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
