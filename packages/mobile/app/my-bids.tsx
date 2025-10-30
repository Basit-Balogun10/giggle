import React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Text, Button, Card, CardContent } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useAuthClient } from '@/convex/useAuthClient';
import fetchWithAuth from '@/network/fetchWithAuth';

export default function MyBidsScreen() {
  const [bids, setBids] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const { user } = useAuthClient();

  React.useEffect(() => {
    let mounted = true;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (!user) {
          setLoading(false);
          return;
        }
  const res = await fetchWithAuth('http://localhost:3333/api/bids/me', { headers: {} });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || cancelled) return;
        setBids(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(() => {
      load();
    }, 5000);

    return () => { mounted = false; cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Button onPress={() => router.back()}>Back</Button>
        <Text variant="h1" className="mt-4">My Bids</Text>
      </View>
      <View style={{ padding: 16 }}>
        {bids.map((b) => (
          <Card key={b.id} className="mb-3">
            <CardContent>
              <Text variant="h3">₦{(b.amount / 100).toLocaleString()}</Text>
              {b.message ? <Text className="text-muted">{b.message}</Text> : null}
              <Text className="text-muted" style={{ marginTop: 6 }}>Status: <Text style={{ fontWeight: '700' }}>{b.status}</Text></Text>
            </CardContent>
          </Card>
        ))}
      </View>
    </View>
  );
}
