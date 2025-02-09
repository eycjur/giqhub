# giqhub への貢献

ご興味をお持ちいただきありがとうございます！このドキュメントでは、開発や貢献を始める際のガイドラインを提供します。

## 前提条件

以下のツールがインストールされていることを確認してください。

- [Node.js](https://nodejs.org/)（最新のLTS推奨）
- [Yarn](https://yarnpkg.com/)（パッケージマネージャー）

## セットアップ

1. リポジトリをフォークし、ローカル環境にクローンします。

   ```sh
   git clone https://github.com/eycjur/giqhub.git
   cd giqhub
   ```

2. 依存関係をインストールします。
   ```sh
   yarn install
   ```

## 開発ワークフロー

### 開発サーバーの起動

以下のコマンドで開発サーバーを起動します。

```sh
yarn run dev
# open http://localhost:5173/ja/home
```

これにより、Vite の開発サーバーが起動します。

### VS Code でのデバッグ

VS Code を使用してアプリケーションをデバッグできます。

デバッグを開始するには:

1. 開発サーバーを起動します（`yarn run dev`）。
2. VS Code のデバッグパネルを開き、「Launch Chrome against localhost」を選択するか、F5 キーを押して直ちにデバッグを開始します。
3. ブレークポイントを設定し、アプリケーションをデバッグできます。

## コード品質とフォーマット

### TypeScript および Svelte の型チェック

プロジェクトが正しく同期され、型エラーがないか確認します。

```sh
yarn check
```

継続的にチェックするウォッチモードを使用する場合:

```sh
yarn check:watch
```

### コードフォーマット

コードのフォーマットには Prettier を使用しています。すべてのファイルをフォーマットするには以下を実行してください。

```sh
yarn format
```

### リンティング

Lint を実行し、自動修正を適用するには以下のコマンドを使用します。

```sh
yarn lint
```

## アーキテクチャ

アプリケーションのアーキテクチャについては、[ARCHITECTURE.md](ARCHITECTURE.md) を参照してください。

## 貢献の手順

1. **ブランチを作成**
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. **変更を加え、コミットする**
   ```sh
   git commit -m "feat: describe your change"
   ```
3. **ブランチをプッシュする**
   ```sh
   git push origin feature/your-feature-name
   ```
4. **プルリクエストを作成**
   GitHub 上でプルリクエスト（PR）を作成してください。

## ヘルプが必要ですか？

問題が発生した場合やサポートが必要な場合は、リポジトリに issue を作成してください。

楽しいコーディングを！🚀
