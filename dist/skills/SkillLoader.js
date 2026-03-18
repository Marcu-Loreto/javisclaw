"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
class SkillLoader {
    skillsDir;
    constructor() {
        // When running from dist or src, point to .agents
        this.skillsDir = path.resolve(__dirname, '../../.agents/skills');
    }
    /**
     * Loads all skills from the .agents/skills directory synchronously.
     * Expected format for each skill is a directory with a SKILL.md file inside,
     * containing YAML frontmatter.
     */
    loadAllSkills() {
        const skills = [];
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
                    }
                    catch (error) {
                        console.error(`Error loading skill ${skillId}:`, error);
                    }
                }
            }
        }
        return skills;
    }
    parseFrontmatter(fileContent) {
        const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (!match) {
            console.warn('Could not parse YAML frontmatter. Ensure it starts and ends with ---');
            return null;
        }
        try {
            const yamlContent = match[1];
            const markdownContent = match[2];
            const metadata = yaml.load(yamlContent || '');
            if (!metadata || !metadata.name) {
                console.warn('Skill metadata missing required "name" field.');
                return null;
            }
            return {
                metadata,
                content: markdownContent || ''
            };
        }
        catch (error) {
            console.error('Failed to parse YAML frontmatter', error);
            return null;
        }
    }
}
exports.SkillLoader = SkillLoader;
