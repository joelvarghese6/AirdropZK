"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { insertTokensSchema } from "@/db/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react";
import { createAndUploadJsonFile } from "@/solana/create-json";
import { createTokenWithUmi } from "@/solana/create-token";
import { config } from "dotenv";

config({ path: ".env.local" });

const formSchema = insertTokensSchema.pick({
    name: true,
    symbol: true,
    supply: true,
})

type FormValues = z.input<typeof formSchema>;

type Props = {
    onSubmit: (values: FormValues) => void;
    disabled?: boolean;
    userData: any;
}

interface JsonObject {
    name: string;
    symbol: number;
    description: string;
    image: string;
}

export const TokenForm = ({ onSubmit, disabled, userData }: Props) => {

    const [file, setFile] = useState<File>();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const handleSubmit = async (values: any) => {
        try {
            const imageUrl = await uploadFile();

            const vertObject = {
                name: String(values.name),
                symbol: String(values.symbol),
                description: "created with AirdropX",
                image: String(imageUrl)
            }

            console.log(vertObject)
            const configUrl = await createAndUploadJsonFile(vertObject);
            console.log(configUrl)

            await createTokenWithUmi(configUrl, values, userData)
            onSubmit(values);
        } catch (error) {
            alert("error")
        }
        
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target?.files?.[0]);
    };

    const uploadFile = async () => {
        if (!!file) {
            const fileData = new FormData();
            fileData.append("file", file);

            const responseData = await axios({
                method: "POST",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: fileData,
                headers: {
                    pinata_api_key: process.env.PINATA_API_KEY!,
                    pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
                    "Content-Type": "multipart/form-data"
                }
            })

            console.log(responseData.data.IpfsHash);
            const url = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
            return url
        }

    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="Token Name"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    name="symbol"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Token Symbol
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="eg: BOL, BONK, SOL, ..."
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    name="supply"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Token Supply
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    type="number"
                                    placeholder="eg: 100, 2000"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Input id="picture" type="file" accept="image/*" onChange={handleChange} />
                <Button className="w-full mt-8" disabled={disabled}>Create Token</Button>
            </form>
            {/* <Button onClick={uploadFile}>Upload Image</Button> */}
        </Form>
    )

}