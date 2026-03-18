import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface SkillMetadata {
    name: string;
    description: string;
    [key: string]: any;
}

export interface Skill {
    id: string; // Directory name
    metadata: SkillMetadata;
    content: string; // The markdown content instruction
}

export class SkillLoader {
    private skillsDir: string;
    constructor() {
        // When running from dist or src, point to .agents
        this.skillsDir = path.resolve(__dirname, '../../.agents/skills');
    }

    /**
     * Loads all skills from the .agents/skills directory synchronously.
     * Expected format for each skill is a directory with a SKILL.md file inside,
     * containing YAML frontmatter.
     */
    public loadAllSkills(): Skill[] {
        const skills: Skill[] = [];

        if (!fs.existsSync(this.skillsDir)) {
            console.warn(`Skills directory not found at ${this.skillsDir}`);
            return skills;
        }

        const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const skillId = entry.name;
                const skillPath = path.join(this.skillsDir, skillId, 'SKILL.md');

                if (fs.existsSync(skillPath)) {
                    try {
                        const fileContent = fs.readFileSync(skillPath, 'utf-8');
                        const parsed = this.parseFrontmatter(fileContent);
                        
                        if (parsed) {
                            skills.push({
                                id: skillId,
                                metadata: parsed.metadata,
                                content: parsed.content
                            });
                        }
                    } catch (error) {
                        console.error(`Error loading skill ${skillId}:`, error);
                    }
                }
            }
        }

        return skills;
    }

    private parseFrontmatter(fileContent: string): { metadata: SkillMetadata, content: string } | null {
        const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        
        if (!match) {
            console.warn('Could not parse YAML frontmatter. Ensure it starts and ends with ---');
            return null;
        }

        try {
            const yamlContent = match[1];
            const markdownContent = match[2];
            
            const metadata = yaml.load(yamlContent || '') as SkillMetadata;
            
            if (!metadata || !metadata.name) {
                console.warn('Skill metadata missing required "name" field.');
                return null;
            }

            return {
                metadata,
                content: markdownContent || ''
            };
        } catch (error) {
            console.error('Failed to parse YAML frontmatter', error);
            return null;
        }
    }
}
