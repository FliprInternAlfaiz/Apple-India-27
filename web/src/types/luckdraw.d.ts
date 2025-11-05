export interface LuckyDraw {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  offerDetails?: string;
  termsConditions?: string[];
  expiryDate?: string;
  winnerSelectionDate?: string;
  maxParticipants?: number;
  participantCount: number;
  prizes?: Array<{ name: string; description: string; value?: string }>;
  status: string;
}

export interface ActiveLuckyDrawsResponse {
  success: boolean;
  data: LuckyDraw[];
}
