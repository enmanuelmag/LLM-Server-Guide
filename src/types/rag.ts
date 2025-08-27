// Financial Policies Vector Store Interface
export interface FinancialPolicy {
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
  policy: FinancialPolicy;
  similarity: number;
}
