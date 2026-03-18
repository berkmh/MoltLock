# Changelog

All notable changes to MoltLock will be documented in this file.

## [v0.4.0] - The Sentry Update (Current)

### 🚀 Added
- **Web3 Sentry Engine (`web3_sentry.js`)**: Introduced a dedicated gatekeeper for On-Chain AI Agents (Solana/EVM).
- **Financial Semantic Judge**: Re-tuned the local Gemma 3 model to specifically detect financial prompt injections and obfuscated wallet drain attempts.
- **TVL Static Moat**: Added hardcoded transaction limits (`TREASURY_LIMIT`) to instantly block massive unauthorized token transfers before they reach the LLM.
- **Web3 Simulation Suite (`test_web3.js`)**: Added a test environment to simulate and block "Delegated Compromise" attacks on AI trading bots.

### 🛠️ Fixed
- Resolved Markdown formatting and clipboard hijacking issues in the `README.md` Quick Start guide.

---

## [v0.3.0] - The Immortal Update
### 🚀 Added
- `chattr +i` integration: MoltLock now physically prevents the AI agent from deleting or modifying the security gatekeeper.
- Reduced LLM latency to 1.45s by pinning `gemma3:270m` in RAM and stripping system prompts.

## [v0.2.0] - The Judge Update
### 🚀 Added
- Integrated local Ollama API to semantically analyze bash commands.
- Implemented Human-in-the-Loop (HITL) via Telegram bot API for asynchronous vetoing.

## [v0.1.0] - Initial Release
### 🚀 Added
- Basic `index.js` interceptor script with a regex-based static moat for `.ssh` and `.env` protection.
