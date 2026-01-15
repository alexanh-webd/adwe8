import mongoose, { Document } from "mongoose";
interface ITopic extends Document {
    title: string;
    content: string;
    username: string;
    createdAt: Date;
}
declare const Topic: mongoose.Model<ITopic, {}, {}, {}, mongoose.Document<unknown, {}, ITopic, {}, mongoose.DefaultSchemaOptions> & ITopic & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITopic>;
export { Topic, type ITopic };
//# sourceMappingURL=Topic.d.ts.map