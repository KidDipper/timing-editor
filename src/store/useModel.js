import { create } from "zustand";
const LS_KEY = "timing-editor:model";
const initial = JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? {
    signal: [
        { name: "IG", wave: "0.1.0.", data: ["OFF", "ON", "OFF"] },
        { name: "Engine", wave: "0..1..0", data: ["", "ON", "OFF"], phase: 1 },
        { name: "Door", wave: "1.0.1.", data: ["Open", "Close", "Open"] },
        {
            name: "BLE",
            wave: "0...1..0",
            data: ["Disconnected", "Connected", "Disconnected"],
            phase: 2,
        },
    ],
    edge: ["IG.r -> Engine.r Start", "Door.f -> BLE.r WakeUp"],
    config: { hscale: 1 },
    title: "サンプル制御タイムチャート",
};
export const useModel = create((set, get) => ({
    model: initial,
    setModel: (m) => {
        localStorage.setItem(LS_KEY, JSON.stringify(m));
        set({ model: m });
    },
    update: (fn) => {
        const next = structuredClone(get().model);
        fn(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        set({ model: next });
    },
    addSignal: () => {
        const { update } = get();
        update((m) => m.signal.push({ name: "New", wave: "0.1" }));
    },
    removeSignal: (i) => {
        const { update } = get();
        update((m) => {
            m.signal.splice(i, 1);
        });
    },
    replaceSignal: (i, s) => {
        const { update } = get();
        update((m) => {
            m.signal[i] = s;
        });
    },
}));
