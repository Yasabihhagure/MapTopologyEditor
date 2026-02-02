# 地図画像トポロジーエディタ (Map Topology Editor)

地図画像を読み込み、その上にノード（地点）とウェイ（経路）を配置してトポロジーデータを作成するためのエディタです。
作成したデータは、AIナビゲーションや経路探索シミュレーションなどの用途での利用を想定しています。

**GitHub Pages**: [https://Yasabihhagure.github.io/MapTopologyEditor/](https://Yasabihhagure.github.io/MapTopologyEditor/) (予定)

## 機能 (Ver: Beta 1)

*   **地図画像の読み込み**: ローカルの画像ファイル(png, gif等)をアップロードして背景として使用。
*   **トポロジー編集**:
    *   **Node (ノード)**: クリックで追加、ドラッグで移動。名称や種類(Place)を設定可能。
    *   **Way (ウェイ)**: 始点ノードを選択し、`Shift`+クリックで終点ノードを指定して接続。名称や種類(Highway)を設定可能。
    *   **削除**: `Delete` または `Backspace` キーで選択中の要素を削除。
*   **縮尺設定**:
    *   地図上の2点をクリックして物理的な距離を設定 (m, km, mile)。
    *   指定した距離に基づく縮尺計算。
*   **データ管理**:
    *   編集状態のJSONエクスポート/インポート。
*   **UI**:
    *   閲覧モード/編集モードの切り替え。
    *   ノード一覧サイドバー（クリックで選択）。

## 技術スタック

*   React
*   TypeScript
*   Vite
*   Tailwind CSS
*   shadcn/ui
*   Zustand (State Management)
*   Lucide React (Icons)

## ローカルでの実行方法

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## ライセンス

MIT License
