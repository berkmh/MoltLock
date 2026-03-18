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

## 📦 Installation & Setup

### 1. Quick Start
\`\`\`bash
git clone https://github.com/berkmh/MoltLock.git
cd MoltLock
npm install
ollama pull gemma3:270m
\`\`\`

### 2. Self-Preservation (Optional but Recommended)
To make MoltLock "Immortal" on your Linux system, lock the core files:
\`\`\`bash
sudo chattr +i index.js forbidden_zones.js .env
\`\`\`

---

## 🛡️ License
Distributed under the MIT License. **Secure your agents. Protect your infrastructure.**
