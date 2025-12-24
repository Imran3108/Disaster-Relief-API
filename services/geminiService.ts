
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDisasterRequest = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following disaster rescue request message and extract information: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Category of disaster like Medical, Fire, Flood, etc." },
            urgencyScore: { type: Type.NUMBER, description: "Score from 1 to 10 based on life threat" },
            estimatedPeople: { type: Type.NUMBER, description: "Number of people mentioned, 1 if unknown" },
            suggestedResources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of resources needed" }
          },
          required: ["category", "urgencyScore", "estimatedPeople", "suggestedResources"]
        }
      }
    });

    // Directly access the text property as per guidelines.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
