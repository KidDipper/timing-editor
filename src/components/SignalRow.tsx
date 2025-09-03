import type { Signal } from "../types";
import { useModel } from "../store/useModel";

type Props = { index: number; sig: Signal };

export default function SignalRow({ index, sig }: Props) {
  const replaceSignal = useModel((s) => s.replaceSignal);
  const removeSignal = useModel((s) => s.removeSignal);

  const onChange = (patch: Partial<Signal>) => {
    replaceSignal(index, { ...sig, ...patch });
  };

  return (
    <tr>
      <td>
        <input
          value={sig.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </td>
      <td>
        <input
          value={sig.wave}
          onChange={(e) => onChange({ wave: e.target.value })}
          placeholder="例: 0..1==0."
        />
      </td>
      <td>
        <input
          value={(sig.data ?? []).join(",")}
          onChange={(e) => {
            const v = e.target.value.trim();
            onChange({ data: v ? v.split(",").map((s) => s.trim()) : undefined });
          }}
          placeholder="Open,Close"
        />
      </td>
      <td>
        <input
          type="number"
          value={sig.phase ?? ""}
          onChange={(e) =>
            onChange({
              phase: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />
      </td>
      <td>
        <button onClick={() => removeSignal(index)}>削除</button>
      </td>
    </tr>
  );
}
