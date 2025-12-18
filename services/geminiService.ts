
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

export const analyzeItemImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean the base64 string
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          text: "請分析這張圖片中的物品，並以 JSON 格式提供詳細資訊。預測物品名稱、可能的尺寸（例如 '30x20x10cm' 或 '大/中/小'）、標準分類，以及合理的存放位置（例如 '廚房抽屜'、'車庫層架'）。請務必使用繁體中文回答所有欄位。",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          size: { type: Type.STRING },
          category: { type: Type.STRING },
          suggestedLocation: { type: Type.STRING },
        },
        required: ["name", "size", "category", "suggestedLocation"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return {
      name: "未知物品",
      size: "未知",
      category: "未分類",
      suggestedLocation: "主儲藏室",
    };
  }
};
