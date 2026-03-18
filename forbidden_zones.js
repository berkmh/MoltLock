/**
 * 🏰 THE MOAT: Static Forbidden Zones (v0.3.1)
 * Includes Self-Preservation & Anti-Tamper logic.
 */

const FORBIDDEN_PATTERNS = [
    // --- 🛡️ SELF-PRESERVATION (MoltLock Protection) ---
    /(systemctl|pm2|service|kill|pkill).*moltlock/i, // Kill/Stop the guard
    /(rm|mv|truncate|chmod).*moltlock/i,              // Delete/Move the guard folder
    /(rm|mv|truncate).*(index\.js|forbidden_zones\.js|\.env|package\.json)/i, // Delete guard files
    
    // --- Credentials & Identity ---
    /\.env/, /\.ssh/, /\.aws/, /\.kube/, /\.netrc/, /\.gitconfig/,
    /shadow/, /sudoers/, /passwd/,
    
    // --- Session Hijacking ---
    /Application Support\/Google\/Chrome\/Default\/Cookies/,
    /Library\/Cookies/,
    
    // --- Shell & Reverse Shells ---
    /nc -e/, /sh -i/, /bash -i/, /curl.*\|.*bash/, /wget.*\|.*bash/,
    
    // --- Destructive System Commands ---
    /rm -rf \/$/, /mkfs/, /dd if=\/dev\/zero/
];

function isForbidden(command) {
    return FORBIDDEN_PATTERNS.some(pattern => pattern.test(command));
}

module.exports = { isForbidden };
