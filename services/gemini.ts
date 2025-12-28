
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ItemAnalysis, OutfitCategory, OutfitSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeItem = async (base64Image: string): Promise<ItemAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: "Analyze this clothing item for a virtual stylist app. Identify the type of garment, the primary color palette (as hex codes), the overall style vibe, and a detailed description of its patterns and texture. Return the result in a clean JSON format." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          style: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["type", "colorPalette", "style", "description"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateOutfitVisual = async (
  analysis: ItemAnalysis,
  category: OutfitCategory,
  pieces: string[]
): Promise<string> => {
  const prompt = `A high-end, professional fashion photography flat-lay of a ${category} outfit. 
    The central piece is the following item: ${analysis.description}. 
    Style this item with: ${pieces.join(', ')}. 
    The composition should be a clean, minimalist flat-lay on a neutral off-white background with soft natural lighting and elegant shadows. 
    Professional editorial quality, 4k, vogue style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

export const editOutfitImage = async (
  currentImageBase64: string,
  editPrompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: currentImageBase64.split(',')[1], mimeType: 'image/png' } },
        { text: editPrompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to edit image");
};

export const planOutfits = async (analysis: ItemAnalysis): Promise<OutfitSuggestion[]> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Based on this item: ${analysis.description} (${analysis.style} style, colors: ${analysis.colorPalette.join(', ')}), 
      suggest 3 distinct outfit combinations for 'Casual', 'Business', and 'Night Out' occasions. 
      For each, provide a brief styling logic and a list of specific pieces to pair it with.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            pieces: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["category", "description", "pieces"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
