import amqp from "amqplib";
import crypto from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://rabbitmq";
const exchangeName = "ai_exchange";
const queueName = "export_queue";
const secretKey = "secret_key_for_encryption";

export const sendProcessedDataToExport = async (
  processedData: string,
  userId: string
): Promise<string> => {
  let connection;
  try {
    connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, queueName);

    const payload = {
      uuid: uuidv4(),
      userId,
      data: processedData,
    };

    const encryptedData = crypto.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    channel.publish(exchangeName, queueName, Buffer.from(encryptedData), {
      persistent: true,
    });

    console.log("Processed CV sent to RabbitMQ");

    await channel.close();
    return payload.uuid;
  } catch (error) {
    console.error("Error in RabbitMQ publisher:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
};
