export interface OpenAIEmbeddingResponse {
  object: string;
  data: { object: string; index: number; embedding: number[] }[];
  model: string;
}

export interface OpenAIChatResponse {
  choices: { message: { content: string } }[];
}
