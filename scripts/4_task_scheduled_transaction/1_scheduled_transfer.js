const {
    Client,
    TransferTransaction,
    PrivateKey,
    ScheduleCreateTransaction,
    Hbar
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

const createScheduledTransaction = async () => {

    //Create transfer transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(test1AccountId, new Hbar(-10))
        .addHbarTransfer(test2AccountId, new Hbar(10));

    //Schedule the transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled Transfer TX!")
        .setAdminKey(test1PrivateKey)
        .execute(client);

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    return scheduledTxId;
}

const submitSignature = async (scheduleId) => {
    //Create the transaction
    const transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(test1PrivateKey);

    //Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " + transactionStatus);

}

const scheduledTask = async () => {
    let scheduleId = await createScheduledTransaction();
    await submitSignature(scheduleId)
    process.exit();

}

scheduledTask();

// ============================= OUTPUT ====================================
