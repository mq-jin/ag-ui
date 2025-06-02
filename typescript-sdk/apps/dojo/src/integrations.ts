import { configureIntegration } from "./types/integration";
import { StarterAgent } from "@ag-ui/starter";
import { MastraClient } from "@mastra/client-js";

export const integrations = [
  configureIntegration({
    id: "starter",
    name: "Starter",
    features: ["agentic_chat"],
    agents: async () => {
      return {
        agentic_chat: new StarterAgent(),
      };
    },
  }),

  configureIntegration({
    id: "mastra",
    name: "Mastra",
    features: ["agentic_chat"],
    agents: async () => {
      const mastra = new MastraClient({
        baseUrl: "http://localhost:4111",
      });
      return "???" as any;
    },
  }),
];
