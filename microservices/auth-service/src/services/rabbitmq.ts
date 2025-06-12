import amqp from "amqplib";
import * as CryptoJS from "crypto-js";
import { verifyTokenFromString } from "../middleware/verifyTokenRabbitmq";

const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://rabbitmq";
const inputQueue = "auth.verify";
const outputQueue = "auth.response";
const secretKey = "your_secret";

export const startAuthConsumer = async () => {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(inputQueue, { durable: true });
  await channel.assertQueue(outputQueue, { durable: true });

  console.log(`🔐 Waiting for auth messages in "${inputQueue}"...`);

  channel.consume(inputQueue, async (msg) => {
    if (!msg) return;

    try {
      const encryptedPayload = msg.content.toString();
      const decryptedText = CryptoJS.AES.decrypt(
        encryptedPayload,
        secretKey
      ).toString(CryptoJS.enc.Utf8);
      const { uuid, token } = JSON.parse(decryptedText);

      const result = await verifyTokenFromString(token);

      const encryptedResponse = CryptoJS.AES.encrypt(
        JSON.stringify({
          uuid,
          result,
        }),
        secretKey
      ).toString();

      channel.sendToQueue(outputQueue, Buffer.from(encryptedResponse), {
        persistent: true,
      });
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Failed to process message:", err);
      channel.nack(msg);
    }
  });
};
