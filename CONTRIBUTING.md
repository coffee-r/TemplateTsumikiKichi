# コントリビューションガイド

TsumikiKichi（つみききち）へのコントリビューションをありがとうございます！

## 🎯 歓迎するコントリビューション

### 特に歓迎
- **Unity・Godotのバージョンアップ対応**
- **他のゲームエンジンや制作ツールのテンプレート追加**
  - Phaser、PixiJS、Cocos2d、Three.js など
  - Canvas を使用するゲームエンジンであれば対応可能です
- **録画機能の改善**
  - パフォーマンス最適化
  - エラーハンドリングの改善
  - 新機能の追加
- **ドキュメントの改善**
  - README.md の改善
  - コメントの追加・修正
  - 使用例の追加

### その他
- バグ修正
- タイポの修正
- コードの最適化

## 📝 プルリクエストの流れ

### 1. Issue を開く（推奨）
大きな変更や新機能の追加を行う場合は、まず Issue を開いて相談してください。

### 2. フォークとブランチ作成
```bash
# リポジトリをフォーク後
git clone https://github.com/YOUR_USERNAME/TemplateTsumikiKichi.git
cd TemplateTsumikiKichi

# フィーチャーブランチを作成
git checkout -b feature/your-feature-name
```

### 3. 開発
- `shared/tsumiki-capture.js` を編集した場合は `bash shared/sync-shared.sh` を実行
- コミットメッセージは明確に（日本語でOK）

### 4. プッシュとプルリクエスト
```bash
git push origin feature/your-feature-name
```

その後、GitHubでプルリクエストを作成してください。

## 🎮 新しいゲームエンジンを追加する場合

### 必要な要素
1. Canvas要素に `tsumiki-kichi-canvas` クラスを追加
2. `shared/tsumiki-capture.js` をテンプレートに組み込む
   - 外部ファイルとして読み込む、または
   - HTMLにインライン展開する

### テンプレートの構成
```
EngineFolder/
├── with_fullscreen/     # フルスクリーンボタンあり
└── no_fullscreen/       # フルスクリーンボタンなし
```

### sync-shared.sh の更新
新しいエンジンを追加した場合は、`shared/sync-shared.sh` に同期処理を追加してください。

## 🧪 テスト

新しいテンプレートを追加する場合は、以下を確認してください：
- [ ] ゲームが正常に動作する
- [ ] Canvas要素に `tsumiki-kichi-canvas` クラスが付与されている
- [ ] 録画スクリプトが正しく読み込まれる
- [ ] iframe として読み込んだ時に録画が動作する

## 💬 質問や提案

- Issue で気軽に相談してください
- 小さな疑問でも歓迎です

## 📄 ライセンス

このプロジェクトは MIT ライセンスです。コントリビューションも同じライセンスの下で提供されます。
