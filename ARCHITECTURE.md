# giqhub Architecture

## Overview

giqhub adopts a simple RAG (Retriever-Answer-Generator) architecture.  
RAG is an architecture that combines a Retriever (search engine) with an LLM (answer generator) to produce answers based on retrieved information.

The Retriever provides a search engine on the frontend and returns search results.

For the RAG Retriever, we use Lunr ( https://lunrjs.com/ ), a search engine that runs entirely on the frontend.  
For the LLM, we use Gemini Nano in Chrome ( https://developer.chrome.com/docs/ai ), which also operates on the frontend.

## Flow

The overall processing flow of giqhub is as follows.

### Setup of the Retriever for RAG

When the page loads, the GitHub repository information is fetched and the Retriever is set up. Afterwards, the repository description is retrieved and the repository summary display is updated.

```mermaid
flowchart
  subgraph frontend
    DataSource["DataSource (GitHub)"]
    Retriever["Retriever (Lunr)"]
    LLM["LLM (Gemini/ChatGPT)"]

  DataSource -.->| 1 fetch data | Retriever
  Retriever -->| 2 generate repository summary | LLM
end
```

A more detailed sequence diagram is provided below:

```mermaid
sequenceDiagram
  participant UI
  participant Application
  participant GDS as GitHubDataSource
  participant DC as DataContainer
  participant LVD as LunrRetriever
  participant RAG

  UI->>Application: Page load
  Application->>GDS: Call fetchData() (on page load)
  GDS->>DC: Store fetched data
  DC->>DC: Perform chunk splitting using split(chunksize, separator)
  Application->>LVD: setup(DataContainer) (index creation)
  GDS-->>Application: Retrieve GitHub repository description
  Application->>RAG: Call generateRepositorySummary(description)
  RAG-->>Application: Repository summary generation (stream)
  Application->>UI: Update repository summary display
```

### User Query Processing

When a user enters a query, the RAG receives the query and generates a search query. The Retriever then retrieves relevant documents based on the search query, and the LLM generates an answer based on these documents. The generated answer is added to the ChatHistory and displayed in the UI.

```mermaid
flowchart LR
  subgraph frontend
    UI
    ChatHistory

    subgraph RAGWorkflow
      Application
      Retriever["Retriever (Lunr)"]
      LLM["LLM (Gemini/ChatGPT)"]
      %% DataSource["DataSource (GitHub)"]
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

A more detailed sequence diagram is provided below:

```mermaid
sequenceDiagram
  participant UI
  participant Application
  participant ChatHistory
  participant Retriever
  participant LLM

  UI->>Application: Enter query
  Application->>ChatHistory: addMessage(UserMessage)
  Application->>LLM: ainvoke(query)
  LLM-->>Application: Search query
  Application->>Retriever: getDocuments(search query, k)
  Retriever-->>Application: Retrieve relevant documents
  Application->>LLM: astream(answer generation prompt)
  LLM-->>Application: Answer streaming
  Application->>ChatHistory: addMessage(AIMessage)
  ChatHistory->>UI: Update UI with AI answer
```

## Class Diagram

There is a **RAG** class that orchestrates the RAG application. The RAG class holds the Retriever, LLM, and ChatHistory, acting as a facade for these components.

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

There are two implementations of the LLM: **GeminiLLM**.

- **GeminiLLM** uses Gemini Nano in Chrome to generate answers.

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

The **Retriever** is implemented as **LunrRetriever**, which uses Lunr to perform searches.  
For preparing data for the Retriever, there is a class called **DataSource**. **GitHubDataSource** retrieves GitHub repository information.

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

**ChatHistory** is the class responsible for managing user and AI messages and displaying them on the screen. It contains **UserMessage** and **AIMessage**, both of which inherit from **BaseMessage**.

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

  BaseMessage <|-- UserMessage
  BaseMessage <|-- AIMessage

  ChatHistory *-- BaseMessage : contains
  BaseMessage o-- Data : references
```

To cache accesses to the LLM and DataSource, there are classes for synchronous access (**Cache**) and asynchronous access (**AsyncCache**).

- **Cache** has three implementations: **LocalStorageCache** and **SecureLocalStorageCache**.
- **AsyncCache** has an implementation **IndexedDBCache**.

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
