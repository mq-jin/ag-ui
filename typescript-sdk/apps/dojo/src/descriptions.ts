export const descriptions = {
  "server-starter-all-features": `
## Server Starter (All Features)

This is a starter kit for demonstrating each feature of AG-UI by sending static events to the frontend.

## Running the server

To run the server:

\`\`\`bash
cd typescript-sdk/integrations/server-starter-all-features/server/python

poetry install && poetry run dev
\`\`\`

## Integrations

- Agentic Chat: [example_server/agentic_chat.py](https://github.com/ag-ui-protocol/ag-ui/blob/main/typescript-sdk/integrations/server-starter-all-features/server/python/example_server/agentic_chat.py)

Demonstrates chatting with an agent and frontend tool calling. (send it a literal "tool" as a chat message to trigger the tool call)

- Human in the Loop: [example_server/human_in_the_loop.py](https://github.com/ag-ui-protocol/ag-ui/blob/main/typescript-sdk/integrations/server-starter-all-features/server/python/example_server/human_in_the_loop.py)

A simple human in the loop workflow where the agent comes up with a plan and the user can approve it using checkboxes.

- Agentic Generative UI: [example_server/agentic_generative_ui.py](https://github.com/ag-ui-protocol/ag-ui/blob/main/typescript-sdk/integrations/server-starter-all-features/server/python/example_server/agentic_generative_ui.py)

Simulates a long running task where the agent sends updates to the frontend to let the user know what's happening.


  `.trim(),
};
