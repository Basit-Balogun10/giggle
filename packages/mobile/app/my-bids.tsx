import React from 'react';
import { View } from 'react-native';
import { Text, Button, Card, CardContent } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useAuthClient } from '@/convex/useAuthClient';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function MyBidsScreen() {
  const [bids, setBids] = React.useState<any[]>([]);
  
  const router = useRouter();

  const { user } = useAuthClient();
  const convexBids = useQuery((api as any).functions?.bids?.listByUser as any, { userId: user?.id } as any);
  React.useEffect(() => {
    if (Array.isArray(convexBids)) {
      setBids(convexBids as any[]);
    }
  }, [convexBids]);

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
