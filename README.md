# 🛡️ MoltLock v0.3.1: The Immortal Update
### Hybrid Zero-Trust Gatekeeper for AI Agents

**MoltLock** is a high-velocity, air-gapped security layer that combines **Static Moat Defense** with **Local Semantic Auditing**. By pinning a **Gemma 3 270M** model in RAM and enforcing **Linux Immutability**, MoltLock ensures that autonomous agents cannot drift from their mission—or kill their own guard.

---

## 🚀 2026 Performance & Security
| Metric | Specification |
| :--- | :--- |
| **Audit Latency** | **1.45s** (Semantic) | **<1ms** (Moat) |
| **Local Brain** | **Gemma 3 270M** (Resident in RAM) |
| **Defense Depth** | **Triple-Lock:** Moat -> Judge -> Human |
| **Self-Preservation** | **Active** (Anti-Tamper & `chattr +i` Enforcement) |

---

## 🛠️ The Triple-Lock Stack

### 1. 🏰 The Moat (Static Layer)
Instant (<1ms) regex filtering for high-risk infrastructure. Automatically blocks access to `.ssh`, `.env`, `/shadow/`, and cloud credentials before the AI even wakes up.

### 2. 🧠 The Judge (Semantic Layer)
A local, air-gapped **Gemma 3** auditor analyzes the **User Intent** vs. the **Proposed Command**. It detects "Sneaky Intent"—preventing agents from using obfuscated code to bypass static rules.

### 3. 📱 The Veto (Human Layer)
If a command is flagged as `DANGER`, MoltLock freezes execution and pings your authorized mobile device via Telegram. **No physical signature = No execution.**

---

## 🎮 Remote Command Center
MoltLock provides a real-time "Heartbeat" and remote control via your Telegram Bot.

| Command | Action |
| :--- | :--- |
| `/status` | **Heartbeat Check:** Returns Uptime, RAM usage, and AI Judge status. |
| `APPROVE` | **Manual Override:** Signs and executes a flagged command. |
| `DENY` | **Hard Veto:** Blocks execution and logs the tamper attempt. |

---

## 📦 Installation & Setup

### 1. Quick Start
```bash
# Clone & Install
git clone https://github.com/berkmh/MoltLock.git
cd MoltLock
npm install

# Pull the Resident Brain
ollama pull gemma3:270m

# Start the Gatekeeper
node index.js
