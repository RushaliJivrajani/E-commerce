'use client';

import React, { useState, useEffect } from 'react';
import VMark3D from './VMark3D';
import { SkeletonBlock } from './SkeletonBlock';

export default function VMark3DWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SkeletonBlock className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-40 mix-blend-screen dark:mix-blend-normal" />;
  }

  return <VMark3D />;
}
