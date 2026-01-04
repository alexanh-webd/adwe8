import mongoose, { Schema, Document } from "mongoose";
const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model("User", userSchema);
export { User };
//# sourceMappingURL=user.js.map