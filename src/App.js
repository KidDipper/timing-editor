import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useLayoutEffect, useMemo, useRef } from "react";
import "./styles.css";
import { useModel } from "./store/useModel";
import SignalRow from "./components/SignalRow";
/* ---- WaveDrom（CDN）ロード ---- */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`script load failed: ${src}`));
        document.head.appendChild(s);
    });
}
let wavedromReady = null;
function ensureWaveDrom() {
    if (!wavedromReady) {
        wavedromReady = (async () => {
            if (!window.WaveDrom) {
                await loadScript("https://cdn.jsdelivr.net/npm/wavedrom@2.9.1/wavedrom.min.js");
                await loadScript("https://cdn.jsdelivr.net/npm/wavedrom@2.9.1/skins/default.js");
            }
            return window.WaveDrom;
        })();
    }
    return wavedromReady;
}
export default function App() {
    const { model, update, addSignal } = useModel();
    const containerRef = useRef(null);
    const waveJson = useMemo(() => ({
        signal: model.signal,
        edge: model.edge?.length ? model.edge : undefined,
        config: model.config,
    }), [model]);
    useLayoutEffect(() => {
        let canceled = false;
        const run = async () => {
            const WaveDrom = await ensureWaveDrom();
            if (canceled)
                return;
            const host = containerRef.current;
            if (!host)
                return;
            host.innerHTML = "";
            const jsonText = JSON.stringify(waveJson).replace(/<\/script>/gi, "<\\/script>");
            const script = document.createElement("script");
            script.type = "WaveDrom";
            script.text = jsonText;
            host.appendChild(script);
            try {
                const process = WaveDrom?.ProcessAll ?? WaveDrom?.processAll;
                if (typeof process !== "function")
                    throw new Error("WaveDrom.ProcessAll が見つかりません");
                process();
            }
            catch (e) {
                console.error(e);
                alert("プレビュー描画エラー: " + e.message);
            }
        };
        run();
        return () => { canceled = true; };
    }, [waveJson]);
    const importJson = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = async () => {
            const f = input.files?.[0];
            if (!f)
                return;
            try {
                const obj = JSON.parse(await f.text());
                useModel.getState().setModel({
                    signal: obj.signal || [],
                    edge: obj.edge || [],
                    config: obj.config || {},
                    title: obj.title || "",
                });
            }
            catch (e) {
                alert("JSON読込エラー: " + e.message);
            }
        };
        input.click();
    };
    const exportJson = () => {
        const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timing.json";
        a.click();
        URL.revokeObjectURL(url);
    };
    const exportSvg = () => {
        const svg = containerRef.current?.querySelector("svg");
        if (!svg) {
            alert("SVGがありません");
            return;
        }
        const text = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([text], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timing.svg";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { children: [_jsx("h1", { children: "Timing Chart Editor (React + WaveDrom)" }), _jsxs("div", { className: "toolbar", children: [_jsx("button", { onClick: addSignal, children: "\uFF0B \u4FE1\u53F7\u8FFD\u52A0" }), _jsx("button", { onClick: importJson, children: "JSON\u8AAD\u8FBC" }), _jsx("button", { onClick: exportJson, children: "JSON\u4FDD\u5B58" }), _jsx("button", { onClick: exportSvg, children: "SVG\u4FDD\u5B58" }), _jsxs("label", { children: ["hscale", " ", _jsx("input", { id: "hscale", type: "number", min: 1, max: 8, value: model.config?.hscale ?? 1, onChange: (e) => update(m => { m.config = { ...(m.config || {}), hscale: Number(e.target.value || 1) }; }) })] }), _jsxs("label", { children: ["\u30BF\u30A4\u30C8\u30EB", " ", _jsx("input", { id: "title", value: model.title ?? "", onChange: (e) => update(m => { m.title = e.target.value; }), placeholder: "\u4EFB\u610F\u30BF\u30A4\u30C8\u30EB" })] })] })] }), _jsxs("main", { children: [_jsxs("section", { className: "editor", children: [_jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: "14rem" }, children: "\u4FE1\u53F7\u540D" }), _jsx("th", { children: "wave" }), _jsx("th", { style: { width: "14rem" }, children: "data\uFF08\u30AB\u30F3\u30DE\u533A\u5207\u308A\uFF09" }), _jsx("th", { style: { width: "6rem" }, children: "phase" }), _jsx("th", { style: { width: "7rem" }, children: "\u524A\u9664" })] }) }), _jsx("tbody", { children: model.signal.map((sig, i) => (_jsx(SignalRow, { index: i, sig: sig }, i))) })] }), _jsxs("details", { className: "edges", children: [_jsx("summary", { children: "edge\uFF08\u56E0\u679C\u77E2\u5370\uFF09" }), _jsx("textarea", { id: "edges", rows: 3, placeholder: "IG.e->Engine.e Start", value: (model.edge ?? []).join("\n"), onChange: (e) => update(m => {
                                            m.edge = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                                        }) }), _jsxs("p", { className: "hint", children: ["\u4F8B: ", _jsx("code", { children: "Door.f->MCU.e WakeUp" })] })] })] }), _jsxs("section", { className: "preview", children: [_jsx("h2", { children: "\u30D7\u30EC\u30D3\u30E5\u30FC" }), _jsx("div", { ref: containerRef, className: "wavedrom" })] })] }), _jsx("footer", { children: _jsx("small", { children: "WaveDrom\u3067\u30EC\u30F3\u30C0\u30EA\u30F3\u30B0\u3002JSON/SVG\u306F\u30ED\u30FC\u30AB\u30EB\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002" }) })] }));
}
