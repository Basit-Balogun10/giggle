import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Button, Text } from "@/components/ui";
import SlideBackgroundPicker from "@/ui/reels/SlideBackgroundPicker";
import ReelView from "@/ui/reels/ReelView";
import { defaultSlidePresets } from "../../src/ui/reels/slide-presets";
import { useRouter } from "expo-router";
import fetchWithAuth from "@/network/fetchWithAuth";
import {
  addOptimisticGig,
  replaceOptimisticGig,
  removeOptimisticGigById,
} from "../../src/optimisticGigs";
import { useThemeTokens } from "../../components/ui/theme";

export default function ReelComposer() {
  const tokens = useThemeTokens();

  const presets = defaultSlidePresets(tokens);
  const [slides, setSlides] = React.useState<
    { id: string; text?: string; bg?: string }[]
  >([{ id: "1", text: "", bg: presets[0] ?? tokens.colors.background }]);
  const [publishing, setPublishing] = React.useState(false);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const router = useRouter();

  function updateSlide(
    i: number,
    patch: Partial<{ text: string; bg: string }>
  ) {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }

  async function publish() {
    // optimistic: POST to server /api/gigs as a simple reel post. Server shape can be expanded later.
    try {
      if (publishing) return;
      const tempId = `temp_gig_${Date.now()}`;
      const optimisticGig = {
        id: tempId,
        title: "Reel Post",
        description: slides.map((s) => s.text).join("\n"),
        payout: 0,
        createdAt: new Date().toISOString(),
      };
      addOptimisticGig(optimisticGig as any);
      setPublishing(true);

      const res = await fetchWithAuth("http://localhost:3333/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Reel Post", slides }),
      });
      if (res.ok) {
        const real = await res.json();
        replaceOptimisticGig(tempId, real);
        router.back();
      } else {
        const body = await res.text();
        removeOptimisticGigById(tempId);
        Alert.alert("Publish failed", body);
      }
    } catch (err) {
      // remove optimistic on failure

      console.error(err);
      Alert.alert("Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="h2">Create Reel</Text>
      <View style={{ height: 400, marginVertical: 12 }}>
        <ReelView slides={slides} />
      </View>

      {slides.map((s, i) => (
        <View key={s.id} style={{ marginBottom: 12 }}>
          <Text variant="small">Slide {i + 1}</Text>
          <TextInput
            placeholder="Text"
            value={s.text}
            onChangeText={(t) => updateSlide(i, { text: t })}
            style={{
              borderWidth: 1,
              borderColor: tokens.colors.muted,
              padding: 8,
              borderRadius: 8,
              marginTop: 8,
            }}
          />
          <SlideBackgroundPicker
            value={s.bg}
            onChange={(c) => updateSlide(i, { bg: c })}
          />
          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            <Button
              onPress={() => setSlides((p) => p.filter((_, idx) => idx !== i))}
              variant="destructive"
            >
              Remove
            </Button>
            {i > 0 && (
              <Button
                onPress={() =>
                  setSlides((p) => {
                    const copy = [...p];
                    const tmp = copy[i - 1];
                    copy[i - 1] = copy[i];
                    copy[i] = tmp;
                    return copy;
                  })
                }
              >
                Move Up
              </Button>
            )}
            {i < slides.length - 1 && (
              <Button
                onPress={() =>
                  setSlides((p) => {
                    const copy = [...p];
                    const tmp = copy[i + 1];
                    copy[i + 1] = copy[i];
                    copy[i] = tmp;
                    return copy;
                  })
                }
              >
                Move Down
              </Button>
            )}
          </View>
        </View>
      ))}

      <Button
        onPress={() => {
          const newSlide = {
            id: String(Date.now()),
            text: "",
            bg: presets[0] ?? tokens.colors.background,
          };
          setSlides((p) => {
            const next = [...p, newSlide];
            // slight delay to wait for layout, then scroll to bottom
            setTimeout(
              () => scrollRef.current?.scrollToEnd({ animated: true }),
              120
            );
            return next;
          });
        }}
      >
        Add Slide
      </Button>

      <View style={{ marginTop: 12 }}>
        <Button onPress={publish} disabled={publishing || slides.length === 0}>
          {publishing ? (
            <ActivityIndicator color={tokens.colors.text} />
          ) : (
            "Publish"
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
