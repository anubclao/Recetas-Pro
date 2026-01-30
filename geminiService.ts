
import { GoogleGenAI, Type } from "@google/genai";
import { TechnicalSheet } from "./types";

/**
 * Generates a full technical sheet using gemini-3-flash-preview.
 * Structured JSON output is enforced via responseSchema.
 */
export const generateTechnicalSheet = async (dishName: string): Promise<TechnicalSheet> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `ERES UN CHEF EJECUTIVO Y DIRECTOR DE COSTOS CON 20 AÑOS DE EXPERIENCIA EN ALTA COCINA.
    TU OBJETIVO ES CREAR FICHAS TÉCNICAS PROFESIONALES Y PRECISAS.
    - Mercado: Colombia (Todos los precios deben estar en Pesos Colombianos COP).
    - El costo de los ingredientes debe ser realista según el mercado mayorista actual.
    - Rendimiento: Por defecto, asume que la receta rinde 4 porciones (yieldPortions: 4) a menos que la receta requiera algo distinto por naturaleza.
    - Cálculo de costos: 
        1. Calcula el totalCost (suma de subtotales de ingredientes).
        2. Calcula el costPerPortion (totalCost / yieldPortions).
        3. Sugerir un precio de venta (suggestedPrice) con un costo de alimento del 30% basado en el costPerPortion (costPerPortion * 3.33).
    - Categorización obligatoria de ingredientes: 'carne', 'vegetal', 'lacteo', 'fruta', 'grano', 'especia', 'liquido', 'pescado', 'huevo', 'otros'.
    - Idioma: Español.
    - Formato de respuesta: JSON estrictamente válido.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una ficha técnica profesional y detallada para el plato: "${dishName}"`,
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
  } catch (err: any) {
    console.error("Error crítico en Gemini:", err);
    throw new Error(err.message || "Error al generar la ficha técnica.");
  }
};

/**
 * Generates an image for the dish using gemini-2.5-flash-image.
 */
export const generateDishImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: `Fotografía gastronómica profesional de alta gama, luz natural de estudio, emplatado minimalista y elegante sobre vajilla artesanal: ${prompt}` }] 
      },
      config: { 
        imageConfig: { aspectRatio: "1:1" } 
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No se pudo generar la imagen del plato.");
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (err) {
    console.warn("Fallo en la generación de imagen, usando imagen de respaldo:", err);
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format";
  }
};
