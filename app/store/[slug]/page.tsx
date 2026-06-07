'use client';

import React from 'react';
import { CustomerStorefront } from '../../../components/storefront/storefront-page';

interface StorefrontPageProps {
  params: {
    slug: string;
  };
}

export default function StorefrontPage({ params }: StorefrontPageProps) {
  return (
    <div className="bg-zinc-950 h-screen overflow-y-auto">
      <CustomerStorefront merchantSlug={params.slug} />
    </div>
  );
}
