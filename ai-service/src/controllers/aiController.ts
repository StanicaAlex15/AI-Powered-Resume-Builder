import { consumeAndProcessData } from "../rabbitmq/rabbitmqConsumer";

export const startAIProcessing = async () => {
  try {
    await consumeAndProcessData();
  } catch (error) {
    console.error("Error in AI Processing:", error);
  }
};
