import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ProductDetailWrapper from '@/components/ProductDetailWrapper';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  // Await the parameters promise (Strict Next.js 16 requirement)
  const { slug } = await params;

  // Fetch product from database
  const product = await db.findOne('products', (p: any) => p.slug === slug && p.status === 'Active');

  if (!product) {
    notFound();
  }

  // Fetch reviews for this product
  const reviews = await db.find('reviews', (r: any) => r.productId === product.id && r.status === 'Approved');

  // Fetch similar products in same category (excluding active product)
  const similarProducts = await db.find(
    'products',
    (p: any) => p.category === product.category && p.id !== product.id && p.status === 'Active'
  );

  return (
    <ProductDetailWrapper
      product={product}
      reviews={reviews || []}
      similarProducts={similarProducts ? similarProducts.slice(0, 4) : []}
    />
  );
}
