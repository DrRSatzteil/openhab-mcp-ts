# OpenHAB MCP Server

A Fast and Concise Model Context Protocol (MCP) server for OpenHAB (v5+).

This server exposes the entire OpenHAB REST API as a set of tools for AI models like Claude or VS Code assistants. It allows for complete control over Items, Things, Rules, Persistence, Semantic Tags, and more.

## Prerequisites

- Node.js (v18 or higher)
- An OpenHAB API Token (Generate in User Profile -> API Tokens)

## Configuration

The server requires two environment variables:
- `OPENHAB_URL`: The URL of your OpenHAB instance (e.g., `http://openhab:8080`)
- `OPENHAB_API_TOKEN`: Your generated long-lived API token.

## Setup instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Test locally (Optional):**
   ```bash
   OPENHAB_URL=http://openhab:8080 OPENHAB_API_TOKEN=your_token_here npm start
   ```

## Client Integration

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openhab": {
      "command": "node",
      "args": [
        "/path/to/oh-mcp/dist/index.js"
      ],
      "env": {
        "OPENHAB_URL": "http://openhab:8080",
        "OPENHAB_API_TOKEN": "your_openhab_token_here"
      }
    }
  }
}
```

### Antigravity

Add the following to your Antigravity MCP settings:

```json
{
  "mcpServers": {
    "openhab": {
      "command": "node",
      "args": [
        "/path/to/oh-mcp/dist/index.js"
      ],
      "env": {
        "OPENHAB_URL": "http://openhab:8080",
        "OPENHAB_API_TOKEN": "your_openhab_token_here"
      }
    }
  }
}
```

### VS Code (Roo/Cline)

Add a new MCP server in your settings:

```json
{
  "mcpServers": {
    "openhab": {
      "command": "node",
      "args": [
        "dist/index.js"
      ],
      "env": {
        "OPENHAB_URL": "http://openhab:8080",
        "OPENHAB_API_TOKEN": "your_openhab_token_here"
      }
    }
  }
}
```

---

## 🛠 Available Tools

This server exposes over 60 tools. Here is a categorized breakdown of what they can do:

### 🔹 Items & State
- `get_items`: List all items with optional filters (`tags`, `type`, `metadata`).
- `get_item`: Fetch details and current state of a specific item.
- `send_command`: Send commands (e.g., `ON`, `OFF`, `50`) to an item.
- `update_state`: Manually update an item's state.
- `create_or_update_item`: Define a new item or update an existing one.
- `delete_item`: Remove an item from the system.
- `add_tag` / `remove_tag`: Manage semantic or functional tags.
- `set_metadata` / `remove_metadata`: Manage item metadata (e.g., namespace values).

### 🔹 Things & Hardware
- `get_things`: List all physical or logical things.
- `get_thing`: Get hardware details and configuration for a thing.
- `get_thing_status`: Check if a thing is `ONLINE`, `OFFLINE`, etc.
- `update_thing_config`: Modify hardware configuration parameters.
- `enable_thing`: Enable or disable a thing (e.g., to restart a binding).
- `create_thing` / `update_thing` / `delete_thing`: Lifecycle management.

### 🔹 Semantic Model & Tags
- `get_semantic_tags`: Retrieve the list of official semantic categories (Location, Equipment, Point).
- `get_semantic_tag` / `create_semantic_tag` / `update_semantic_tag` / `delete_semantic_tag`: Manage the tags that power the OpenHAB UI model.

### 🔹 Automation & Rules
- `get_rules`: List all defined automation rules.
- `get_rule`: View the triggers, conditions, and actions of a rule.
- `run_rule`: Manually trigger a rule to run immediately.
- `enable_rule`: Enable or disable an automation.
- `create_rule` / `update_rule` / `delete_rule`: Programmable rule management.

### 🔹 Persistence & History
- `get_persistence_services`: List available storage engines (e.g., RRD4j, InfluxDB).
- `get_item_persistence_data`: Fetch historical state data for an item (supports `starttime` and `endtime`).
- `store_item_persistence_data`: Manually insert a state into the database for a specific time.

### 🔹 Voice & Interaction
- `voice_say`: Text-to-speech output to a specific audio sink.
- `voice_interpret`: Send a natural language string to OpenHAB's interpreter (Rule triggers, etc.).
- `chat_with_habot`: Direct interaction with the HABot machine learning interface.
- `get_voices` / `get_audio_sinks` / `get_audio_sources`: Discover audio hardware and TTS capabilities.

### 🔹 Discovery & Inbox
- `get_inbox`: View discovered but unconfigured devices.
- `approve_inbox_item`: Add a discovered device to the system.
- `ignore_inbox_item` / `unignore_inbox_item`: Manage the discovery inbox.

### 🔹 System & Maintenance
- `get_system_info`: Detailed runtime info (OS, Java version, CPU, Memory).
- `get_loggers` / `set_logger_level`: Monitor and adjust logging verbosity on the fly.
- `get_addons` / `install_addon` / `uninstall_addon`: Manage system extensions and bindings.
- `get_services` / `get_service_config` / `update_service_config`: Configure system-level services.

### 🔹 UI & Transformations
- `get_sitemaps`: Retrieve classic UI sitemap definitions.
- `get_ui_components` / `get_ui_tiles`: Access MainUI layout information.
- `get_templates` / `get_transformations`: Manage data transformation logic.

## License
MIT
