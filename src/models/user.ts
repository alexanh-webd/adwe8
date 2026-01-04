import mongoose, {Schema, Document} from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    isAdmin: boolean;
}

const userSchema = new Schema<IUser>({
    email: {type: String, required: true},
    password: {type: String, required: true},
    username: {type: String, required: true},
    isAdmin: {type: Boolean, default: false}
});

const User = mongoose.model<IUser>("User", userSchema);

export { User, type IUser };