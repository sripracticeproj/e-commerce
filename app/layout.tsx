// root layout file
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'AI-Commerce Engine - Multi-Tenant Platform',
  description: 'Production-ready SaaS commerce console with RLS vector search and custom checkout channels.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
