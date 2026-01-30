
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
      console.error("Generation error:", err);
      setError("Error al procesar la solicitud. Por favor, verifica tu conexión o intenta con otro plato.");
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
        filename: `Ficha_${sheet.dishName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert("Error al exportar.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white py-4 px-4 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-amber-500 p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">ChefMaster <span className="text-amber-500 text-xs">PRO</span></h1>
            </div>
          </div>
          
          <form onSubmit={handleGenerate} className="relative flex-1 w-full md:max-w-xl">
            <input
              type="text"
              placeholder="Nombre del plato..."
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-2.5 px-6 pl-11 focus:border-amber-500 text-white text-sm"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[10px] px-5 py-1.5 rounded-full uppercase"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generar"}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 w-full flex-1 mb-20">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Zap className="w-16 h-16 text-amber-500 animate-pulse mb-6" />
            <h2 className="text-2xl font-black text-slate-800 italic">ANALIZANDO COSTOS...</h2>
          </div>
        )}

        {error && (
          <div className="bg-white border-2 border-red-100 p-8 rounded-[2rem] shadow-xl mb-8 flex flex-col items-center text-center animate-in fade-in">
            <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error Detectado</h2>
            <p className="text-slate-500 mb-6 max-w-md">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> REINTENTAR
            </button>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-200">
            <UtensilsCrossed className="w-12 h-12 text-slate-200 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Precisión Gastronómica</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium italic">Escriba el nombre de un plato para generar su ficha técnica completa y costeo profesional.</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in">
            <div className="flex justify-end mb-6 no-print">
               <button onClick={handleExportPDF} disabled={exporting} className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 font-black text-xs flex items-center gap-2 shadow-xl">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  DESCARGAR PDF
                </button>
            </div>

            <article className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200" id="printable-area">
              <div className="bg-slate-900 p-10 md:p-16 text-white border-b-8 border-amber-500">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tighter">{sheet.dishName}</h2>
                    <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-amber-500" /> {sheet.category}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> {sheet.prepTime}</span>
                    </div>
                    <p className="mt-8 text-slate-300 italic text-xl leading-relaxed border-l-4 border-amber-500/30 pl-6">"{sheet.description}"</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-8">
                    <div className="bg-white/10 p-8 rounded-3xl text-center min-w-[280px] border border-white/5">
                      <p className="text-[10px] uppercase font-black text-amber-500 mb-2">Precio Sugerido (COP)</p>
                      <p className="text-5xl font-black">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                    </div>
                    {sheet.imageUrl && (
                      <img src={sheet.imageUrl} className="w-48 h-48 object-cover rounded-[2rem] border-4 border-white shadow-2xl" alt={sheet.dishName} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-16">
                <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                  <DollarSign className="w-7 h-7 text-emerald-600 bg-emerald-50 p-1 rounded-lg" /> Desglose de Costos
                </h3>
                <div className="overflow-x-auto rounded-3xl border border-slate-100 mb-16 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Ingrediente</th>
                        <th className="px-8 py-5 text-right">Cant.</th>
                        <th className="px-8 py-5 text-right">Costo Unit.</th>
                        <th className="px-8 py-5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${getCategoryBg(ing.category)}`}>
                                <IngredientIcon category={ing.category} />
                              </div>
                              <span className="font-bold text-slate-800">{ing.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right font-medium text-slate-500">{ing.amount} {ing.unit}</td>
                          <td className="px-8 py-5 text-right font-medium text-slate-400 text-xs">${ing.unitCost.toLocaleString('es-CO')}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">${ing.subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      <tr>
                        <td colSpan={3} className="px-8 py-8 text-right uppercase text-[10px] font-black text-slate-400">Costo Producción Unitario</td>
                        <td className="px-8 py-8 text-right text-3xl font-black text-slate-900">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-10">
                      <h3 className="text-xl font-black uppercase flex items-center gap-3"><FileText className="w-6 h-6 text-indigo-500" /> Preparación</h3>
                      <div className="space-y-6">
                        {sheet.preparationSteps.map(s => (
                          <div key={s.step} className="flex gap-4">
                            <span className="bg-slate-900 text-white w-8 h-8 shrink-0 flex items-center justify-center rounded-xl font-black text-sm">{s.step}</span>
                            <div>
                              <p className="text-slate-700 font-bold leading-relaxed">{s.description}</p>
                              <div className="flex gap-2 mt-2">
                                {s.temp && <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded uppercase border border-rose-100">{s.temp}</span>}
                                {s.time && <span className="text-[9px] font-black bg-sky-50 text-sky-600 px-2 py-0.5 rounded uppercase border border-sky-100">{s.time}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-10">
                      <div className="bg-slate-50 p-10 rounded-[2.5rem]">
                        <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Zap className="w-6 h-6 text-amber-500" /> Mise en Place</h3>
                        <ul className="space-y-4">
                          {sheet.miseEnPlace.map((m, i) => (
                            <li key={i} className="flex items-center gap-4 font-bold text-slate-600">
                              <div className="w-2 h-2 bg-amber-500 rounded-full" /> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100">
                        <h3 className="text-lg font-black uppercase mb-4 text-rose-900">Alérgenos</h3>
                        <div className="flex flex-wrap gap-2">
                          {sheet.allergens.map((a, i) => (
                            <span key={i} className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase text-rose-700 border border-rose-200">{a}</span>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] no-print">
        CHEFMASTER GLOBAL | PRECISIÓN FINANCIERA GASTRONÓMICA
      </footer>
    </div>
  );
};

export default App;
