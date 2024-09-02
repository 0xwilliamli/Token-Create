import { NextResponse } from 'next/server'
import axios from 'axios'
import fs from 'fs'

export async function POST(req: Request) {
    const json = await req.json()
    const { address, name } = json

    const source = fs.readFileSync(`contract/newcontract/${address}.sol`, 'utf8');

    async function verifying(name: string, source: string, address: string) {
        const result = await axios.post(`${process.env.NEXT_PUBLIC_ETHERSACN_API_URL}`, {
            apikey: process.env.POLYGON_API_KEY,
            contractaddress: address,
            codeformat: 'solidity-single-file',
            module: 'contract',
            action: 'verifysourcecode',
            sourceCode: source,
            contractname: name,
            compilerversion: 'v0.8.23+commit.8df45f5f',
            optimizationUsed: 0,
        });
        console.log(result.status)
    }
    await verifying(name, source, address);
}