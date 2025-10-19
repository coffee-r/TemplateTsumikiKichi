# TsumikiKichiTemplate

このリポジトリは、作ったWebゲームを置いておく場所 TsumikiKichi (つみききち) のテンプレート集です。

https://tsumiki-kichi.com

## Unity

**📁 フォルダ**: [`Unity/WebGLTemplates/`](./Unity/WebGLTemplates/)

このフォルダには2つのテンプレートが含まれています：
- **TsumikiKichiWithFullscreen** - フルスクリーンボタン付き
- **TsumikiKichiNoFullscreen** - フルスクリーンボタンなし

### 使用方法

1. [`Unity/WebGLTemplates/`](./Unity/WebGLTemplates/) フォルダをダウンロード
2. Unityプロジェクトの `Assets/` 配下に配置（フォルダ名は `WebGLTemplates` のまま）
3. `Player Settings > WebGL > Resolution and Presentation > WebGL Template` で使いたいテンプレートを選択
   - **TsumikiKichiWithFullscreen** - フルスクリーンボタンあり
   - **TsumikiKichiNoFullscreen** - フルスクリーンボタンなし
4. WebGLビルドを実行

---

## Godot

**📁 フォルダ**: 
- [`Godot/with_fullscreen/`](./Godot/with_fullscreen/) (フルスクリーンボタン付き)
- [`Godot/no_fullscreen/`](./Godot/no_fullscreen/) (フルスクリーンボタンなし)

### 使用方法

1. 使いたいバージョンの `index.html` をダウンロード
2. プロジェクト > エクスポート > Custom HTML Shell で `index.html` を指定
3. エクスポートを実行

### 更新方法

最新版の `index.html` をダウンロードして、エクスポート設定で指定し直してください。

---

## 録画機能について

TsumikiKichiテンプレートには、ゲームプレイを自動録画してサイトに送信する機能が組み込まれています。

### 仕組み

- ゲームがiframeとして読み込まれると、親ウィンドウと通信
- 指定された遅延時間後に自動的にCanvas要素の録画を開始
- 録画完了後、動画データを親ウィンドウに送信
- PC環境でのみ録画（モバイルデバイスではスキップ）

### メッセージタイプ

親ウィンドウとiframe間のpostMessage通信で使用されるメッセージタイプ：

- `tsumiki:capture-ready` - iframe側: Canvas録画システムが準備完了
- `tsumiki:capture-start` - 親 → iframe: 録画開始指示（設定含む）
- `tsumiki:capture-complete` - iframe → 親: 録画完了、動画データ送信

---

## 開発者向け

### テンプレートの更新

`shared/tsumiki-capture.js` を編集後、以下のコマンドで各テンプレートに同期します：

```bash
bash shared/sync-shared.sh
```

このスクリプトは：
- Unityテンプレートには外部JSファイルとしてコピー
- GodotテンプレートにはHTMLにインライン展開

### ディレクトリ構造

```
TemplateTsumikiKichi/
├── Unity/
│   └── WebGLTemplates/
│       ├── TsumikiKichiWithFullscreen/      # フルスクリーンボタンあり
│       └── TsumikiKichiNoFullscreen/        # フルスクリーンボタンなし
├── Godot/
│   ├── no_fullscreen/
│   │   └── index.html
│   └── with_fullscreen/
│       └── index.html
└── shared/
    ├── tsumiki-capture.js
    └── sync-shared.sh
```

---

## コントリビューション

TsumikiKichi（つみききち）は個人で開発しているため、各種ゲームエンジンに対応したテンプレート開発および動作確認が一人では難しい課題があります。

以下のようなプルリクエストをお待ちしております：
- Unity・Godotのバージョンアップ対応
- 他のゲームエンジンや制作ツール（Phaser、PixiJS、Cocos2dなど）のテンプレート追加
- 録画機能の改善
- README改善

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

Issue での提案や質問もお気軽にどうぞ。

---

## ライセンス

このプロジェクトは [MITライセンス](./LICENSE) の下で公開されています。

自由に使用、改変、配布できます。
