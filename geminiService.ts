
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet, Language } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTechnicalSheet = async (dishName: string, lang: Language): Promise<TechnicalSheet> => {
  const systemInstruction = lang === 'es' 
    ? `Actúa como un Chef Ejecutivo y Director de Costos con 20 años de experiencia. 
      Utiliza precios de mercado actuales en Colombia (Bogotá/Medellín) en Pesos Colombianos (COP).
      Cálculo de Precio Sugerido: Costo Total * 3.3 (230% markup). 
      Redondea el precio final a la centena más cercana.
      Toda la respuesta debe estar en ESPAÑOL.`
    : `Act as an Executive Chef and Cost Director with 20 years of experience.
      Use current market prices in Colombia (Bogotá/Medellín) in Colombian Pesos (COP).
      Suggested Price Calculation: Total Cost * 3.3 (230% markup).
      Round the final price to the nearest hundred.
      The entire response must be in ENGLISH.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a ultra-precise Gastronomic Technical Sheet for the dish: "${dishName}" for the Colombian market.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishName: { type: Type.STRING },
          category: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                unitCost: { type: Type.NUMBER },
                subtotal: { type: Type.NUMBER }
              },
              required: ["name", "amount", "unit", "unitCost", "subtotal"]
            }
          },
          financials: {
            type: Type.OBJECT,
            properties: {
              totalCost: { type: Type.NUMBER },
              marginPercentage: { type: Type.NUMBER },
              suggestedPrice: { type: Type.NUMBER }
            }
          },
          miseEnPlace: { type: Type.ARRAY, items: { type: Type.STRING } },
          preparationSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.NUMBER },
                description: { type: Type.STRING },
                temp: { type: Type.STRING },
                time: { type: Type.STRING }
              }
            }
          },
          plating: { type: Type.STRING },
          variants: { type: Type.STRING },
          allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
          conservation: {
            type: Type.OBJECT,
            properties: {
              refrigeration: { type: Type.STRING },
              freezing: { type: Type.STRING }
            }
          },
          qcChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING }
        },
        required: ["dishName", "category", "prepTime", "description", "ingredients", "financials", "miseEnPlace", "preparationSteps", "plating", "variants", "allergens", "conservation", "qcChecklist", "imagePrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as TechnicalSheet;
};

export const generateDishImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-end, professional culinary photograph of the following dish: ${prompt}. Studio lighting, 8k resolution, food photography style.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};
