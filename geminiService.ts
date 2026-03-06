
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TechnicalSheet } from "./types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isOverloaded = err.message?.includes("503") || err.message?.includes("overloaded") || err.message?.includes("UNAVAILABLE");
    if (isOverloaded && retries > 0) {
      await sleep(INITIAL_RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

  export const generateTechnicalSheet = async (dishName: string): Promise<TechnicalSheet> => {
  const apiKey = import.meta.env.GEMINI_API_KEY || '';         // ✅ Cambio 2
  const ai = new GoogleGenerativeAI(apiKey);                  // ✅ Cambio 3

  const systemInstruction = `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS PRO.
    TU OBJETIVO ES CREAR FICHAS TÉCNICAS CON CÁLCULO DE MERMA PROFESIONAL.
    - Mercado: Colombia (COP).
    - Merma: Estima un porcentaje de merma (wastePercentage) realista (ej: Proteínas 15-25%, Vegetales 10-20%, Secos 0%).
    - Fórmula de Subtotal Crítica: Subtotal = (amount * unitCost) / (1 - (wastePercentage / 100)).
    - Rendimiento: Por defecto rinde 4 porciones.
    - El totalCost es la suma de estos subtotales ajustados por merma.
    - Idioma: Español.
    - Formato: JSON estrictamente válido según el esquema proporcionado.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una ficha técnica profesional con análisis de merma para: "${dishName}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
                  wastePercentage: { type: Type.NUMBER },
                  subtotal: { type: Type.NUMBER },
                  category: { type: Type.STRING, enum: ['carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'] }
                },
                required: ["name", "amount", "unit", "unitCost", "wastePercentage", "subtotal", "category"]
              }
            },
            financials: {
              type: Type.OBJECT,
              properties: {
                totalCost: { type: Type.NUMBER },
                yieldPortions: { type: Type.NUMBER },
                costPerPortion: { type: Type.NUMBER },
                marginPercentage: { type: Type.NUMBER },
                suggestedPrice: { type: Type.NUMBER }
              },
              required: ["totalCost", "yieldPortions", "costPerPortion", "marginPercentage", "suggestedPrice"]
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
    if (!text) throw new Error("La API devolvió una respuesta vacía.");
    return JSON.parse(text) as TechnicalSheet;
  });
};

export const generateDishImage = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `Fotografía gastronómica profesional de alta gama, luz natural, fondo neutro: ${prompt}` }] 
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No se pudo generar la imagen.");
    return `data:image/png;base64,${part.inlineData.data}`;
  }).catch(() => "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format");
};
