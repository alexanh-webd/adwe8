import mongoose, {Schema, Document} from "mongoose";

interface ITopic extends Document {
    title: string;
    content: string;
    username: string;
    createdAt: Date;
}
// This is an example from week 8 exercise
const topicSchema = new Schema<ITopic>({
    title: {type: String, required: true},
    content: {type: String, required: true},
    username: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export { Topic, type ITopic };