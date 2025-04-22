import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserBase {
  name: string;
  email: string;
}

export interface IUser extends IUserBase, Document {}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
