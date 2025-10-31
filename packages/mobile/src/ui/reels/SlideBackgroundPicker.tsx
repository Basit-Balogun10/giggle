import React from "react";
import { View, Pressable, TextInput, Alert } from "react-native";
import { Text, Button } from "@/components/ui";
import { useThemeTokens } from "../../../components/ui/theme";
import { defaultSlidePresets } from "../reels/slide-presets";

export default function SlideBackgroundPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (c: string) => void;
}) {
  const tokens = useThemeTokens();

  const PRESETS = defaultSlidePresets(tokens);
  const [custom, setCustom] = React.useState("");

  return (
    <View style={{ padding: 12 }}>
      <Text variant="h3">Background presets</Text>
      <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
        {PRESETS.map((p) => (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: p,
              borderWidth: value === p ? 3 : 0,
              borderColor: value === p ? tokens.colors.text : "transparent",
            }}
          />
        ))}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text variant="small">Custom hex</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="#RRGGBB"
            style={{
              borderWidth: 1,
              borderColor: tokens.colors.muted,
              padding: 8,
              borderRadius: 6,
              flex: 1,
            }}
          />
          <Button
            onPress={() => {
              const hex = custom.trim();
              if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex)) {
                onChange(hex);
                setCustom("");
              } else {
                // simple feedback
                Alert.alert(
                  "Invalid color",
                  "Enter a valid hex color like #RRGGBB"
                );
              }
            }}
          >
            Use
          </Button>
        </View>
      </View>
    </View>
  );
}
