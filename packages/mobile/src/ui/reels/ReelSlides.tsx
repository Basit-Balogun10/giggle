import React from 'react';
import { View, ScrollView, Dimensions, Pressable } from 'react-native';
import { Text } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function ReelSlides({
  slides,
  autoplay = true,
  autoplayDelay = 4000,
}: {
  slides: { id: string; text?: string; bg?: string }[];
  autoplay?: boolean;
  autoplayDelay?: number;
}) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const indexRef = React.useRef(index);

  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  React.useEffect(() => {
    if (!autoplay) return;
  let id: number | null = null;
    function tick() {
      if (paused) return;
      const next = Math.min(slides.length - 1, indexRef.current + 1);
      if (next !== indexRef.current) {
        setIndex(next);
        if (scrollRef.current) scrollRef.current.scrollTo({ x: next * width, animated: true });
      }
    }
  id = setInterval(tick, autoplayDelay) as unknown as number;
  return () => { if (id !== null) clearInterval(id); };
  }, [autoplay, autoplayDelay, paused, slides.length]);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    setIndex(clamped);
    indexRef.current = clamped;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: clamped * width, animated: true });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const ix = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(ix);
          indexRef.current = ix;
        }}
      >
        {slides.map((s) => (
          <View key={s.id} style={{ width, height, backgroundColor: s.bg ?? '#000', justifyContent: 'center', alignItems: 'center' }}>
            <Text className="text-white text-2xl">{s.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tap zones: left half = prev, right half = next; long-press toggles pause */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        <Pressable
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: width / 2 }}
          onPress={() => { if (!paused) goTo(index - 1); }}
          onLongPress={() => setPaused((p) => !p)}
        />
        <Pressable
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: width / 2 }}
          onPress={() => { if (!paused) goTo(index + 1); }}
          onLongPress={() => setPaused((p) => !p)}
        />
      </View>

      {/* Overlay controls: like & share */}
      <View style={{ position: 'absolute', right: 16, top: height / 3, alignItems: 'center' }}>
        <Pressable onPress={() => setLiked((v) => !v)} style={{ marginBottom: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: liked ? '#ef4444' : '#ffffff22', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: liked ? '#fff' : '#fff' }}>{liked ? '♥' : '♡'}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => { /* TODO: share sheet */ }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#ffffff22', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff' }}>↗</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          {slides.map((s, i) => (
            <View key={s.id} style={{ width: i === index ? 28 : 10, height: 6, borderRadius: 3, backgroundColor: i === index ? '#fff' : '#ffffff66', marginHorizontal: 4 }} />
          ))}
        </View>
      </View>
    </View>
  );
}
