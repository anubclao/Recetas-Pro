
import React, { useState, useEffect } from 'react';
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
  Key,
  ShieldAlert,
  RefreshCw
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
  const [isKeyValid, setIsKeyValid] = useState(true);

  // Verificamos si existe la API Key en el entorno
  useEffect(() => {
    const hasKey = !!process.env.API_KEY;
    setIsKeyValid(hasKey);
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsKeyValid(true);
      setError(null);
    } else {
      alert("Por favor, configure su API_KEY en las variables de entorno de Vercel y realice un 'Redeploy'.");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateTechnicalSheet(dishName);
      const imageUrl = await generateDishImage(data.dishName);
      setSheet({ ...data, imageUrl });
    } catch (err: any) {
      console.error("App catch error:", err);
      if (err.message === "MISSING_API_KEY" || err.message?.includes("401") || err.message?.includes("API key not valid")) {
        setIsKeyValid(false);
        setError("La API Key es inexistente o no válida. Por favor, vincúlela de nuevo.");
      } else {
        setError("Error de comunicación con el Chef AI. Verifique su conexión o intente con un plato más simple.");
      }
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
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert("Error al generar PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header UI */}
      <header className="bg-slate-900 text-white py-4 px-4 no-print shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <ChefHat className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter flex items-baseline gap-1">
                CHEFMASTER <span className="text-amber-500 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">PRO</span>
              </h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Gestión Financiera de Menús</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:max-w-2xl">
            <form onSubmit={handleGenerate} className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Nombre del plato (ej: Pulpo a la brasa)..."
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-3 px-6 pl-12 focus:outline-none focus:border-amber-500 transition-all text-sm text-white placeholder-slate-500 shadow-inner"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <button
                type="submit"
                disabled={loading || !isKeyValid}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] uppercase px-6 py-2 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generar Ficha"}
              </button>
            </form>

            {!isKeyValid && (
              <button 
                onClick={handleOpenKeySelector}
                className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-full animate-pulse flex items-center gap-2 text-[10px] font-black px-5 shadow-lg shadow-rose-600/20 transition-all border border-rose-400/30 shrink-0"
              >
                <Key className="w-4 h-4" /> VINCULAR API KEY
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 w-full flex-1 mb-24">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-10">
               <Zap className="w-24 h-24 text-amber-500 animate-pulse" />
               <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 italic mb-2">PROCESANDO TÉCNICA...</h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Nuestro Chef Ejecutivo AI está calculando gramajes, costos actuales en Colombia y pasos de preparación.</p>
          </div>
        )}

        {/* Error States */}
        {error && (
          <div className="bg-white border-2 border-red-100 p-10 rounded-[3rem] shadow-2xl mb-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-red-50 p-6 rounded-full mb-6 border border-red-100">
              <ShieldAlert className="text-red-500 w-14 h-14" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Error de Conexión Detectado</h2>
            <p className="text-slate-500 mb-8 max-w-lg leading-relaxed">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleOpenKeySelector}
                className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <Key className="w-5 h-5 text-amber-500" /> RE-VINCULAR API KEY
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-full font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5 text-slate-400" /> RECARGAR APP
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!sheet && !loading && !error && (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border border-slate-200 px-8">
            <UtensilsCrossed className="w-16 h-16 text-slate-100 mx-auto mb-10 rotate-12" />
            <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tight">Potencia tu Rentabilidad</h2>
            <p className="text-slate-400 max-w-md mx-auto text-lg font-medium leading-relaxed italic">
              "La cocina es un arte, pero el restaurante es un negocio de precisión."
              <br />
              <span className="text-slate-300 block mt-4 text-sm font-bold">— Genera tu primera ficha técnica ahora —</span>
            </p>
          </div>
        )}

        {/* Content State */}
        {sheet && !loading && (
          <div className="animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-10 no-print px-4">
               <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 Ficha Técnica Verificada
               </div>
               <button 
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="bg-slate-900 text-white px-10 py-4 rounded-full hover:bg-slate-800 transition-all font-black text-xs flex items-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {exporting ? "PROCESANDO PDF..." : "EXPORTAR FICHA PDF"}
                </button>
            </div>

            <article className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200" id="printable-area">
              {/* Main Banner */}
              <div className="bg-slate-900 p-12 md:p-20 text-white border-b-[12px] border-amber-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row justify-between gap-16 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-amber-500 text-slate-900 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">Premium Gastro Sheet</span>
                      <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">{new Date().toLocaleDateString('es-CO')}</span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black uppercase mb-8 leading-[0.95] tracking-tighter">{sheet.dishName}</h2>
                    <div className="flex flex-wrap gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-3 border-r border-slate-700 pr-8"><UtensilsCrossed className="w-5 h-5 text-amber-500" /> {sheet.category}</span>
                      <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-amber-500" /> {sheet.prepTime}</span>
                    </div>
                    <p className="mt-12 text-slate-300 italic text-2xl leading-relaxed max-w-2xl border-l-8 border-amber-500/30 pl-10">"{sheet.description}"</p>
                  </div>
                  
                  <div className="flex flex-col items-center lg:items-end gap-12">
                    <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] text-center min-w-[320px] border border-white/10 shadow-2xl">
                      <p className="text-[11px] uppercase font-black text-amber-500 mb-4 tracking-[0.2em]">Precio de Venta Sugerido</p>
                      <div className="flex items-start justify-center gap-1">
                         <span className="text-2xl font-black text-amber-500 mt-2">$</span>
                         <p className="text-7xl font-black tracking-tighter">{sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-4 tracking-widest border-t border-white/10 pt-4">COP | Target Food Cost: 30%</p>
                    </div>
                    {sheet.imageUrl && (
                      <div className="relative group">
                        <img src={sheet.imageUrl} className="w-64 h-64 object-cover rounded-[3.5rem] border-[10px] border-white shadow-2xl relative z-10" alt={sheet.dishName} />
                        <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ingredients & Finance Table */}
              <div className="p-12 md:p-20">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-3xl font-black uppercase flex items-center gap-4">
                    <DollarSign className="w-8 h-8 text-emerald-600 bg-emerald-50 p-1.5 rounded-xl" /> Ingeniería de Costos
                  </h3>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2 rounded-full">Referencia: Mercado Mayorista Colombia</div>
                </div>
                
                <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm mb-20">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[11px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-10 py-7">Insumo Gastronómico</th>
                        <th className="px-10 py-7 text-right">Gramaje/ML</th>
                        <th className="px-10 py-7 text-right">Costo Unit.</th>
                        <th className="px-10 py-7 text-right">Subtotal Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-5">
                              <div className={`p-2.5 rounded-xl shadow-sm ${getCategoryBg(ing.category)}`}>
                                <IngredientIcon category={ing.category} />
                              </div>
                              <span className="font-bold text-slate-800 text-lg">{ing.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-7 text-right font-black text-slate-500">{ing.amount} <span className="text-[10px]">{ing.unit}</span></td>
                          <td className="px-10 py-7 text-right font-bold text-slate-400 text-sm">${ing.unitCost.toLocaleString('es-CO')}</td>
                          <td className="px-10 py-7 text-right font-black text-slate-900 text-xl">${ing.subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      <tr>
                        <td colSpan={3} className="px-10 py-10 text-right uppercase text-xs font-black text-slate-400 tracking-[0.2em]">Costo de Producción por Porción</td>
                        <td className="px-10 py-10 text-right text-4xl font-black text-slate-900 border-l border-slate-200 bg-white">
                          <span className="text-emerald-600">$</span>{sheet.financials.totalCost.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bottom Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                   <div className="space-y-12">
                      <div className="bg-white border-2 border-slate-100 p-10 rounded-[3.5rem] shadow-sm relative">
                        <h3 className="text-2xl font-black uppercase flex items-center gap-4 mb-10"><FileText className="w-7 h-7 text-indigo-500" /> Método de Preparación</h3>
                        <div className="space-y-10">
                          {sheet.preparationSteps.map(s => (
                            <div key={s.step} className="flex gap-6 relative">
                              <div className="flex flex-col items-center">
                                <span className="bg-slate-900 text-white w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl font-black text-base shadow-lg relative z-10">{s.step}</span>
                                <div className="w-0.5 h-full bg-slate-100 absolute top-10" />
                              </div>
                              <div className="pb-6">
                                <p className="text-slate-800 font-bold text-lg leading-snug mb-3">{s.description}</p>
                                <div className="flex gap-3">
                                  {s.temp && <span className="text-[9px] font-black uppercase bg-rose-50 px-3 py-1 rounded-full text-rose-600 border border-rose-100">{s.temp}</span>}
                                  {s.time && <span className="text-[9px] font-black uppercase bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 border border-indigo-100">{s.time}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100">
                        <h3 className="text-xl font-black uppercase flex items-center gap-3 mb-6 text-rose-900"><AlertTriangle className="w-6 h-6" /> Control de Alérgenos</h3>
                        <div className="flex flex-wrap gap-3">
                          {sheet.allergens.map((a, i) => (
                            <span key={i} className="bg-white px-5 py-2 rounded-full font-black text-[10px] uppercase text-rose-700 border border-rose-200 shadow-sm">{a}</span>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-12">
                      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] rounded-full" />
                        <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4 text-amber-500"><Zap className="w-7 h-7" /> Mise en Place Crítica</h3>
                        <ul className="grid grid-cols-1 gap-6">
                          {sheet.miseEnPlace.map((m, i) => (
                            <li key={i} className="flex items-center gap-5 group">
                              <div className="w-3 h-3 bg-amber-500 rounded-full group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> 
                              <span className="font-bold text-slate-300 text-lg">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-900 text-white p-12 rounded-[3.5rem] shadow-2xl">
                        <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-4 text-emerald-400"><RefreshCw className="w-7 h-7" /> Conservación & Calidad</h3>
                        <div className="space-y-8">
                           <div>
                             <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest mb-3">Refrigeración</p>
                             <p className="font-bold text-lg">{sheet.conservation.refrigeration}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest mb-3">Congelación</p>
                             <p className="font-bold text-lg">{sheet.conservation.freezing}</p>
                           </div>
                           <div className="pt-6 border-t border-emerald-800">
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Checklist de Calidad</p>
                             <ul className="space-y-3">
                               {sheet.qcChecklist.map((q, i) => (
                                 <li key={i} className="flex items-center gap-3 text-sm font-bold text-emerald-100">
                                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {q}
                                 </li>
                               ))}
                             </ul>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] no-print">
        <div className="flex items-center justify-center gap-6 mb-8">
           <div className="h-px w-16 bg-slate-200" />
           <ChefHat className="w-5 h-5 opacity-20" />
           <div className="h-px w-16 bg-slate-200" />
        </div>
        © {new Date().getFullYear()} CHEFMASTER GLOBAL | SISTEMAS DE PRECISIÓN GASTRONÓMICA
      </footer>
    </div>
  );
};

export default App;
