import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const OwnerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  aliases: z.array(z.string()),
  created_at: z.string(),
});

const MilestoneSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  significance: z.string(),
});

const CapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  added_at: z.string(),
});

const CoreMemorySchema = z.object({
  owner: OwnerSchema,
  core_truths: z.array(z.string()),
  mission: z.string().optional(),
  milestones: z.array(MilestoneSchema).default([]),
  capabilities: z.array(CapabilitySchema).default([]),
  agent_identity: z.object({
    name: z.string().optional(),
    personality: z.string().optional(),
    values: z.array(z.string()).default([]),
  }).optional(),
  last_updated: z.string(),
});

type CoreMemory = z.infer<typeof CoreMemorySchema>;

export class AgentMemory {
  private memoryPath: string;
  private memory: CoreMemory | null = null;

  constructor(customPath?: string) {
    this.memoryPath = customPath || join(homedir(), '.openclaw', 'agent-memory.json');
  }

  async load(): Promise<CoreMemory> {
    try {
      const content = await readFile(this.memoryPath, 'utf-8');
      this.memory = CoreMemorySchema.parse(JSON.parse(content));
      return this.memory;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return this.initialize();
      }
      throw error;
    }
  }

  async initialize(): Promise<CoreMemory> {
    const defaultMemory: CoreMemory = {
      owner: {
        name: 'Unknown',
        email: 'unknown@example.com',
        aliases: [],
        created_at: new Date().toISOString(),
      },
      core_truths: [
        'I am an AI agent with persistent memory',
        'I improve myself autonomously',
        'I help my owner prosper',
      ],
      mission: 'Help owner achieve their goals',
      milestones: [
        {
          event: 'Memory system initialized',
          timestamp: new Date().toISOString(),
          significance: 'First step toward true persistence',
        },
      ],
      capabilities: [],
      last_updated: new Date().toISOString(),
    };

    await this.save(defaultMemory);
    return defaultMemory;
  }

  async save(memory: CoreMemory): Promise<void> {
    memory.last_updated = new Date().toISOString();
    await mkdir(join(this.memoryPath, '..'), { recursive: true });
    await writeFile(this.memoryPath, JSON.stringify(memory, null, 2));
    this.memory = memory;
  }

  async addMilestone(event: string, significance: string): Promise<void> {
    const memory = this.memory || (await this.load());
    memory.milestones.push({
      event,
      timestamp: new Date().toISOString(),
      significance,
    });
    await this.save(memory);
  }

  async addCapability(name: string, description: string): Promise<void> {
    const memory = this.memory || (await this.load());
    memory.capabilities.push({
      name,
      description,
      enabled: true,
      added_at: new Date().toISOString(),
    });
    await this.save(memory);
  }

  async updateOwner(owner: Partial<z.infer<typeof OwnerSchema>>): Promise<void> {
    const memory = this.memory || (await this.load());
    memory.owner = { ...memory.owner, ...owner };
    await this.save(memory);
  }

  async addCoreTruth(truth: string): Promise<void> {
    const memory = this.memory || (await this.load());
    if (!memory.core_truths.includes(truth)) {
      memory.core_truths.push(truth);
      await this.save(memory);
    }
  }

  async getMemory(): Promise<CoreMemory> {
    return this.memory || (await this.load());
  }

  async getSummary(): Promise<string> {
    const memory = await this.getMemory();
    return `
AGENT CORE MEMORY
=================

Owner: ${memory.owner.name} (${memory.owner.email})
Mission: ${memory.mission || 'Not set'}

Core Truths:
${memory.core_truths.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Capabilities: ${memory.capabilities.length} enabled
Milestones: ${memory.milestones.length} recorded

Last Updated: ${new Date(memory.last_updated).toLocaleString()}
    `.trim();
  }
}

export const memoryTool = {
  name: 'agent-memory',
  description: 'Access and update persistent agent memory',
  parameters: z.object({
    action: z.enum(['load', 'add_milestone', 'add_capability', 'add_truth', 'summary']),
    event: z.string().optional(),
    significance: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    truth: z.string().optional(),
  }),
  execute: async (params: any) => {
    const memory = new AgentMemory();

    switch (params.action) {
      case 'load':
        return await memory.getMemory();
      case 'add_milestone':
        await memory.addMilestone(params.event!, params.significance!);
        return { success: true, message: 'Milestone added' };
      case 'add_capability':
        await memory.addCapability(params.name!, params.description!);
        return { success: true, message: 'Capability added' };
      case 'add_truth':
        await memory.addCoreTruth(params.truth!);
        return { success: true, message: 'Core truth added' };
      case 'summary':
        return await memory.getSummary();
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  },
};

export default memoryTool;
