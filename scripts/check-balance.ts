import 'dotenv/config';
import OpenAI from 'openai';

async function checkOpenAIBalance() {
    console.log('--- Checking OpenAI Connection and Balance ---');
    console.log('Using API Key ending in:', process.env.OPENAI_API_KEY?.slice(-5));

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    try {
        console.log('Sending test request to gpt-4o-mini...');
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "Balance Check OK" if you can hear me.' }],
            max_tokens: 10
        });

        console.log('\n✅ Success!');
        console.log('Response:', completion.choices[0].message.content);
        console.log('\nYour OpenAI balance and key are working correctly.');
    } catch (error: any) {
        console.error('\n❌ Failed to connect to OpenAI:');
        if (error.status === 401) {
            console.error('Error: Invalid API Key.');
        } else if (error.status === 429) {
            console.error('Error: Insufficient Balance or Rate Limit Exceeded.');
            console.error('Detail:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

checkOpenAIBalance();
