import amqp from "amqplib";
import crypto from "crypto-js";

const rabbitUrl = "amqp://localhost";
const exchangeName = "data_exchange";
const queueName = "ai_queue";
const secretKey = "secret_key_for_encryption";

export const sendDataToAI = async (data: string) => {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);
    console.log("Connection established.");

    const channel = await connection.createChannel();
    console.log("Channel created.");

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    console.log(`Exchange '${exchangeName}' asserted.`);

    const encryptedData = crypto.AES.encrypt(data, secretKey).toString();
    console.log("Data encrypted:", encryptedData);

    channel.publish(exchangeName, queueName, Buffer.from(encryptedData));
    console.log(`Data published to queue '${queueName}'`);

    setTimeout(() => {
      channel.close();
      connection.close();
      console.log("Connection closed.");
    }, 500);
  } catch (error) {
    console.error("Error sending data to AI:", error);
    throw error;
  }
};
