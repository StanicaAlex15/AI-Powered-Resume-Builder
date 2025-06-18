import { GridFSBucket, MongoClient, ObjectId } from "mongodb";
import { Readable } from "stream";

const mongoURI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/export-service";
const dbName = "export-service";

let gfsBucket: GridFSBucket | null = null;
let client: MongoClient | null = null;

export const initializeGridFS = async (): Promise<void> => {
  if (gfsBucket) {
    return;
  }

  try {
    if (!client) {
      client = new MongoClient(mongoURI);
      await client.connect();
    }
    const db = client.db(dbName);
    gfsBucket = new GridFSBucket(db, { bucketName: "pdfs" });
    console.log("✅ GridFS initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing GridFS:", error);
    throw error;
  }
};

export const savePDFToMongo = async (
  filename: string,
  buffer: Buffer,
  userId: String,
  uuid: String
): Promise<string> => {
  if (!gfsBucket) {
    throw new Error(
      "GridFS bucket not initialized. Call initializeGridFS() first."
    );
  }

  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    if (!gfsBucket) {
      throw new Error("GridFS bucket not initialized");
    }

    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: { userId, uuid },
    });

    readableStream
      .pipe(uploadStream)
      .on("error", (error) => {
        reject(
          new Error(`Error saving PDF to MongoDB: ${error.message ?? error}`)
        );
      })
      .on("finish", () => {
        console.log(`✅ PDF saved in MongoDB with ID: ${uploadStream.id}`);
        resolve(uploadStream.id.toString());
      });
  });
};

export const getPDFStreamFromMongoByUuid = async (uuid: string) => {
  if (!gfsBucket) {
    throw new Error("GridFS bucket not initialized.");
  }

  try {
    console.time("Download PDF Time");
    console.log("Attempting to create ObjectId from UUID:", uuid);
    const _ = new ObjectId(uuid);
    const filesCursor = await gfsBucket
      .find({ "metadata.uuid": uuid })
      .sort({ uploadDate: -1 })
      .limit(1);
    const file = await filesCursor.next();

    if (!file) {
      throw new Error(`No PDF found with UUID: ${uuid}`);
    }

    const stream = gfsBucket.openDownloadStream(file._id);
    console.timeEnd("Download PDF Time");
    return stream;
  } catch (err) {
    console.error("❌ Error creating download stream by UUID:", err);
    throw err;
  }
};

export const getAllPDFFilesByUserId = async (userId: string) => {
  if (!gfsBucket) {
    throw new Error("GridFS bucket not initialized.");
  }

  const filesCursor = await gfsBucket.find({ "metadata.userId": userId });
  const files = await filesCursor.toArray();
  return files;
};
