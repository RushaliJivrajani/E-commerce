'use client';

import React from 'react';
import { Award, MapPin, Sparkles, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
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
  icon: any;
}

interface AboutData {
  story?: any;
  founders?: Founder[];
  designCredit?: string;
  values?: ValueItem[];
  rawHtml?: string;
}

// Framer Motion text animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as any, damping: 12, stiffness: 100 }
  }
};

export default function AboutClient({ data }: { data: AboutData }) {
  const founders = data.founders || [
    {
      name: "Alvish",
      role: "Co-Founder & CEO",
      bio: "Alvish leads VIARO's strategic expansion, establishing our presence in premium streetwear circles.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
    },
    {
      name: "Bhavin",
      role: "Co-Founder & CEO",
      bio: "Bhavin oversees product sourcing and retail operations, ensuring premium fabrications and standard of fit.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      name: "Vishwajeet",
      role: "Co-Founder & CEO",
      bio: "Vishwajeet drives the visual identity and campaign drops, staying true to our streetwear-meets-luxury theme.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
    }
  ];

  const designCredit = data.designCredit || "Designed by Rushali Jivrajani.";

  const values = [
    { title: "Craftsmanship", desc: "Precision stitching and fine textiles.", icon: Award },
    { title: "Minimalism", desc: "Uncluttered, confident aesthetics.", icon: Sparkles },
    { title: "Modern Style", desc: "Designed for the pace of today.", icon: Heart },
    { title: "Authenticity", desc: "No compromises on our identity.", icon: ShieldCheck }
  ];

  const headline = "Modern. Minimal. Made for the now.".split(" ");

  return (
    <div className="bg-background text-foreground overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center px-4 py-20 overflow-hidden bg-viaro-black text-white">
        {/* Subtle velvet/grain texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,45,45,0.1),transparent_70%)]" />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-2"
        >
          {headline.map((word, i) => (
            <motion.span key={i} variants={wordVariant} className="text-4xl sm:text-6xl md:text-7xl font-headings font-bold uppercase tracking-tight">
              {word}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* 2. BRAND STORY SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 text-center"
        >
          <div className="text-2xl font-headings font-bold uppercase tracking-widest text-primary italic">
             "Own Your Style."
          </div>
          
          <div className="text-base sm:text-lg text-muted-foreground leading-relaxed space-y-6 font-sans font-light">
            <p>
              VIARO was born from a desire to bridge the gap between high-street fashion and accessible luxury. We saw a landscape cluttered with noise and chose a different path—one defined by clean lines, premium fabrications, and unapologetic confidence.
            </p>
            <p>
              Every piece in our collection is an invitation to express your most authentic self. We don't just make clothes; we engineer armor for the modern world.
            </p>
          </div>

          <div className="text-xl font-headings font-medium tracking-widest text-foreground mt-8">
             Live in Style.
          </div>
        </motion.div>
      </section>

      {/* 3. FOUNDERS SECTION */}
      <section className="py-24 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-headings font-bold uppercase tracking-wider">The Visionaries</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group flex flex-col items-center text-center space-y-4"
              >
                <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted relative mb-4">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:-translate-y-2"
                  />
                  {/* Subtle lift overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                
                <div className="relative inline-block">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">{founder.name}</h3>
                  {/* Red accent underline on hover */}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </div>
                
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{founder.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">{founder.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALUES/PILLARS STRIP */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl hover:bg-card transition-colors border border-transparent hover:border-border/50"
            >
              <div className="p-3 bg-primary/10 text-primary rounded-full mb-2">
                <v.icon className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest">{v.title}</h4>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. DESIGN CREDIT SECTION */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="py-12 border-t border-border/20 text-center"
      >
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.3em]">
          {designCredit}
        </p>
      </motion.section>

      {/* 6. CLOSING CTA */}
      <section className="py-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-headings font-bold uppercase tracking-tight">Ready to Own Your Style?</h2>
          <Link href="/shop" className="inline-block">
            <AnimatedButton variant="primary">
              Shop The Collection
            </AnimatedButton>
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
