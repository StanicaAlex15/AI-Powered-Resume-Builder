import User, { IUser } from "../models/user.model";

async function getUsers(): Promise<IUser[]> {
  return await User.find();
}

async function createUser(data: IUser): Promise<IUser> {
  const user = new User(data);
  return await user.save();
}

async function deleteUser(userId: string): Promise<{ message: string }> {
  const result = await User.findByIdAndDelete(userId);
  if (!result) {
    throw new Error("User not found");
  }
  return { message: "User deleted successfully" };
}

export { getUsers, createUser, deleteUser };
