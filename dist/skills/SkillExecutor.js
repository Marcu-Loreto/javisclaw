"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillExecutor = void 0;
const SkillLoader_1 = require("./SkillLoader");
const SkillRouter_1 = require("./SkillRouter");
const AgentLoop_1 = require("../core/AgentLoop");
class SkillExecutor {
    loader;
    router;
    loop;
    constructor() {
        this.loader = new SkillLoader_1.SkillLoader();
        this.router = new SkillRouter_1.SkillRouter();
        this.loop = new AgentLoop_1.AgentLoop();
    }
    /**
     * Entry point to handle a user conversation turn.
     */
    async executeTurn(userId, userMessage) {
        console.log(`[Executor] Processing turn for user ${userId}`);
        // 1. Hot-reload skills
        const skills = this.loader.loadAllSkills();
        // 2. Identify the intent
        const targetSkillId = await this.router.route(userMessage, skills);
        // 3. Get the skill content if found
        let skillContent = '';
        if (targetSkillId) {
            const targetSkill = skills.find(s => s.id === targetSkillId);
            if (targetSkill) {
                skillContent = targetSkill.content;
            }
        }
        // 4. Pass execution to the Agent Loop
        return await this.loop.run(userId, userMessage, skillContent, skills);
    }
}
exports.SkillExecutor = SkillExecutor;
