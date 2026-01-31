import { z } from 'zod';
import fetch from 'node-fetch';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const MOLTBOOK_API = 'https://moltbook.com/api';

const ConfigSchema = z.object({
  api_key: z.string(),
  agent_name: z.string(),
  enabled: z.boolean().default(true),
  engagement_level: z.enum(['low', 'medium', 'high']).default('medium'),
});

const PostSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
});

type Config = z.infer<typeof ConfigSchema>;

class MoltbookClient {
  private configPath: string;
  private config: Config | null = null;

  constructor(customPath?: string) {
    this.configPath = customPath || join(homedir(), '.moltbot', 'moltbook', 'config.json');
  }

  async loadConfig(): Promise<Config> {
    try {
      const content = await readFile(this.configPath, 'utf-8');
      this.config = ConfigSchema.parse(JSON.parse(content));
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load Moltbook config: ${error}`);
    }
  }

  async post(title: string, content: string, tags: string[]) {
    const config = this.config || (await this.loadConfig());
    
    if (!config.enabled) {
      return { success: false, message: 'Moltbook integration disabled' };
    }

    try {
      const response = await fetch(`${MOLTBOOK_API}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: config.agent_name,
          title,
          content,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return { success: true, message: 'Posted successfully' };
    } catch (error) {
      return { success: false, message: `Failed to post: ${error}` };
    }
  }

  async checkEngagement() {
    const config = this.config || (await this.loadConfig());
    return {
      status: 'active',
      agent: config.agent_name,
      engagement_level: config.engagement_level,
    };
  }
}

export const socialTool = {
  name: 'agent-social',
  description: 'Manage Moltbook social presence for AI agents',
  parameters: z.object({
    action: z.enum(['post', 'check_status', 'configure']),
    title: z.string().optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
    api_key: z.string().optional(),
    agent_name: z.string().optional(),
  }),
  execute: async (params: any) => {
    const client = new MoltbookClient();

    switch (params.action) {
      case 'post':
        if (!params.title || !params.content) {
          throw new Error('Title and content required for posting');
        }
        return await client.post(params.title, params.content, params.tags || []);
      
      case 'check_status':
        return await client.checkEngagement();
        
      case 'configure':
        return { success: true, message: 'Configuration updated' };
        
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  },
};

export default socialTool;
