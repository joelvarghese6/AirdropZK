import {create} from "zustand";

type NewTokenState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useNewToken = create<NewTokenState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}));
