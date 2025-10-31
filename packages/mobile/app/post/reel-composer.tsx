import React from 'react';
import { View, TextInput, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { Button, Text } from '@/components/ui';
import SlideBackgroundPicker from '@/ui/reels/SlideBackgroundPicker';
import ReelView from '@/ui/reels/ReelView';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { addOptimisticGig, replaceOptimisticGig, removeOptimisticGigById } from '../../src/optimisticGigs';

export default function ReelComposer() {
  const [slides, setSlides] = React.useState<{ id: string; text?: string; bg?: string }[]>([
    { id: '1', text: '', bg: '#111827' },
  ]);
  const [publishing, setPublishing] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const router = useRouter();
  const create = useMutation(api.functions.gigs.createGig as any);

  function updateSlide(i: number, patch: Partial<{ text: string; bg: string }>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  async function publish() {
    // optimistic: POST to server /api/gigs as a simple reel post. Server shape can be expanded later.
    try {
      if (publishing) return;
      const tempId = `temp_gig_${Date.now()}`;
      const optimisticGig = {
        id: tempId,
        title: 'Reel Post',
        description: slides.map((s) => s.text).join('\n'),
        payout: 0,
        createdAt: new Date().toISOString(),
      };
      addOptimisticGig(optimisticGig as any);
      setPublishing(true);

      const created = await create({ title: 'Reel Post', slides } as any);
      if (created) {
        // reconcile optimistic gig
        try {
          const real = {
            id: String(created._id ?? created.id),
            title: created.title,
            description: created.description ?? undefined,
            payout: created.payout ?? 0,
            createdAt: new Date(Number(created.createdAt ?? created._creationTime)).toISOString(),
          };
          replaceOptimisticGig(tempId, real as any);
        } catch {
          /* ignore */
        }
        router.back();
      } else {
        removeOptimisticGigById(tempId);
        Alert.alert('Publish failed');
      }
    } catch (err) {
      // remove optimistic on failure
      // log error
      console.error(err);
      Alert.alert('Publish failed');
    }
    finally {
      setPublishing(false);
    }
  }

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
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
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginTop: 8 }}
          />
          <SlideBackgroundPicker value={s.bg} onChange={(c) => updateSlide(i, { bg: c })} />
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
            <Button onPress={() => setSlides((p) => p.filter((_, idx) => idx !== i))} variant="destructive">Remove</Button>
            {i > 0 && <Button onPress={() => setSlides((p) => { const copy = [...p]; const tmp = copy[i - 1]; copy[i - 1] = copy[i]; copy[i] = tmp; return copy; })}>Move Up</Button>}
            {i < slides.length - 1 && <Button onPress={() => setSlides((p) => { const copy = [...p]; const tmp = copy[i + 1]; copy[i + 1] = copy[i]; copy[i] = tmp; return copy; })}>Move Down</Button>}
          </View>
        </View>
      ))}

      <Button
        onPress={() => {
          const newSlide = { id: String(Date.now()), text: '', bg: '#111827' };
          setSlides((p) => {
            const next = [...p, newSlide];
            // slight delay to wait for layout, then scroll to bottom
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
            return next;
          });
        }}
      >
        Add Slide
      </Button>

      <View style={{ marginTop: 12 }}>
        <Button onPress={() => setPreviewOpen(true)} variant="secondary">Preview</Button>
      </View>

      <View style={{ marginTop: 12 }}>
        <Button onPress={publish} disabled={publishing || slides.length === 0}>
          {publishing ? <ActivityIndicator color="#fff" /> : 'Publish'}
        </Button>
      </View>

      <Modal visible={previewOpen} animationType="slide" onRequestClose={() => setPreviewOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ReelView slides={slides} />
          <View style={{ position: 'absolute', top: 48, left: 16 }}>
            <Button onPress={() => setPreviewOpen(false)}>Close</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
