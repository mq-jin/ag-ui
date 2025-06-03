import { AgentIntegrationConfig } from "./types/integration";
import { StarterAgent } from "@ag-ui/starter";
import { MastraClient } from "@mastra/client-js";
import { MastraAgent } from "@ag-ui/mastra";

export const agentsIntegrations: AgentIntegrationConfig[] = [
  {
    id: "starter",
    agents: async () => {
      return {
        agentic_chat: new StarterAgent(),
      };
    },
  },
  {
    id: "mastra",
    agents: async () => {
      const mastraClient = new MastraClient({
        baseUrl: "http://localhost:4111",
      });

      return MastraAgent.getRemoteAgents({
        mastraClient,
      });
    },
  },
];
