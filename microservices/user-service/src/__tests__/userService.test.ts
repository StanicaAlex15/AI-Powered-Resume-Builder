import User from "../models/user.model";
import { getUsers, createUser, deleteUser } from "../services/user.service";
import { IUser } from "../models/user.model";

jest.mock("../models/user.model");

const mockUserData: IUser[] = [
  {
    _id: "1",
    name: "Alice",
    email: "alice@email.com",
    __v: 0,
  } as unknown as IUser,
  { _id: "2", name: "Bob", email: "bob@email.com", __v: 0 } as unknown as IUser,
];

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      (User.find as jest.MockedFunction<typeof User.find>).mockImplementation(
        () => ({ exec: jest.fn().mockResolvedValue(mockUserData) } as any)
      );

      const users = await getUsers();
      expect(User.find).toHaveBeenCalled();
      expect(users).toEqual(mockUserData);
    });
  });

  describe("createUser", () => {
    it("should create and return a new user", async () => {
      const newUser = {
        name: "Charlie",
        email: "charlie@email.com",
      };

      const savedUser: Partial<IUser>[] = [
        {
          _id: "3",
          name: "Charlie",
          email: "charlie@email.com",
        },
      ];

      const mockSave = jest.fn().mockResolvedValue(savedUser);
      (User as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await createUser(newUser);
      expect(result).toEqual(savedUser);
      expect(User).toHaveBeenCalledWith(newUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return success message", async () => {
      (
        User.findByIdAndDelete as jest.MockedFunction<
          typeof User.findByIdAndDelete
        >
      ).mockResolvedValue(mockUserData[0] as any);

      const result = await deleteUser("1");
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(result).toEqual({ message: "User deleted successfully" });
    });

    it("should throw error if user not found", async () => {
      (
        User.findByIdAndDelete as jest.MockedFunction<
          typeof User.findByIdAndDelete
        >
      ).mockResolvedValue(null);

      await expect(deleteUser("999")).rejects.toThrow("User not found");
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("999");
    });
  });
});
