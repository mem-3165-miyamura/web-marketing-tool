// components/SessionProviderWrapper.tsx
"use client";

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// childrenを受け取り、SessionProviderでラップするシンプルなClient Component
export default function SessionProviderWrapper({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}