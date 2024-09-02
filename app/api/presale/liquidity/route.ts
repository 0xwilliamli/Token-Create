import { NextResponse } from 'next/server'
import { getServiceRoleServerSupabaseClient } from '@/utils/supabase/newclient';
import { BigNumber } from "bignumber.js";
import originABI from "../../../../contract/abi/origin.json"
import uniswapABI from "../../../../contract/abi/swap.json"
import Web3 from "web3";
import { add } from 'date-fns';

export async function POST(req: Request) {

    const srSupabase = getServiceRoleServerSupabaseClient()
    const json = await req.json()
    const { address, privatekey, ethAmount, tokenAmount } = json

    const web3 = new Web3(process.env.NEXT_PUBLIC_INFURA_GOERLI_URL)

    const mainAccount = web3.eth.accounts.privateKeyToAccount(privatekey);
    web3.eth.accounts.wallet.add(mainAccount);
    web3.eth.defaultAccount = mainAccount.address;

    const tokenamount = new BigNumber(tokenAmount).shiftedBy(18).toString();
    const ethamount = new BigNumber(ethAmount).shiftedBy(18).toString();

    const tokenContract = new web3.eth.Contract(originABI, address);
    const uniswapContract = new web3.eth.Contract(uniswapABI, `${process.env.NEXT_PUBLIC_DATATOKEN_ADDRESS}`);

    const blockNumber = await web3.eth.getBlockNumber();
    const blockTimestamp = (await web3.eth.getBlock(blockNumber)).timestamp;

    const allow_tx = tokenContract.methods.approve(`${process.env.NEXT_PUBLIC_DATATOKEN_ADDRESS}`, tokenAmount);
    const uniswap_tx = uniswapContract.methods.addLiquidityETH(address, tokenamount, 0, 0, web3.eth.defaultAccount, BigNumber(blockTimestamp.toString()).plus(100).toString());
    
    const allow_gas_standard = await allow_tx.estimateGas({ from: web3.eth.defaultAccount })

    const gasPrice_standard = await web3.eth.getGasPrice();

    const allowResult = await allow_tx.send({
        from: web3.eth.defaultAccount,
        gas: BigNumber(allow_gas_standard.toString()).multipliedBy(2).toString(),
        gasPrice: web3.utils.toWei(`${BigNumber(gasPrice_standard.toString()).multipliedBy(1.2).toString()}`, 'gwei')
    });

    // console.log(allowResult)

    // const uniswap_gas_standard = await uniswap_tx.estimateGas({ value: ethamount, from: web3.eth.defaultAccount })
    // const uniswapResult = await uniswap_tx.send({
    //     value: ethamount, 
    //     from: web3.eth.defaultAccount, 
    //     gas: BigNumber(uniswap_gas_standard.toString()).multipliedBy(2).toString(),
    //     gasPrice: web3.utils.toWei(`${BigNumber(gasPrice_standard.toString()).multipliedBy(1.2).toString()}`, 'gwei')
    // })

    const { data, error } = await srSupabase
            .from('tokens')
            .update([
                {
                    liquidity_eth: ethamount,
                    liquidity_token: tokenamount,
                    tx_allow : allowResult.contractAddress,
                    // tx_uniswap: uniswapResult.contractAddress
                }
            ])
            .eq('address', address)
    if(!error){
        return NextResponse.json(
            { error: "'Successful'" },
            { status: 200 },
        )
    }
    return NextResponse.json(
        { error: "'Internal Server Error'" },
        { status: 500 },
    )
}