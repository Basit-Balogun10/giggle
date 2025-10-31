import React from "react";
import { SafeAreaView, Text, View } from "@/components/ui";

export default function ProfileScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 p-4">
      <View>
        <Text variant="h2">Profile</Text>
        <Text className="mt-2">
          User profile and settings will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
