import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useModel } from "../store/useModel";
export default function SignalRow({ index, sig }) {
    const replaceSignal = useModel((s) => s.replaceSignal);
    const removeSignal = useModel((s) => s.removeSignal);
    const onChange = (patch) => {
        replaceSignal(index, { ...sig, ...patch });
    };
    return (_jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { value: sig.name, onChange: (e) => onChange({ name: e.target.value }) }) }), _jsx("td", { children: _jsx("input", { value: sig.wave, onChange: (e) => onChange({ wave: e.target.value }), placeholder: "\u4F8B: 0..1==0." }) }), _jsx("td", { children: _jsx("input", { value: (sig.data ?? []).join(","), onChange: (e) => {
                        const v = e.target.value.trim();
                        onChange({ data: v ? v.split(",").map((s) => s.trim()) : undefined });
                    }, placeholder: "Open,Close" }) }), _jsx("td", { children: _jsx("input", { type: "number", value: sig.phase ?? "", onChange: (e) => onChange({
                        phase: e.target.value === "" ? undefined : Number(e.target.value),
                    }) }) }), _jsx("td", { children: _jsx("button", { onClick: () => removeSignal(index), children: "\u524A\u9664" }) })] }));
}
