type Gig = {
  id: string;
  title: string;
  description?: string;
  payout: number;
  location?: string;
  tags?: string[];
  createdAt: string;
};

let gigs: Gig[] = [];
const listeners = new Set<(g: Gig[]) => void>();

export function getOptimisticGigs() {
  return gigs.slice();
}

export function subscribeOptimisticGigs(fn: (g: Gig[]) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addOptimisticGig(g: Gig) {
  gigs = [g, ...gigs];
  listeners.forEach((l) => l(gigs.slice()));
}

export function removeOptimisticGigById(id: string) {
  gigs = gigs.filter((x) => x.id !== id);
  listeners.forEach((l) => l(gigs.slice()));
}

export function clearOptimisticGigs() {
  gigs = [];
  listeners.forEach((l) => l(gigs.slice()));
}

export function replaceOptimisticGig(tempId: string, realGig: Gig) {
  gigs = gigs.map((g) => (g.id === tempId ? realGig : g));
  listeners.forEach((l) => l(gigs.slice()));
}
