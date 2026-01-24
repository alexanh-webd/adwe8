import mongoose, { Document, Types } from "mongoose";
interface ITextFile extends Document {
    filename: string;
    path: string;
    uploadedAt: Date;
    owner: Types.ObjectId;
    editor: Types.ObjectId[];
    savedAt: Date;
    editingSessions: {
        userId: Types.ObjectId | null;
        fileLocked: boolean;
    };
    comments: {
        line: number;
        author: Types.ObjectId;
        authorName: string;
        comment: string;
        createdAt: Date;
    }[];
    readOnly: boolean;
}
declare const TextFile: mongoose.Model<ITextFile, {}, {}, {}, mongoose.Document<unknown, {}, ITextFile, {}, mongoose.DefaultSchemaOptions> & ITextFile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITextFile>;
export { TextFile, type ITextFile };
//# sourceMappingURL=TextFile.d.ts.map