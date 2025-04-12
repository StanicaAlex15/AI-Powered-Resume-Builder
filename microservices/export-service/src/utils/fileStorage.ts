import mongoose from "mongoose";
import { GridFSBucket, MongoClient } from "mongodb";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/export-service";
const dbName = "export-service";

let gfsBucket: GridFSBucket | null = null;

export const connectToMongo = async (): Promise<void> => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db(dbName);
    gfsBucket = new GridFSBucket(db, { bucketName: "pdfs" });
    console.log("✅ Connected to MongoDB and GridFS initialized.");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};

export const savePDFToMongo = async (
  filename: string,
  buffer: Buffer
): Promise<string> => {
  if (!gfsBucket) {
    throw new Error(
      "GridFS bucket not initialized. Call connectToMongo() first."
    );
  }

  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = gfsBucket!.openUploadStream(filename);
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
