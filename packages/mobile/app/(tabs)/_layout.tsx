import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu-demo"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="menucard" color={color} />
          ),
        }}
      />

      {/* Post button: opens the /post screen as a modal */}
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus" color={color} />
          ),
          // Use a custom tabBarButton to navigate to the root /post route as a modal
          tabBarButton: (props) => (
            <Pressable
              accessibilityLabel="Create post"
              onPress={() => router.push("/post")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                size={28}
                name="plus"
                color={Colors[colorScheme ?? "light"].tint}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="permissions-demo"
        options={{
          title: "Permissions",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="checkmark.shield.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="chevron.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="error-demo"
        options={{
          title: "Errors",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={22}
              name="exclamationmark.triangle.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
