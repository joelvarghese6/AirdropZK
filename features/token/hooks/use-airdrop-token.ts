import { create } from "zustand";

type NewAirdropTokenState = {
    isSheetOpen: boolean;
    onSheetOpen: () => void;
    onSheetClose: () => void;
};

export const useAirdropToken = create<NewAirdropTokenState>((set) => ({
    isSheetOpen: false,
    onSheetOpen: () => set({ isSheetOpen: true }),
    onSheetClose: () => set({ isSheetOpen: false })
}));
