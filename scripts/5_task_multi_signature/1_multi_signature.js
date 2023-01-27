const {
    Client,
    PrivateKey,
} = require("@hashgraph/sdk");
require('dotenv').config();

const test1AccountId = process.env.TEST_1_ACCOUNT_ID;
const test1PrivateKey = PrivateKey.fromString(process.env.TEST_1_PRIVATE_KEY);

const test2AccountId = process.env.TEST_2_ACCOUNT_ID;
const test2PrivateKey = PrivateKey.fromString(process.env.TEST_2_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (test1AccountId == null || test1PrivateKey == null ||
    test2AccountId == null || test2PrivateKey == null
) {
    throw new Error("Environment variables for test accounts must be present");
}

// Setup client
const client = Client.forTestnet();
client.setOperator(test1AccountId, test1PrivateKey);

async function main() {


    process.exit();
}

main();

// ============================= OUTPUT ====================================
