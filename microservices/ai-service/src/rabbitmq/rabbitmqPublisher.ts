import amqp from "amqplib";
import crypto from "crypto-js";

const rabbitUrl = "amqp://rabbitmq";
const exchangeName = "ai_exchange";
const queueName = "export_queue";
const secretKey = "secret_key_for_encryption";

export const sendProcessedDataToExport = async (processedData: string) => {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);
    console.log("Connection established.");

    const channel = await connection.createChannel();
    console.log("Channel created.");

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    console.log(`Exchange '${exchangeName}' asserted.`);

    const encryptedProcessedData = crypto.AES.encrypt(
      processedData,
      secretKey
    ).toString();
    console.log("Processed data encrypted:", encryptedProcessedData);

    channel.publish(
      exchangeName,
      queueName,
      Buffer.from(encryptedProcessedData)
    );
    console.log(`Processed data published to queue '${queueName}'`);

    setTimeout(() => {
      channel.close();
      connection.close();
      console.log("Connection closed.");
    }, 500);
  } catch (error) {
    console.error("Error sending processed data:", error);
  }
};
