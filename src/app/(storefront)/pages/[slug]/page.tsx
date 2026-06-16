import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, FileText, Calendar } from 'lucide-react';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicWebsitePage({ params }: PageProps) {
  // Await params promise for Next.js 16 App Router compatibility
  const { slug } = await params;

  // Retrieve matching content from DB
  const pageData = await db.findOne('website_content', (wc: any) => wc.id === slug);

  if (!pageData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-slate-500">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <span className="text-slate-600 dark:text-slate-400 font-bold">{pageData.title}</span>
      </div>

      {/* Main Content Layout */}
      <article className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Store Page</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {pageData.title}
          </h1>
          {pageData.lastUpdated && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last Updated: {new Date(pageData.lastUpdated).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            </div>
          )}
        </div>

        {/* Page markup content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-650 dark:text-slate-300 space-y-4"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />

      </article>
      
    </div>
  );
}
