import { Request, Response, NextFunction } from "express";
import amqp from "amqplib";
import * as crypto from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
const REQUEST_QUEUE = "auth.verify";
const RESPONSE_QUEUE = "auth.response";
const SECRET = process.env.RABBITMQ_SECRET || "your_secret";

let channel: amqp.Channel | null = null;

async function setupRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertQueue(REQUEST_QUEUE, { durable: true });
  await channel.assertQueue(RESPONSE_QUEUE, { durable: true });
}

export const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!channel) await setupRabbitMQ();

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Missing token" });
      return;
    }

    const uuid = uuidv4();
    const payload = crypto.AES.encrypt(
      JSON.stringify({ uuid, token }),
      SECRET
    ).toString();

    channel!.sendToQueue(REQUEST_QUEUE, Buffer.from(payload));

    const checkResponse = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject("Timeout waiting for auth"),
        5000
      );

      channel!.consume(
        RESPONSE_QUEUE,
        (msg) => {
          if (!msg) return;

          const decrypted = crypto.AES.decrypt(
            msg.content.toString(),
            SECRET
          ).toString(crypto.enc.Utf8);

          const data = JSON.parse(decrypted);

          if (data.uuid === uuid) {
            clearTimeout(timeout);
            channel!.ack(msg);
            resolve(data.result);
          } else {
            channel!.nack(msg, false, true);
          }
        },
        { noAck: false }
      );
    });

    const result: any = await checkResponse;

    if (result && result.userId) {
      (req as any).user = result;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    console.error("Auth verify error:", err);
    res.status(500).json({ message: "Auth verification failed" });
  }
};
