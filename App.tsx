
import React, { useState } from 'react';
import { generateTechnicalSheet, generateDishImage } from './geminiService';
import { TechnicalSheet, Language } from './types';
import { 
  ChefHat, 
  Printer, 
  Search, 
  DollarSign, 
  Clock, 
  UtensilsCrossed, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Thermometer,
  Zap,
  Globe,
  ImageIcon
} from 'lucide-react';

const translations = {
  es: {
    title: "CHEFMASTER",
    subtitle: "Gestión de Costos & Fichas Técnicas Gastronómicas",
    placeholder: "Nombre del plato (ej. Posta Cartagenera)",
    generate: "Generar",
    generating: "Generando...",
    loadingText: "Calculando costos de mercado en Colombia...",
    optimizing: "Optimizando rentabilidad y mise en place...",
    welcome: "Bienvenido, Chef",
    welcomeDesc: "Ingrese el nombre de un plato para generar una ficha técnica profesional con costeo detallado y procesos de cocina industrial.",
    export: "Exportar a PDF",
    suggestedPrice: "Precio Sugerido",
    costingTitle: "Costeo Detallado de Insumos",
    ingredient: "Ingrediente",
    amount: "Gramaje/Cantidad",
    unitCost: "Costo Unitario (g/ml)",
    subtotal: "Subtotal",
    totalCost: "Costo Total del Plato",
    foodCost: "Food Cost %",
    margin: "Margen de Contribución",
    markup: "Multiplicador (Markup)",
    miseEnPlace: "Mise en Place",
    steps: "Preparación Paso a Paso",
    plating: "Montaje y Estética",
    variants: "Variantes & Tips",
    allergens: "Alérgenos (SISO)",
    qc: "QC Checklist",
    conservation: "Conservación",
    refrig: "Refrigeración",
    freeze: "Congelación",
    imagePrompt: "Prompt Publicitario Sugerido (Midjourney/DALL-E)",
    error: "Ocurrió un error al generar la ficha técnica. Por favor intenta de nuevo.",
    author: "Chef Ejecutivo / Autor",
    approval: "Aprobación Costos & Finanzas",
    imageLabel: "Imagen Generada por IA"
  },
  en: {
    title: "CHEFMASTER",
    subtitle: "Cost Management & Gastronomic Technical Sheets",
    placeholder: "Dish name (e.g. Colombian Braised Beef)",
    generate: "Generate",
    generating: "Generating...",
    loadingText: "Calculating market costs in Colombia...",
    optimizing: "Optimizing profitability and mise en place...",
    welcome: "Welcome, Chef",
    welcomeDesc: "Enter the name of a dish to generate a professional technical sheet with detailed costing and industrial kitchen processes.",
    export: "Export to PDF",
    suggestedPrice: "Suggested Price",
    costingTitle: "Detailed Resource Costing",
    ingredient: "Ingredient",
    amount: "Weight/Quantity",
    unitCost: "Unit Cost (g/ml)",
    subtotal: "Subtotal",
    totalCost: "Total Plate Cost",
    foodCost: "Food Cost %",
    margin: "Contribution Margin",
    markup: "Multiplier (Markup)",
    miseEnPlace: "Mise en Place",
    steps: "Step-by-Step Preparation",
    plating: "Plating and Aesthetics",
    variants: "Variants & Tips",
    allergens: "Allergens (SISO)",
    qc: "QC Checklist",
    conservation: "Conservation",
    refrig: "Refrigeration",
    freeze: "Freezing",
    imagePrompt: "Suggested Advertising Prompt (Midjourney/DALL-E)",
    error: "An error occurred while generating the sheet. Please try again.",
    author: "Executive Chef / Author",
    approval: "Cost & Finance Approval",
    imageLabel: "AI Generated Image"
  }
};

const App: React.FC = () => {
  const [dishName, setDishName] = useState('');
  const [lang, setLang] = useState<Language>('es');
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<TechnicalSheet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // 1. Generate text data
      const data = await generateTechnicalSheet(dishName, lang);
      
      // 2. Generate image based on the dish name and description
      const imageUrl = await generateDishImage(data.dishName + " " + data.description);
      
      setSheet({ ...data, imageUrl });
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <header className="bg-slate-900 text-white py-8 px-4 no-print shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-3 rounded-lg shadow-inner">
              <ChefHat className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.title} <span className="text-amber-500 italic">PRO</span></h1>
              <p className="text-slate-400 text-sm font-medium">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-2xl">
            <button 
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full hover:bg-slate-700 transition-all text-xs font-bold uppercase tracking-widest text-slate-300"
            >
              <Globe className="w-4 h-4 text-amber-500" />
              {lang === 'es' ? 'English' : 'Español'}
            </button>

            <form onSubmit={handleGenerate} className="relative flex-1 group w-full">
              <input
                type="text"
                placeholder={t.placeholder}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-3 px-6 pl-12 focus:outline-none focus:border-amber-500 transition-all text-white placeholder-slate-500"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {loading ? t.generating : t.generate}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 px-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
            <Zap className="w-16 h-16 mb-4 text-amber-500 animate-bounce" />
            <p className="text-xl font-medium italic">{t.loadingText}</p>
            <p className="text-sm">{t.optimizing}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl text-slate-800 mb-2">{t.welcome}</h2>
            <p className="text-slate-500 max-w-md mx-auto">{t.welcomeDesc}</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center no-print">
              <span className="text-slate-500 font-mono text-xs tracking-widest uppercase">ID: FT-{Math.floor(Math.random()*10000)} | Rev: 01</span>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t.export}
              </button>
            </div>

            <div className="p-8 md:p-12" id="printable-area">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-8 mb-10 gap-8">
                <div className="flex-1">
                  <h2 className="text-4xl font-extrabold text-slate-900 uppercase mb-2 leading-tight">{sheet.dishName}</h2>
                  <p className="text-slate-500 font-medium text-lg uppercase tracking-wide">{sheet.category} | {t.steps}: {sheet.prepTime}</p>
                  <p className="mt-4 text-slate-700 italic border-l-4 border-amber-500 pl-4 py-1 text-lg leading-relaxed">"{sheet.description}"</p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-slate-900 text-white p-6 rounded-lg text-center min-w-[200px] shadow-lg">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{t.suggestedPrice}</p>
                    <p className="text-4xl font-black text-amber-500">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                    <p className="text-[10px] opacity-50 mt-2 uppercase">COP - {lang === 'es' ? 'Redondeado' : 'Rounded'}</p>
                  </div>
                  {sheet.imageUrl && (
                    <div className="relative group">
                      <img 
                        src={sheet.imageUrl} 
                        alt={sheet.dishName} 
                        className="w-48 h-48 object-cover rounded-lg border-4 border-white shadow-xl rotate-2 group-hover:rotate-0 transition-all duration-300" 
                      />
                      <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 p-1.5 rounded-full shadow-lg">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Costing Grid */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">{t.costingTitle}</h3>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-6 py-4">{t.ingredient}</th>
                        <th className="px-6 py-4 text-right">{t.amount}</th>
                        <th className="px-6 py-4 text-right">{t.unitCost}</th>
                        <th className="px-6 py-4 text-right">{t.subtotal}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.ingredients.map((ing, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-800">{ing.name}</td>
                          <td className="px-6 py-3 text-right text-slate-600">{ing.amount} {ing.unit}</td>
                          <td className="px-6 py-3 text-right text-slate-600">${ing.unitCost.toLocaleString('es-CO')}</td>
                          <td className="px-6 py-3 text-right font-semibold text-slate-900">${ing.subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white font-bold">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right uppercase tracking-wider">{t.totalCost}</td>
                        <td className="px-6 py-4 text-right text-xl text-amber-500">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <p className="text-xs uppercase text-emerald-600 font-bold mb-1">{t.foodCost}</p>
                    <p className="text-2xl font-bold text-emerald-700">30.3%</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs uppercase text-blue-600 font-bold mb-1">{t.margin}</p>
                    <p className="text-2xl font-bold text-blue-700">${(sheet.financials.suggestedPrice - sheet.financials.totalCost).toLocaleString('es-CO')}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 col-span-2 md:col-span-1">
                    <p className="text-xs uppercase text-purple-600 font-bold mb-1">{t.markup}</p>
                    <p className="text-2xl font-bold text-purple-700">3.3x</p>
                  </div>
                </div>
              </div>

              {/* Technical Procedures */}
              <div className="grid md:grid-cols-2 gap-12 mb-12">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter border-b border-slate-200 pb-2 w-full">{t.miseEnPlace}</h3>
                  </div>
                  <ul className="space-y-3">
                    {sheet.miseEnPlace.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 leading-tight">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter border-b border-slate-200 pb-2 w-full">{t.steps}</h3>
                  </div>
                  <div className="space-y-6">
                    {sheet.preparationSteps.map((step) => (
                      <div key={step.step} className="relative pl-10">
                        <span className="absolute left-0 top-0 bg-slate-100 text-slate-500 font-bold w-7 h-7 flex items-center justify-center rounded-full text-sm">
                          {step.step}
                        </span>
                        <p className="text-slate-800 font-medium mb-1">{step.description}</p>
                        {(step.temp || step.time) && (
                          <div className="flex gap-4 text-xs text-slate-500 uppercase font-semibold">
                            {step.temp && <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> {step.temp}</span>}
                            {step.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {step.time}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Plating and Quality Control */}
              <div className="bg-slate-900 text-white rounded-xl p-8 grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-amber-500 uppercase mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5" /> {t.plating}
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-lg italic">{sheet.plating}</p>
                  
                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">{t.variants}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{sheet.variants}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">{t.allergens}</h4>
                      <div className="flex flex-wrap gap-2">
                        {sheet.allergens.map((alg, idx) => (
                          <span key={idx} className="bg-red-900/40 text-red-200 text-[10px] px-2 py-0.5 rounded border border-red-800/50 uppercase font-bold tracking-tighter">
                            {alg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-bold text-amber-500 uppercase mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {t.qc}
                  </h3>
                  <ul className="space-y-4">
                    {sheet.qcChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-xs uppercase text-slate-500 font-bold mb-3">{t.conservation}</h4>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase">{t.refrig}:</span>
                        <span className="text-white font-semibold">{sheet.conservation.refrigeration}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase">{t.freeze}:</span>
                        <span className="text-white font-semibold">{sheet.conservation.freezing}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Image Prompt Footer */}
              <div className="mt-12 pt-8 border-t border-slate-100 no-print">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-4 items-center">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Search className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">{t.imagePrompt}</h4>
                    <p className="text-sm text-amber-900 font-mono bg-white/50 p-2 rounded border border-amber-200 mt-2">
                      {sheet.imagePrompt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Section for Print */}
              <div className="mt-20 pt-10 border-t border-slate-200 hidden print:grid grid-cols-2 gap-10">
                <div className="text-center">
                  <div className="border-t border-slate-400 w-48 mx-auto mt-10"></div>
                  <p className="text-xs uppercase text-slate-500 font-bold mt-2">{t.author}</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 w-48 mx-auto mt-10"></div>
                  <p className="text-xs uppercase text-slate-500 font-bold mt-2">{t.approval}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-slate-400 text-xs no-print">
        <p>© {new Date().getFullYear()} ChefMaster Pro | Software de Gestión Gastronómica de Alta Precisión</p>
      </footer>
    </div>
  );
};

export default App;
