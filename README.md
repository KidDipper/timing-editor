# Timing Chart Editor (React + WaveDrom)

Excelで作っていた制御タイムチャートを、**ブラウザだけ**で編集・プレビュー・JSON/SVG保存できるツール。  
公開ページ: https://kiddipper.github.io/timing-editor/

## 特徴
- React + TypeScript + Vite（静的サイト、GitHub Pagesで公開）
- 入力：`name / wave / data / phase`、edge（因果矢印）
- 出力：**JSON**（再編集用） / **SVG**（ドキュメントに貼れます）
- モデルはブラウザの localStorage に自動保存

## 使い方
1. 画面上で信号行を編集（右側プレビューが自動更新）
2. `JSON保存` で編集用データを保存
3. `SVG保存` で画像として保存（READMEや設計書に貼付）

### Wave 例
- `0.1.0.` / `0..1..0` / `1.0.1.` / `0...1..0`
- edge 例: `Door.f->MCU.e WakeUp`（※READMEでは `Door.f-&gt;MCU.e WakeUp` と表記）

## JSONフォーマット
```json
{
  "signal": [
    { "name": "IG", "wave": "0.1.0.", "data": ["OFF","ON","OFF"] },
    { "name": "Engine", "wave": "0..1..0", "data": ["","ON","OFF"], "phase": 1 }
  ],
  "edge": ["IG.r -> Engine.r Start"],
  "config": { "hscale": 1 },
  "title": "サンプル制御タイムチャート"
}
```

## ローカル開発

```bash
npm i
npm run dev    # http://localhost:5173
npm run build  # dist/ を生成
```

## デプロイ（GitHub Pages）

* `vite.config.ts` の `base` は `/timing-editor/`
* GitHub Actions: `.github/workflows/deploy.yml`

  * `configure-pages@v5` → `upload-pages-artifact@v3` → `deploy-pages@v4`

## 技術構成

* React + TS + Vite
* 状態管理：Zustand
* **WaveDromの読み込みはCDN + ProcessAll方式（暫定）**

  * React内で `<script type="WaveDrom">` を挿入し、`ProcessAll()` でSVGへ変換
  * `RenderWaveForm(..., elementId)` による `outputElement is null` を回避

## ライセンス

MIT

# 開発メモ（ARCHITECTURE.md）

# Architecture

## ディレクトリ構成
```

src/
components/
SignalRow\.tsx      # 信号1行の編集UI
store/
useModel.ts        # Zustand: Model（signal/edge/config）の集中管理
types.ts             # Model/Signal 型定義
App.tsx              # 画面構成＋WaveDrom描画
styles.css

```

## 描画フロー
1. `App.tsx` で `waveJson` をメモ化
2. `useLayoutEffect` で DOM 準備が完了後に実行
3. コンテナ内に `<script type="WaveDrom">JSON</script>` を挿入
4. `WaveDrom.ProcessAll()` を呼び、script要素が **SVGに置換**される

> なぜこの方式？
> - `renderWaveForm/RenderWaveForm` は第三引数が要素ID文字列で、Reactのレンダリングタイミングと相性が悪く `outputElement is null` を頻発
> - `ProcessAll()` 方式なら **ID解決をWaveDromに任せられ**、安定して描画できる

## データ永続化
- `localStorage` に `timing-editor:model` で保存
- JSON入出力はファイルベース（ローカル）


# 既知の課題（KNOWN\_ISSUES.md）


# Known Issues

1. **WaveDromをCDNからロード（暫定）**
   - オフライン環境／社内NWでCDNがブロックされるとプレビュー不可
   - 将来対応: npm パッケージに切替えて ESM で安定ロード（skins も一緒に）

2. JSX内で `>` を表示するときは `&gt;`
   - README/UIの例示ではエスケープ必須

3. SVGテーマ/配色
   - 現状は default skin 固定
   - 将来: custom skin or 生成後のSVGにクラス付与して色変更

4. Undo/Redo なし
   - 今は編集は即時反映・上書き
   - 将来: Zustand middleware で履歴管理

5. 大きなチャートのパフォーマンス
   - 行数が多いと `ProcessAll()` で全描画になる
   - 将来: 行ごとの局所再描画 or `renderWaveForm` 安定化後に最適化


# 今後の計画（ROADMAP.md）

# Roadmap

## v0.2
- プリセット挿入（車載ECU: IG/Engine/Door/BLE など）
- PNG出力（SVG -> canvas -> PNG）
- フォームのキーボード操作改善（Enterで行追加 等）

## v0.3
- Undo/Redo（Zustand middleware）
- 色テーマ・太さ・フォントサイズ設定
- Wave記法のチートシートをUIに内蔵

## v0.4
- WaveDromを npm import に変更（オフライン対応）
  - `import 'wavedrom'; import 'wavedrom/skins/default.js'`
  - 安定化できたら `renderWaveForm` に切替（部分再描画）

## v1.0
- 複数チャート管理（タブ/ファイル一覧）
- GitHub/Gist/Drive 連携の保存・読み込み（任意）


# コントリビューションガイド（CONTRIBUTING.md）

# Contributing

## セットアップ
```bash
npm i
npm run dev
```
## コーディング規約（軽め）

* TypeScript（`strict`）
* コンポーネントは関数コンポーネント
* 型は `src/types.ts` に置く
* PR ではスクリーンショット or 動作説明を添付

## ブランチ/コミット

* feature ブランチ: `feat/<summary>`
* fix ブランチ: `fix/<summary>`
* Conventional Commits 準拠歓迎（任意）

## テスト

* まだ未導入。将来: Vitest + React Testing Library 予定

# 追記：トラブルシュート

- **Pagesで404/assetが読めない** → `vite.config.ts` の `base` が `/timing-editor/` か確認
- **Actionsが404で失敗** → `configure-pages@v5` を入れているか確認（修正版workflow参照）
- **プレビューが出ない**  
  - ネットワークでCDNがブロック？ Console のネットワークエラーを確認  
  - `edge` 例示で `>` を素のまま書いていないか（JSX内は `&gt;`）

---
 


