"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CodeMirror from "@uiw/react-codemirror"
import { Input } from "@/components/ui/input";
import { LightSystemProgram } from "@lightprotocol/stateless.js"
import { getKeypairFromPrivateKey, transferTokens } from "@/solana/lib/utils";
import { useGetUser } from "@/features/users/api/use-get-users";
import { toast } from "sonner";
import { fetchSplTokenAccounts, isValidAddress, compressToken } from "@/solana/lib/utils"
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader2 } from "lucide-react"

interface Token {
    address: string;
    amount: number;
    delegated_amount: number;
    frozen: boolean;
    mint: string;
    owner: string;
}


export const AirdropForm = ({ closeSheet }: any) => {

    // const tokens = [
    //     {
    //         id: 1,
    //         value: "hey"
    //     },
    //     {
    //         id: 2,
    //         value: "bye"
    //     },
    //     {
    //         id: 3,
    //         value: "cry"
    //     },
    // ]

    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState("");
    const [keys, setKeys] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const form = useForm();
    const { data } = useGetUser();

    const loadToken = async () => {

        if (!data) {
            console.log("Private key error");
            return
        }
        const keyPair = getKeypairFromPrivateKey(data[0].key);
        const ownerAddress = keyPair.publicKey;
        const loadedTokens = await fetchSplTokenAccounts(ownerAddress);
        setTokens(loadedTokens)
        console.log(loadedTokens);
    }

    const loadCompressedTokens = () => {

    }

    useEffect(() => {
        loadToken();
    }, [data]);

    const handleSelectToken = (value: string) => {
        setSelectedToken(value);
        console.log(value);
    }

    const handlesubmit = (values: any) => {
        values.preventDefault();
        console.log(values.target.value);
    }

    const handleClick = async () => {
        setIsLoading(true);
        console.log(selectedToken);
        console.log(keys);
        const keysArray = keys.split("\n");

        for (const key of keysArray) {

            const isTrue = isValidAddress(key)
            if (!isTrue || !selectedToken) {
                //setSelectedToken("");
                //setKeys("In valid key");
                alert("Invalid key present");
                setIsLoading(false);
                return
            } else {
                console.log("success");
            }

        }

        if (selectedToken.length === 0 || !data) {
            alert("error");
            setIsLoading(false);
            return
        }

        const [mintString, amountString] = selectedToken.split("+");
        const mint = new PublicKey(mintString);
        const amount = Number(amountString);

        if (Math.trunc(amount / keysArray.length) < 1) {
            alert("Not enough funds");
            setIsLoading(false);
            return
        }
        const wallet = getKeypairFromPrivateKey(data[0].key);
        await compressToken({ mint, amount, wallet });
        const amountToSend = Math.trunc(amount / keysArray.length);
        for (const key of keysArray) {
            const address = new PublicKey(key);
            transferTokens({ to: address, amount: amountToSend, mint, wallet });
        }
        setIsLoading(false);
    }

    const handleCompressToken = () => {

    }

    return (
        <div>
            {!isLoading ? (<Form {...form}>
                <form action="" className="space-y-4 pt-4" onSubmit={handlesubmit}>
                    <FormField
                        name="selectedToken"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center space-x-1">
                                    <span>Which SPL Token do you want to airdrop?</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="flex items-center space-x-2">
                                        <Select
                                            onValueChange={handleSelectToken}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger ref={field.ref}>
                                                <SelectValue placeholder="Select a token" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tokens.map((token) => (
                                                    <SelectItem
                                                        key={token.address}
                                                        value={`${token.mint}+${token.amount}`}
                                                    >
                                                        {token.mint + " - " + token.amount}

                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <FormField
                        name="recipient"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Addresses</FormLabel>
                                <FormControl>
                                    <CodeMirror
                                        value={field.value}
                                        onChange={(value) => setKeys(value)}
                                        placeholder="One address per line"
                                        height="200px"
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />
                </form>
                <Button className="w-full mt-8" onClick={handleClick}>Send Airdrop</Button>
            </Form>) : <Loader2 className='animate-spin text-muted-foreground' />}

        </div>

    )
}