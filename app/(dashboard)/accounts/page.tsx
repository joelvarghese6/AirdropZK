"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Plus, Plane } from "lucide-react";
import { useNewToken } from "@/features/token/hooks/use-new-token";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table";
import { useGetTokens } from "@/features/token/api/use-get-tokens";
import { useAirdropToken } from "@/features/token/hooks/use-airdrop-token";



const AccountsPage = () => {
    const { onOpen } = useNewToken();
    const { onSheetOpen } = useAirdropToken();
    //const newToken = useNewToken();
    const tokensQuery = useGetTokens();
    const tokens = tokensQuery.data || [];
    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Minted Tokens
                    </CardTitle>
                    <div>
                        <Button size="sm" className="mr-4" onClick={onSheetOpen}>
                            <Plane className="size-4 mr-2" />
                            Airdrop
                        </Button>
                        <Button size="sm" onClick={onOpen}>
                            <Plus className="size-4 mr-2" />
                            Add New
                        </Button>
                    </div>

                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={tokens} />
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountsPage;