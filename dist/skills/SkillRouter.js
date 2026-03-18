"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillRouter = void 0;
const ProviderFactory_1 = require("../providers/ProviderFactory");
class SkillRouter {
    provider;
    constructor() {
        // Router can use a fast model or the default
        this.provider = ProviderFactory_1.ProviderFactory.getProvider();
    }
    /**
     * Determines which skill is most appropriate for the user's intent.
     * @param userIntent The latest message or intent from the user.
     * @param availableSkills Array of currently loaded skills.
     * @returns The ID of the chosen skill, or null if no skill matches.
     */
    async route(userIntent, availableSkills) {
        if (availableSkills.length === 0) {
            return null;
        }
        const skillList = availableSkills.map(s => `- ID: "${s.id}" | Name: "${s.metadata.name}" | Desc: "${s.metadata.description}"`).join('\n');
        const systemPrompt = `You are a strict Skill Router. Your job is to select the most appropriate skill ID based on the user's input.
Available Skills:
${skillList}

You MUST return ONLY a valid JSON object matching this schema:
{
  "skillId": "string or null"
}

If no skill matches the intent, return {"skillId": null}. DO NOT return markdown formatting around the JSON, just the raw JSON.`;
        try {
            const response = await this.provider.generateContent(systemPrompt, [{ role: 'user', content: userIntent }]);
            if (response.content) {
                // Remove potential markdown code blocks returned by LLM
                const cleanContent = response.content.replace(/```json\n?|\n?```/gi, '').trim();
                const parsed = JSON.parse(cleanContent);
                if (parsed.skillId && availableSkills.some(s => s.id === parsed.skillId)) {
                    console.log(`[Router] Routed intent to skill: ${parsed.skillId}`);
                    return parsed.skillId;
                }
            }
        }
        catch (error) {
            console.error('[Router] Error routing skill:', error);
        }
        console.log(`[Router] No specific skill matched. Falling back to default agent.`);
        return null;
    }
}
exports.SkillRouter = SkillRouter;
