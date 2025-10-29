import React from 'react';
import { Alert, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, KeyboardAvoidingView, ScrollView, Text, Input, Label, Button } from '@/components/ui';
import { addOptimisticGig, removeOptimisticGigById, replaceOptimisticGig } from '../src/optimisticGigs';

type Gig = {
  id: string;
  title: string;
  description?: string;
  payout: number;
  location?: string;
  tags?: string[];
  createdAt: string;
};

export default function PostScreen() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [payout, setPayout] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!title || !payout) {
      Alert.alert('Validation', 'Please provide a title and payout');
      return;
    }

    // optimistic update: add a temporary gig to the feed immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticGig: Gig = {
      id: tempId,
      title,
      description,
      payout: Number(payout),
      location,
      tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      createdAt: new Date().toISOString(),
    };
    try {
      addOptimisticGig(optimisticGig as any);
    } catch {
      // swallow if optimistic store not available
    }

    setLoading(true);
    try {
      const body = {
        title,
        description,
        payout: Number(payout),
        location,
        tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      };

      // NOTE: When testing on a physical device or emulator you may need to
      // replace 'localhost' with your machine's LAN IP or use Expo tunnel.
      const res = await fetch('http://localhost:3333/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      // reconcile optimistic entry: replace temp with server-created gig
      try {
        replaceOptimisticGig(tempId, json);
      } catch {
        /* ignore */
      }
      Alert.alert('Success', `Created gig: ${json.id}`);
      router.back();
    } catch (err) {
      // remove optimistic gig on failure
      try {
        removeOptimisticGigById(tempId);
      } catch {
        /* ignore */
      }
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} className="flex-1">
        <ScrollView contentContainerClassName="p-4">
          <Text variant="h2" className="mb-4">Create a Gig</Text>

          <View className="mb-3">
            <Label>Title</Label>
            <Input value={title} onChangeText={setTitle} placeholder="One-line gig title" />
          </View>

          <View className="mb-3">
            <Label>Description</Label>
            <Input value={description} onChangeText={setDescription} placeholder="Optional details" />
          </View>

          <View className="mb-3">
            <Label>Payout (in kobo)</Label>
            <Input value={payout} onChangeText={setPayout} placeholder="e.g. 35000" keyboardType="numeric" />
          </View>

          <View className="mb-6">
            <Label>Location</Label>
            <Input value={location} onChangeText={setLocation} placeholder="Lagos, Campus, etc" />
          </View>

          <View className="mb-6">
            <Label>Tags (comma-separated)</Label>
            <Input value={tags} onChangeText={setTags} placeholder="design, dev, marketing" />
          </View>

          <Button onPress={submit} disabled={loading}>
            <Text>{loading ? 'Posting...' : 'Post Gig'}</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Named export for modal-style post form (used elsewhere if needed)
export function PostModal() {
  const router = useRouter();
  const [form, setForm] = React.useState({ title: '', description: '', payout: '', location: '' });
  const [tags, setTags] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.payout) {
      Alert.alert('Validation', 'Please enter a title and payout');
      return;
    }

    const payoutInt = Math.round(Number(form.payout) * 100);
    if (Number.isNaN(payoutInt) || payoutInt <= 0) {
      Alert.alert('Validation', 'Payout must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3333/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          payout: payoutInt,
          location: form.location,
          tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      Alert.alert('Posted', 'Your gig was posted');
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Error', (err as Error).message || 'Failed to post gig');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 p-4">
      <Text variant="h2" className="mb-4">Create a Gig</Text>

      <View className="mb-3">
        <Input value={form.title} onChangeText={(t) => update('title', t)} placeholder="One-line gig title" />
      </View>

      <View className="mb-3">
        <Input value={form.description} onChangeText={(t) => update('description', t)} placeholder="Description (optional)" />
      </View>

      <View className="mb-3">
        <Input value={tags} onChangeText={setTags} placeholder="Tags (comma-separated)" />
      </View>

      <View className="mb-3">
        <Input keyboardType="numeric" value={form.payout} onChangeText={(t) => update('payout', t)} placeholder="Payout (₦)" />
      </View>

      <View className="mb-6">
        <Input value={form.location} onChangeText={(t) => update('location', t)} placeholder="Location (optional)" />
      </View>

      <Button onPress={handleSubmit} disabled={submitting}>
        <Text>{submitting ? 'Posting...' : 'Post Gig'}</Text>
      </Button>

      <View className="h-8" />
    </SafeAreaView>
  );
}
