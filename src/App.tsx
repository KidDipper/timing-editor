// src/App.tsx
import { useLayoutEffect, useMemo, useRef } from "react";
import "./styles.css";
import { useModel } from "./store/useModel";
import SignalRow from "./components/SignalRow";
import type { Signal } from "./types";

/* ---- WaveDrom（CDN）ロード ---- */
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`script load failed: ${src}`));
    document.head.appendChild(s);
  });
}

let wavedromReady: Promise<any> | null = null;
function ensureWaveDrom(): Promise<any> {
  if (!wavedromReady) {
    wavedromReady = (async () => {
      if (!(window as any).WaveDrom) {
        await loadScript("https://cdn.jsdelivr.net/npm/wavedrom@2.9.1/wavedrom.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/wavedrom@2.9.1/skins/default.js");
      }
      return (window as any).WaveDrom;
    })();
  }
  return wavedromReady;
}

export default function App() {
  const { model, update, addSignal } = useModel();
  const containerRef = useRef<HTMLDivElement>(null);

  const waveJson = useMemo(
    () => ({
      signal: model.signal,
      edge: model.edge?.length ? model.edge : undefined,
      config: model.config,
    }),
    [model]
  );

  useLayoutEffect(() => {
    let canceled = false;
    const run = async () => {
      const WaveDrom = await ensureWaveDrom();
      if (canceled) return;
      const host = containerRef.current;
      if (!host) return;

      host.innerHTML = "";

      const jsonText = JSON.stringify(waveJson).replace(/<\/script>/gi, "<\\/script>");
      const script = document.createElement("script");
      (script as any).type = "WaveDrom";
      script.text = jsonText;
      host.appendChild(script);

      try {
        const process = WaveDrom?.ProcessAll ?? WaveDrom?.processAll;
        if (typeof process !== "function") throw new Error("WaveDrom.ProcessAll が見つかりません");
        process();
      } catch (e: any) {
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
      if (!f) return;
      try {
        const obj = JSON.parse(await f.text());
        useModel.getState().setModel({
          signal: obj.signal || [],
          edge: obj.edge || [],
          config: obj.config || {},
          title: obj.title || "",
        });
      } catch (e: any) { alert("JSON読込エラー: " + e.message); }
    };
    input.click();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "timing.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) { alert("SVGがありません"); return; }
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "timing.svg"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header>
        <h1>Timing Chart Editor (React + WaveDrom)</h1>
        <div className="toolbar">
          <button onClick={addSignal}>＋ 信号追加</button>
          <button onClick={importJson}>JSON読込</button>
          <button onClick={exportJson}>JSON保存</button>
          <button onClick={exportSvg}>SVG保存</button>
          <label>
            hscale{" "}
            <input
              id="hscale"
              type="number" min={1} max={8}
              value={model.config?.hscale ?? 1}
              onChange={(e)=> update(m => { m.config = { ...(m.config||{}), hscale: Number(e.target.value||1) }; })}
            />
          </label>
          <label>
            タイトル{" "}
            <input
              id="title"
              value={model.title ?? ""}
              onChange={(e)=> update(m => { m.title = e.target.value; })}
              placeholder="任意タイトル"
            />
          </label>
        </div>
      </header>

      <main>
        <section className="editor">
          <table>
            <thead>
              <tr>
                <th style={{ width: "14rem" }}>信号名</th>
                <th>wave</th>
                <th style={{ width: "14rem" }}>data（カンマ区切り）</th>
                <th style={{ width: "6rem" }}>phase</th>
                <th style={{ width: "7rem" }}>削除</th>
              </tr>
            </thead>
            <tbody>
              {model.signal.map((sig: Signal, i: number) => (
                <SignalRow key={i} index={i} sig={sig} />
              ))}
            </tbody>
          </table>

          <details className="edges">
            <summary>edge（因果矢印）</summary>
            <textarea
              id="edges"
              rows={3}
              placeholder="IG.e->Engine.e Start"
              value={(model.edge ?? []).join("\n")}
              onChange={(e)=> update(m => {
                m.edge = e.target.value.split("\n").map(s=>s.trim()).filter(Boolean);
              })}
            />
            <p className="hint">例: <code>Door.f-&gt;MCU.e WakeUp</code></p>
          </details>
        </section>

        <section className="preview">
          <h2>プレビュー</h2>
          {/* WaveDrom はこの中の <script type="WaveDrom"> を SVG に置換 */}
          <div ref={containerRef} className="wavedrom" />
        </section>
      </main>

      <footer>
        <small>WaveDromでレンダリング。JSON/SVGはローカル保存されます。</small>
      </footer>
    </div>
  );
}
