
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet } from "./types";

export const generateTechnicalSheet = async (dishName: string): Promise<TechnicalSheet> => {
  // Inicializamos dentro de la función para asegurar que process.env esté actualizado
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const systemInstruction = `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS CON 20 AÑOS DE EXPERIENCIA. 
    INSTRUCCIÓN CRÍTICA: TODA LA RESPUESTA DEBE ESTAR EXCLUSIVAMENTE EN ESPAÑOL.
    - Mercado: Colombia (Precios actuales en COP).
    - Cálculo de Precio Sugerido: Aplica un markup del 230% sobre el costo total, lo que equivale a multiplicar por 3.3 (Costo x 3.3).
    - Redondeo: Redondea el precio final sugerido a la centena más cercana.
    - Categorización de Ingredientes: Debes asignar obligatoriamente una de estas categorías a cada ingrediente: 'carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'.
    - Formato: Retorna estrictamente el JSON siguiendo el esquema proporcionado.`;

  const promptText = `Genera una ficha técnica gastronómica completa y ultra-precisa para el plato: "${dishName}". Incluye categorización de ingredientes para representación visual.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: promptText, // Formato simplificado y correcto para texto
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
                subtotal: { type: Type.NUMBER },
                category: { 
                  type: Type.STRING, 
                  enum: ['carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'] 
                }
              },
              required: ["name", "amount", "unit", "unitCost", "subtotal", "category"]
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Fotografía profesional de comida: ${prompt}. Emplatado de restaurante gourmet, profundidad de campo reducida, iluminación natural, presentación elegante.`,
        },
      ],
    },
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
