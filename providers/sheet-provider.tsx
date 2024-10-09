"use client";
import { useMountedState } from "react-use";
import { NewTokenSheet } from "@/features/token/components/new-token-sheet";
import { AirdropTokenSheet } from "@/features/token/components/airdrop-token-sheet";

export const SheetProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) return null;

    return (
        <>
            <NewTokenSheet />
            <AirdropTokenSheet />
        </>
    )
}