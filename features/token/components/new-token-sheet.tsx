import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { useNewToken } from "../hooks/use-new-token";
import { TokenForm } from "./token-form";
import { insertTokensSchema } from "@/db/schema";
import { z } from "zod"
import { useCreateToken } from "../api/use-create-tokens";
import { useGetUser } from "@/features/users/api/use-get-users";

const formSchema = insertTokensSchema.pick({
    name: true,
    symbol: true,
    supply: true,
})

type FormValues = z.input<typeof formSchema>;

export const NewTokenSheet = () => {
    const { isOpen, onClose } = useNewToken();

    const mutation = useCreateToken();
    const { data } = useGetUser();
    console.log(data)

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose();
            },
        });
    }
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        New Token
                    </SheetTitle>
                    <SheetDescription>
                        Create a new token to distribute to the customers.
                    </SheetDescription>
                </SheetHeader>
                {!!data ? <TokenForm onSubmit={onSubmit} disabled={mutation.isPending} userData={data} /> : "Go to settings to update the private key"}

            </SheetContent>
        </Sheet>

    )
}