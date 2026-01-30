
import React, { useState } from 'react';
import { generateTechnicalSheet, generateDishImage } from './geminiService';
import { TechnicalSheet, Ingredient } from './types';
import { 
  ChefHat, 
  Download, 
  Search, 
  DollarSign, 
  Clock, 
  UtensilsCrossed, 
  AlertTriangle,
  FileText,
  Zap,
  Loader2,
  Beef,
  Carrot,
  Milk,
  Apple,
  Wheat,
  Droplets,
  Fish,
  Egg,
  Leaf,
  CircleDashed,
  RefreshCw,
  Info,
  Users
} from 'lucide-react';

const IngredientIcon: React.FC<{ category: Ingredient['category'] }> = ({ category }) => {
  const baseClass = "w-5 h-5";
  switch (category) {
    case 'carne': return <Beef className={`${baseClass} text-red-600`} />;
    case 'vegetal': return <Carrot className={`${baseClass} text-emerald-600`} />;
    case 'lacteo': return <Milk className={`${baseClass} text-blue-500`} />;
    case 'fruta': return <Apple className={`${baseClass} text-rose-500`} />;
    case 'grano': return <Wheat className={`${baseClass} text-amber-600`} />;
    case 'especia': return <Leaf className={`${baseClass} text-green-700`} />;
    case 'liquido': return <Droplets className={`${baseClass} text-sky-500`} />;
    case 'pescado': return <Fish className={`${baseClass} text-cyan-600`} />;
    case 'huevo': return <Egg className={`${baseClass} text-yellow-600`} />;
    default: return <CircleDashed className={`${baseClass} text-slate-400`} />;
  }
};

const getCategoryBg = (category: Ingredient['category']) => {
  switch (category) {
    case 'carne': return 'bg-red-50';
    case 'vegetal': return 'bg-emerald-50';
    case 'lacteo': return 'bg-blue-50';
    case 'fruta': return 'bg-rose-50';
    case 'grano': return 'bg-amber-50';
    case 'especia': return 'bg-green-50';
    case 'liquido': return 'bg-sky-50';
    case 'pescado': return 'bg-cyan-50';
    case 'huevo': return 'bg-yellow-50';
    default: return 'bg-slate-50';
  }
};

const App: React.FC = () => {
  const [dishName, setDishName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sheet, setSheet] = useState<TechnicalSheet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    setError(null);
    setSheet(null);
    
    try {
      const data = await generateTechnicalSheet(dishName);
      const imageUrl = await generateDishImage(data.imagePrompt || data.dishName);
      setSheet({ ...data, imageUrl });
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Error al procesar la solicitud. Por favor, intente de nuevo.");
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
        filename: `ChefMaster_Ficha_${sheet.dishName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("Export error:", err);
      alert("Hubo un problema al generar el archivo PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-slate-900 text-white py-4 px-6 shadow-2xl sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-amber-500 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/20">
              <ChefHat className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                ChefMaster <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Ingeniería de Alta Rentabilidad</p>
            </div>
          </div>
          
          <form onSubmit={handleGenerate} className="relative flex-1 w-full md:max-w-2xl">
            <input
              type="text"
              placeholder="¿Qué plato vamos a costear hoy?"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-3.5 px-8 pl-14 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-white placeholder-slate-500 shadow-inner"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              disabled={loading}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <button
              type="submit"
              disabled={loading || !dishName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs px-8 py-2.5 rounded-full uppercase tracking-tighter shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "GENERAR FICHA"}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-10 px-6 w-full flex-1 mb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
            <div className="relative mb-12">
               <Zap className="w-24 h-24 text-amber-500 animate-pulse" />
               <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tight mb-4 uppercase">Diseñando Técnica Maestra...</h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">Calculando gramajes, redactando pasos técnicos y analizando la rentabilidad óptima en COP.</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white border-2 border-red-100 p-12 rounded-[3rem] shadow-2xl mb-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-red-50 p-6 rounded-full mb-8">
              <AlertTriangle className="text-red-500 w-16 h-16" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Error de Sistema</h2>
            <p className="text-slate-500 mb-10 max-w-lg leading-relaxed">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-12 py-4 rounded-full font-black text-xs flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
              <RefreshCw className="w-5 h-5 text-amber-500" /> REINTENTAR AHORA
            </button>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-40 bg-white rounded-[4rem] shadow-sm border border-slate-200 px-10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <UtensilsCrossed className="w-20 h-20 text-slate-100 mx-auto mb-10 rotate-12 transition-transform duration-1000 group-hover:rotate-45" />
              <h2 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Ingeniería Gastronómica</h2>
              <p className="text-slate-400 max-w-lg mx-auto text-xl font-medium leading-relaxed italic">
                "La cocina es un arte, pero un restaurante rentable es una ciencia exacta."
                <br />
                <span className="text-slate-300 block mt-6 text-sm font-black uppercase tracking-[0.2em]">— Introduce un nombre para comenzar —</span>
              </p>
            </div>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 no-print gap-6">
               <div className="flex items-center gap-4 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 Ficha Técnica Verificada
               </div>
               <button 
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="bg-slate-900 text-white px-12 py-4 rounded-full hover:bg-slate-800 transition-all font-black text-xs flex items-center gap-3 shadow-2xl shadow-slate-900/30 active:scale-95 disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {exporting ? "GENERANDO PDF..." : "EXPORTAR PDF PROFESIONAL"}
                </button>
            </div>

            <article className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200" id="printable-area">
              <div className="bg-slate-900 p-12 md:p-20 text-white border-b-[16px] border-amber-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row justify-between gap-16 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                       <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Documento Técnico Maestro</span>
                       <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleDateString('es-CO')}</span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black uppercase mb-8 leading-[0.9] tracking-tighter">{sheet.dishName}</h2>
                    <div className="flex flex-wrap gap-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-3 border-r border-slate-700 pr-10">
                        <UtensilsCrossed className="w-5 h-5 text-amber-500" /> {sheet.category}
                      </span>
                      <span className="flex items-center gap-3 border-r border-slate-700 pr-10">
                        <Clock className="w-5 h-5 text-amber-500" /> {sheet.prepTime}
                      </span>
                      <span className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-amber-500" /> {sheet.financials.yieldPortions} Pax
                      </span>
                    </div>
                    <p className="mt-12 text-slate-300 italic text-2xl leading-relaxed max-w-3xl border-l-4 border-amber-500/30 pl-10">"{sheet.description}"</p>
                  </div>
                  
                  <div className="flex flex-col items-center lg:items-end gap-12">
                    <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] text-center min-w-[320px] border border-white/10 shadow-inner">
                      <p className="text-[11px] uppercase font-black text-amber-500 mb-4 tracking-[0.2em]">PVP Sugerido (COP)</p>
                      <div className="flex items-start justify-center gap-1">
                         <span className="text-2xl font-black text-amber-500 mt-2">$</span>
                         <p className="text-7xl font-black tracking-tighter">{sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                         <span>Alimento: 30%</span>
                         <span>Margen Sugerido</span>
                      </div>
                    </div>
                    {sheet.imageUrl && (
                      <div className="relative group">
                        <img src={sheet.imageUrl} className="w-64 h-64 object-cover rounded-[3.5rem] border-[12px] border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105" alt={sheet.dishName} />
                        <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full z-0 group-hover:bg-amber-500/30 transition-all duration-700"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-12 md:p-20">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-black uppercase flex items-center gap-4">
                    <DollarSign className="w-10 h-10 text-emerald-600 bg-emerald-50 p-2 rounded-2xl" /> Desglose Financiero
                  </h3>
                  <div className="bg-slate-50 px-6 py-2.5 rounded-full flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                    <Info className="w-4 h-4" /> Valores Ref. Mercado Colombia
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-[3rem] border border-slate-100 shadow-sm mb-20 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[11px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-10 py-7">Insumo Seleccionado</th>
                        <th className="px-10 py-7 text-right">Cant. Neto</th>
                        <th className="px-10 py-7 text-right">Costo Unit.</th>
                        <th className="px-10 py-7 text-right">Subtotal Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sheet.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-5">
                              <div className={`p-2.5 rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${getCategoryBg(ing.category)}`}>
                                <IngredientIcon category={ing.category} />
                              </div>
                              <span className="font-bold text-slate-900 text-lg">{ing.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-7 text-right font-black text-slate-400">{ing.amount} <span className="text-[10px]">{ing.unit}</span></td>
                          <td className="px-10 py-7 text-right font-medium text-slate-400 text-sm">${ing.unitCost.toLocaleString('es-CO')}</td>
                          <td className="px-10 py-7 text-right font-black text-slate-900 text-xl">${ing.subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-4 border-slate-200">
                      <tr className="border-b border-slate-100">
                        <td colSpan={3} className="px-10 py-6 text-right uppercase text-[10px] font-black text-slate-500 tracking-[0.3em]">Costo Total de Receta ({sheet.financials.yieldPortions} Pax)</td>
                        <td className="px-10 py-6 text-right text-2xl font-black text-slate-500 bg-white border-l-4 border-slate-50">
                           <span className="mr-2 text-lg">$</span>{sheet.financials.totalCost.toLocaleString('es-CO')}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-10 py-8 text-right uppercase text-xs font-black text-slate-900 tracking-[0.3em]">Costo de Producción por Porción (Unidad)</td>
                        <td className="px-10 py-8 text-right text-4xl font-black text-slate-900 bg-white border-l-4 border-slate-50">
                           <span className="text-emerald-600 mr-2 text-2xl">$</span>{sheet.financials.costPerPortion.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   <div className="space-y-16">
                      <div>
                        <h3 className="text-2xl font-black uppercase flex items-center gap-4 mb-12"><FileText className="w-8 h-8 text-indigo-500" /> Método de Preparación</h3>
                        <div className="space-y-12">
                          {sheet.preparationSteps.map(s => (
                            <div key={s.step} className="flex gap-8 relative">
                              <div className="flex flex-col items-center">
                                <span className="bg-slate-900 text-white w-12 h-12 shrink-0 flex items-center justify-center rounded-[1.25rem] font-black text-lg shadow-xl relative z-10 transition-transform hover:scale-110">{s.step}</span>
                                <div className="w-0.5 h-full bg-slate-100 absolute top-12"></div>
                              </div>
                              <div className="pb-4">
                                <p className="text-slate-800 font-bold text-xl leading-snug mb-4">{s.description}</p>
                                <div className="flex gap-3">
                                  {s.temp && <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full uppercase border border-rose-100 tracking-wider shadow-sm">{s.temp}</span>}
                                  {s.time && <span className="text-[10px] font-black bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full uppercase border border-sky-100 tracking-wider shadow-sm">{s.time}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-rose-50/50 p-12 rounded-[4rem] border-2 border-rose-100/30">
                        <h3 className="text-xl font-black uppercase text-rose-900 mb-8 flex items-center gap-4">
                           <AlertTriangle className="w-7 h-7" /> Alérgenos & Seguridad
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {sheet.allergens.map((a, i) => (
                            <span key={i} className="bg-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase text-rose-700 border border-rose-100 shadow-sm tracking-widest">{a}</span>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-16">
                      <div className="bg-slate-900 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full group-hover:bg-amber-500/10 transition-all duration-1000"></div>
                        <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4 text-amber-500"><Zap className="w-8 h-8" /> Mise en Place Maestra</h3>
                        <ul className="grid grid-cols-1 gap-7">
                          {sheet.miseEnPlace.map((m, i) => (
                            <li key={i} className="flex items-start gap-5 group/item">
                              <div className="w-3.5 h-3.5 bg-amber-500 rounded-full mt-2.5 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover/item:scale-150 transition-transform duration-300"></div>
                              <span className="font-bold text-slate-300 text-xl leading-tight">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-14 rounded-[4.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/50 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4 text-slate-900 relative z-10"><RefreshCw className="w-8 h-8 text-emerald-500" /> Control de Conservación</h3>
                        <div className="space-y-10 relative z-10">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Refrigeración</p>
                               <p className="font-black text-lg text-slate-800 leading-tight">{sheet.conservation.refrigeration}</p>
                             </div>
                             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Congelación</p>
                               <p className="font-black text-lg text-slate-800 leading-tight">{sheet.conservation.freezing}</p>
                             </div>
                           </div>
                           <div className="pt-10 border-t border-slate-200">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Puntos de Calidad (HACCP)</p>
                             <ul className="grid grid-cols-1 gap-5">
                               {sheet.qcChecklist.map((q, i) => (
                                 <li key={i} className="flex items-center gap-5 text-slate-600 font-bold text-lg leading-snug">
                                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] shrink-0"></div> {q}
                                 </li>
                               ))}
                             </ul>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="bg-slate-900/5 p-12 md:p-20 border-t border-slate-100">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                       <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6">Estética & Emplatado</h4>
                       <p className="text-slate-800 font-bold leading-relaxed text-lg italic">"{sheet.plating}"</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                       <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6">Sugerencias & Variantes</h4>
                       <p className="text-slate-800 font-bold leading-relaxed text-lg italic">"{sheet.variants}"</p>
                    </div>
                 </div>
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="py-24 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] no-print opacity-50">
        <div className="flex items-center justify-center gap-12 mb-10">
           <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-slate-200"></div>
           <ChefHat className="w-7 h-7 text-slate-300" />
           <div className="h-[2px] w-24 bg-gradient-to-l from-transparent to-slate-200"></div>
        </div>
        CHEFMASTER GLOBAL SOLUTIONS | PRECISIÓN FINANCIERA GASTRONÓMICA
      </footer>
    </div>
  );
};

export default App;
