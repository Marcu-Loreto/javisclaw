import { BaseTool } from './BaseTool';

export class ToolRegistry {
    private tools: Map<string, BaseTool> = new Map();

    register(tool: BaseTool) {
        if (this.tools.has(tool.name)) {
            console.warn(`Tool with name ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }

    getTool(name: string): BaseTool | undefined {
        return this.tools.get(name);
    }

    getAllTools(): BaseTool[] {
        return Array.from(this.tools.values());
    }

    getToolDeclarations(): any[] {
        return this.getAllTools().map(tool => tool.getFunctionDeclaration());
    }
}

// Global registry instance
export const toolRegistry = new ToolRegistry();
