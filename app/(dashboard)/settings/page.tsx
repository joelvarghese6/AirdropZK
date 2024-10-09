"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react"
import { Input } from "@/components/ui/input";
import { useGetUser } from "@/features/users/api/use-get-users";
import { useState } from "react";
import React from "react";
import { useCreateUser } from "@/features/users/api/use-create-users";


const ProfilePage = () => {

    const { data } = useGetUser();
    const [key, setKey] = useState("");

    const mutation = useCreateUser();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const privateKey = key
        mutation.mutate({ privateKey: privateKey });
        console.log(key)
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Separator />
                    <div className="flex justify-between m-4">
                        <p className="text-lg font-bold">Private Key</p>
                        {!!data ? (
                            <div className="flex">
                                <p className="mr-4">*****************************</p>
                                <Pencil size={16}/>
                            </div>
                        ) : (
                            <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={onSubmit}>

                                <Input placeholder="Paste your private key here" onChange={(e) => setKey(e.target.value)} />
                                <Button >Submit</Button>

                            </form>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

export default ProfilePage;