import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { OpenHabClient } from './openhab-client.js';
import { registerTools } from './tools.js';

function isInitializeRequest(body: unknown): boolean {
  return (
    typeof body === 'object' &&
    body !== null &&
    'method' in body &&
    (body as { method: string }).method === 'initialize'
  );
}

function setupServer(server: McpServer, client: OpenHabClient): void {
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

  // --- Tools ---
  registerTools(server, client);
}

async function main() {
  const openhabUrl = process.env.OPENHAB_URL;
  const apiToken = process.env.OPENHAB_API_TOKEN;
  const mcpTransport = process.env.MCP_TRANSPORT ?? 'stdio';
  const mcpPort = parseInt(process.env.MCP_PORT ?? '8000', 10);

  if (!openhabUrl || !apiToken) {
    console.error('Error: OPENHAB_URL and OPENHAB_API_TOKEN environment variables are required.');
    console.error(
      'Example: OPENHAB_URL=http://openhab.localdomain:8080 OPENHAB_API_TOKEN=oh.mytoken node dist/index.js'
    );
    process.exit(1);
  }

  const client = new OpenHabClient(openhabUrl, apiToken);

  if (mcpTransport === 'streamable-http') {
    // Session map: sessionId → transport (one McpServer+Transport per MCP client session)
    const sessions = new Map<string, StreamableHTTPServerTransport>();

    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url?.startsWith('/mcp')) {
        res.writeHead(404);
        res.end();
        return;
      }

      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const raw = Buffer.concat(chunks).toString();
        const body = raw ? (JSON.parse(raw) as unknown) : undefined;

        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && sessions.has(sessionId)) {
          transport = sessions.get(sessionId)!;
        } else if (isInitializeRequest(body)) {
          // New MCP client: create a fresh server+transport per session so reconnects work
          transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
          transport.onclose = () => {
            if (transport.sessionId) sessions.delete(transport.sessionId);
          };
          const server = new McpServer({ name: 'openhab-mcp', version: '1.0.0' }, {
            capabilities: {
              resources: { subscribe: true, templates: true, list: true },
              tools: { list: true, call: true, schemas: true },
            },
          } as any);
          setupServer(server, client);
          await server.connect(transport);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found: please re-initialize' }));
          return;
        }

        await transport.handleRequest(req, res, body);

        // Capture session ID after initialize so subsequent requests can be routed
        if (transport.sessionId && !sessions.has(transport.sessionId)) {
          sessions.set(transport.sessionId, transport);
        }
      } catch (err) {
        console.error('[OpenHAB MCP] Request handling error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      }
    });

    httpServer.listen(mcpPort, '0.0.0.0');
    console.error(`[OpenHAB MCP] HTTP server listening on :${mcpPort} — connected to ${openhabUrl}`);
  } else {
    const server = new McpServer({ name: 'openhab-mcp', version: '1.0.0' }, {
      capabilities: {
        resources: { subscribe: true, templates: true, list: true },
        tools: { list: true, call: true, schemas: true },
      },
    } as any);
    setupServer(server, client);
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
