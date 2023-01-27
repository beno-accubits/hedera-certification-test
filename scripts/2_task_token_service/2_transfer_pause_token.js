const {
    Client,
    AccountBalanceQuery,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
    PrivateKey,
} = require("@hashgraph/sdk");
require('dotenv').config();

const test1AccountId = process.env.TEST_1_ACCOUNT_ID;
const test1PrivateKey = PrivateKey.fromString(process.env.TEST_1_PRIVATE_KEY);

const test2AccountId = process.env.TEST_2_ACCOUNT_ID;
const test2PrivateKey = PrivateKey.fromString(process.env.TEST_2_PRIVATE_KEY);

const test3AccountId = process.env.TEST_3_ACCOUNT_ID;
const test3PrivateKey = PrivateKey.fromString(process.env.TEST_3_PRIVATE_KEY);

const test4AccountId = process.env.TEST_4_ACCOUNT_ID;
const test4PrivateKey = PrivateKey.fromString(process.env.TEST_4_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (test1AccountId == null || test1PrivateKey == null ||
    test2AccountId == null || test2PrivateKey == null ||
    test3AccountId == null || test3PrivateKey == null ||
    test4AccountId == null || test4PrivateKey == null) {
    throw new Error("Environment variables for 4 test accounts must be present");
}

// Setup client
const client = Client.forTestnet();
client.setOperator(test1AccountId, test1PrivateKey);

const associateToken = async (tokenId, accountId, privateKey) => {
    // Associate Account with token id
    let associateAccountTx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(privateKey)

    //SUBMIT THE TRANSACTION
    let associateAccountTxSubmit = await associateAccountTx.execute(client);

    //GET THE RECEIPT OF THE TRANSACTION
    let associateAccountRx = await associateAccountTxSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with the Account ${accountId} : ${associateAccountRx.status} \n`);

    // Check the balance of the account
    let balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
    console.log(`- Account balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} Tokens ID ${tokenId}`);
}

const transferToken = async (tokenId, fromAccountId, toAccountId, amount, fromAccountPrivateKey) => {
    // Transfer the Token 
    let tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amount)
        .addTokenTransfer(tokenId, toAccountId, amount)
        .freezeWith(client)
        .sign(fromAccountPrivateKey);

    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token Transfer from ${fromAccountId} to ${toAccountId} of amount ${amount} : ${tokenTransferRx.status} \n`);

    // Check the balance of the account
    let balanceCheckTx = await new AccountBalanceQuery().setAccountId(fromAccountId).execute(client);
    console.log(`- From account balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} Tokens ID ${tokenId}`);

    balanceCheckTx = await new AccountBalanceQuery().setAccountId(toAccountId).execute(client);
    console.log(`- To account balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} Tokens ID ${tokenId}`);
}

const pauseToken = async (tokenId, pausePrivateKey) => {
    // Pause the Token 
    let tokenPauseTx = await new TokenPauseTransaction()
        .setTokenId(tokenId)
        .freezeWith(client)
        .sign(pausePrivateKey);

    let tokenPauseSubmit = await tokenPauseTx.execute(client);
    let tokenPauseRx = await tokenPauseSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token Pause of ${tokenId} : ${tokenPauseRx.status} \n`);
}

const unPauseToken = async (tokenId, pausePrivateKey) => {
    // unPause the Token 
    let tokenUnPauseTx = await new TokenUnpauseTransaction()
        .setTokenId(tokenId)
        .freezeWith(client)
        .sign(pausePrivateKey);

    let tokenUnPauseSubmit = await tokenUnPauseTx.execute(client);
    let tokenUnPauseRx = await tokenUnPauseSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token Pause of ${tokenId} : ${tokenUnPauseRx.status} \n`);
}

async function transferAndPauseToken() {

    const tokenId = "0.0.9130";

    // Associate Account 3 and Account 4 with token id
    console.log("=========== Associate Token ===========")
    console.log("Associate Account 3 with the Token")
    await associateToken(tokenId, test3AccountId, test3PrivateKey)
    console.log("Associate Account 4 with the Token")
    await associateToken(tokenId, test4AccountId, test4PrivateKey)

    // Transfer 25.25 tokens to Account 3 and Account 4
    console.log("=========== Transfer Token ===========")
    console.log("Account 1 -> Account 3 (25.25 Tokens)")
    await transferToken(tokenId, test1AccountId, test3AccountId, 2525, test1PrivateKey)
    console.log("Account 1 -> Account 4 (25.25 Tokens)")
    await transferToken(tokenId, test1AccountId, test4AccountId, 2525, test1PrivateKey)

    // Pause token
    console.log("=========== Pause Token ===========")
    await pauseToken(tokenId, test1PrivateKey)

    console.log("=========== Transfer Token ===========")
    console.log("Account 1 -> Account 3 (1.35 Tokens)")

    try {
        // Transfer 1.35 tokens to Account 3
        await transferToken(tokenId, test1AccountId, test3AccountId, 135, test1PrivateKey)
    } catch (error) {
        console.log("Transfer Failed due to token being paused")
        console.log(error)
    }

    // UnPause Token
    console.log("=========== UnPause Token ===========")
    await unPauseToken(tokenId, test1PrivateKey)

    // Transfer 1.35 tokens to Account 3
    console.log("=========== Transfer Token ===========")
    console.log("Account 1 -> Account 3 (1.35 Tokens)")
    await transferToken(tokenId, test1AccountId, test3AccountId, 135, test1PrivateKey)

    process.exit();
}

transferAndPauseToken();


// ============================= OUTPUT ====================================

// =========== Associate Token ===========
// Associate Account 3 with the Token
// - Token association with the Account 0.0.7976 : SUCCESS 

// - Account balance: 0 Tokens ID 0.0.9130
// Associate Account 4 with the Token
// - Token association with the Account 0.0.7977 : SUCCESS 

// - Account balance: 0 Tokens ID 0.0.9130
// =========== Transfer Token ===========
// Account 1 -> Account 3 (25.25 Tokens)
// - Token Transfer from 0.0.7974 to 0.0.7976 of amount 2525 : SUCCESS 

// - From account balance: 32525 Tokens ID 0.0.9130
// - To account balance: 2525 Tokens ID 0.0.9130
// Account 1 -> Account 4 (25.25 Tokens)
// - Token Transfer from 0.0.7974 to 0.0.7977 of amount 2525 : SUCCESS 

// - From account balance: 30000 Tokens ID 0.0.9130
// - To account balance: 2525 Tokens ID 0.0.9130
// =========== Pause Token ===========
// - Token Pause of 0.0.9130 : SUCCESS 

// =========== Transfer Token ===========
// Account 1 -> Account 3 (1.35 Tokens)
// Transfer Failed due to token being paused
// ReceiptStatusError: receipt for transaction 0.0.7974@1674815254.274667220 contained error status TOKEN_IS_PAUSED
//     at new ReceiptStatusError (/home/beno/Desktop/Projects/hedera/hedera-certification-test/node_modules/@hashgraph/sdk/lib/ReceiptStatusError.cjs:45:5)
//     at TransactionReceiptQuery._mapStatusError (/home/beno/Desktop/Projects/hedera/hedera-certification-test/node_modules/@hashgraph/sdk/lib/transaction/TransactionReceiptQuery.cjs:326:12)
//     at TransactionReceiptQuery.execute (/home/beno/Desktop/Projects/hedera/hedera-certification-test/node_modules/@hashgraph/sdk/lib/Executable.cjs:698:22)
//     at processTicksAndRejections (node:internal/process/task_queues:96:5)
//     at async TransactionResponse.getReceipt (/home/beno/Desktop/Projects/hedera/hedera-certification-test/node_modules/@hashgraph/sdk/lib/transaction/TransactionResponse.cjs:100:21)
//     at async transferToken (/home/beno/Desktop/Projects/hedera/hedera-certification-test/scripts/2_task_token_service/2_transfer_pause_token.js:67:27)
//     at async transferAndPauseToken (/home/beno/Desktop/Projects/hedera/hedera-certification-test/scripts/2_task_token_service/2_transfer_pause_token.js:135:9) {
//   status: Status { _code: 265 },
//   transactionId: TransactionId {
//     accountId: AccountId {
//       shard: [Long],
//       realm: [Long],
//       num: [Long],
//       aliasKey: null,
//       aliasEvmAddress: null,
//       _checksum: null
//     },
//     validStart: Timestamp { seconds: [Long], nanos: [Long] },
//     scheduled: false,
//     nonce: null
//   },
//   transactionReceipt: TransactionReceipt {
//     status: Status { _code: 265 },
//     accountId: null,
//     fileId: null,
//     contractId: null,
//     topicId: null,
//     tokenId: null,
//     scheduleId: null,
//     exchangeRate: ExchangeRate {
//       hbars: 30000,
//       cents: 203237,
//       expirationTime: 2023-01-27T11:00:00.000Z,
//       exchangeRateInCents: 6.774566666666667
//     },
//     topicSequenceNumber: Long { low: 0, high: 0, unsigned: false },
//     topicRunningHash: Uint8Array(0) [],
//     totalSupply: Long { low: 0, high: 0, unsigned: false },
//     scheduledTransactionId: null,
//     serials: [],
//     duplicates: [],
//     children: []
//   }
// }
// =========== UnPause Token ===========
// - Token Pause of 0.0.9130 : SUCCESS 

// =========== Transfer Token ===========
// Account 1 -> Account 3 (1.35 Tokens)
// - Token Transfer from 0.0.7974 to 0.0.7976 of amount 135 : SUCCESS 

// - From account balance: 29865 Tokens ID 0.0.9130
// - To account balance: 2660 Tokens ID 0.0.9130