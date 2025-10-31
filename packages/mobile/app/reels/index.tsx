import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ReelFeed from "@/ui/reels/ReelFeed";

export default function ReelsScreen() {
  // TODO: replace with real data from Convex subscriptions
  const sample = [
    { id: "r1", slides: [{ id: "s1", text: "Hello — Reel 1", bg: "#111827" }] },
    { id: "r2", slides: [{ id: "s1", text: "Reel 2 — Offer", bg: "#3B82F6" }] },
    {
      id: "r3",
      slides: [{ id: "s1", text: "Reel 3 — Get paid", bg: "#10B981" }],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReelFeed data={sample} />
    </SafeAreaView>
  );
}
