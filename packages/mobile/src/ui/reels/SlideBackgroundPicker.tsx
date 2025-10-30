import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui';

const PRESETS = ['#000000', '#111827', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export default function SlideBackgroundPicker({ value, onChange }: { value?: string; onChange: (c: string) => void }) {
  return (
    <View style={{ padding: 12 }}>
      <Text variant="h3">Background presets</Text>
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
        {PRESETS.map((p) => (
          <Pressable key={p} onPress={() => onChange(p)} style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: p, borderWidth: value === p ? 3 : 0, borderColor: '#fff' }} />
        ))}
      </View>
    </View>
  );
}
