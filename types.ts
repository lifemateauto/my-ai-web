
export interface Item {
  id: string;
  name: string;
  photo: string;
  size: string;
  quantity: number;
  location: string;
  category: string;
  createdAt: number;
}

export interface AIAnalysisResult {
  name: string;
  size: string;
  category: string;
  suggestedLocation: string;
}
