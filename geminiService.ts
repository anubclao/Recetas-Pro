
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet } from "./types.ts";

// Inicializar AI directamente desde la variable de entorno.
const ai = new GoogleGenAI({ apiKey: apiKey: import.meta.env.VITE_API_KEY });

export const generateTechnicalSheet = async (dishName: string): Promise<TechnicalSheet> => {
  const systemInstruction = `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS CON 20 AÑOS DE EXPERIENCIA. 
    INSTRUCCIÓN CRÍTICA: TODA LA RESPUESTA DEBE ESTAR EXCLUSIVAMENTE EN ESPAÑOL.
    - Mercado: Colombia (Precios actuales en COP).
    - Cálculo de Precio Sugerido: Aplica un markup del 230% sobre el costo total, lo que equivale a multiplicar por 3.3 (Costo x 3.3).
    - Redondeo: Redondea el precio final sugerido a la centena más cercana (ej. 45.820 -> 45.800).
    - Formato: Retorna estrictamente el JSON siguiendo el esquema proporcionado.
    - IMPORTANTE: Realiza los cálculos matemáticos de subtotal y total con extrema precisión.`;

  const promptText = `Genera una ficha técnica gastronómica completa y ultra-precisa para el plato: "${dishName}". Recuerda: Todo en español, precios en COP, markup 3.3x.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: promptText }] }],
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
            },
            required: ["totalCost", "marginPercentage", "suggestedPrice"]
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
              },
              required: ["step", "description"]
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
  if (!text) throw new Error("La API devolvió un texto vacío.");
  
  try {
    return JSON.parse(text) as TechnicalSheet;
  } catch (e) {
    console.error("Error al parsear JSON:", text);
    throw new Error("Estructura JSON inválida en la respuesta.");
  }
};

export const generateDishImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{
      parts: [
        {
          text: `Fotografía profesional de comida: ${prompt}. Emplatado de restaurante gourmet, profundidad de campo reducida, iluminación natural, presentación elegante.`,
        },
      ],
    }],
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No se pudo generar la imagen.");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No se encontró la parte de imagen en la respuesta.");
};
