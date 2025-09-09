import { useModel } from "./useModel";

test("addSignal で signal が増える", () => {
  const { model, addSignal } = useModel.getState();
  const before = model.signal.length;
  addSignal();
  const after = useModel.getState().model.signal.length;
  expect(after).toBe(before + 1);
});
