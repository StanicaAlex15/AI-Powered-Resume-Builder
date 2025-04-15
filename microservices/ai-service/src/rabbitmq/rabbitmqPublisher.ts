import amqp from "amqplib";
import crypto from "crypto-js";

const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://rabbitmq";
const exchangeName = "ai_exchange";
const queueName = "export_queue";
const secretKey = "secret_key_for_encryption";

export const sendProcessedDataToExport = async (processedData: string) => {
  let connection;
  try {
    connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, queueName);

    const encryptedData = crypto.AES.encrypt(
      processedData,
      secretKey
    ).toString();

    channel.publish(exchangeName, queueName, Buffer.from(encryptedData), {
      persistent: true,
    });

    console.log("Processed CV sent to RabbitMQ");

    await channel.close();
  } catch (error) {
    console.error("Error in RabbitMQ publisher:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
};
