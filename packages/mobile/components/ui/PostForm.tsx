import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import {
  addOptimisticGig,
  replaceOptimisticGig,
  removeOptimisticGigById,
} from "../../src/optimisticGigs";
import { createGigWithRetry } from "../../src/convex/client";
import { useThemeTokens } from "../ui/theme";

type Props = {
  onDone?: () => void;
};

export default function PostForm({ onDone }: Props) {
  const tokens = useThemeTokens();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (title.length > 100) return "Title is too long (100 chars max)";
    return null;
  };

  const submit = async () => {
    setError(null);
    const v = validate();
    if (v) return setError(v);

    setSubmitting(true);
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    addOptimisticGig(optimistic as any);

    try {
      const created = await createGigWithRetry({
        title: title.trim(),
        description: description.trim(),
        payout: 0,
      });
      // reconcile optimistic entry with created one
      replaceOptimisticGig(optimistic.id, created as any);
      setTitle("");
      setDescription("");
      onDone?.();
    } catch (err) {
      // remove optimistic and show error
      removeOptimisticGigById(optimistic.id);
      setError("Failed to create gig. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 16, backgroundColor: tokens.colors.background }}>
      <Text
        style={{ color: tokens.colors.text, fontSize: 18, marginBottom: 8 }}
      >
        Create a gig
      </Text>
      {error ? (
        <Text style={{ color: tokens.colors.accent, marginBottom: 8 }}>
          {error}
        </Text>
      ) : null}
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderColor: tokens.colors.muted,
          borderWidth: 1,
          padding: 8,
          borderRadius: tokens.radii.md,
          marginBottom: 8,
          color: tokens.colors.text,
        }}
        maxLength={100}
      />
      <TextInput
        placeholder="Details (optional)"
        value={description}
        onChangeText={setDescription}
        style={{
          borderColor: tokens.colors.muted,
          borderWidth: 1,
          padding: 8,
          borderRadius: tokens.radii.md,
          marginBottom: 12,
          color: tokens.colors.text,
          minHeight: 80,
        }}
        multiline
      />

      <Button
        title={submitting ? "Posting…" : "Post"}
        onPress={submit}
        disabled={submitting}
      />
    </View>
  );
}
