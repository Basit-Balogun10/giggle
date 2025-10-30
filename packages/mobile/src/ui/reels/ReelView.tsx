import React from 'react';
import { View } from 'react-native';
import ReelSlides from './ReelSlides';

export default function ReelView({ slides, autoplay = true }: { slides: { id: string; text?: string; bg?: string }[]; autoplay?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <ReelSlides slides={slides} autoplay={autoplay} />
    </View>
  );
}
