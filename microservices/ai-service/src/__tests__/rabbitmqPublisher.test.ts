import { sendProcessedDataToExport } from "../rabbitmq/rabbitmqPublisher";
import amqp from "amqplib";
import crypto from "crypto-js";
import { v4 as uuidv4 } from "uuid";

jest.mock("amqplib");
jest.mock("crypto-js");
jest.mock("uuid");

describe("sendProcessedDataToExport", () => {
  const mockChannel = {
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    publish: jest.fn(),
    close: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
    (uuidv4 as jest.Mock).mockReturnValue("mock-uuid");
    (crypto.AES.encrypt as jest.Mock).mockReturnValue({
      toString: () => "encrypted-payload",
    });
  });

  it("publishes encrypted message to RabbitMQ and returns UUID", async () => {
    const result = await sendProcessedDataToExport("data", "user123");

    expect(amqp.connect).toHaveBeenCalledWith(expect.any(String));
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "ai_exchange",
      "direct",
      { durable: true }
    );
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("export_queue", {
      durable: true,
    });
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "export_queue",
      "ai_exchange",
      "export_queue"
    );

    expect(crypto.AES.encrypt).toHaveBeenCalledWith(
      JSON.stringify({
        uuid: "mock-uuid",
        userId: "user123",
        data: "data",
      }),
      "secret_key_for_encryption"
    );

    expect(mockChannel.publish).toHaveBeenCalledWith(
      "ai_exchange",
      "export_queue",
      Buffer.from("encrypted-payload"),
      { persistent: true }
    );

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
    expect(result).toBe("mock-uuid");
  });

  it("throws error and still closes connection on failure", async () => {
    (mockChannel.assertExchange as jest.Mock).mockRejectedValue(
      new Error("fail")
    );
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(sendProcessedDataToExport("data", "user123")).rejects.toThrow(
      "fail"
    );

    expect(mockConnection.close).toHaveBeenCalled();
    spy.mockRestore();
  });
});
