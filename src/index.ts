import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OpenHabClient } from './openhab-client.js';
import { registerTools } from './tools.js';

async function main() {
  const openhabUrl = process.env.OPENHAB_URL;
  const apiToken = process.env.OPENHAB_API_TOKEN;

  // We enforce settings via Env variables
  if (!openhabUrl || !apiToken) {
    console.error('Error: OPENHAB_URL and OPENHAB_API_TOKEN environment variables are required.');
    console.error('Example: OPENHAB_URL=http://openhab.localdomain:8080 OPENHAB_API_TOKEN=oh.mytoken node dist/index.js');
    process.exit(1);
  }

  // Set up MCP Server
  const server = new Server(
    { name: 'openhab-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // Initialize Client
  const client = new OpenHabClient(openhabUrl, apiToken);

  // Register Tools
  registerTools(server, client);

  // Use stdio for communication with MCP Clients
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`OpenHAB MCP Server started successfully connected to ${openhabUrl}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
