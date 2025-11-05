import { Schema, model } from 'mongoose';
import { IConferenceNews, IConferenceNewsModel } from '../../interface/conferenceNews.interface';


const schema = new Schema<IConferenceNews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      comment: 'Higher priority news will be shown first',
    },
    expiryDate: {
      type: Date,
      default: null,
      comment: 'News will not be shown after this date',
    },
    clickUrl: {
      type: String,
      default: null,
      comment: 'Optional URL to redirect when user clicks on the news',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    closeCount: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.index({ isActive: 1, priority: -1, createdAt: -1 });
schema.index({ expiryDate: 1 });

schema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

const ConferenceNewsModel: IConferenceNewsModel = model<IConferenceNews, IConferenceNewsModel>(
  'conferenceNews',
  schema
);

export default ConferenceNewsModel;