"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = exports.ToolRegistry = void 0;
class ToolRegistry {
    tools = new Map();
    register(tool) {
        if (this.tools.has(tool.name)) {
            console.warn(`Tool with name ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getToolDeclarations() {
        return this.getAllTools().map(tool => tool.getFunctionDeclaration());
    }
}
exports.ToolRegistry = ToolRegistry;
// Global registry instance
exports.toolRegistry = new ToolRegistry();
