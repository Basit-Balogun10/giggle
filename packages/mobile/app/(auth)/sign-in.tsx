import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuthClient } from "@/convex/useAuthClient";
import { useThemeTokens } from "../../components/ui/theme";

export default function SignInScreen() {
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const { sendOtp } = useAuthClient();
  const tokens = useThemeTokens();

  async function onContinue() {
    await sendOtp(phone);
    // route to verify screen; pass phone as param
    router.push({ pathname: "/(auth)/verify-otp", params: { phone } } as any);
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
        Sign in
      </Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone or ID (dev)"
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          borderColor: tokens.colors.muted,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          color: tokens.colors.text,
        }}
      />
      <Pressable
        onPress={onContinue}
        style={{
          backgroundColor: tokens.colors.secondary,
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: tokens.colors.surface, textAlign: "center" }}>
          Send code
        </Text>
      </Pressable>
    </View>
  );
}
