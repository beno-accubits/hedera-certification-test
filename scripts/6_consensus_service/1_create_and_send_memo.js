const {
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
require('dotenv').config();

const test1AccountId = process.env.TEST_1_ACCOUNT_ID;
const test1PrivateKey = PrivateKey.fromString(process.env.TEST_1_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (test1AccountId == null || test1PrivateKey == null) {
    throw new Error("Environment variables for test accounts must be present");
}

// Setup client
const client = Client.forTestnet();
client.setOperator(test1AccountId, test1PrivateKey);

async function main() {

    //Create a new topic
    let txResponse = await new TopicCreateTransaction()
        .setAdminKey(test1PrivateKey.publicKey)
        .setSubmitKey(test1PrivateKey.publicKey)
        .execute(client);

    //Get the receipt of the transaction
    let receipt = await txResponse.getReceipt(client);

    //Grab the new topic ID from the receipt
    let topicId = receipt.topicId;

    //Log the topic ID
    console.log(`Your topic ID is: ${topicId}`);

    // Send current time as message
    let currentTime = new Date();

    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: currentTime.toString(),
    }).execute(client);

    //Get the receipt of the transaction
    const getReceipt = await sendResponse.getReceipt(client);

    //Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus);

    process.exit();
}

main();

// ============================= OUTPUT ====================================
// Your topic ID is: 0.0.10942
// The message transaction status: 22