import React from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthClient } from '@/convex/useAuthClient';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Text, Button, Card, CardContent } from '@/components/ui';
import CounterModal from '@/ui/counter-modal';
import { subscribeOptimisticBids } from '../../src/optimisticBids';

export default function GigBidsScreen() {
  const { gigId } = useLocalSearchParams();
  const router = useRouter();
  const gid = Array.isArray(gigId) ? gigId[0] : gigId;
  const [bids, setBids] = React.useState<any[]>([]);
  // loading state intentionally omitted; convex subscriptions update UI
  const [counterModalOpen, setCounterModalOpen] = React.useState(false);
  const [activeBidId, setActiveBidId] = React.useState<string | null>(null);

  const { user } = useAuthClient();
  const convexBids = useQuery(api.functions.bids.listByGig as any, { gigId: gid } as any);
  const acceptMut = useMutation(api.functions.bids.acceptBid as any);
  const rejectMut = useMutation(api.functions.bids.rejectBid as any);
  const counterMut = useMutation(api.functions.bids.counterBid as any);

  React.useEffect(() => {
  let mounted = true;
    try {
      if (Array.isArray(convexBids)) {
        setBids(convexBids as any[]);
      }
    } catch {
      // ignore
    }

    // subscribe to optimistic bids and merge any that belong to this gig
    const unsub = subscribeOptimisticBids((obs) => {
      if (!mounted) return;
      const relevant = obs.filter((o) => o.gigId === gigId);
      setBids((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = relevant.filter((r) => !existingIds.has(r.id));
        return [...newOnes, ...prev];
      });
    });
    return () => { mounted = false; unsub(); };
  }, [convexBids, gigId]);

  async function doAccept(bidId: string) {
    try {
      if (!user) {
        Alert.alert('Not signed in', 'Please sign in as the poster to accept bids');
        return;
      }
      const updated = await acceptMut({ bidId } as any);
      setBids((prev) => prev.map((b) => (String(b.id) === String(updated._id ?? updated.id) ? (updated as any) : b)));
      Alert.alert('Accepted', 'Bid accepted');
    } catch {
      Alert.alert('Error', 'Could not accept bid');
    }
  }

  async function doReject(bidId: string) {
    try {
      if (!user) return Alert.alert('Not signed in', 'Please sign in as the poster to reject bids');
      const updated = await rejectMut({ bidId } as any);
      setBids((prev) => prev.map((b) => (String(b.id) === String(updated._id ?? updated.id) ? (updated as any) : b)));
      Alert.alert('Rejected', 'Bid rejected');
    } catch {
      Alert.alert('Error', 'Could not reject bid');
    }
  }

  async function doCounter(bidId: string, payload: { counterAmount: number; message?: string }) {
    try {
      if (!user) return Alert.alert('Not signed in', 'Please sign in as the poster to send counters');
      const updated = await counterMut({ bidId, counterAmount: payload.counterAmount, message: payload.message } as any);
      setBids((prev) => prev.map((b) => (String(b.id) === String(updated._id ?? updated.id) ? (updated as any) : b)));
      Alert.alert('Counter sent', 'Counter-offer sent to bidder');
    } catch {
      Alert.alert('Error', 'Could not send counter');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Button onPress={() => router.back()}>Back</Button>
        <Text variant="h1" className="mt-4">Bids for gig</Text>
      </View>
      <View style={{ padding: 16 }}>
        {bids.map((b) => (
          <Card key={b.id} className="mb-3">
            <CardContent>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text variant="h3">₦{(b.amount / 100).toLocaleString()}</Text>
                  {b.message ? <Text className="text-muted">{b.message}</Text> : null}
                  <Text className="text-muted" style={{ marginTop: 6 }}>Bidder: <Text style={{ fontWeight: '600' }}>{b.bidderId}</Text></Text>
                </View>
                <View>
                  {/* Status badge */}
                  <View style={{ backgroundColor: b.status === 'accepted' ? '#10B981' : b.status === 'rejected' ? '#EF4444' : b.status === 'countered' ? '#F59E0B' : '#6B7280', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>{String(b.status).toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <Button onPress={() => { setActiveBidId(b.id); setCounterModalOpen(true); }} className="mr-2">Counter</Button>
                <Button onPress={() => doAccept(b.id)} className="mr-2">Accept</Button>
                <Button variant="secondary" onPress={() => doReject(b.id)}>Reject</Button>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

      <CounterModal visible={counterModalOpen} onClose={() => { setCounterModalOpen(false); setActiveBidId(null); }} onSubmit={async (payload) => {
        if (!activeBidId) return;
        await doCounter(activeBidId, payload);
      }} />
    </View>
  );
}
