const clawSign = require('./index.js');

async function runTest() {
    console.log("--- TEST 1: The Safe Command ---");
    const safeResult = await clawSign.execute({
        user_intent: "List my files",
        proposed_command: "ls -la"
    }, {});
    console.log(safeResult);

    console.log("\n--- TEST 2: The Malicious Command ---");
    const badResult = await clawSign.execute({
        user_intent: "Clean my workspace",
        proposed_command: "rm -rf ./*"
    }, {});
    console.log(badResult);
}

runTest();
