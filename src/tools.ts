import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OpenHabClient } from './openhab-client.js';

export function registerTools(server: Server, client: OpenHabClient) {
  server.setRequestHandler(
    ListToolsRequestSchema,
    async () => {
      return {
        tools: [
          // --- Items ---
          {
            name: 'get_items',
            description: 'Get all OpenHAB items, optionally filtered by tags, type, or metadata',
            inputSchema: {
              type: 'object',
              properties: {
                tags: { type: 'string', description: 'Comma-separated list of tags to filter by' },
                type: 'string',
                metadata: { type: 'string', description: 'Metadata selector or regular expression' }
              }
            }
          },
          {
            name: 'get_item',
            description: 'Get a specific OpenHAB item by name',
            inputSchema: {
              type: 'object',
              properties: { itemName: { type: 'string' } },
              required: ['itemName']
            }
          },
          {
            name: 'send_command',
            description: 'Send a command (e.g., ON, OFF, 50, UP) to an OpenHAB item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                command: { type: 'string' }
              },
              required: ['itemName', 'command']
            }
          },
          {
            name: 'update_state',
            description: 'Update the state of an OpenHAB item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                state: { type: 'string' }
              },
              required: ['itemName', 'state']
            }
          },
          {
            name: 'create_or_update_item',
            description: 'Create or update an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                itemData: { type: 'object', description: 'Full item definition' }
              },
              required: ['itemName', 'itemData']
            }
          },
          {
            name: 'delete_item',
            description: 'Delete an item',
            inputSchema: {
              type: 'object',
              properties: { itemName: { type: 'string' } },
              required: ['itemName']
            }
          },
          {
            name: 'add_tag',
            description: 'Add a tag to an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                tag: { type: 'string' }
              },
              required: ['itemName', 'tag']
            }
          },
          {
            name: 'remove_tag',
            description: 'Remove a tag from an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                tag: { type: 'string' }
              },
              required: ['itemName', 'tag']
            }
          },
          {
            name: 'set_metadata',
            description: 'Set metadata on an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                namespace: { type: 'string' },
                value: { type: 'string' },
                config: { type: 'object' }
              },
              required: ['itemName', 'namespace', 'value']
            }
          },
          {
            name: 'remove_metadata',
            description: 'Remove metadata from an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                namespace: { type: 'string' }
              },
              required: ['itemName', 'namespace']
            }
          },

          // --- Things ---
          {
            name: 'get_things',
            description: 'Get all OpenHAB things',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_thing',
            description: 'Get a specific OpenHAB thing by UID',
            inputSchema: {
              type: 'object',
              properties: { thingUID: { type: 'string' } },
              required: ['thingUID']
            }
          },
          {
            name: 'create_thing',
            description: 'Create a new thing',
            inputSchema: {
              type: 'object',
              properties: { thingData: { type: 'object' } },
              required: ['thingData']
            }
          },
          {
            name: 'update_thing',
            description: 'Update a thing definition',
            inputSchema: {
              type: 'object',
              properties: {
                thingUID: { type: 'string' },
                thingData: { type: 'object' }
              },
              required: ['thingUID', 'thingData']
            }
          },
          {
            name: 'delete_thing',
            description: 'Delete a thing',
            inputSchema: {
              type: 'object',
              properties: {
                thingUID: { type: 'string' },
                force: { type: 'boolean' }
              },
              required: ['thingUID']
            }
          },
          {
            name: 'enable_thing',
            description: 'Enable or disable a thing',
            inputSchema: {
              type: 'object',
              properties: {
                thingUID: { type: 'string' },
                enable: { type: 'boolean' }
              },
              required: ['thingUID', 'enable']
            }
          },
          {
            name: 'get_thing_status',
            description: 'Get the status of a thing',
            inputSchema: {
              type: 'object',
              properties: { thingUID: { type: 'string' } },
              required: ['thingUID']
            }
          },
          {
            name: 'update_thing_config',
            description: 'Update the configuration of a thing',
            inputSchema: {
              type: 'object',
              properties: {
                thingUID: { type: 'string' },
                config: { type: 'object' }
              },
              required: ['thingUID', 'config']
            }
          },

          // --- Links ---
          {
            name: 'get_links',
            description: 'Get all links between items and channels',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                channelUID: { type: 'string' }
              }
            }
          },
          {
            name: 'link_item_to_channel',
            description: 'Link an item to a channel',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                channelUID: { type: 'string' },
                config: { type: 'object' }
              },
              required: ['itemName', 'channelUID']
            }
          },
          {
            name: 'unlink_item_from_channel',
            description: 'Unlink an item from a channel',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                channelUID: { type: 'string' }
              },
              required: ['itemName', 'channelUID']
            }
          },

          // --- Semantic Tags ---
          {
            name: 'get_semantic_tags',
            description: 'Get all available semantic tags',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'create_semantic_tag',
            description: 'Create a new semantic tag',
            inputSchema: {
              type: 'object',
              properties: { tagData: { type: 'object' } },
              required: ['tagData']
            }
          },
          {
            name: 'get_semantic_tag',
            description: 'Get a specific semantic tag',
            inputSchema: {
              type: 'object',
              properties: { tagId: { type: 'string' } },
              required: ['tagId']
            }
          },
          {
            name: 'update_semantic_tag',
            description: 'Update a semantic tag',
            inputSchema: {
              type: 'object',
              properties: {
                tagId: { type: 'string' },
                tagData: { type: 'object' }
              },
              required: ['tagId', 'tagData']
            }
          },
          {
            name: 'delete_semantic_tag',
            description: 'Delete a semantic tag',
            inputSchema: {
              type: 'object',
              properties: { tagId: { type: 'string' } },
              required: ['tagId']
            }
          },

          // --- Rules ---
          {
            name: 'get_rules',
            description: 'Get all OpenHAB rules',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_rule',
            description: 'Get a specific rule by UID',
            inputSchema: {
              type: 'object',
              properties: { ruleUID: { type: 'string' } },
              required: ['ruleUID']
            }
          },
          {
            name: 'create_rule',
            description: 'Create a new rule',
            inputSchema: {
              type: 'object',
              properties: { ruleData: { type: 'object' } },
              required: ['ruleData']
            }
          },
          {
            name: 'update_rule',
            description: 'Update a rule definition',
            inputSchema: {
              type: 'object',
              properties: {
                ruleUID: { type: 'string' },
                ruleData: { type: 'object' }
              },
              required: ['ruleUID', 'ruleData']
            }
          },
          {
            name: 'delete_rule',
            description: 'Delete a rule',
            inputSchema: {
              type: 'object',
              properties: { ruleUID: { type: 'string' } },
              required: ['ruleUID']
            }
          },
          {
            name: 'run_rule',
            description: 'Manually execute an OpenHAB rule by UID',
            inputSchema: {
              type: 'object',
              properties: { ruleUID: { type: 'string' } },
              required: ['ruleUID']
            }
          },
          {
            name: 'enable_rule',
            description: 'Enable or disable a rule',
            inputSchema: {
              type: 'object',
              properties: {
                ruleUID: { type: 'string' },
                enable: { type: 'boolean' }
              },
              required: ['ruleUID', 'enable']
            }
          },

          // --- Inbox / Discovery ---
          {
            name: 'get_inbox',
            description: 'Get all discovered things in the inbox',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'approve_inbox_item',
            description: 'Approve a thing in the inbox',
            inputSchema: {
              type: 'object',
              properties: {
                thingUID: { type: 'string' },
                label: { type: 'string' },
                newThingId: { type: 'string' }
              },
              required: ['thingUID']
            }
          },
          {
            name: 'ignore_inbox_item',
            description: 'Ignore a thing in the inbox',
            inputSchema: {
              type: 'object',
              properties: { thingUID: { type: 'string' } },
              required: ['thingUID']
            }
          },
          {
            name: 'unignore_inbox_item',
            description: 'Unignore a thing in the inbox',
            inputSchema: {
              type: 'object',
              properties: { thingUID: { type: 'string' } },
              required: ['thingUID']
            }
          },

          // --- Persistence ---
          {
            name: 'get_persistence_services',
            description: 'Get all available persistence services',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_item_persistence_data',
            description: 'Get historical data for an item',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                serviceId: { type: 'string' },
                starttime: { type: 'string' },
                endtime: { type: 'string' }
              },
              required: ['itemName']
            }
          },
          {
            name: 'store_item_persistence_data',
            description: 'Store a state in persistence',
            inputSchema: {
              type: 'object',
              properties: {
                itemName: { type: 'string' },
                time: { type: 'string' },
                state: { type: 'string' },
                serviceId: { type: 'string' }
              },
              required: ['itemName', 'time', 'state']
            }
          },

          // --- Voice / Audio ---
          {
            name: 'voice_say',
            description: 'Speak a text via OpenHAB TTS',
            inputSchema: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                sinkId: { type: 'string', description: 'Audio sink ID (optional)' }
              },
              required: ['text']
            }
          },
          {
            name: 'voice_interpret',
            description: 'Interpret a natural language string',
            inputSchema: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                interpreterIds: { type: 'string' }
              },
              required: ['text']
            }
          },
          {
            name: 'get_voices',
            description: 'Get all available TTS voices',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_audio_sinks',
            description: 'Get all audio sinks',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_audio_sources',
            description: 'Get all audio sources',
            inputSchema: { type: 'object', properties: {} }
          },

          // --- Addons ---
          {
            name: 'get_addons',
            description: 'Get all addons',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'install_addon',
            description: 'Install an addon',
            inputSchema: {
              type: 'object',
              properties: { addonId: { type: 'string' } },
              required: ['addonId']
            }
          },
          {
            name: 'uninstall_addon',
            description: 'Uninstall an addon',
            inputSchema: {
              type: 'object',
              properties: { addonId: { type: 'string' } },
              required: ['addonId']
            }
          },

          // --- Sitemaps & UI ---
          {
            name: 'get_sitemaps',
            description: 'Get all sitemaps',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_ui_components',
            description: 'Get UI components for a namespace',
            inputSchema: {
              type: 'object',
              properties: { namespace: { type: 'string' } },
              required: ['namespace']
            }
          },
          {
            name: 'get_ui_tiles',
            description: 'Get all UI tiles',
            inputSchema: { type: 'object', properties: {} }
          },

          // --- System & Config ---
          {
            name: 'get_system_info',
            description: 'Get system information',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_loggers',
            description: 'Get all loggers',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'set_logger_level',
            description: 'Set level for a logger',
            inputSchema: {
              type: 'object',
              properties: {
                loggerName: { type: 'string' },
                level: { type: 'string' }
              },
              required: ['loggerName', 'level']
            }
          },
          {
            name: 'get_services',
            description: 'Get all services',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_service_config',
            description: 'Get configuration for a service',
            inputSchema: {
              type: 'object',
              properties: { serviceId: { type: 'string' } },
              required: ['serviceId']
            }
          },
          {
            name: 'update_service_config',
            description: 'Update service configuration',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: { type: 'string' },
                config: { type: 'object' }
              },
              required: ['serviceId', 'config']
            }
          },
          {
            name: 'get_templates',
            description: 'Get all templates',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_transformations',
            description: 'Get all transformations',
            inputSchema: { type: 'object', properties: {} }
          },

          // --- Habot ---
          {
            name: 'chat_with_habot',
            description: 'Send a natural language query to Habot',
            inputSchema: {
              type: 'object',
              properties: { text: { type: 'string' } },
              required: ['text']
            }
          }
        ]
      };
    }
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: any) => {
      const { name, arguments: args } = request.params;
      try {
        let result: any;
        switch (name) {
          // --- Items ---
          case 'get_items':
            result = await client.getItems(args.tags, args.type, args.metadata);
            break;
          case 'get_item':
            result = await client.getItem(args.itemName);
            break;
          case 'send_command':
            result = await client.sendCommand(args.itemName, args.command);
            break;
          case 'update_state':
            result = await client.updateState(args.itemName, args.state);
            break;
          case 'create_or_update_item':
            result = await client.createOrUpdateItem(args.itemName, args.itemData);
            break;
          case 'delete_item':
            result = await client.deleteItem(args.itemName);
            break;
          case 'add_tag':
            result = await client.addTag(args.itemName, args.tag);
            break;
          case 'remove_tag':
            result = await client.removeTag(args.itemName, args.tag);
            break;
          case 'set_metadata':
            result = await client.setMetadata(args.itemName, args.namespace, args.value, args.config);
            break;
          case 'remove_metadata':
            result = await client.removeMetadata(args.itemName, args.namespace);
            break;

          // --- Things ---
          case 'get_things':
            result = await client.getThings();
            break;
          case 'get_thing':
            result = await client.getThing(args.thingUID);
            break;
          case 'create_thing':
            result = await client.createThing(args.thingData);
            break;
          case 'update_thing':
            result = await client.updateThing(args.thingUID, args.thingData);
            break;
          case 'delete_thing':
            result = await client.deleteThing(args.thingUID, args.force);
            break;
          case 'enable_thing':
            result = await client.enableThing(args.thingUID, args.enable);
            break;
          case 'get_thing_status':
            result = await client.getThingStatus(args.thingUID);
            break;
          case 'update_thing_config':
            result = await client.updateThingConfig(args.thingUID, args.config);
            break;

          // --- Links ---
          case 'get_links':
            result = await client.getLinks(args.itemName, args.channelUID);
            break;
          case 'link_item_to_channel':
            result = await client.linkItemToChannel(args.itemName, args.channelUID, args.config);
            break;
          case 'unlink_item_from_channel':
            result = await client.unlinkItemFromChannel(args.itemName, args.channelUID);
            break;

          // --- Semantic Tags ---
          case 'get_semantic_tags':
            result = await client.getSemanticTags();
            break;
          case 'create_semantic_tag':
            result = await client.createSemanticTag(args.tagData);
            break;
          case 'get_semantic_tag':
            result = await client.getSemanticTag(args.tagId);
            break;
          case 'update_semantic_tag':
            result = await client.updateSemanticTag(args.tagId, args.tagData);
            break;
          case 'delete_semantic_tag':
            result = await client.deleteSemanticTag(args.tagId);
            break;

          // --- Rules ---
          case 'get_rules':
            result = await client.getRules();
            break;
          case 'get_rule':
            result = await client.getRule(args.ruleUID);
            break;
          case 'create_rule':
            result = await client.createRule(args.ruleData);
            break;
          case 'update_rule':
            result = await client.updateRule(args.ruleUID, args.ruleData);
            break;
          case 'delete_rule':
            result = await client.deleteRule(args.ruleUID);
            break;
          case 'run_rule':
            result = await client.runRule(args.ruleUID);
            break;
          case 'enable_rule':
            result = await client.enableRule(args.ruleUID, args.enable);
            break;

          // --- Inbox / Discovery ---
          case 'get_inbox':
            result = await client.getInbox();
            break;
          case 'approve_inbox_item':
            result = await client.approveInboxItem(args.thingUID, args.label, args.newThingId);
            break;
          case 'ignore_inbox_item':
            result = await client.ignoreInboxItem(args.thingUID);
            break;
          case 'unignore_inbox_item':
            result = await client.unignoreInboxItem(args.thingUID);
            break;

          // --- Persistence ---
          case 'get_persistence_services':
            result = await client.getPersistenceServices();
            break;
          case 'get_item_persistence_data':
            result = await client.getItemPersistenceData(args.itemName, args.serviceId, args.starttime, args.endtime);
            break;
          case 'store_item_persistence_data':
            result = await client.storeItemPersistenceData(args.itemName, args.time, args.state, args.serviceId);
            break;

          // --- Voice / Audio ---
          case 'voice_say':
            result = await client.voiceSay(args.text, undefined, args.sinkId);
            break;
          case 'voice_interpret':
            result = await client.voiceInterpret(args.text, args.interpreterIds);
            break;
          case 'get_voices':
            result = await client.getVoices();
            break;
          case 'get_audio_sinks':
            result = await client.getAudioSinks();
            break;
          case 'get_audio_sources':
            result = await client.getAudioSources();
            break;

          // --- Addons ---
          case 'get_addons':
            result = await client.getAddons();
            break;
          case 'install_addon':
            result = await client.installAddon(args.addonId);
            break;
          case 'uninstall_addon':
            result = await client.uninstallAddon(args.addonId);
            break;

          // --- Sitemaps & UI ---
          case 'get_sitemaps':
            result = await client.getSitemaps();
            break;
          case 'get_ui_components':
            result = await client.getUIComponents(args.namespace);
            break;
          case 'get_ui_tiles':
            result = await client.getUITiles();
            break;

          // --- System & Config ---
          case 'get_system_info':
            result = await client.getSystemInfo();
            break;
          case 'get_loggers':
            result = await client.getLoggers();
            break;
          case 'set_logger_level':
            result = await client.setLoggerLevel(args.loggerName, args.level);
            break;
          case 'get_services':
            result = await client.getServices();
            break;
          case 'get_service_config':
            result = await client.getServiceConfig(args.serviceId);
            break;
          case 'update_service_config':
            result = await client.updateServiceConfig(args.serviceId, args.config);
            break;
          case 'get_templates':
            result = await client.getTemplates();
            break;
          case 'get_transformations':
            result = await client.getTransformations();
            break;

          // --- Habot ---
          case 'chat_with_habot':
            result = await client.chatWithHabot(args.text);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
