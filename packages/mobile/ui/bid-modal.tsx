import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { useThemeTokens } from "@/components/ui/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  gigId: string;
  onSubmit: (payload: {
    amount: number;
    message?: string;
  }) => Promise<void> | void;
};

export default function BidModal({ visible, onClose, gigId, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const tokens = useThemeTokens();

  const styles = {
    overlay: {
      flex: 1,
      justifyContent: "center" as const,
      padding: tokens.spacing.md,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    container: {
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.radii.md,
      padding: tokens.spacing.md,
    },
    title: {
      fontSize: tokens.typography.headingSize,
      fontWeight: "600" as const,
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.text,
    },
    label: { marginBottom: 4, color: tokens.colors.muted },
    input: {
      borderWidth: 1,
      borderColor: tokens.colors.muted,
      padding: tokens.spacing.sm,
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.text,
    },
    actions: {
      flexDirection: "row" as const,
      justifyContent: "flex-end" as const,
    },
    cancelText: { marginRight: 8, padding: 8, color: tokens.colors.muted },
    sendText: { padding: 8, color: tokens.colors.secondary },
  };

  async function submit() {
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    try {
      setLoading(true);
      await onSubmit({ amount: parsed, message: message || undefined });
      setAmount("");
      setMessage("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Place a bid</Text>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={styles.label}>Message (optional)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={{ ...styles.input, marginBottom: tokens.spacing.lg }}
            multiline
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={{ marginRight: 8, padding: 8 }}>
              <Text style={{ color: tokens.colors.muted }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              style={{ padding: 8 }}
              disabled={loading}
            >
              <Text style={{ color: tokens.colors.secondary }}>
                {loading ? "Sending..." : "Send bid"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
