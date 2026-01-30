
export interface Ingredient {
  name: string;
  amount: number; // Grams or ML
  unit: string;
  unitCost: number; // Cost per Gram/ML
  subtotal: number;
}

export interface Financials {
  totalCost: number;
  marginPercentage: number;
  suggestedPrice: number;
}

export interface TechnicalSheet {
  dishName: string;
  category: string;
  prepTime: string;
  description: string;
  ingredients: Ingredient[];
  financials: Financials;
  miseEnPlace: string[];
  preparationSteps: {
    step: number;
    description: string;
    temp?: string;
    time?: string;
  }[];
  plating: string;
  variants: string;
  allergens: string[];
  conservation: {
    refrigeration: string;
    freezing: string;
  };
  qcChecklist: string[];
  imagePrompt: string;
  imageUrl?: string;
}

export type Language = 'es' | 'en';
