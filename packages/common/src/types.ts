export interface Gig {
  id: string;
  title: string;
  description?: string;
  payout: number; // in kobo or smallest currency unit
  location?: string;
  tags?: string[];
  createdAt: string; // ISO timestamp
  authorId: string;
}

export interface CreateGigDTO {
  title: string;
  description?: string;
  payout: number;
  location?: string;
  tags?: string[];
}

export interface ClaimGigDTO {
  gigId: string;
  userId: string;
}

export type BidStatus = 'pending' | 'countered' | 'accepted' | 'rejected';

export interface Bid {
  id: string;
  gigId: string;
  bidderId: string;
  amount: number; // in kobo
  message?: string;
  status: BidStatus;
  counterAmount?: number;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface CreateBidDTO {
  gigId: string;
  amount: number;
  message?: string;
}

export interface UpdateBidDTO {
  amount?: number;
  message?: string;
}
