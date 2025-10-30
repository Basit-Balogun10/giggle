import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReelView from '@/ui/reels/ReelView';

export default function ReelsDemo() {
  const slides = [
    { id: 's1', text: 'Slide 1 — Hello from Giggle', bg: '#111827' },
    { id: 's2', text: 'Slide 2 — Offer your services', bg: '#3B82F6' },
    { id: 's3', text: 'Slide 3 — Get paid quickly', bg: '#10B981' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReelView slides={slides} />
    </SafeAreaView>
  );
}
