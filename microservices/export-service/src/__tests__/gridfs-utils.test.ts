import { Readable, Writable } from "stream";

// Mocks globale pentru GridFS și Mongo
const mockDb: any = {};
const mockBucket: any = {};
const originalLog = console.log;
const originalError = console.error;
const originalTime = console.time;
const originalTimeEnd = console.timeEnd;

beforeAll(() => {
  console.log = () => {};
  console.error = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.time = originalTime;
  console.timeEnd = originalTimeEnd;
});

jest.mock("mongodb", () => {
  const actual = jest.requireActual("mongodb");
  return {
    ...actual,
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn(() => mockDb),
    })),
    GridFSBucket: jest.fn(() => mockBucket),
    ObjectId: actual.ObjectId,
  };
});

describe("fileStorage utils", () => {
  let fileStorage: typeof import("../utils/fileStorage");
  let mockUploadStream: Writable & { id: string };
  let mockDownloadStream: Readable;

  beforeEach(async () => {
    jest.resetModules();

    const mockCursor = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      next: jest.fn().mockResolvedValue({ _id: "123", filename: "test.pdf" }),
    };

    fileStorage = await import("../utils/fileStorage");

    // Upload stream mock
    mockUploadStream = new Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    }) as Writable & { id: string };
    mockUploadStream.id = "123";
    mockUploadStream.on = jest.fn().mockImplementation((event, handler) => {
      if (event === "finish") setTimeout(handler, 5);
      return mockUploadStream;
    });

    // Download stream mock
    mockDownloadStream = new Readable({
      read() {
        this.push(Buffer.from("mock-data"));
        this.push(null);
      },
    });

    // Assign metode în bucket
    Object.assign(mockDb, {});
    Object.assign(mockBucket, {
      openUploadStream: jest.fn().mockReturnValue(mockUploadStream),
      openDownloadStream: jest.fn().mockReturnValue(mockDownloadStream),
      find: jest.fn().mockReturnValue(mockCursor),
    });

    // Resetare mocks
    const { MongoClient, GridFSBucket } = require("mongodb");
    (MongoClient as jest.Mock).mockClear();
    (GridFSBucket as jest.Mock).mockClear();
  });

  describe("initializeGridFS", () => {
    it("inițializează GridFS bucket", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      await fileStorage.initializeGridFS();
      const { MongoClient, GridFSBucket } = require("mongodb");
      expect(MongoClient).toHaveBeenCalledWith(
        "mongodb://127.0.0.1:27017/export-service"
      );
      expect(GridFSBucket).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        "✅ GridFS initialized successfully!"
      );
      logSpy.mockRestore();
    });

    it("refolosește conexiunea existentă", async () => {
      await fileStorage.initializeGridFS();
      await fileStorage.initializeGridFS();
      const { MongoClient } = require("mongodb");
      expect(MongoClient).toHaveBeenCalledTimes(1);
    });

    it("aruncă eroare dacă conexiunea eșuează", async () => {
      const { MongoClient } = require("mongodb");
      (MongoClient as jest.Mock).mockImplementationOnce(() => {
        throw new Error("connection failed");
      });
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await expect(fileStorage.initializeGridFS()).rejects.toThrow(
        "connection failed"
      );
      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Error initializing GridFS:",
        expect.any(Error)
      );
      errorSpy.mockRestore();
    });
  });

  describe("savePDFToMongo", () => {
    it("salvează PDF în MongoDB", async () => {
      await fileStorage.initializeGridFS();
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const result = await fileStorage.savePDFToMongo(
        "test.pdf",
        Buffer.from("test"),
        "mockUserId",
        "uuid"
      );
      expect(result).toBe("123");
      expect(mockBucket.openUploadStream).toHaveBeenCalledWith("test.pdf", {
        metadata: { userId: "mockUserId", uuid: "uuid" },
      });
      expect(logSpy).toHaveBeenCalledWith(
        "✅ PDF saved in MongoDB with ID: 123"
      );
      logSpy.mockRestore();
    });

    it("aruncă eroare dacă GridFS nu e inițializat", async () => {
      (fileStorage as any).gfsBucket = null;
      await expect(
        fileStorage.savePDFToMongo("fail.pdf", Buffer.from("fail"), "u", "id")
      ).rejects.toThrow("GridFS bucket not initialized");
    });

    it("aruncă eroare la upload fail", async () => {
      await fileStorage.initializeGridFS();
      mockUploadStream.on = jest.fn().mockImplementation((event, handler) => {
        if (event === "error")
          setTimeout(() => handler(new Error("upload failed")), 5);
        return mockUploadStream;
      });

      await expect(
        fileStorage.savePDFToMongo(
          "fail.pdf",
          Buffer.from("fail"),
          "mockUserId",
          "uuid"
        )
      ).rejects.toThrow("Error saving PDF to MongoDB: upload failed");
    });
  });

  describe("getPDFStreamFromMongoByUuid", () => {
    it("returnează stream pentru UUID valid", async () => {
      await fileStorage.initializeGridFS();
      const stream = await fileStorage.getPDFStreamFromMongoByUuid(
        "507f1f77bcf86cd799439011"
      );
      expect(stream).toBeInstanceOf(Readable);
      expect(mockBucket.openDownloadStream).toHaveBeenCalled();
    });

    it("aruncă eroare pentru UUID invalid", async () => {
      await fileStorage.initializeGridFS();

      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        fileStorage.getPDFStreamFromMongoByUuid("invalid")
      ).rejects.toThrow(
        "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
      );

      expect(errorSpy).toHaveBeenCalledWith(
        "❌ Error creating download stream by UUID:",
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });

    it("aruncă eroare dacă GridFS nu e inițializat", async () => {
      await expect(
        fileStorage.getPDFStreamFromMongoByUuid("507f1f77bcf86cd799439011")
      ).rejects.toThrow("GridFS bucket not initialized.");
    });
  });
});
