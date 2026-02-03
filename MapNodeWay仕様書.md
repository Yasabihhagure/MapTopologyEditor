# Map Node & Way Editor 仕様書

## 1. 概要

地図画像を背景に、OpenStreetMap（OSM）準拠のデータ構造（Node / Way）を編集・管理・保存できるWebベースのツール。

## 2. 座標系と計算モデル

* **基本座標系:** 左上原点（Screen Space / Web標準）
* **データ保存形式:** **正規化座標（Normalized Coordinates）**
  * 範囲: **$x \in [0, 1]$**, **$y \in [0, 1]$**
  * 変換式: **$表示px = 正規化座標 \times 画像の表示サイズ$**
  * メリット: デバイスの解像度や画像リサイズに依存せず、ノードの相対位置を維持できる。

## 2.1 距離単位 (Units)
* `unit` フィールドには `m`, `km`, `mile` のほか、ユーザー定義の任意の単位文字列（例: `league`, `hex`）を許容する。
* 計算ロジック上は、指定された `p1`, `p2` 間の入力距離 (`actualDistance`) を基準とし、単位文字列はラベルとして扱う。

## 3. データ構造（Schema）

アプリケーションの状態（State）は以下のJSON構造で管理する。

**JSON**

```
{
  "project": {
    "mapImage": "map.png",
    "viewBox": { "zoom": 1, "panX": 0, "panY": 0 },
    "scale": {
      "p1": { "x": 0.1, "y": 0.1 }, 
      "p2": { "x": 0.2, "y": 0.1 },
      "actualDistance": 100,
      "unit": "km",
      "scale_px_per_unit": 12.3456
    }
  },
  "nodes": [
    { 
      "id": "n1", 
      "x": 0.45, 
      "y": 0.62, 
      "tags": { 
        "name": "交差点A",
        "name:en": "Intersection A",
        "place": "town"
      } 
    }
  ],
  "ways": [
    {
      "id": "w1",
      "nodes": ["n1", "n2", "n3"],
      "tags": { 
        "highway": "footway",
        "name": "中央通り"
      }
    }
  ]
}
```

## 4. 主要機能

### 4.1. 地図・スケール設定

* **背景ロード:** 任意の地図画像を読み込み。
* **2点間スケール設定:**
  * ユーザーが画像上の2点を指定。
  * 2点間の実距離を入力し、座標あたりのスケール係数を算出。
  * 算出されたスケールに基づき、Wayの総延長をリアルタイム表示。

### 4.2. エディタ機能

* **Node（点）の操作:**
  * クリックによる新規作成、ドラッグによる移動。
* **Way（線）の操作:**
  * 既存ノードを順に選択して接続（中間ノードを無制限に保持可能）。
  * Nodeの移動に合わせ、接続されたすべてのWayを自動再描画。
* **トポロジー管理:**
  * 複数のWayで同一Nodeを共有可能（交差点の表現）。

### 4.3. システム

* **永続化:** JSON形式でのエクスポート/インポート機能。
* **レスポンシブ:** 画面リサイズ時も正規化座標から再計算して描画を維持。

## 5. 推奨技術スタック

* **Hosting:** GitHub Pages
* **Framework:** React + TypeScript (Vite)
* **Styling:** TailwindCSS + shadcn/ui
* **Rendering:** SVG（スタイリングとイベント処理の容易性のため）
* **Icons:** Lucide-react
