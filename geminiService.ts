
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet } from "./types";

export const generateTechnicalSheet = async (dishName: string): Promise<TechnicalSheet> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const systemInstruction = `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS CON 20 AÑOS DE EXPERIENCIA. 
    INSTRUCCIÓN CRÍTICA: TODA LA RESPUESTA DEBE ESTAR EXCLUSIVAMENTE EN ESPAÑOL.
    - Mercado: Colombia (Precios actuales en COP).
    - Categorización de Ingredientes obligatoria: 'carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'.
    - Cálculo: Costo total x 3.3 para precio sugerido.
    - Formato: Retorna estrictamente JSON válido.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una ficha técnica gastronómica profesional detallada para el plato: "${dishName}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
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
                  category: { type: Type.STRING, enum: ['carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'] }
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
    if (!text) throw new Error("No text response");
    return JSON.parse(text) as TechnicalSheet;
  } catch (err: any) {
    console.error("Error in generateTechnicalSheet:", err);
    throw err;
  }
};

export const generateDishImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-end food photography, gourmet plating: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No image data found");
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (err) {
    console.warn("Image gen failed:", err);
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format";
  }
};
