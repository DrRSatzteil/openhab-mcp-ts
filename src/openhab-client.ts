import axios, { AxiosInstance } from 'axios';

export class OpenHabClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiToken: string) {
    this.client = axios.create({
      baseURL: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add interceptor to format errors nicely
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(`OpenHAB API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          throw new Error(`OpenHAB Network Error: No response received connecting to ${baseUrl}`);
        } else {
          throw new Error(`OpenHAB Request Error: ${error.message}`);
        }
      }
    );
  }

  // --- Items ---
  async getItems(tags?: string, type?: string, metadata?: string) {
    const params: any = {};
    if (tags) params.tags = tags;
    if (type) params.type = type;
    if (metadata) params.metadata = metadata;
    
    const response = await this.client.get('/rest/items', { params });
    return response.data;
  }

  async getItem(itemName: string) {
    const response = await this.client.get(`/rest/items/${itemName}`);
    return response.data;
  }

  async sendCommand(itemName: string, command: string) {
    const response = await this.client.post(`/rest/items/${itemName}`, command, {
      headers: { 'Content-Type': 'text/plain', 'Accept': '*/*' }
    });
    return response.data;
  }

  async updateState(itemName: string, state: string) {
    const response = await this.client.put(`/rest/items/${itemName}/state`, state, {
      headers: { 'Content-Type': 'text/plain', 'Accept': '*/*' }
    });
    return response.data;
  }

  async createOrUpdateItem(itemName: string, itemData: any) {
    const response = await this.client.put(`/rest/items/${itemName}`, itemData);
    return response.data;
  }

  async deleteItem(itemName: string) {
    const response = await this.client.delete(`/rest/items/${itemName}`);
    return response.data;
  }

  async addTag(itemName: string, tag: string) {
    const response = await this.client.put(`/rest/items/${itemName}/tags/${tag}`);
    return response.data;
  }

  async removeTag(itemName: string, tag: string) {
    const response = await this.client.delete(`/rest/items/${itemName}/tags/${tag}`);
    return response.data;
  }

  async setMetadata(itemName: string, namespace: string, value: string, config?: any) {
    const data = { value, config };
    const response = await this.client.put(`/rest/items/${itemName}/metadata/${namespace}`, data);
    return response.data;
  }

  async removeMetadata(itemName: string, namespace: string) {
    const response = await this.client.delete(`/rest/items/${itemName}/metadata/${namespace}`);
    return response.data;
  }

  // --- Things ---
  async getThings() {
    const response = await this.client.get('/rest/things');
    return response.data;
  }

  async getThing(thingUID: string) {
    const response = await this.client.get(`/rest/things/${thingUID}`);
    return response.data;
  }

  async createThing(thingData: any) {
    const response = await this.client.post('/rest/things', thingData);
    return response.data;
  }

  async updateThing(thingUID: string, thingData: any) {
    const response = await this.client.put(`/rest/things/${thingUID}`, thingData);
    return response.data;
  }

  async deleteThing(thingUID: string, force: boolean = false) {
    const response = await this.client.delete(`/rest/things/${thingUID}`, {
      params: { force }
    });
    return response.data;
  }

  async enableThing(thingUID: string, enable: boolean) {
    const response = await this.client.put(`/rest/things/${thingUID}/enable`, enable.toString(), {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }

  async getThingStatus(thingUID: string) {
    const response = await this.client.get(`/rest/things/${thingUID}/status`);
    return response.data;
  }

  async updateThingConfig(thingUID: string, config: any) {
    const response = await this.client.put(`/rest/things/${thingUID}/config`, config);
    return response.data;
  }

  // --- Links ---
  async getLinks(itemName?: string, channelUID?: string) {
    const params: any = {};
    if (itemName) params.itemName = itemName;
    if (channelUID) params.channelUID = channelUID;
    const response = await this.client.get('/rest/links', { params });
    return response.data;
  }

  async linkItemToChannel(itemName: string, channelUID: string, config?: any) {
    const response = await this.client.put(`/rest/links/${itemName}/${channelUID}`, { configuration: config || {} });
    return response.data;
  }

  async unlinkItemFromChannel(itemName: string, channelUID: string) {
    const response = await this.client.delete(`/rest/links/${itemName}/${channelUID}`);
    return response.data;
  }

  // --- Semantic Tags ---
  async getSemanticTags() {
    const response = await this.client.get('/rest/tags');
    return response.data;
  }

  async createSemanticTag(tagData: any) {
    const response = await this.client.post('/rest/tags', tagData);
    return response.data;
  }

  async getSemanticTag(tagId: string) {
    const response = await this.client.get(`/rest/tags/${tagId}`);
    return response.data;
  }

  async updateSemanticTag(tagId: string, tagData: any) {
    const response = await this.client.put(`/rest/tags/${tagId}`, tagData);
    return response.data;
  }

  async deleteSemanticTag(tagId: string) {
    const response = await this.client.delete(`/rest/tags/${tagId}`);
    return response.data;
  }

  // --- Rules ---
  async getRules() {
    const response = await this.client.get('/rest/rules');
    return response.data;
  }

  async getRule(ruleUID: string) {
    const response = await this.client.get(`/rest/rules/${ruleUID}`);
    return response.data;
  }

  async createRule(ruleData: any) {
    const response = await this.client.post('/rest/rules', ruleData);
    return response.data;
  }

  async updateRule(ruleUID: string, ruleData: any) {
    const response = await this.client.put(`/rest/rules/${ruleUID}`, ruleData);
    return response.data;
  }

  async deleteRule(ruleUID: string) {
    const response = await this.client.delete(`/rest/rules/${ruleUID}`);
    return response.data;
  }

  async runRule(ruleUID: string, context?: any) {
    const response = await this.client.post(`/rest/rules/${ruleUID}/runnow`, context || {});
    return response.data;
  }

  async enableRule(ruleUID: string, enable: boolean) {
    const response = await this.client.post(`/rest/rules/${ruleUID}/enable`, enable.toString(), {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }

  // --- Inbox / Discovery ---
  async getInbox() {
    const response = await this.client.get('/rest/inbox');
    return response.data;
  }

  async approveInboxItem(thingUID: string, label?: string, newThingId?: string) {
    const params: any = {};
    if (newThingId) params.newThingId = newThingId;
    const response = await this.client.post(`/rest/inbox/${thingUID}/approve`, label || '', {
      params,
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }

  async ignoreInboxItem(thingUID: string) {
    const response = await this.client.post(`/rest/inbox/${thingUID}/ignore`);
    return response.data;
  }

  async unignoreInboxItem(thingUID: string) {
    const response = await this.client.post(`/rest/inbox/${thingUID}/unignore`);
    return response.data;
  }

  // --- Persistence ---
  async getPersistenceServices() {
    const response = await this.client.get('/rest/persistence');
    return response.data;
  }

  async getItemPersistenceData(itemName: string, serviceId?: string, starttime?: string, endtime?: string) {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId;
    if (starttime) params.starttime = starttime;
    if (endtime) params.endtime = endtime;
    const response = await this.client.get(`/rest/persistence/items/${itemName}`, { params });
    return response.data;
  }

  async storeItemPersistenceData(itemName: string, time: string, state: string, serviceId?: string) {
    const params: any = { time, state };
    if (serviceId) params.serviceId = serviceId;
    const response = await this.client.put(`/rest/persistence/items/${itemName}`, null, { params });
    return response.data;
  }

  // --- Voice / Audio ---
  async voiceSay(text: string, voiceId?: string, sinkId?: string, volume?: string) {
    const params: any = {};
    if (voiceId) params.voiceid = voiceId;
    if (sinkId) params.sinkid = sinkId;
    if (volume) params.volume = volume;
    const response = await this.client.post('/rest/voice/say', text, {
      params,
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }

  async voiceInterpret(text: string, interpreterIds?: string) {
    const url = interpreterIds ? `/rest/voice/interpreters/${interpreterIds}` : '/rest/voice/interpreters';
    const response = await this.client.post(url, text, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }

  async getVoices() {
    const response = await this.client.get('/rest/voice/voices');
    return response.data;
  }

  async getAudioSinks() {
    const response = await this.client.get('/rest/audio/sinks');
    return response.data;
  }

  async getAudioSources() {
    const response = await this.client.get('/rest/audio/sources');
    return response.data;
  }

  // --- Addons ---
  async getAddons() {
    const response = await this.client.get('/rest/addons');
    return response.data;
  }

  async installAddon(addonId: string) {
    const response = await this.client.post(`/rest/addons/${addonId}/install`);
    return response.data;
  }

  async uninstallAddon(addonId: string) {
    const response = await this.client.post(`/rest/addons/${addonId}/uninstall`);
    return response.data;
  }

  // --- Sitemaps & UI ---
  async getSitemaps() {
    const response = await this.client.get('/rest/sitemaps');
    return response.data;
  }

  async getUIComponents(namespace: string) {
    const response = await this.client.get(`/rest/ui/components/${namespace}`);
    return response.data;
  }

  async getUITiles() {
    const response = await this.client.get('/rest/ui/tiles');
    return response.data;
  }

  // --- System & Config ---
  async getSystemInfo() {
    const response = await this.client.get('/rest/systeminfo');
    return response.data;
  }

  async getLoggers() {
    const response = await this.client.get('/rest/logging');
    return response.data;
  }

  async setLoggerLevel(loggerName: string, level: string) {
    const response = await this.client.put(`/rest/logging/${loggerName}`, { loggerName, level });
    return response.data;
  }

  async getServices() {
    const response = await this.client.get('/rest/services');
    return response.data;
  }

  async getServiceConfig(serviceId: string) {
    const response = await this.client.get(`/rest/services/${serviceId}/config`);
    return response.data;
  }

  async updateServiceConfig(serviceId: string, config: any) {
    const response = await this.client.put(`/rest/services/${serviceId}/config`, config);
    return response.data;
  }

  async getTemplates() {
    const response = await this.client.get('/rest/templates');
    return response.data;
  }

  async getTransformations() {
    const response = await this.client.get('/rest/transformations');
    return response.data;
  }

  // --- Habot ---
  async chatWithHabot(text: string) {
    const response = await this.client.post('/rest/habot/chat', text, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  }
}
