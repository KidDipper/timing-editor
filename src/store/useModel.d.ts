import type { Model, Signal } from "../types";
type Store = {
    model: Model;
    setModel: (m: Model) => void;
    update: (fn: (m: Model) => void) => void;
    addSignal: () => void;
    removeSignal: (i: number) => void;
    replaceSignal: (i: number, s: Signal) => void;
};
export declare const useModel: import("zustand").UseBoundStore<import("zustand").StoreApi<Store>>;
export {};
