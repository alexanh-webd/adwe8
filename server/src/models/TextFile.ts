import mongoose, {Schema, Document, Types} from "mongoose";

interface ITextFile extends Document {
    filename: string;
    path: string;
    uploadedAt: Date;
    owner: Types.ObjectId;
    editor: Types.ObjectId[];
    editingSessions: {
        userId: Types.ObjectId | null;
        //startedAt: Date | null; // This can be remove
        //expiresAt: Date | null; // Also this
        //fileLocked: boolean; --> simple to implement
        // Save button --> change the fileLocked to false
        // Click on the save btn, ask the user to open the file lock.
        fileLocked: boolean;
    };
    readOnly: boolean;
}

const textFileSchema = new Schema<ITextFile>({
    filename: {type: String, required: true},
    path: {type: String, required: true},
    uploadedAt: {type: Date, default: Date.now},
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
    editor: [{type: Schema.Types.ObjectId, ref: "User"}],
    editingSessions: {
        userId: {type: Schema.Types.ObjectId, ref: "User", default: null},
        //startedAt: {type: Date, default: null},
        //expiresAt: {type: Date, default: null}
        fileLocked: {type: Boolean, default: false}
    },
    readOnly: {type: Boolean, default: false}
})

const TextFile = mongoose.model<ITextFile>("TextFile", textFileSchema);

export { TextFile, type ITextFile };