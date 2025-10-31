import React from 'react';
import { SafeAreaView, Text, View } from '@/components/ui';

export default function WalletScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 p-4">
      <View>
        <Text variant="h2">Wallet</Text>
        <Text className="mt-2">Your balance and transactions will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}
