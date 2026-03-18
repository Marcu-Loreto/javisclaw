import { SkillLoader, Skill } from './SkillLoader';
import { SkillRouter } from './SkillRouter';
import { AgentLoop } from '../core/AgentLoop';

export class SkillExecutor {
    private loader: SkillLoader;
    private router: SkillRouter;
    private loop: AgentLoop;

    constructor() {
        this.loader = new SkillLoader();
        this.router = new SkillRouter();
        this.loop = new AgentLoop();
    }

    /**
     * Entry point to handle a user conversation turn.
     */
    public async executeTurn(userId: string, userMessage: string): Promise<string> {
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
