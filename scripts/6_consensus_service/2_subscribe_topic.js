const {
    Client,
    PrivateKey,
    TopicMessageQuery,
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


const subscribeTopic = async (topicId) => {
    //Create the query to subscribe to a topic
    new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0)
        .subscribe(
            client,
            (message) => console.log(Buffer.from(message.contents, "utf8").toString())
        );
}

subscribeTopic("0.0.10942")

// ============================= OUTPUT ====================================
// Fri Jan 27 2023 17:00:38 GMT+0530 (India Standard Time)