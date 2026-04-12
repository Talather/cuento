export interface GenerateImageResponse {
  imageURL: string;
  taskUUID: string;
}

export interface RequestLog {
  id: string;
  user_id: string | null;
  timestamp: number;
  status: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  requestId: string;
  timestamp: number;
}