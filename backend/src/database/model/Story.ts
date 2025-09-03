import { model, Schema, Types } from "mongoose";

export const DOCUMENT_NAME = "Story";

export default interface Story {
  _id: Types.ObjectId;
  user?: Types.ObjectId; // optional reference to User
  name: string;          // name like "Musala"
  message: string;       // the story content
  createdAt?: Date;
}

const schema = new Schema<Story>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // allow anonymous stories
  },
  name: {
    type: Schema.Types.String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  message: {
    type: Schema.Types.String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
});

export const StoryModel = model<Story>(DOCUMENT_NAME, schema);
