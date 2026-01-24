import mongoose, { Schema, Document, Types } from "mongoose";
const textFileSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedAt: { type: Date, required: true, default: Date.now },
    editingSessions: {
        userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        //startedAt: {type: Date, default: null},
        //expiresAt: {type: Date, default: null}
        fileLocked: { type: Boolean, default: false }
    },
    // add comment
    comments: [
        {
            line: { type: Number, required: true },
            author: { type: Schema.Types.ObjectId, ref: "User", default: null },
            authorName: { type: String, required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    readOnly: { type: Boolean, default: false }
});
const TextFile = mongoose.model("TextFile", textFileSchema);
export { TextFile };
//# sourceMappingURL=TextFile.js.map