import mongoose, { Schema, Document } from "mongoose";
// This is an example from week 8 exercise
const topicSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Topic = mongoose.model("Topic", topicSchema);
export { Topic };
//# sourceMappingURL=Topic.js.map