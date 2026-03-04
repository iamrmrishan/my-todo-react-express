import { Schema, model, Types } from "mongoose";

export interface ITodo {
  _id: Types.ObjectId;
  title: string;
  description: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Todo = model<ITodo>("Todo", todoSchema);
