
export interface ErrorResponse {
  error: string;
  details: string;
  status: number;
}

export interface StoryData {
  title: string;
  content: string;
  synopsis: string;
  image_prompts: {
    featured: string;
    middle1: string;
    middle2: string;
    final: string;
  };
  tags: string[];
}
