import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITransaction extends Document {
  userId: IUser['_id'];
  amount: number;
  date: Date;
  categoryId: Schema.Types.ObjectId;
  description?: string;
  paymentMethod?: 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Other';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Categorie',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Other'],
    default: 'Cash'
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add compound index for efficient querying by user and date range
transactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema); 