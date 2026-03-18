export abstract class BaseTool {
    abstract name: string;
    abstract description: string;

    /**
     * Executes the tool with the given arguments.
     * @param args The arguments parsed from the LLM.
     * @returns A string representation of the tool's execution result or observation.
     */
    abstract execute(args: Record<string, any>): Promise<string>;

    /**
     * Returns the JSON Schema function declaration expected by the LLM providers (e.g. Gemini, OpenAI)
     */
    abstract getFunctionDeclaration(): any;
}
