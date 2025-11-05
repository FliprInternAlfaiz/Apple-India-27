import { Document, Model } from 'mongoose';

export interface IConferenceNews extends Document {
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  priority: number;
  expiryDate?: Date | null;
  clickUrl?: string | null;
  viewCount: number;
  closeCount: number;
  createdAt: Date;
  updatedAt: Date;
  isExpired?: boolean;
}

export interface IConferenceNewsModel extends Model<IConferenceNews> {}