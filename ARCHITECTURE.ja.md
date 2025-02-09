# giqhub architecture

## 概要

giqhubはシンプルなRAG（Retriever-Answer-Generator）アーキテクチャを採用しています。
RAGは、Retriever（検索エンジン）とLLM（回答生成器）を組み合わせたアーキテクチャで、検索した情報をもとに回答を生成することができます。

Retrieverは、フロントエンドで検索エンジンを提供し、検索結果を返します。

RAG用のRetrieverは、フロントエンドで完結する検索エンジンであるLunr( https://lunrjs.com/ )を使用しています。
LLMとしては、フロントエンドで動作するGemini Nano in Chrome( https://developer.chrome.com/docs/ai )を使用しています。

## フロー

giqhubの大まかな処理フローは以下の通りです。

### RAG用のRetrieverのセットアップ

ページ読み込み時に、GitHubのリポジトリ情報を取得し、Retrieverのセットアップを行います。その後、リポジトリの説明を取得し、リポジトリ概要表示を更新します。

```mermaid
flowchart
  subgraph frontend
    DataSource["DataSource(GitHub)"]
    Retriever["Retriever(Lunr)"]
    LLM["LLM(Gemini/ChatGPT)"]

  DataSource -.->| 1 fetch data | Retriever
  Retriever -->| 2 generate repository summary | LLM
end
```

より詳細なシーケンス図は以下の通りです。

```mermaid
sequenceDiagram
  participant UI
  participant Application
  participant GDS as GitHubDataSource
  participant DC as DataContainer
  participant LVD as LunrRetriever
  participant RAG

  UI->>Application: ページ読み込み
  Application->>GDS: fetchData() 呼び出し (ページ読み込み時)
  GDS->>DC: 取得データの格納
  DC->>DC: split(chunksize, separator) によるチャンク分割
  Application->>LVD: setup(DataContainer) (インデックス作成)
  GDS-->>Application: GitHubリポジトリの説明取得
  Application->>RAG: generateRepositorySummary(説明) 呼び出し
  RAG-->>Application: リポジトリ概要生成（ストリーム）
  Application->>UI: リポジトリ概要表示更新
```

### ユーザークエリ処理

ユーザーがクエリを入力すると、RAGはクエリを受け取り、検索用のクエリを生成します。Retrieverは検索用のクエリをもとに関連ドキュメントを取得し、LLMは関連ドキュメントをもとに回答を生成します。生成された回答はChatHistoryに追加され、UIに表示されます。

```mermaid
flowchart LR
  subgraph frontend
    UI
    ChatHistory

    subgraph RAGWorkflow
      Application
      Retriever["Retriever(Lunr)"]
      LLM["LLM(Gemini/ChatGPT)"]
      %% DataSource["DataSource(GitHub)"]
    end
  end

%% DataSource -.->| prev fetch data | Retriever
UI -->| 1 send query | Application
Application -->| 2 generate search query | LLM
Application -->| 3 get relevant document | Retriever
Application -->| 4 generate answer | LLM
Application -->| 5 add message | ChatHistory
ChatHistory -->| 6 update UI | UI
```

より詳細なシーケンス図は以下の通りです。

```mermaid
sequenceDiagram
  participant UI
  participant Application
  participant ChatHistory
  participant Retriever
  participant LLM

  UI->>Application: クエリ入力
  Application->>ChatHistory: addMessage(UserMessage)
  Application->>LLM: ainvoke(query)
  LLM-->>Application: 検索用クエリ
  Application->>Retriever: getDocuments(検索用クエリ, k)
  Retriever-->>Application: 関連ドキュメント取得
  Application->>LLM: astream(回答生成プロンプト)
  LLM-->>Application: 回答ストリーミング
  Application->>ChatHistory: addMessage(AIMessage)
  ChatHistory->>UI: AI回答表示更新
```

## クラス図

RAGアプリケーションをオーケストレーションするクラスとして、RAGクラスがあります。RAGクラスは、Retriever、LLM、ChatHistory、Retrieverを持ち、これらのクラスのファサードとして機能します。

```mermaid
classDiagram
  class RAG {
    - _owner: string
    - _repo: string
    - _llm: LLM
    - _llmGenerateQuery: LLM
    - _chatHistory: ChatHistory
    - _retriever: Retriever
    - _isCallingLLM: boolean
    +generateRepositorySummary(description: string): AsyncGenerator<string, void, unknown>
    +query(query: string): Promise<void>
    +get isLLMProcessing(): boolean
    +updateLLM(llm: LLM, llmGenerateQuery: LLM): void
  }

  class ChatHistory {
    <<interface>>
  }
  class LLM {
    <<interface>>
  }
  class Retriever {
    <<interface>>
  }

  RAG o-- LLM : delegates to
  RAG o-- Retriever : aggregates
  RAG o-- ChatHistory : aggregates
```

LLMは、GeminiLLMとChatGPTの実装があります。GeminiLLMは、Gemini Nano in Chromeを使用して回答を生成します。ChatGPTは、OpenAIのChatGPTを使用して回答を生成します。

```mermaid
classDiagram
  class LLM {
    <<interface>>
    +initSession(): void
    +available(): Promise<boolean>
    +updateSystemPrompt(systemPrompt: string): void
    +ainvoke(userPrompt: string): Promise<string>
    +astream(userPrompt: string): AsyncGenerator<string, void, unknown>
  }

  class GeminiLLM {
    - _session: any
    - _isMemory: boolean
    - _temperature: number
    - _topK: number
    - _systemPrompt: string
    - _controller: AbortController
  }

  class ChatGPTLLM {
    - _session: any
    - _isMemory: boolean
    - _temperature: number
    - _systemPrompt: string
    - _apiKey: string
    - _client: OpenAI
  }

  LLM <|-- GeminiLLM
  LLM <|-- ChatGPTLLM
```

Retrieverは、LunrRetrieverとして実装されています。LunrRetrieverは、Lunrを使用して検索を行います。
RetrieverのDataを準備するためのクラスとして、DataSourceがあります。GitHubDataSourceは、GitHubのリポジトリ情報を取得します。

```mermaid
classDiagram
  class Data {
    <<interface>>
    +name: string
    +content: string
    +url: string
  }

  class DataContainer {
    - _dataArray: Data[]
    +addData(data: Data)
    +getDataFromName(name: string): Data
    +split(chunksize: number, separator: string)
    +data: Data[]
  }

  DataContainer o-- Data : contains

  class DataSource {
    <<interface>>
    +description: string
    +fetchData(): Promise<void>
  }

  class GitHubDataSource {
    - _octokit: Octokit
    - _dataContainer: DataContainer
    - _owner: string
    - _repo: string
    - _rateLimitWithBuffer: number
    - _description: string
    +fetchData(): Promise<void>
    +get description(): string
    +get dataContainer(): DataContainer
  }

  DataSource <|-- GitHubDataSource

  GitHubDataSource o-- DataContainer : aggregates

  class Retriever {
    <<interface>>
    +setup(dataContainer: DataContainer): Promise<void>
    +getDocuments(query: string, k: number): Promise<Data[]>
  }

  class LunrRetriever {
    - _index: any
    - _data: Data[]
    +setup(dataContainer: DataContainer): Promise<void>
    +getDocuments(query: string, k: number): Promise<Data[]>
  }

  Retriever <|-- LunrRetriever

  LunrRetriever o-- Data : contains
```

ChatHistoryは、ユーザーメッセージとAIメッセージを管理し、画面に表示するためのクラスです。ChatHistoryは、BaseMessageを継承したUserMessageとAIMessageを持ちます。

```mermaid
classDiagram
  class BaseMessage {
    +role: string
    +content: string
    +references: Data[]
    +getUniqueNameReferences(): Data[]
  }

  class UserMessage
  class AIMessage
  class ChatHistory {
    - _history: BaseMessage[]
    +addMessage(message: BaseMessage)
    +updateLastContent(content: string)
    +get history(): BaseMessage[]
    +clear(): void
  }

	interface Data

  BaseMessage <| -- UserMessage
  BaseMessage <| -- AIMessage

  ChatHistory *-- BaseMessage : contains
	BaseMessage o-- Data : references
```

LLMやDataSourceへのアクセスをキャッシュするためのクラスとして、同期的にアクセスするCacheと、非同期的にアクセスするAsyncCacheがあります。Cacheは、LocalStorageCache、SecureLocalStorageCacheの2つの実装があります。AsyncCacheは、IndexedDBCacheの実装があります。

```mermaid
classDiagram
  class Cache {
    <<interface>>
    +get(key: string): string | null
    +set(key: string, value: string): void
    +delete(key: string): void
  }

  class AsyncCache {
    <<interface>>
    +get(key: string): Promise<string | null>
    +set(key: string, value: string): Promise<void>
    +delete(key: string): Promise<void>
  }

  class LocalStorageCache
  class SecureLocalStorageCache {
    - _cache: LocalStorageCache
    - generateKey(prefix: string): string
  }
  class IndexedDBCache

  Cache <|-- SecureLocalStorageCache
  Cache <|-- LocalStorageCache
  AsyncCache <|-- IndexedDBCache

  SecureLocalStorageCache *-- LocalStorageCache : secure implement
```
