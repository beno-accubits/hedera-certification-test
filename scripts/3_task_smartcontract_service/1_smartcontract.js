const {
    Client,
    PrivateKey,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction
} = require("@hashgraph/sdk");
require('dotenv').config();

const { hethers } = require('@hashgraph/hethers');
const abicoder = new hethers.utils.AbiCoder();

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

const main = async () => {
    let esealCompiled = require("./CertificationC1.json");
    const bytecode = esealCompiled.bytecode;

    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction()
        //Set the bytecode of the contract
        .setContents(bytecode);

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    console.log("The smart contract byte code file ID is " + bytecodeFileId)

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters());

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const contractId = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + contractId);

    // Execute function 1
    const contractExecTx1 = new ContractExecuteTransaction()
        //Set the ID of the contract to query
        .setContractId(contractId)
        //Set the gas to execute the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction("function1", new ContractFunctionParameters().addUint16(6).addUint16(7))

    //Submit the transaction to a Hedera network
    const contractExecTx1Submit = await contractExecTx1.execute(client);

    const record1 = await contractExecTx1Submit.getRecord(client);

    const encodedResult1 =
        '0x' + record1.contractFunctionResult.bytes.toString('hex');

    const result1 = abicoder.decode(['uint16'], encodedResult1);

    console.log('Function 1 Output :', result1[0]);

    //Create the transaction to update the contract message
    const contractExecTx2 = new ContractExecuteTransaction()
        //Set the ID of the contract
        .setContractId(contractId)
        //Set the gas for the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction(
            'function2',
            new ContractFunctionParameters().addUint16(result1[0])
        );

    //Submit the transaction to a Hedera network and store the response
    const contractExecTx2Submit = await contractExecTx2.execute(client);

    const record2 = await contractExecTx2Submit.getRecord(client);

    const encodedResult2 =
        '0x' + record2.contractFunctionResult.bytes.toString('hex');

    const result2 = abicoder.decode(['uint16'], encodedResult2);

    console.log('Function 2 Output :', result2[0]);

    process.exit();
}

main();

// ============================= OUTPUT ====================================

// The smart contract ID is 0.0.9939
// Function 1 Output : 42
// Function 2 Output : 44