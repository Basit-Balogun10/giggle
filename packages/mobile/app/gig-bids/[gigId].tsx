import React from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthClient } from "@/convex/useAuthClient";
import fetchWithAuth from "@/network/fetchWithAuth";
import { Text, Button, Card, CardContent } from "@/components/ui";
import CounterModal from "@/ui/counter-modal";
import StatusChip from "@/components/ui/status-chip";
import { subscribeOptimisticBids } from "../../src/optimisticBids";

export default function GigBidsScreen() {
  const { gigId } = useLocalSearchParams();
  const router = useRouter();
  const gid = Array.isArray(gigId) ? gigId[0] : gigId;
  const [bids, setBids] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [counterModalOpen, setCounterModalOpen] = React.useState(false);
  const [activeBidId, setActiveBidId] = React.useState<string | null>(null);

  const { user } = useAuthClient();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!user) {
          // Not signed in — navigate to sign-in
          // We intentionally don't block rendering here but return early
          setLoading(false);
          return;
        }
        const res = await fetchWithAuth(
          `http://localhost:3333/api/gigs/${encodeURIComponent(
            gid ?? ""
          )}/bids`,
          {
            headers: {},
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setBids(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();

    // subscribe to optimistic bids and merge any that belong to this gig
    const unsub = subscribeOptimisticBids((obs) => {
      if (!mounted) return;
      const relevant = obs.filter((o) => o.gigId === gigId);
      setBids((prev) => {
        // avoid duplication: keep existing real bids and prepend optimistic ones that aren't present
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = relevant.filter((r) => !existingIds.has(r.id));
        return [...newOnes, ...prev];
      });
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [gigId, user]);

  async function doAccept(bidId: string) {
    try {
      if (!user) {
        Alert.alert(
          "Not signed in",
          "Please sign in as the poster to accept bids"
        );
        return;
      }
      const res = await fetchWithAuth(
        `http://localhost:3333/api/bids/${encodeURIComponent(bidId)}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error("failed");
      const updated = await res.json();
      setBids((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      Alert.alert("Accepted", "Bid accepted");
    } catch {
      Alert.alert("Error", "Could not accept bid");
    }
  }

  async function doReject(bidId: string) {
    try {
      if (!user)
        return Alert.alert(
          "Not signed in",
          "Please sign in as the poster to reject bids"
        );
      const res = await fetchWithAuth(
        `http://localhost:3333/api/bids/${encodeURIComponent(bidId)}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error("failed");
      const updated = await res.json();
      setBids((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      Alert.alert("Rejected", "Bid rejected");
    } catch {
      Alert.alert("Error", "Could not reject bid");
    }
  }

  async function doCounter(
    bidId: string,
    payload: { counterAmount: number; message?: string }
  ) {
    try {
      if (!user)
        return Alert.alert(
          "Not signed in",
          "Please sign in as the poster to send counters"
        );
      const res = await fetchWithAuth(
        `http://localhost:3333/api/bids/${encodeURIComponent(bidId)}/counter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("failed");
      const updated = await res.json();
      setBids((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      Alert.alert("Counter sent", "Counter-offer sent to bidder");
    } catch {
      Alert.alert("Error", "Could not send counter");
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Button onPress={() => router.back()}>Back</Button>
        <Text variant="h1" className="mt-4">
          Bids for gig
        </Text>
      </View>
      <View style={{ padding: 16 }}>
        {bids.map((b) => (
          <Card key={b.id} className="mb-3">
            <CardContent>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text variant="h3">₦{(b.amount / 100).toLocaleString()}</Text>
                  {b.message ? (
                    <Text className="text-muted">{b.message}</Text>
                  ) : null}
                  <Text className="text-muted" style={{ marginTop: 6 }}>
                    Bidder:{" "}
                    <Text style={{ fontWeight: "600" }}>{b.bidderId}</Text>
                  </Text>
                </View>
                <View>
                  {/* Status badge */}
                  {/* Use centralized token-aware StatusChip so colors follow theme */}
                  <StatusChip status={b.status} />
                </View>
              </View>

              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <Button
                  onPress={() => {
                    setActiveBidId(b.id);
                    setCounterModalOpen(true);
                  }}
                  className="mr-2"
                >
                  Counter
                </Button>
                <Button onPress={() => doAccept(b.id)} className="mr-2">
                  Accept
                </Button>
                <Button variant="secondary" onPress={() => doReject(b.id)}>
                  Reject
                </Button>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

      <CounterModal
        visible={counterModalOpen}
        onClose={() => {
          setCounterModalOpen(false);
          setActiveBidId(null);
        }}
        onSubmit={async (payload) => {
          if (!activeBidId) return;
          await doCounter(activeBidId, payload);
        }}
      />
    </View>
  );
}
