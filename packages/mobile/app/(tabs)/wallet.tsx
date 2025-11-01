import React from "react";
import { SafeAreaView, Text, View, Button } from "@/components/ui";
import { Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
// The generated Convex API may not be available during merge reconciliation.
// Use a guarded any-cast access to avoid compile friction.
import { api } from '../../src/convexApiShim';

export default function WalletScreen() {
  // Guard generated API access with any-cast while codegen/types reconcile
  const balance = useQuery((api as any).functions?.ledger?.getBalance as any, { userId: (globalThis as any).__DEV_USER_ID ?? '' } as any) as any;
  const createCharge = useMutation((api as any).functions?.claims?.createCharge as any);

  async function topUp() {
    try {
      // example top-up amount in kobo (1000 => ₦10.00)
      const amount = 1000;
      const res = await createCharge({ amount, metadata: { via: 'mobile-topup' } } as any);
      Alert.alert('Top-up initiated', `Charge reference: ${res?.reference ?? 'unknown'}`);
    } catch (e) {
      Alert.alert('Top-up failed', String(e));
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 p-4">
      <View>
        <Text variant="h2">Wallet</Text>
        <Text className="mt-2">Your balance and transactions will appear here.</Text>
        <View className="mt-4">
          <Text variant="p">Balance: ₦{balance ? (Number(balance) / 100).toLocaleString() : '—'}</Text>
        </View>
        <View className="mt-4">
          <Button onPress={topUp}>Top up (₦10)</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
