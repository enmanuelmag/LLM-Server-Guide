// Email Data Vector Store Interface
export interface EmailData {
  id: string;
  title: string;
  content: string;
  category: string;
  embedding: number[];
}

export interface VectorStoreQuery {
  query: string;
  embedding: number[];
  limit?: number;
  threshold?: number;
}

export interface VectorSearchResult {
  email: EmailData;
  similarity: number;
}
