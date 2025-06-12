import amqp from "amqplib";
import * as crypto from "crypto-js";
import { createPDF } from "../services/exportService";
import { savePDFToMongo } from "../utils/fileStorage";

const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://rabbitmq";
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
        try {
          const encryptedData = msg.content.toString();

          const decryptedString = crypto.AES.decrypt(
            encryptedData,
            secretKey
          ).toString(crypto.enc.Utf8);

          const payload = JSON.parse(decryptedString);

          const { uuid, userId, data } = payload;

          if (!uuid || !data || !userId) {
            throw new Error("Payload incomplet sau invalid.");
          }

          console.log(`📥 Received UUID: ${payload.uuid}`);
          console.log(`📥 Received USERID: ${payload.userId}`);
          const pdfBuffer = await createPDF(payload.data);

          const fileId = await savePDFToMongo(
            `cv_export_${payload.uuid}.pdf`,
            pdfBuffer,
            userId,
            uuid
          );

          console.log(`📦 PDF saved in MongoDB with ID: ${fileId}`);
          channel.ack(msg);
        } catch (err) {
          console.error("❌ Error processing message:", err);
        }
      }
    });

    console.log(`📡 Waiting for messages in queue '${queueName}'...`);
  } catch (error) {
    console.error("❌ Error consuming processed data:", error);
  }
};
