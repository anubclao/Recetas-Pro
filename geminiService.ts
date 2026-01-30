
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet, Language } from "./types";

const ai = new GoogleGenAI({ apiKey:import.meta.env.VITE_API_KEY });

export const generateTechnicalSheet = async (dishName: string, lang: Language): Promise<TechnicalSheet> => {
  const isEs = lang === 'es';
  
  const systemInstruction = isEs 
    ? `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS CON 20 AÑOS DE EXPERIENCIA. 
      INSTRUCCIÓN CRÍTICA DE IDIOMA: TODA LA RESPUESTA DEBE ESTAR EXCLUSIVAMENTE EN ESPAÑOL. NO MEZCLES INGLÉS.
      - Mercado: Colombia (Precios actuales en COP).
      - Cálculo de Precio Sugerido: Aplica un markup del 230% sobre el costo total, lo que equivale a multiplicar por 3.3 (Costo x 3.3).
      - Redondeo: Redondea el precio final sugerido a la centena más cercana (ej. 45.820 -> 45.800).
      - Formato: Retorna estrictamente el JSON siguiendo el esquema proporcionado.`
    : `YOU ARE AN EXPERT EXECUTIVE CHEF AND COST DIRECTOR WITH 20 YEARS OF EXPERIENCE.
      CRITICAL LANGUAGE INSTRUCTION: THE ENTIRE RESPONSE MUST BE EXCLUSIVELY IN ENGLISH. DO NOT MIX SPANISH.
      - Market: Colombia (Current prices in COP).
      - Suggested Price Calculation: Apply a 230% markup over the total cost, which equals a multiplier of 3.3 (Cost x 3.3).
      - Rounding: Round the final suggested price to the nearest hundred.
      - Format: Strictly return the JSON following the provided schema.`;

  const prompt = isEs
    ? `Genera una ficha técnica gastronómica completa y ultra-precisa para el plato: "${dishName}". Recuerda: Todo en español, precios en COP, markup 3.3x.`
    : `Generate a complete and ultra-precise gastronomic technical sheet for the dish: "${dishName}". Remember: Everything in English, prices in COP, 3.3x markup.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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
          text: `Fine dining restaurant plating of ${prompt}. Modern culinary style, bright soft lighting, high contrast, clean background, 4k macro photography.`,
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
