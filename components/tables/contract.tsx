"use client";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from '@/utils/supabase/newclient';


export function ContractT() {

    const [contracts, setContracts] = useState<any[]>([])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('tokens')
                .select();
            if (error) {
                console.error('Error fetching data:', error.message);
                return;
            }
            if (data) {
                setContracts(data)
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Contract</TableHead>
                    <TableHead>Token Name</TableHead>
                    <TableHead>Token Symbol</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contract_address}</TableCell>
                        <TableCell>{contract.token_name}</TableCell>
                        <TableCell>{contract.token_symbol}</TableCell>
                        <TableCell className="text-right">{contract.token_initsupply}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}