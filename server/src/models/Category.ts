import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure category names are unique
    },
  },
  {
    timestamps: true,
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

export const Category = mongoose.model<ICategory>("Category", categorySchema);
