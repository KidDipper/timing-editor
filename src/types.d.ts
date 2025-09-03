export type Signal = {
    name: string;
    wave: string;
    data?: string[];
    phase?: number;
};
export type Model = {
    signal: Signal[];
    edge?: string[];
    config?: {
        hscale?: number;
    };
    title?: string;
};
