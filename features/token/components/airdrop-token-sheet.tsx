import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { useAirdropToken } from "@/features/token/hooks/use-airdrop-token";
import { AirdropForm } from "./airdrop-form";
import { useGetUser } from "@/features/users/api/use-get-users";

// const formSchema = insertTokensSchema.pick({
//     name: true,
//     symbol: true,
//     supply: true,
//     logo: true,
// })

// type FormValues = z.input<typeof formSchema>;

export const AirdropTokenSheet = () => {
    const { isSheetOpen, onSheetClose } = useAirdropToken();
    const { data } = useGetUser();

    // const mutation = useCreateToken();

    // const onSubmit = (values: FormValues) => {
    //     mutation.mutate(values, {
    //         onSuccess: () => {
    //             onClose();
    //         },
    //     });
    // }
    return (
        <Sheet open={isSheetOpen} onOpenChange={onSheetClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        Airdrop TOken
                    </SheetTitle>
                    <SheetDescription>
                        you can select and airdrop the token to the list of addresses. The amount each user gets will depend on the total mint, and the number of addresses.
                    </SheetDescription>
                </SheetHeader>
                {!data ? "Please update the private key in settings." : <AirdropForm closeSheet={onSheetClose} />}

            </SheetContent>
        </Sheet>

    )
}