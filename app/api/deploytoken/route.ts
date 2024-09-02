import { NextResponse } from 'next/server'
import { getServiceRoleServerSupabaseClient } from '@/utils/supabase/newclient';
import { BigNumber } from "bignumber.js";
import Web3 from "web3";
import * as solc from 'solc';
import * as fs from 'fs';

export async function POST(req: Request) {


    const srSupabase = getServiceRoleServerSupabaseClient()
    const json = await req.json();
    const { formvalue } = json;
    const { tokenName, tokenSymbol, tokenInitsupply, tokenDecimals, privateKey } = formvalue


    const web3 = new Web3(process.env.NEXT_PUBLIC_INFURA_GOERLI_URL)

    const file = fs.readFileSync("contract/modal.sol", 'utf8');
    const content  = file
        .replace("T__T", tokenSymbol)
        .replace("T__V", BigNumber(tokenInitsupply).multipliedBy(tokenDecimals).toString())
        .replace("T__N", tokenName)
        .replace("T__S", tokenSymbol)
        .replace("T__D", tokenDecimals)
        .replace("_router", `${process.env.NEXT_PUBLIC_DATATOKEN_ADDRESS}`)
        .replace("_fee", "0xc870E2d3Eb367d9E85552B8b9A94FB3Ca08763D6")

    var inputVal = {
        language: "Solidity",
        sources: {
            "modal.sol": {
                content: content 
            }
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode.object"],
                },
            },
        },
    }

    var output = JSON.parse(solc.compile(JSON.stringify(inputVal)));

    console.log(output)
    const ABI = output.contracts["modal.sol"][tokenSymbol].abi;
    const bytecode = output.contracts["modal.sol"][tokenSymbol].evm.bytecode.object;
    const contract = new web3.eth.Contract(ABI);
    const txHash = contract.deploy({ data: "0x" + bytecode, arguments: [] });

    const mainAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(mainAccount);
    web3.eth.defaultAccount = mainAccount.address;

    const gas_standard = await txHash.estimateGas({})
    const gasPrice_standard = await web3.eth.getGasPrice();
    const gas = BigNumber(gas_standard.toString()).multipliedBy(2).toString()
    const gasPrice = web3.utils.toWei(`${BigNumber(gasPrice_standard.toString()).multipliedBy(1.2).toString()}`, 'gwei')
    
    try {
        const deployContract = await contract
            .deploy({ data: bytecode })
            .send({ from: web3.eth.defaultAccount, gas, gasPrice })

        const contractAddress = deployContract.options.address;
        const { data, error } = await srSupabase
            .from('tokens')
            .upsert([
                {
                    contract_address: contractAddress,
                    address: web3.eth.defaultAccount,
                    token_name: tokenName,
                    token_symbol: tokenSymbol,
                    token_decimals: tokenDecimals,
                    token_initsupply: tokenInitsupply,
                    privatekey: privateKey,
                    status: 0
                }
            ])
            .single()
            if(!error){
                fs.writeFile(`contract/newcontract/${contractAddress}.sol`, content, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(`File ${contractAddress}.sol has been saved`);
                    }
                });
                return NextResponse.json(
                    { status: 200 }
                );
            }
            else {
                return NextResponse.json(
                    { error: error },
                    { status: 401 }
                );
            }
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 401 }
        );
    }
}