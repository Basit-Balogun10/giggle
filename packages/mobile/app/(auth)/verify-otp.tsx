import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import OTPInputView from 'input-otp-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthClient } from '@/convex/useAuthClient';

export default function VerifyOtpScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyOtp } = useAuthClient();

  async function onVerify() {
    await verifyOtp(code || String(params.phone ?? code));
    // navigate home after successful sign-in
    router.replace('/');
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Enter code</Text>
      <OTPInputView
        pinCount={6}
        onCodeChanged={(c: string) => setCode(c)}
        autoFocusOnLoad
        containerStyle={{ marginBottom: 16 }}
      />
      <Pressable onPress={onVerify} style={{ backgroundColor: '#0f62fe', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Verify</Text>
      </Pressable>
    </View>
  );
}
