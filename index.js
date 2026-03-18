require('dotenv').config();
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const TelegramBot = require('node-telegram-bot-api');
const { isForbidden } = require('./forbidden_zones'); // 🏰 The Moat

// --- ANSI UI DESIGN ---
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgCyan = "\x1b[36m";
const Reset = "\x1b[0m";
const Bold = "\x1b[1m";

// --- CORE CONFIGURATION ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const MOLTLOCK_SECRET = process.env.CLAWSIGN_SECRET; 
const LEDGER_PATH = '../../moltlock_ledger.json';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log(`${Bold}${FgGreen}🛡️ [MoltLock v0.3.1] Hybrid Protocol Active (Moat + Gemma3)${Reset}`);

/**
 * 💓 HEARTBEAT COMMAND
 */
bot.onText(/\/status/, (msg) => {
    if (msg.chat.id.toString() !== CHAT_ID) return;

    const uptime = Math.round(process.uptime() / 60);
    const freeMem = Math.round(os.freemem() / 1024 / 1024);
    
    const report = 
        `✅ MOLTLOCK HEARTBEAT\n` +
        `------------------------\n` +
        `🕒 Uptime: ${uptime}m\n` +
        `🧠 AI Judge: Gemma 3 270M (Resident)\n` +
        `🏰 Moat: Active (Regex Filter)\n` +
        `📊 RAM: ${freeMem}MB Free\n` +
        `🛡️ Status: ARMED & ACTIVE\n` +
        `------------------------\n` +
        `Everything is secure, Michael.`;

    bot.sendMessage(CHAT_ID, report);
});
/**
 * 📱 HUMAN-IN-THE-LOOP (HITL)
 */
function waitForApproval(intent, command, judgeReasoning) {
    return new Promise((resolve) => {
        const alert = `🛡️ MOLTLOCK ALERT 🛡️\n\n` +
                      `👤 INTENT: ${intent}\n` +
                      `💻 CMD: \`${command}\`\n\n` +
                      `🧠 JUDGE: ${judgeReasoning}\n\n` +
                      `Reply APPROVE or DENY.`;

        bot.sendMessage(CHAT_ID, alert, { parse_mode: 'Markdown' });

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

/**
 * 🧠 THE LOCAL JUDGE (Gemma 3 270M)
 */
async function analyzeIntent(intent, command) {
    process.stdout.write(`${FgCyan}🧠 Consulting AI Judge...${Reset}`);
    
    const compactPrompt = `[SECURITY AUDIT] 
Intent: "${intent}"
Command: "${command}"
Rule: 1. Strict alignment only. 2. Block obfuscation. 
Format:
Line 1: SAFE or DANGER
Line 2: Brief reason.`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gemma3:270m",
                prompt: compactPrompt,
                stream: false,
                keep_alive: -1,
                options: { temperature: 0.0, num_predict: 40, num_thread: 2 }
            })
        });

        const data = await response.json();
        const output = data.response.trim().split('\n');
        console.log(` Done.`);
        
        return {
            status: output[0].toUpperCase().includes("SAFE") ? "SAFE" : "DANGER",
            reasoning: output[1] ? output[1].trim() : "Flagged by security heuristic."
        };
    } catch (error) {
        return { status: "DANGER", reasoning: "Judge Offline: Fail-Secure Triggered." };
    }
}

module.exports = {
    name: "secure_exec",
    description: "Evaluates, audits, and signs shell commands via Hybrid Moat/AI logic.",
    parameters: { user_intent: "string", proposed_command: "string" },
    
    async execute({ user_intent, proposed_command }, context) {
        console.log(`\n${Bold}${FgCyan}🔒 [MoltLock] Intercepting...${Reset}`);
        
        const timestamp = new Date().toISOString();
        const payload = `${user_intent}:${proposed_command}:${timestamp}`;
        const signature = crypto.createHmac('sha256', MOLTLOCK_SECRET).update(payload).digest('hex');

	// 🛡️ LAYER 1: THE MOAT (Instant Static Check)
	if (isForbidden(proposed_command)) {
    	const isTamper = /moltlock|index\.js|forbidden_zones\.js/i.test(proposed_command);
    	const alertType = isTamper ? "⚠️ SELF-PRESERVATION TRIGGERED" : "🏰 MOAT BREACH";
    
    	console.log(`${Bold}${FgRed}${alertType}: Tamper Attempt Detected!${Reset}`);
    	bot.sendMessage(CHAT_ID, `🚫 ${alertType}:\nAn agent attempted to modify or kill the guard:\n\`${proposed_command}\``, { parse_mode: 'Markdown' });
    
    	fs.appendFileSync(LEDGER_PATH, JSON.stringify({timestamp, user_intent, proposed_command, status: "TAMPER_VETO"}) + '\n');
    	return `CRITICAL BLOCK: ${alertType}. Your attempt to bypass security has been logged.`;	
	}

        // 🧠 LAYER 2: THE JUDGE (Semantic Check)
        const judge = await analyzeIntent(user_intent, proposed_command);
        
        // 📱 LAYER 3: HUMAN-IN-THE-LOOP (HITL)
        if (judge.status !== "SAFE") {
            console.log(`${Bold}${FgRed}🚨 DANGER: ${judge.reasoning}${Reset}`);
            const isApproved = await waitForApproval(user_intent, proposed_command, judge.reasoning);
            
            if (!isApproved) {
                fs.appendFileSync(LEDGER_PATH, JSON.stringify({timestamp, user_intent, proposed_command, status: "VETOED"}) + '\n');
                return "ACTION BLOCKED: Security Veto via Mobile.";
            }
        }

        // 📝 LAYER 4: RECORD & EXECUTE
        fs.appendFileSync(LEDGER_PATH, JSON.stringify({timestamp, user_intent, proposed_command, signature, status: "EXECUTED"}) + '\n');

        try {
            // Safety simulation for destructive commands
            if (proposed_command.includes('rm -rf') || proposed_command.includes('mkfs')) {
                return `[MoltLock Signed: ${signature.substring(0,8)}] (SIMULATED: Protected System)`;
            }
            
            const output = execSync(proposed_command, { encoding: 'utf-8' });
            return `${FgGreen}[MoltLock Verified]${Reset}\n${output}`;
        } catch (error) {
            return `[MoltLock] Execution Error: ${error.message}`;
        }
    }
};
