
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
  Loader2,
  ChevronRight
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
    exporting: "Generando...",
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
    prepPrefix: "Preparación:",
    scrollHint: "Deslice para ver más"
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
    exporting: "Generating...",
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
    prepPrefix: "Prep:",
    scrollHint: "Scroll to see more"
  }
};

const App: React.FC = () => {
  const [dishName, setDishName] = useState('');
  const [lang, setLang] = useState<Language>('es');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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
      const imageUrl = await generateDishImage(data.dishName + " high-end restaurant food photography");
      setSheet({ ...data, imageUrl });
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('printable-area');
    if (!element || !sheet) return;

    setExporting(true);
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `ChefMaster_${sheet.dishName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          windowWidth: 1200 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF Generation error:", err);
      alert(lang === 'es' ? "Error al generar el PDF. Intente nuevamente." : "Error generating PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <header className="bg-slate-900 text-white py-4 px-4 no-print shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                <ChefHat className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl lg:text-2xl font-black leading-none flex items-center gap-2">
                  {t.title} <span className="text-[8px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-black italic">PRO</span>
                </h1>
                <p className="text-[9px] uppercase font-bold text-slate-400 mt-0.5 tracking-tighter">{t.subtitle}</p>
              </div>
            </div>
            <button 
              onClick={() => { setLang(lang === 'es' ? 'en' : 'es'); setSheet(null); }}
              className="md:hidden flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-[10px] font-black uppercase text-slate-300"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
            <button 
              onClick={() => { setLang(lang === 'es' ? 'en' : 'es'); setSheet(null); }}
              className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 px-5 py-2.5 rounded-full hover:bg-slate-700 transition-all text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'es' ? 'English Version' : 'Versión Española'}
            </button>

            <form onSubmit={handleGenerate} className="relative flex-1 group w-full">
              <input
                type="text"
                placeholder={t.placeholder}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-2.5 px-6 pl-11 focus:outline-none focus:border-amber-500 transition-all text-sm text-white placeholder-slate-500"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] uppercase px-5 py-1.5 rounded-full shadow-lg disabled:opacity-50 transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.generate}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6 px-4 w-full flex-1 mb-20 overflow-x-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="relative mb-8">
              <Zap className="w-20 h-20 text-amber-500 animate-pulse" />
              <Loader2 className="w-24 h-24 text-amber-200 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
            </div>
            <p className="text-2xl font-black text-slate-800 italic text-center">{t.loadingText}</p>
            <p className="text-sm font-medium mt-3 text-slate-500">{t.optimizing}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 flex items-center gap-5 shadow-lg animate-in slide-in-from-left-4">
            <AlertTriangle className="text-red-500 w-8 h-8 shrink-0" />
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-200 px-6">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
              <UtensilsCrossed className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">{t.welcome}</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">{t.welcomeDesc}</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4">
               <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 bg-white px-5 py-2.5 rounded-full border border-slate-200 uppercase shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 ID: FT-{Math.floor(Math.random()*9000)+1000} | {t.rev} 2024
               </div>
               <button 
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 font-black text-xs disabled:opacity-70 active:scale-95"
                >
                  {exporting ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-amber-500" /> {t.exporting}</>
                  ) : (
                    <><Download className="w-4 h-4 text-amber-500" /> {t.export}</>
                  )}
                </button>
            </div>

            <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200" id="printable-area">
              <div className="bg-slate-900 p-8 md:p-14 text-white flex flex-col lg:flex-row justify-between gap-12 border-b-8 border-amber-500">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.5em]">{t.docHeader}</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black uppercase mb-6 leading-tight tracking-tighter">{sheet.dishName}</h2>
                  <div className="flex flex-wrap items-center gap-6 lg:gap-10 text-slate-400 font-black text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-3 border-r border-slate-700 pr-10 py-1"><UtensilsCrossed className="w-5 h-5 text-amber-500" /> {sheet.category}</span>
                    <span className="flex items-center gap-3 py-1"><Clock className="w-5 h-5 text-amber-500" /> {t.prepPrefix} {sheet.prepTime}</span>
                  </div>
                  <p className="mt-10 text-slate-300 italic text-xl md:text-2xl border-l-8 border-amber-500/30 pl-8 leading-relaxed max-w-4xl py-2">
                    "{sheet.description}"
                  </p>
                </div>

                <div className="flex flex-col md:flex-row lg:flex-col items-center lg:items-end gap-10 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] text-center border border-white/10 w-full sm:min-w-[300px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl -mr-10 -mt-10" />
                    <p className="text-[10px] lg:text-xs uppercase font-black text-amber-500 mb-3 tracking-widest">{t.suggestedPrice}</p>
                    <p className="text-5xl md:text-7xl font-black text-white tracking-tighter">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                    <div className="h-0.5 bg-amber-500/30 w-12 mx-auto my-4 rounded-full" />
                    <p className="text-[10px] lg:text-xs uppercase font-bold text-slate-500 tracking-[0.2em]">COP | {t.finalPriceLabel}</p>
                  </div>
                  {sheet.imageUrl && (
                    <div className="relative group">
                      <img 
                        src={sheet.imageUrl} 
                        alt={sheet.dishName} 
                        className="w-56 h-56 md:w-72 md:h-72 object-cover rounded-[3rem] border-8 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute -bottom-4 -right-4 bg-amber-500 p-4 rounded-2xl shadow-xl border-4 border-white">
                        <ImageIcon className="w-6 h-6 text-slate-900" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 md:p-14 space-y-16">
                <div>
                  <div className="flex items-center justify-between mb-8 border-b-4 border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-2xl">
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{t.costingTitle}</h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase italic">
                      <ChevronRight className="w-4 h-4" /> {t.scrollHint}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                      <thead className="bg-slate-50 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-100">
                        <tr>
                          <th className="px-8 py-6">{t.ingredient}</th>
                          <th className="px-8 py-6 text-right">{t.amount}</th>
                          <th className="px-8 py-6 text-right">{t.unitCost}</th>
                          <th className="px-8 py-6 text-right bg-slate-100/40">{t.subtotal}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sheet.ingredients.map((ing, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800 text-lg">{ing.name}</td>
                            <td className="px-8 py-6 text-right text-slate-600 font-bold text-base">{ing.amount} {ing.unit}</td>
                            <td className="px-8 py-6 text-right text-slate-500 tabular-nums font-medium">${ing.unitCost.toLocaleString('es-CO')}</td>
                            <td className="px-8 py-6 text-right font-black text-slate-900 bg-slate-50/20 tabular-nums text-lg group-hover:bg-slate-100/50 transition-colors">${ing.subtotal.toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white font-black">
                        <tr>
                          <td colSpan={3} className="px-8 py-8 text-right uppercase text-xs opacity-50 tracking-[0.3em] font-black">{t.totalCost}</td>
                          <td className="px-8 py-8 text-right text-3xl md:text-4xl text-amber-500 tracking-tighter">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                    <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 -mr-8 -mt-8" />
                      <p className="text-[10px] uppercase font-black text-emerald-600 mb-2 tracking-widest">{t.foodCost}</p>
                      <p className="text-3xl font-black text-emerald-800">30.3%</p>
                    </div>
                    <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-blue-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rotate-45 -mr-8 -mt-8" />
                      <p className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">{t.margin}</p>
                      <p className="text-3xl font-black text-blue-800">${(sheet.financials.suggestedPrice - sheet.financials.totalCost).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rotate-45 -mr-8 -mt-8" />
                      <p className="text-[10px] uppercase font-black text-amber-600 mb-2 tracking-widest">{t.markup}</p>
                      <p className="text-3xl font-black text-amber-800">3.3x</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="bg-amber-500 text-white p-3 rounded-2xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{t.miseEnPlace}</h3>
                    </div>
                    <ul className="space-y-6">
                      {sheet.miseEnPlace.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-5 font-bold text-slate-700 text-lg leading-snug">
                          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2.5 shrink-0 shadow-sm" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  
                  <section>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{t.steps}</h3>
                    </div>
                    <div className="space-y-12">
                      {sheet.preparationSteps.map((s) => (
                        <div key={s.step} className="relative pl-16 border-l-4 border-slate-100 last:border-transparent pb-4">
                          <span className="absolute -left-[30px] top-0 bg-slate-900 text-white font-black w-14 h-14 flex items-center justify-center rounded-[1.2rem] text-lg shadow-2xl shadow-slate-900/20 border-4 border-white">
                            {s.step}
                          </span>
                          <p className="text-xl md:text-2xl font-black text-slate-900 mb-4 leading-tight">{s.description}</p>
                          <div className="flex flex-wrap gap-4">
                            {s.temp && (
                              <span className="text-[10px] font-black uppercase bg-slate-100 px-5 py-2 rounded-full text-slate-500 flex items-center gap-2 border border-slate-200">
                                <Thermometer className="w-4 h-4 text-red-500" /> {s.temp}
                              </span>
                            )}
                            {s.time && (
                              <span className="text-[10px] font-black uppercase bg-slate-100 px-5 py-2 rounded-full text-slate-500 flex items-center gap-2 border border-slate-200">
                                <Clock className="w-4 h-4 text-indigo-500" /> {s.time}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="bg-slate-900 p-10 md:p-16 rounded-[4rem] text-white grid grid-cols-1 lg:grid-cols-3 gap-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
                  <div className="lg:col-span-2 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-2 h-10 bg-amber-500 rounded-full" />
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{t.plating}</h3>
                    </div>
                    <p className="text-2xl text-slate-300 italic mb-14 leading-relaxed font-medium">"{sheet.plating}"</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-slate-500 mb-5 tracking-[0.3em]">{t.variants}</h4>
                        <p className="text-base text-slate-400 font-medium leading-relaxed">{sheet.variants}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-slate-500 mb-5 tracking-[0.3em]">{t.allergens}</h4>
                        <div className="flex flex-wrap gap-3">
                          {sheet.allergens.map((alg, i) => (
                            <span key={i} className="text-[10px] font-black bg-red-500/20 text-red-400 px-5 py-2 rounded-full border border-red-500/30 uppercase tracking-tighter">{alg}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-3xl relative z-10">
                    <h3 className="text-2xl font-black text-emerald-400 uppercase mb-8 tracking-tighter flex items-center gap-3">
                      <CheckCircle2 className="w-7 h-7" /> {t.qc}
                    </h3>
                    <ul className="space-y-6 mb-12">
                      {sheet.qcChecklist.map((q, i) => (
                        <li key={i} className="flex items-start gap-4 text-base text-slate-300 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" /> {q}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-10 border-t border-white/10">
                      <h4 className="text-[10px] uppercase font-black text-slate-500 mb-6 tracking-[0.2em]">{t.conservation}</h4>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                          <span className="text-slate-400 uppercase font-black text-[10px]">{t.refrig}</span>
                          <span className="font-black text-white">{sheet.conservation.refrigeration}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                          <span className="text-slate-400 uppercase font-black text-[10px]">{t.freeze}</span>
                          <span className="font-black text-white">{sheet.conservation.freezing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-2 gap-40 mt-40 pt-20 border-t-4 border-slate-100 no-print">
                   <div className="text-center">
                     <div className="h-1 bg-slate-300 mb-8 mx-auto w-72 rounded-full" />
                     <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] mb-2">{t.author}</p>
                     <p className="text-sm font-black text-slate-900 uppercase tracking-widest">CHEFMASTER AI CERTIFIED</p>
                   </div>
                   <div className="text-center">
                     <div className="h-1 bg-slate-300 mb-8 mx-auto w-72 rounded-full" />
                     <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.4em] mb-2">{t.approval}</p>
                     <p className="text-sm font-black text-slate-900 uppercase tracking-widest">OPERATIONS MANAGEMENT</p>
                   </div>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-slate-400 no-print max-w-2xl mx-auto px-6 font-medium">
              Este documento es una estimación generada por IA profesional. Los costos deben ser validados por el departamento de compras y finanzas del establecimiento.
            </p>
          </div>
        )}
      </main>

      <footer className="py-16 text-center no-print">
        <div className="inline-flex items-center gap-4 bg-white px-10 py-4 rounded-full border border-slate-200 shadow-2xl shadow-slate-200/50 group hover:border-amber-500 transition-colors">
          <div className="bg-slate-100 p-2 rounded-full group-hover:bg-amber-100 transition-colors">
            <ChefHat className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">
            © {new Date().getFullYear()} {t.title} | {t.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
