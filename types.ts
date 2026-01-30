
export interface Ingredient {
  name: string;
  amount: number; // Gramos o ML
  unit: string;
  unitCost: number; // Costo por Gramo/ML
  subtotal: number;
  category: 'carne' | 'vegetal' | 'lacteo' | 'fruta' | 'grano' | 'especia' | 'liquido' | 'pescado' | 'huevo' | 'otros';
}

export interface Financials {
  totalCost: number;
  marginPercentage: number;
  suggestedPrice: number;
  yieldPortions: number;
  costPerPortion: number;
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
