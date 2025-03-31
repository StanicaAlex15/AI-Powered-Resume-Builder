import amqp from "amqplib";
import * as crypto from "crypto-js";
import { createPDF } from "../services/exportService";

const rabbitUrl = "amqp://localhost";
const exchangeName = "ai_exchange";
const queueName = "export_queue";
const secretKey = "secret_key_for_encryption";

export const consumeProcessedData = async () => {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);
    console.log("Connection established.");

    const channel = await connection.createChannel();
    console.log("Channel created.");

    await channel.assertExchange(exchangeName, "direct", { durable: true });
    console.log(`Exchange '${exchangeName}' asserted.`);

    await channel.assertQueue(queueName, { exclusive: false });
    console.log(`Queue '${queueName}' asserted.`);
    await channel.bindQueue(queueName, exchangeName, queueName);
    console.log(`Queue '${queueName}' bound to exchange '${exchangeName}'.`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        console.log("Message received:", msg.content.toString());

        const encryptedData = msg.content.toString();
        const decryptedData = crypto.AES.decrypt(
          encryptedData,
          secretKey
        ).toString(crypto.enc.Utf8);
        console.log("Decrypted data:", decryptedData);

        const pdfBuffer = await createPDF(decryptedData);
        console.log("PDF created successfully.");

        require("fs").writeFileSync("output.pdf", pdfBuffer);
        console.log("PDF saved locally as 'output.pdf'.");

        channel.ack(msg);
        console.log("Message acknowledged.");
      }
    });

    console.log(`Waiting for messages in queue '${queueName}'...`);
  } catch (error) {
    console.error("Error consuming processed data:", error);
  }
};
