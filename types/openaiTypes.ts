export interface OpenAIEmbeddingResponse {
  object: string;
  data: { object: string; index: number; embedding: number[] }[];
  model: string;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: { index: number; message: { role: string; content: string } }[];
}