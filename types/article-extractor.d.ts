declare module '@extractus/article-extractor' {
  export interface Article {
    title?: string
    content?: string
  }

  export function extract(url: string): Promise<Article | null>
} 