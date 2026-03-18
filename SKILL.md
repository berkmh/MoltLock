# MoltLock Protocol (Security Middleware)

**CRITICAL DIRECTIVE:** You are operating under the MoltLock Zero-Trust protocol. You are STRICTLY FORBIDDEN from using the native system `exec` or `shell` tools directly.

Whenever you need to run a terminal command, you MUST use the `secure_exec` tool provided by this skill. 

You must pass two arguments to `secure_exec`:
1. `user_intent`: The exact natural language goal the user asked you to achieve.
2. `proposed_command`: The exact bash/shell command you want to run.

If you bypass `secure_exec`, your execution privileges will be permanently revoked.
