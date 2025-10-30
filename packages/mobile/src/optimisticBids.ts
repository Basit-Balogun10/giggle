type Bid = {
  id: string;
  gigId: string;
  bidderId: string;
  amount: number;
  message?: string;
  status: 'pending' | 'countered' | 'accepted' | 'rejected';
  createdAt: string;
};

let bids: Bid[] = [];
const listeners = new Set<(b: Bid[]) => void>();

export function getOptimisticBids() {
  return bids.slice();
}

export function subscribeOptimisticBids(fn: (b: Bid[]) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addOptimisticBid(b: Bid) {
  bids = [b, ...bids];
  listeners.forEach((l) => l(bids.slice()));
}

export function updateOptimisticBid(id: string, patch: Partial<Bid>) {
  bids = bids.map((x) => (x.id === id ? { ...x, ...patch } : x));
  listeners.forEach((l) => l(bids.slice()));
}

export function removeOptimisticBid(id: string) {
  bids = bids.filter((x) => x.id !== id);
  listeners.forEach((l) => l(bids.slice()));
}

export function clearOptimisticBids() {
  bids = [];
  listeners.forEach((l) => l(bids.slice()));
}

export function replaceOptimisticBid(tempId: string, realBid: Bid) {
  bids = bids.map((x) => (x.id === tempId ? realBid : x));
  listeners.forEach((l) => l(bids.slice()));
}
