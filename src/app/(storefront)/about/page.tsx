import React from 'react';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import AboutClient from '@/components/AboutClient';
import { PageTransition } from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'About VIARO | Our Story & Founders',
  description: 'Learn about the story, founders, craftsmanship, and design philosophy behind VIARO - premium streetwear and luxury fashion. Designed by Rushali Jivrajani.',
};

export default async function AboutPage() {
  let aboutData: any = {};

  try {
    const pageData = await db.findOne('website_content', (wc: any) => wc.id === 'about-us');
    if (pageData && pageData.content) {
      try {
        // Try parsing JSON representation first
        aboutData = JSON.parse(pageData.content);
      } catch (err) {
        // If content is not JSON (e.g. edited as raw HTML block), pass it as rawHtml
        aboutData = { rawHtml: pageData.content };
      }
    }
  } catch (err) {
    console.error('Error fetching about page content:', err);
  }

  return (
    <PageTransition>
      <AboutClient data={aboutData} />
    </PageTransition>
  );
}
