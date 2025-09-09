import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

test("ヘッダとプレビュー領域が表示される", async () => {
  render(<App />);
  expect(screen.getByText(/Timing Chart Editor/i)).toBeInTheDocument();
  // プレビュー用のコンテナ（App 内で ref による div）
  expect(screen.getByRole("heading", { name: /プレビュー/i })).toBeInTheDocument();
});

test("＋ 信号追加 を押すと行が1つ増える", async () => {
  render(<App />);

  const table = screen.getByRole("table");
  const before = within(table).getAllByRole("row").length;

  fireEvent.click(screen.getByRole("button", { name: "＋ 信号追加" }));

  const after = within(table).getAllByRole("row").length;
  expect(after).toBeGreaterThan(before);
});
