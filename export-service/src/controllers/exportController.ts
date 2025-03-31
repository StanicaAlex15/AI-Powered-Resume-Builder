import { consumeProcessedData } from "../rabbitmq/rabbitmqConsumer";

export const startExportProcessing = async () => {
  try {
    await consumeProcessedData();
  } catch (error) {
    console.error("Error in Export Processing:", error);
  }
};
