const fs = require('fs');
const readline = require('readline');

// --- ANSI COLORS ---
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const Reset = "\x1b[0m";
const Bold = "\x1b[1m";

async function generateReport() {
    console.log(`\n${Bold}🛡️  MoltLock Forensic Audit Report${Reset}`);
    console.log(`Generated on: ${new Date().toLocaleString()}\n`);
    console.log(`| Status   | Time (UTC) | Intent Snapshot                | Sig (Trunc) |`);
    console.log(`|----------|------------|--------------------------------|-------------|`);

    const fileStream = fs.createReadStream('../../moltlock_ledger.json');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line);
        
        const time = new Date(entry.timestamp).toLocaleTimeString([], { hour12: false });
        const status = entry.status === "VETOED" 
            ? `${FgRed}🚨 VETOED${Reset}` 
            : `${FgGreen}✅ EXEC  ${Reset}`;
        
        const intent = entry.user_intent.length > 30 
            ? entry.user_intent.substring(0, 27) + "..." 
            : entry.user_intent.padEnd(30);
            
        const sig = entry.signature.substring(0, 8);

        console.log(`| ${status} | ${time}   | ${intent} | ${sig}    |`);
    }
    console.log(`\n${FgYellow}End of MoltLock Ledger.${Reset}\n`);
}

generateReport();
