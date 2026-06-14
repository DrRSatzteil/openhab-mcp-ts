import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { OpenHabClient } from './openhab-client.js';
import { registerTools } from './tools.js';

async function main() {
  const openhabUrl = process.env.OPENHAB_URL;
  const apiToken = process.env.OPENHAB_API_TOKEN;
  const mcpTransport = process.env.MCP_TRANSPORT ?? 'stdio';
  const mcpPort = parseInt(process.env.MCP_PORT ?? '8000', 10);

  // We enforce settings via Env variables
  if (!openhabUrl || !apiToken) {
    console.error('Error: OPENHAB_URL and OPENHAB_API_TOKEN environment variables are required.');
    console.error(
      'Example: OPENHAB_URL=http://openhab.localdomain:8080 OPENHAB_API_TOKEN=oh.mytoken node dist/index.js'
    );
    process.exit(1);
  }

  // Set up MCP Server
  const server = new McpServer({ name: 'openhab-mcp', version: '1.0.0' }, {
    // Advertise explicit capabilities so MCP clients (and different LLM runtimes)
    // can discover available resources and tool calling support. Some model
    // implementations (e.g. newer models in VS Code) require richer capability
    // metadata to enable tool/resource usage.
    capabilities: {
      resources: {
        subscribe: true,
        templates: true,
        list: true,
      },
      tools: {
        list: true,
        call: true,
        schemas: true,
      },
    },
  } as any);

  // Initialize Client
  const client = new OpenHabClient(openhabUrl, apiToken);

  // --- Static Resources ---

  server.registerResource(
    'OpenHAB Items',
    'openhab://items',
    { description: 'A list of all items and their current states', mimeType: 'application/json' },
    async (_uri) => {
      const items = await client.getItems();
      return {
        contents: [
          {
            uri: 'openhab://items',
            mimeType: 'application/json',
            text: JSON.stringify(items),
          },
        ],
      };
    }
  );

  server.registerResource(
    'OpenHAB Things',
    'openhab://things',
    {
      description: 'A list of all configured things and their status',
      mimeType: 'application/json',
    },
    async (_uri) => {
      const things = await client.getThings();
      return {
        contents: [
          {
            uri: 'openhab://things',
            mimeType: 'application/json',
            text: JSON.stringify(things),
          },
        ],
      };
    }
  );

  server.registerResource(
    'OpenHAB Discovery Inbox',
    'openhab://discovery',
    {
      description: 'A list of discovered but unconfigured things in the inbox',
      mimeType: 'application/json',
    },
    async (_uri) => {
      const inbox = await client.getInbox();
      return {
        contents: [
          {
            uri: 'openhab://discovery',
            mimeType: 'application/json',
            text: JSON.stringify(inbox),
          },
        ],
      };
    }
  );

  server.registerResource(
    'OpenHAB System Summary',
    'openhab://summary',
    {
      description: 'A token-efficient overview of the system state for LLM context optimization',
      mimeType: 'application/json',
    },
    async (_uri) => {
      const summary = await client.getSystemSummary();
      return {
        contents: [
          {
            uri: 'openhab://summary',
            mimeType: 'application/json',
            text: JSON.stringify(summary),
          },
        ],
      };
    }
  );

  server.registerResource(
    'OpenHAB Item Schema',
    'openhab://schema',
    {
      description: 'Ultra-minimal list of item names and types for zero-token discovery',
      mimeType: 'application/json',
    },
    async (_uri) => {
      const schema = await client.getSchema();
      return {
        contents: [
          {
            uri: 'openhab://schema',
            mimeType: 'application/json',
            text: JSON.stringify(schema),
          },
        ],
      };
    }
  );

  server.registerResource(
    'OpenHAB AI Prompt Context',
    'openhab://prompt-context',
    {
      description: 'Pre-baked system prompt fragment to prime any AI agent for this specific home',
      mimeType: 'text/markdown',
    },
    async (_uri) => {
      const context = await client.getPromptContext();
      return {
        contents: [{ uri: 'openhab://prompt-context', mimeType: 'text/markdown', text: context }],
      };
    }
  );

  // --- Resource Templates ---

  server.registerResource(
    'Specific OpenHAB Item',
    new ResourceTemplate('openhab://items/{name}', { list: undefined }),
    { description: 'Access a single item by its name', mimeType: 'application/json' },
    async (uri, variables) => {
      const itemName = String(variables.name);
      const item = await client.getItem(itemName);
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(item),
          },
        ],
      };
    }
  );

  server.registerResource(
    'Specific OpenHAB Thing',
    new ResourceTemplate('openhab://things/{uid}', { list: undefined }),
    { description: 'Access a single thing by its UID', mimeType: 'application/json' },
    async (uri, variables) => {
      const thingUID = String(variables.uid);
      const thing = await client.getThing(thingUID);
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(thing),
          },
        ],
      };
    }
  );

  server.registerResource(
    'Item Visual Telemetry',
    new ResourceTemplate('openhab://visual/charts/{item}', { list: undefined }),
    { description: 'ASCII Sparkline trend analysis for an item', mimeType: 'text/markdown' },
    async (uri, variables) => {
      const itemName = String(variables.item);
      const chart = await client.getVisualChart(itemName);
      return { contents: [{ uri: uri.toString(), mimeType: 'text/markdown', text: chart }] };
    }
  );

  // Register Tools
  registerTools(server, client);

  if (mcpTransport === 'streamable-http') {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (req.url?.startsWith('/mcp')) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const raw = Buffer.concat(chunks).toString();
        const body = raw ? (JSON.parse(raw) as unknown) : undefined;
        await transport.handleRequest(req, res, body);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await server.connect(transport);
    httpServer.listen(mcpPort, '0.0.0.0');
    console.error(`[OpenHAB MCP] HTTP server listening on :${mcpPort} — connected to ${openhabUrl}`);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      `[OpenHAB MCP] Server connected to ${openhabUrl} — cache warm-up running in background.`
    );
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
