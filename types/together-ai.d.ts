declare module 'together-ai' {
  interface Message {
    role: string;
    content: string;
  }

  interface CompletionChoice {
    message?: {
      content: string;
    };
    delta?: {
      content: string;
    };
  }

  interface CompletionResponse {
    choices: CompletionChoice[];
  }

  interface CompletionOptions {
    messages: Message[];
    model: string;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    stop?: string[];
  }

  interface Together {
    chat: {
      completions: {
        create(options: CompletionOptions): Promise<CompletionResponse>;
      };
    };
  }

  export default class TogetherAI {
    constructor(options: { apiKey: string | undefined });
  }
} 