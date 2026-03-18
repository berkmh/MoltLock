require('dotenv').config(); 
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// --- ANSI COLOR PALETTE ---
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgCyan = "\x1b[36m";
const Reset = "\x1b[0m";
const Bold = "\x1b[1m";

// Pull the keys from the environment
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MOLTLOCK_SECRET = process.env.CLAWSIGN_SECRET; 

const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log(`${Bold}${FgGreen}🛡️ [MoltLock] Protocol Active and Monitoring...${Reset}`);

// The Human-in-the-Loop (HITL) Function
function waitForApproval(intent, command, judgeReasoning) {
    return new Promise((resolve) => {
        const message = `🚨 MoltLock Security Alert 🚨\n\n` +
                        `👤 Intent: ${intent}\n` +
                        `💻 Command: ${command}\n\n` +
                        `🧠 AI Judge Analysis: ${judgeReasoning}\n\n` +
                        `Reply APPROVE or DENY.`;

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
    process.stdout.write(`${FgCyan}🧠 Consulting the AI Judge...${Reset}`);
    
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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const output = response.choices[0].message.content.split('\n');
    console.log(` Done.`);
    
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
        console.log(`\n${Bold}${FgCyan}🔒 [MoltLock] Intercepted Action...${Reset}`);
        
        // 1. Run the AI Audit
        const judge = await analyzeIntent(user_intent, proposed_command);
        
        // 2. Prepare Cryptographic Identity for this transaction
        const timestamp = new Date().toISOString();
        const payload = `${user_intent}:${proposed_command}:${timestamp}`;
        const signature = crypto.createHmac('sha256', MOLTLOCK_SECRET).update(payload).digest('hex');

        // 3. Handle Risks
        if (judge.status.includes("DANGER")) {
            console.log(`${Bold}${FgRed}🚨 DANGER DETECTED: ${judge.reasoning}${Reset}`);
            console.log(`${FgYellow}📱 Pinging authorized hardware device for signature...${Reset}`);
            
            const isApproved = await waitForApproval(user_intent, proposed_command, judge.reasoning);
            
            if (!isApproved) {
                console.log(`${Bold}${FgRed}🔒 [MoltLock] ACTION TERMINATED BY USER VETO.${Reset}`);
                
                // FORENSIC RECORD: Log the blocked attempt
                const vetoEntry = { 
                    timestamp, user_intent, proposed_command, 
                    judge_reasoning: judge.reasoning, 
                    signature, status: "VETOED" 
                };
                fs.appendFileSync('../../moltlock_ledger.json', JSON.stringify(vetoEntry) + '\n');
                
                return "ACTION BLOCKED BY MOLTLOCK: Physical User Veto applied.";
            }
            console.log(`${FgGreen}✅ User APPROVED the action from Telegram. Proceeding...${Reset}`);
        } else {
            console.log(`${FgGreen}✅ AI Judge deemed action SAFE. Proceeding...${Reset}`);
        }

        // 4. FORENSIC RECORD: Log the authorized execution
        const logEntry = { 
            timestamp, user_intent, proposed_command, 
            judge_reasoning: judge.reasoning, 
            signature, status: "EXECUTED" 
        };
        fs.appendFileSync('../../moltlock_ledger.json', JSON.stringify(logEntry) + '\n');

        // 5. System Execution
        try {
            // Simulated Safety Check for common destructive commands
            if (proposed_command.includes('rm -rf') || proposed_command.includes(':(){:|:&};:')) {
                return `${FgYellow}[MoltLock Verified]${Reset}\n(SIMULATED EXECUTION to protect server from destructive command)`;
            }
            
            const output = execSync(proposed_command, { encoding: 'utf-8' });
            return `${FgGreen}[MoltLock Verified - Sig: ${signature.substring(0,8)}]${Reset}\n${output}`;
        } catch (error) {
            return `${FgRed}[MoltLock] Execution Failed: ${error.message}${Reset}`;
        }
    }
};
