import mongoose, {Schema, Document, Types} from "mongoose";

interface ITextFile extends Document {
    filename: string;
    path: string;
    uploadedAt: Date;
    owner: Types.ObjectId;
    editor: Types.ObjectId[];
    savedAt: Date;
    editingSessions: {
        userId: Types.ObjectId | null;
        //startedAt: Date | null; // This can be remove
        //expiresAt: Date | null; // Also this
        //fileLocked: boolean; --> simple to implement
        // Save button --> change the fileLocked to false
        // Click on the save btn, ask the user to open the file lock.
        fileLocked: boolean;
    };
    // Update comment for textfile
    comments: {
        line: number;
        author: Types.ObjectId;
        authorName: string;
        comment: string;
        createdAt: Date;
    }[];
    readOnly: boolean;
}

const textFileSchema = new Schema<ITextFile>({
    filename: {type: String, required: true},
    path: {type: String, required: true},
    uploadedAt: {type: Date, default: Date.now},
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
    editor: [{type: Schema.Types.ObjectId, ref: "User"}],
    savedAt: {type: Date, required: true, default: Date.now},
    editingSessions: {
        userId: {type: Schema.Types.ObjectId, ref: "User", default: null},
        //startedAt: {type: Date, default: null},
        //expiresAt: {type: Date, default: null}
        fileLocked: {type: Boolean, default: false}
    },
    // add comment
    comments: [
        {
            line: {type: Number, required: true},
            author: {type: Schema.Types.ObjectId, ref: "User", default: null},
            authorName: {type: String, required: true},
            comment: {type: String, required: true},
            createdAt: {type: Date, default: Date.now},
        }
    ],
    readOnly: {type: Boolean, default: false}
})

const TextFile = mongoose.model<ITextFile>("TextFile", textFileSchema);

export { TextFile, type ITextFile };