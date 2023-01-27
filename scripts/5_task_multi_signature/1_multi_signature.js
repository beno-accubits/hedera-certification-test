const {
    Client,
    PrivateKey,
    AccountAllowanceApproveTransaction,
    TransferTransaction,
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

const approveHbarAllowance = async (ownerId, spendorId, amount, ownerPrivateKey) => {
    const hbarAllowanceTx = new AccountAllowanceApproveTransaction()
        .approveHbarAllowance(ownerId, spendorId, amount)
        .freezeWith(client)

    //Sign the transaction with the account 1 key
    const signTx = await hbarAllowanceTx.sign(ownerPrivateKey);

    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The Approve Hbar Allowance transaction consensus status is " + transactionStatus.toString());
}

const approvedHbarTransfer = async (ownerId, receiverId, receiverPrivateKey, amount) => {
    const approvedHbarTransferTx = new TransferTransaction()
        .addHbarTransfer(ownerId, Hbar.fromTinybars(-amount))
        .addHbarTransfer(receiverId, Hbar.fromTinybars(amount))
        .freezeWith(client)

    //Sign the transaction with the account 1 key
    const signTx = await approvedHbarTransferTx.sign(receiverPrivateKey);

    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The Approved Hbar Transfer transaction consensus status is " + transactionStatus.toString());
}

const main = async () => {

    console.log("Approved HBar Transfer")
    await approveHbarAllowance(test1AccountId, test2AccountId, 20, test1PrivateKey)

    console.log("Tranfer Hbar")
    await approvedHbarTransfer(test1AccountId, test2AccountId, test2PrivateKey, 20)

    try {
        console.log("Tranfer Hbar again")

        await approvedHbarTransfer(test1AccountId, test2AccountId, test2PrivateKey, 20)

    } catch (error) {
        console.log("errored out due to multiple transfer attempt")
        console.log(error)
    }

    process.exit();
}

main();

// ============================= OUTPUT ====================================

// Approved HBar Transfer
// Tranfer Hbar
// The Approved Hbar Transfer transaction consensus status is SUCCESS
// Tranfer Hbar again
// errored out due to multiple transfer attempt