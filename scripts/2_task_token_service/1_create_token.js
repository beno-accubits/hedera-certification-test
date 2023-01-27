const {
    Client,
    AccountBalanceQuery,
    TokenCreateTransaction,
    PrivateKey,
    TokenType,
    TokenSupplyType,
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
    throw new Error("Environment variables for 4 test accounts must be present");
}

// Setup client
const client = Client.forTestnet();
client.setOperator(test1AccountId, test1PrivateKey);

const createToken = async () => {
    //Create the Token
    let tokenCreate = new TokenCreateTransaction()
        .setTokenName("HED TEST")
        .setTokenSymbol("HTST")
        .setDecimals(2)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(35050)
        .setMaxSupply(50000)
        .setTreasuryAccountId(test1AccountId)
        .setPauseKey(test1PrivateKey.publicKey)
        .setSupplyKey(test2PrivateKey.publicKey)
        .freezeWith(client);

    //Sign the transaction with the treasury key
    let tokenCreateTxSign = await tokenCreate.sign(test1PrivateKey);

    //Submit the transaction to a Hedera network
    let tokenCreateSubmit = await tokenCreateTxSign.execute(client);

    //Get the transaction receipt
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

    //Get the token ID
    let tokenId = tokenCreateRx.tokenId;

    //Log the token ID
    console.log(`- Created Token with Token ID: ${tokenId} \n`);

    const balanceCheckTx = await new AccountBalanceQuery().setAccountId(test1AccountId).execute(client);

    console.log(`- Account 1 balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    process.exit();
}

createToken();


// ============================= OUTPUT ====================================

// - Created Token with Token ID: 0.0.8930 

// - Account 1 balance: 35050 units of token ID 0.0.8930