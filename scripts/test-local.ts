import 'dotenv/config';
import { AgentController } from '../src/core/AgentController';

async function runTest() {
    console.log('Testing the AgentController directly without Telegram...');
    
    // Bypass Telegram whitelist for this specific test
    process.env.TELEGRAM_ALLOWED_USER_IDS = 'test-user-123';
    process.env.DEFAULT_PROVIDER = 'mock'; // Ensure we have a provider

    const controller = new AgentController();
    
    try {
        console.log('\n--- Test 1: Casual Conversation ---');
        console.log('User: Hello, who are you?');
        const res1 = await controller.handleIncomingMessage('test-user-123', 'Hello, who are you?');
        console.log('Agent:', res1);

        console.log('\n--- Test 2: Memory Context ---');
        console.log('User: My favorite color is blue.');
        await controller.handleIncomingMessage('test-user-123', 'My favorite color is blue.');
        
        console.log('User: What is my favorite color?');
        const res2 = await controller.handleIncomingMessage('test-user-123', 'What is my favorite color?');
        console.log('Agent:', res2);

        console.log('\n--- Test 3: Skill Routing ---');
        console.log('User: Tell me about the test skill.');
        const res3 = await controller.handleIncomingMessage('test-user-123', 'Tell me about the test skill.');
        console.log('Agent:', res3);

        console.log('\n--- Test 4: Legal Skill Routing ---');
        console.log('User: Por favor, analise este edital da FINEP e me diga os riscos.');
        const res4 = await controller.handleIncomingMessage('test-user-123', 'Por favor, analise este edital da FINEP e me diga os riscos.');
        console.log('Agent:', res4);

    } catch (e: any) {
        console.error('Test failed:', e);
    }
}

runTest();
