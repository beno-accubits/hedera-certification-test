const {
    Client,
    AccountBalanceQuery,
    AccountCreateTransaction,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (myAccountId == null ||
    myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Setup client
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const createAccounts = async (count) => {
    for (let i = 0; i < count; i++) {

        // Generate account
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        console.log("Account Number = ", i + 1)
        console.log("Account Public Key = ", newAccountPublicKey.toStringRaw())
        console.log("Account Private Key = ", newAccountPrivateKey.toStringRaw())

        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(100))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        //Log the account ID
        console.log("Account ID is: " + newAccountId);

        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("Account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");
        console.log("=========================================================")
    }

    process.exit();
}

createAccounts(5);



// ============================= OUTPUT ====================================

// Account Number =  1
// Account Public Key =  09f7deecb290ee75eca15a8744f7c001b919dc39d4727334a487fbb9979c7ad5
// Account Private Key =  016781c4885e377b521bd0d17906556ec11425e6c4d44a344e11b87aad93e859
// Account ID is: 0.0.7974
// Account balance is: 10000000000 tinybar.
// =========================================================
// Account Number =  2
// Account Public Key =  8fdd8ff5fd0d73f7451e0126cdecb3d85f8787df90a9bb3416b37098381f49c6
// Account Private Key =  bd77fa4feb85039f12ddcd0e3f442caecfa36eaa62daf821d792bfe03004050a
// Account ID is: 0.0.7975
// Account balance is: 10000000000 tinybar.
// =========================================================
// Account Number =  3
// Account Public Key =  021c2001ccf01f7ad269a6adbe87d7e41e924ea9c0f1d123afd8a92675019e4c
// Account Private Key =  bb0bb85ff96619af946014029873420679e430e069a5a46db4d88d830745be92
// Account ID is: 0.0.7976
// Account balance is: 10000000000 tinybar.
// =========================================================
// Account Number =  4
// Account Public Key =  9d1c183c06a6921ffbab8e88b744c8a8edce4fbff829344b93631e55f377542a
// Account Private Key =  e129cdb8525d62494d71b2c690294ccb89666573bf698968bf16c5b39c9b4835
// Account ID is: 0.0.7977
// Account balance is: 10000000000 tinybar.
// =========================================================
// Account Number =  5
// Account Public Key =  1ac49c7f0ea0400ada559328c685095a2ee7855f467cdb3cb6781b91beb1eab1
// Account Private Key =  8c33ce00ec0bf49c3d345cd99f533c800e20aa520ad684f6e636ebef7d8f7f30
// Account ID is: 0.0.7978
// Account balance is: 10000000000 tinybar.
// =========================================================