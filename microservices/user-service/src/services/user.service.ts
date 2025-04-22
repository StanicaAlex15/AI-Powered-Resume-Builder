import User, { IUser, IUserBase } from "../models/user.model";

async function getUsers(): Promise<IUser[]> {
  return await User.find().exec();
}

async function createUser(data: IUserBase): Promise<IUser> {
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
