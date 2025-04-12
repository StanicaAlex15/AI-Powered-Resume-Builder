import pdfkit from "pdfkit";

export const createPDF = async (data: string): Promise<Buffer> => {
  try {
    const pdfDoc = new pdfkit();
    pdfDoc.text(data);

    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", reject);
      pdfDoc.end();
    });
  } catch (error) {
    console.error("❌ Error creating PDF:", error);
    throw error;
  }
};
