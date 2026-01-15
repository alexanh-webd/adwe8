import mongoose, { Document } from "mongoose";
interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    isAdmin: boolean;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export { User, type IUser };
//# sourceMappingURL=user.d.ts.map