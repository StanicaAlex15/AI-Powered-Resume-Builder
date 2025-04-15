import { GridFSBucket, MongoClient } from "mongodb";
import { Readable } from "stream";
import { ObjectId } from "mongodb";

const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/export-service";
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
  buffer: Buffer
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

    const uploadStream = gfsBucket.openUploadStream(filename);
    readableStream
      .pipe(uploadStream)
      .on("error", (error) => {
        console.error("❌ Error saving PDF to MongoDB:", error);
        reject(error);
      })
      .on("finish", () => {
        console.log(`✅ PDF saved in MongoDB with ID: ${uploadStream.id}`);
        resolve(uploadStream.id.toString());
      });
  });
};

export const getPDFStreamFromMongo = async (fileId: string) => {
  if (!gfsBucket) {
    throw new Error("GridFS bucket not initialized.");
  }

  try {
    console.time("Download PDF Time");
    const _id = new ObjectId(fileId);
    const stream = gfsBucket.openDownloadStream(_id);
    console.timeEnd("Download PDF Time");
    return stream;
  } catch (err) {
    console.error("❌ Error creating download stream:", err);
    throw err;
  }
};
