import pdf from "pdf-parse";
import mammoth from "mammoth";
import { UploadedFile } from "express-fileupload";

export const processFile = async (file: UploadedFile): Promise<string> => {
  const buffer = file.data;

  if (file.mimetype === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type");
  }
};
