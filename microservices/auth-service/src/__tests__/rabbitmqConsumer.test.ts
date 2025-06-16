import amqp from "amqplib";
import * as CryptoJS from "crypto-js";
import { startAuthConsumer } from "../services/rabbitmq";
import { verifyTokenFromString } from "../middleware/verifyTokenRabbitmq";

jest.mock("amqplib");
jest.mock("../middleware/verifyTokenRabbitmq");

describe("startAuthConsumer", () => {
  const mockChannel = {
    assertQueue: jest.fn(),
    consume: jest.fn(),
    sendToQueue: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  it("should consume, decrypt, verify and send encrypted response", async () => {
    const uuid = "1234-uuid";
    const token = "valid-token";

    const payload = JSON.stringify({ uuid, token });
    const encryptedPayload = CryptoJS.AES.encrypt(
      payload,
      "your_secret"
    ).toString();
    const decryptedText = CryptoJS.AES.decrypt(
      encryptedPayload,
      "your_secret"
    ).toString(CryptoJS.enc.Utf8);

    // mock implementation for verifyTokenFromString
    (verifyTokenFromString as jest.Mock).mockResolvedValue(true);

    const fakeMsg = {
      content: Buffer.from(encryptedPayload),
    };

    mockChannel.consume.mockImplementation((_queue: string, cb: Function) => {
      cb(fakeMsg); // simulate one message consumed
    });

    await startAuthConsumer();

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("auth.verify", {
      durable: true,
    });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("auth.response", {
      durable: true,
    });

    expect(verifyTokenFromString).toHaveBeenCalledWith(token);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "auth.response",
      expect.any(Buffer),
      { persistent: true }
    );

    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg);
  });

  it("should nack message on error", async () => {
    const invalidEncrypted = "invalid";

    const fakeMsg = {
      content: Buffer.from(invalidEncrypted),
    };

    mockChannel.consume.mockImplementation((_queue: string, cb: Function) => {
      cb(fakeMsg); // simulate one invalid message
    });

    await startAuthConsumer();

    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg);
  });
});
