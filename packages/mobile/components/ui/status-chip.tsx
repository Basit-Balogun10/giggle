import * as React from 'react';
import { View, Text as RNText, type ViewProps, TextStyle } from 'react-native';
import { useThemeTokens } from './theme';

type StatusType = 'pending' | 'countered' | 'accepted' | 'rejected' | string;

interface StatusChipProps extends ViewProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

function labelFor(status: StatusType) {
  if (!status) return '';
  return String(status).toUpperCase();
}

export default function StatusChip({ status, size = 'md', style, ...props }: StatusChipProps) {
  const tokens = useThemeTokens();

  // Map semantic status to token colors
  const mapping: Record<string, { bg: string; color: string }> = {
    accepted: { bg: tokens.colors.success, color: '#ffffff' },
    rejected: { bg: tokens.colors.error, color: '#ffffff' },
    countered: { bg: tokens.colors.secondary, color: '#041124' },
    pending: { bg: tokens.colors.muted, color: '#ffffff' },
  };

  const chosen = mapping[String(status).toLowerCase()] ?? { bg: tokens.colors.surface, color: tokens.colors.text };

  const paddingHorizontal = size === 'sm' ? 8 : 10;
  const paddingVertical = size === 'sm' ? 4 : 6;

  const textStyle: TextStyle = {
    color: chosen.color,
    fontWeight: '700',
    fontSize: size === 'sm' ? 12 : 13,
  };

  return (
    <View
      style={[{ backgroundColor: chosen.bg, paddingHorizontal, paddingVertical, borderRadius: 16, alignSelf: 'flex-start' }, style]}
      {...props}
    >
      <RNText style={textStyle}>{labelFor(status)}</RNText>
    </View>
  );
}

StatusChip.displayName = 'StatusChip';
