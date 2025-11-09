import mongoose, { Schema } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
