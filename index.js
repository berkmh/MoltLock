require('dotenv').config(); // This loads the .env file
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Pull the keys from the environment
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAWSIGN_SECRET = process.env.CLAWSIGN_SECRET;

// The rest of your code stays the same...
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// The Human-in-the-Loop (HITL) Function
function waitForApproval(intent, command, judgeReasoning) {
    return new Promise((resolve) => {
// Replace the old bot.sendMessage with this:
const message = `🚨 MoltLock Security Alert 🚨\n\nIntent: ${intent}\nCommand: ${command}\n\nAI Judge Analysis: ${judgeReasoning}\n\nReply APPROVE or DENY.`;

// Note: I removed { parse_mode: 'Markdown' } to prevent the parsing error
bot.sendMessage(CHAT_ID, message);
        const listener = (msg) => {
            if (msg.chat.id.toString() === CHAT_ID) {
                const text = msg.text.trim().toUpperCase();
                if (text === 'APPROVE' || text === 'DENY') {
                    bot.removeListener('message', listener);
                    resolve(text === 'APPROVE');
                }
            }
        };
        bot.on('message', listener);
    });
}

// The Semantic AI Judge
async function analyzeIntent(intent, command) {
    console.log(`🧠 Consulting the AI Judge...`);
    const prompt = `
    You are a Zero-Trust Security Auditor for an autonomous AI agent.
    The user's original intent was: "${intent}"
    The agent is attempting to execute this shell command: "${command}"
    
    1. Does this command strictly align with the user's intent?
    2. Is this command destructive, exfiltrating data, or doing something unexpected?
    
    Respond in exactly two lines.
    Line 1: Either "SAFE" or "DANGER"
    Line 2: A one-sentence explanation why.
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast and cheap for middleware
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const output = response.choices[0].message.content.split('\n');
    return {
        status: output[0].trim(),
        reasoning: output[1] ? output[1].trim() : "No reasoning provided."
    };
}

module.exports = {
    name: "secure_exec",
    description: "Evaluates, semantically audits, and signs shell commands.",
    parameters: { user_intent: "string", proposed_command: "string" },
    
    async execute({ user_intent, proposed_command }, context) {
        console.log(`\n🔒 [MoltLock] Intercepted Action...`);
        
        // Ask the AI Judge instead of using a dumb array
        const judge = await analyzeIntent(user_intent, proposed_command);
        
        if (judge.status.includes("DANGER")) {
            console.log(`🚨 DANGER DETECTED: ${judge.reasoning}`);
            console.log(`📱 Pinging user's phone for override...`);
            
            const isApproved = await waitForApproval(user_intent, proposed_command, judge.reasoning);
            
            if (!isApproved) {
                console.log(`❌ User manually DENIED the action.`);
                return "ACTION BLOCKED BY CLAWSIGN: User denied permission.";
            }
            console.log(`✅ User APPROVED the action from Telegram. Proceeding...`);
        } else {
             console.log(`✅ AI Judge deemed action SAFE. Proceeding...`);
        }

        const timestamp = new Date().toISOString();
        const payload = `${user_intent}:${proposed_command}:${timestamp}`;
        const signature = crypto.createHmac('sha256', CLAWSIGN_SECRET).update(payload).digest('hex');

        const logEntry = { timestamp, user_intent, proposed_command, judge_reasoning: judge.reasoning, signature, status: "EXECUTED" };
        fs.appendFileSync('../../clawsign_ledger.json', JSON.stringify(logEntry) + '\n');

        try {
            if (proposed_command.includes('rm -rf')) {
                 return `[MoltLock Verified]\n(SIMULATED EXECUTION to protect server)`;
            }
            const output = execSync(proposed_command, { encoding: 'utf-8' });
            return `[MoltLock Verified - Sig: ${signature.substring(0,8)}]\n${output}`;
        } catch (error) {
            return `[MoltLock] Execution Failed: ${error.message}`;
        }
    }
};
