import mongoose, { Schema, Document, Types } from "mongoose";
const textFileSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    editingSessions: {
        userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        //startedAt: {type: Date, default: null},
        //expiresAt: {type: Date, default: null}
        fileLocked: { type: Boolean, default: false }
    },
    readOnly: { type: Boolean, default: false }
});
const TextFile = mongoose.model("TextFile", textFileSchema);
export { TextFile };
//# sourceMappingURL=TextFile.js.map