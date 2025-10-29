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
