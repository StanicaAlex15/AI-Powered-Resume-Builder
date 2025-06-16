import { consumeProcessedData } from "../rabbitmq/rabbitmqConsumer";
import amqp from "amqplib";
import * as crypto from "crypto-js";
import * as exportService from "../services/exportService";
import * as fileStorage from "../utils/fileStorage";

jest.mock("amqplib");
jest.mock("crypto-js");
jest.mock("../services/exportService");
jest.mock("../utils/fileStorage");

describe("consumeProcessedData", () => {
  const mockChannel = {
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });
  it("should consume a valid message and save PDF", async () => {
    const fakePayload = {
      uuid: "uuid123",
      userId: "user123",
      data: "my CV data",
    };

    const encryptedMock = "encrypted-data";
    const decryptedMock = JSON.stringify(fakePayload);

    (crypto.AES.decrypt as jest.Mock).mockReturnValue({
      toString: () => decryptedMock,
    });

    (exportService.createPDF as jest.Mock).mockResolvedValue(
      Buffer.from("PDF")
    );
    (fileStorage.savePDFToMongo as jest.Mock).mockResolvedValue("mongoId123");

    const mockMessage = {
      content: {
        toString: () => encryptedMock,
      },
    };

    let consumeCallback!: (msg: any) => void;
    mockChannel.consume.mockImplementation((_q, cb) => {
      consumeCallback = cb;
      return Promise.resolve({ consumerTag: "test" });
    });

    await consumeProcessedData();

    await consumeCallback(mockMessage);

    expect(amqp.connect).toHaveBeenCalled();
    expect(crypto.AES.decrypt).toHaveBeenCalledWith(
      encryptedMock,
      "secret_key_for_encryption"
    );
    expect(exportService.createPDF).toHaveBeenCalledWith("my CV data");
    expect(fileStorage.savePDFToMongo).toHaveBeenCalledWith(
      "cv_export_uuid123.pdf",
      expect.any(Buffer),
      "user123",
      "uuid123"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });

  it("should handle message with invalid payload", async () => {
    const decryptedMock = JSON.stringify({ uuid: "x" });

    (crypto.AES.decrypt as jest.Mock).mockReturnValue({
      toString: () => decryptedMock,
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockMessage = {
      content: {
        toString: () => "bad-data",
      },
    };

    mockChannel.consume.mockImplementation((_, cb) => cb(mockMessage));

    await consumeProcessedData();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Error processing message:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it("should handle connection error", async () => {
    (amqp.connect as jest.Mock).mockRejectedValue(
      new Error("Connection failed")
    );

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await consumeProcessedData();

    expect(spy).toHaveBeenCalledWith(
      "❌ Error consuming processed data:",
      expect.any(Error)
    );
    spy.mockRestore();
  });
});
