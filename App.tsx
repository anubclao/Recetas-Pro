
import React, { useState } from 'react';
import { generateTechnicalSheet, generateDishImage } from './geminiService';
import { TechnicalSheet, Language } from './types';
import { 
  ChefHat, 
  Download, 
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
  ImageIcon,
  Loader2
} from 'lucide-react';

const translations = {
  es: {
    title: "CHEFMASTER",
    subtitle: "Gestión de Costos & Fichas Técnicas",
    placeholder: "Nombre del plato (ej. Posta Cartagenera)",
    generate: "Generar Ficha",
    generating: "Cocinando...",
    loadingText: "Analizando costos en COP...",
    optimizing: "Generando imagen y procesos...",
    welcome: "Panel de Control de Costos",
    welcomeDesc: "Cree fichas técnicas profesionales con precisión financiera y visual para su restaurante.",
    export: "Descargar PDF",
    suggestedPrice: "Precio Sugerido",
    costingTitle: "Estructura de Costos de Insumos",
    ingredient: "Ingrediente",
    amount: "Cantidad",
    unitCost: "Costo (g/ml)",
    subtotal: "Subtotal",
    totalCost: "Costo Total Unitario",
    foodCost: "Food Cost Target",
    margin: "Utilidad Bruta",
    markup: "Multiplicador (3.3x)",
    miseEnPlace: "Mise en Place",
    steps: "Proceso de Elaboración",
    plating: "Presentación y Estética",
    variants: "Variantes y Recomendaciones",
    allergens: "Mapa de Alérgenos",
    qc: "Control de Calidad (QC)",
    conservation: "Vida Útil",
    refrig: "Refrigeración",
    freeze: "Congelación",
    imagePrompt: "Concepto Visual de IA",
    error: "Error en la conexión. Intente con otro plato o verifique su conexión.",
    author: "Firma Chef Responsable",
    approval: "Firma Gerencia / Costos",
    imageLabel: "Visualización Sugerida",
    docHeader: "Documento Técnico Oficial",
    rev: "REV:",
    finalPriceLabel: "Final Cliente",
    footerText: "Precisión Gastronómica",
    prepPrefix: "Prep:"
  },
  en: {
    title: "CHEFMASTER",
    subtitle: "Cost Management & Technical Sheets",
    placeholder: "Dish name (e.g. Braised Short Ribs)",
    generate: "Generate Sheet",
    generating: "Cooking...",
    loadingText: "Analyzing COP costs...",
    optimizing: "Generating image and workflows...",
    welcome: "Cost Control Dashboard",
    welcomeDesc: "Create professional technical sheets with financial and visual precision for your restaurant.",
    export: "Download PDF",
    suggestedPrice: "Suggested Price",
    costingTitle: "Resource Costing Structure",
    ingredient: "Ingredient",
    amount: "Quantity",
    unitCost: "Cost (g/ml)",
    subtotal: "Subtotal",
    totalCost: "Total Unit Cost",
    foodCost: "Food Cost Target",
    margin: "Gross Utility",
    markup: "Multiplier (3.3x)",
    miseEnPlace: "Mise en Place",
    steps: "Preparation Workflow",
    plating: "Plating and Aesthetics",
    variants: "Variants & Chef Tips",
    allergens: "Allergen Map",
    qc: "Quality Control (QC)",
    conservation: "Shelf Life",
    refrig: "Refrigeration",
    freeze: "Freezing",
    imagePrompt: "AI Visual Concept",
    error: "Connection error. Please check your connection or try another dish.",
    author: "Executive Chef Signature",
    approval: "Management / Cost Approval",
    imageLabel: "Suggested Visualization",
    docHeader: "Official Technical Document",
    rev: "REV:",
    finalPriceLabel: "Final Customer",
    footerText: "Gastronomic Precision",
    prepPrefix: "Prep:"
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
      const data = await generateTechnicalSheet(dishName, lang);
      const imageUrl = await generateDishImage(data.dishName + " gourmet restaurant plating");
      setSheet({ ...data, imageUrl });
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('printable-area');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Ficha_Tecnica_${sheet?.dishName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf for a direct download
    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Fixed Header */}
      <header className="bg-slate-900 text-white py-4 px-4 no-print shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-amber-500" />
              <div>
                <h1 className="text-xl font-black leading-none">{t.title} <span className="text-[8px] bg-amber-500 text-slate-900 px-1 py-0.5 rounded italic">PRO</span></h1>
                <p className="text-[8px] uppercase font-bold text-slate-400 mt-0.5">{t.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={() => { setLang(lang === 'es' ? 'en' : 'es'); setSheet(null); }}
              className="md:hidden bg-slate-800 p-2 rounded-full"
            ><Globe className="w-4 h-4 text-amber-500" /></button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
            <button 
              onClick={() => { setLang(lang === 'es' ? 'en' : 'es'); setSheet(null); }}
              className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300"
            >
              <Globe className="w-3 h-3 text-amber-500" />
              {lang === 'es' ? 'English' : 'Español'}
            </button>

            <form onSubmit={handleGenerate} className="relative flex-1 group w-full">
              <input
                type="text"
                placeholder={t.placeholder}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-2 px-6 pl-10 focus:outline-none focus:border-amber-500 transition-all text-sm text-white"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] uppercase px-4 py-1.5 rounded-full shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t.generate}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto mt-6 px-4 w-full flex-1 mb-20 overflow-x-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Zap className="w-16 h-16 text-amber-500 animate-pulse mb-6" />
            <p className="text-xl font-black text-slate-800 italic">{t.loadingText}</p>
            <p className="text-sm font-medium mt-2">{t.optimizing}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 flex items-center gap-4 shadow-sm animate-in slide-in-from-left-4">
            <AlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-200">
            <UtensilsCrossed className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t.welcome}</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium px-6">{t.welcomeDesc}</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 no-print gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 uppercase">
                 ID: FT-{Math.floor(Math.random()*9000)+1000} | {t.rev} 2024
               </div>
               <button 
                  onClick={handleExportPDF}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 shadow-xl font-bold text-xs"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  {t.export}
                </button>
            </div>

            {/* PRINTABLE CARD */}
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200" id="printable-area">
              {/* Header */}
              <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col xl:flex-row justify-between gap-10">
                <div className="flex-1">
                  <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">{t.docHeader}</span>
                  <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 leading-none">{sheet.dishName}</h2>
                  <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                    <span className="flex items-center gap-2 border-r border-slate-700 pr-6"><UtensilsCrossed className="w-4 h-4 text-amber-500" /> {sheet.category}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> {t.prepPrefix} {sheet.prepTime}</span>
                  </div>
                  <p className="mt-8 text-slate-300 italic text-xl border-l-4 border-amber-500/50 pl-6 leading-relaxed">"{sheet.description}"</p>
                </div>

                <div className="flex flex-col md:flex-row xl:flex-col items-center xl:items-end gap-8 shrink-0">
                  <div className="bg-white/10 p-6 rounded-[2rem] text-center border border-white/10 w-full sm:min-w-[240px] shadow-2xl">
                    <p className="text-[10px] uppercase font-black text-amber-500 mb-2">{t.suggestedPrice}</p>
                    <p className="text-5xl font-black text-white tracking-tight">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-widest">COP | {t.finalPriceLabel}</p>
                  </div>
                  {sheet.imageUrl && (
                    <img 
                      src={sheet.imageUrl} 
                      alt={sheet.dishName} 
                      className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-[2rem] border-8 border-white shadow-2xl" 
                    />
                  )}
                </div>
              </div>

              {/* Data Body */}
              <div className="p-8 md:p-12 space-y-12">
                {/* Costing */}
                <div>
                  <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-100 pb-4">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{t.costingTitle}</h3>
                  </div>
                  <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                          <th className="px-6 py-5">{t.ingredient}</th>
                          <th className="px-6 py-5 text-right">{t.amount}</th>
                          <th className="px-6 py-5 text-right">{t.unitCost}</th>
                          <th className="px-6 py-5 text-right bg-slate-100/30">{t.subtotal}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sheet.ingredients.map((ing, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-800">{ing.name}</td>
                            <td className="px-6 py-4 text-right text-slate-600 font-medium">{ing.amount} {ing.unit}</td>
                            <td className="px-6 py-4 text-right text-slate-500 tabular-nums">${ing.unitCost.toLocaleString('es-CO')}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50/20">${ing.subtotal.toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white font-black">
                        <tr>
                          <td colSpan={3} className="px-6 py-6 text-right uppercase text-[10px] opacity-60 tracking-[0.2em]">{t.totalCost}</td>
                          <td className="px-6 py-6 text-right text-3xl text-amber-500">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] uppercase font-black text-emerald-600 mb-1">{t.foodCost}</p>
                      <p className="text-2xl font-black text-emerald-800">30.3%</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <p className="text-[10px] uppercase font-black text-blue-600 mb-1">{t.margin}</p>
                      <p className="text-2xl font-black text-blue-800">${(sheet.financials.suggestedPrice - sheet.financials.totalCost).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                      <p className="text-[10px] uppercase font-black text-amber-600 mb-1">{t.markup}</p>
                      <p className="text-2xl font-black text-amber-800">3.3x</p>
                    </div>
                  </div>
                </div>

                {/* Preparation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h3 className="text-2xl font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><Clock className="w-5 h-5" /> {t.miseEnPlace}</h3>
                    <ul className="space-y-4">
                      {sheet.miseEnPlace.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 font-medium text-slate-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-2xl font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5" /> {t.steps}</h3>
                    <div className="space-y-8">
                      {sheet.preparationSteps.map((s) => (
                        <div key={s.step} className="relative pl-12 border-l-2 border-slate-200 last:border-transparent pb-2">
                          <span className="absolute -left-[21px] top-0 bg-slate-900 text-white font-black w-10 h-10 flex items-center justify-center rounded-2xl text-xs">{s.step}</span>
                          <p className="text-lg font-bold text-slate-800 mb-2 leading-tight">{s.description}</p>
                          <div className="flex gap-4">
                            {s.temp && <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-400 flex items-center gap-1"><Thermometer className="w-3 h-3" /> {s.temp}</span>}
                            {s.time && <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Aesthetics & QC */}
                <div className="bg-slate-900 p-10 lg:p-16 rounded-[3rem] text-white grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-2">
                    <h3 className="text-3xl font-black text-amber-500 uppercase mb-8">{t.plating}</h3>
                    <p className="text-xl text-slate-300 italic mb-10 leading-relaxed">{sheet.plating}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/10">
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-slate-500 mb-4 tracking-widest">{t.variants}</h4>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{sheet.variants}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-slate-500 mb-4 tracking-widest">{t.allergens}</h4>
                        <div className="flex flex-wrap gap-2">
                          {sheet.allergens.map((alg, i) => (
                            <span key={i} className="text-[10px] font-black bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full border border-red-500/30 uppercase">{alg}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                    <h3 className="text-xl font-black text-emerald-400 uppercase mb-6">{t.qc}</h3>
                    <ul className="space-y-4 mb-10">
                      {sheet.qcChecklist.map((q, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {q}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-8 border-t border-white/10">
                      <h4 className="text-[10px] uppercase font-black text-slate-500 mb-4">{t.conservation}</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between bg-white/5 p-4 rounded-xl text-xs">
                          <span className="text-slate-400 uppercase font-black">{t.refrig}</span>
                          <span className="font-black">{sheet.conservation.refrigeration}</span>
                        </div>
                        <div className="flex justify-between bg-white/5 p-4 rounded-xl text-xs">
                          <span className="text-slate-400 uppercase font-black">{t.freeze}</span>
                          <span className="font-black">{sheet.conservation.freezing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures for PDF */}
                <div className="hidden sm:grid grid-cols-2 gap-32 mt-32 pt-16 border-t-2 border-slate-100 no-print">
                   <div className="text-center">
                     <div className="h-0.5 bg-slate-200 mb-6 mx-auto w-48"></div>
                     <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{t.author}</p>
                     <p className="text-xs font-black text-slate-900 uppercase">CHEFMASTER AI CERTIFIED</p>
                   </div>
                   <div className="text-center">
                     <div className="h-0.5 bg-slate-200 mb-6 mx-auto w-48"></div>
                     <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{t.approval}</p>
                     <p className="text-xs font-black text-slate-900 uppercase">OPERATIONS DEPT.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 text-center no-print">
        <div className="inline-flex items-center gap-3 bg-white px-8 py-3 rounded-full border border-slate-200 shadow-xl">
          <ChefHat className="w-5 h-5 text-amber-500" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
            © {new Date().getFullYear()} {t.title} | {t.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
