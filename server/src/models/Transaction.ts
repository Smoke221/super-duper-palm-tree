import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userName: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
  categoryName: string;
  description?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["expense", "income"],
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
transactionSchema.index({ userName: 1, date: -1 });
transactionSchema.index({ userName: 1, type: 1 });
transactionSchema.index({ userName: 1, categoryName: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
