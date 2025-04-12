import amqp from "amqplib";
import * as crypto from "crypto-js";
import { createPDF } from "../services/exportService";
import { savePDFToMongo } from "../utils/fileStorage";

const rabbitUrl = "amqp://rabbitmq";
const exchangeName = "ai_exchange";
const queueName = "export_queue";
const secretKey = "secret_key_for_encryption";

export const consumeProcessedData = async () => {
  try {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(queueName, exchangeName, queueName);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const encryptedData = msg.content.toString();
        const decryptedData = crypto.AES.decrypt(
          encryptedData,
          secretKey
        ).toString(crypto.enc.Utf8);

        const pdfBuffer = await createPDF(decryptedData);
        const fileId = await savePDFToMongo("cv_export.pdf", pdfBuffer);

        console.log(`📦 PDF saved in MongoDB with ID: ${fileId}`);
        channel.ack(msg);
      }
    });

    console.log(`📡 Waiting for messages in queue '${queueName}'...`);
  } catch (error) {
    console.error("❌ Error consuming processed data:", error);
  }
};
