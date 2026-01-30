
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
  Key
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
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const isKeySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(isKeySelected || !!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setError(null);
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
      console.error(err);
      if (err.message?.includes("API Key") || err.message?.includes("401")) {
        setHasApiKey(false);
        setError("Se requiere configurar la API Key de Google para continuar.");
      } else {
        setError("Error de conexión. Asegúrese de que su API Key sea válida y tenga crédito.");
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
      <header className="bg-slate-900 text-white py-4 px-4 no-print shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">ChefMaster <span className="text-amber-500 text-xs">PRO</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:max-w-2xl">
            <form onSubmit={handleGenerate} className="relative flex-1">
              <input
                type="text"
                placeholder="Ej: Salmón en costra de pistacho..."
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-2.5 px-6 pl-11 focus:border-amber-500 text-white text-sm"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[10px] px-5 py-1.5 rounded-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "GENERAR"}
              </button>
            </form>

            {!hasApiKey && (
              <button 
                onClick={handleOpenKeySelector}
                className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full animate-pulse flex items-center gap-2 text-[10px] font-bold px-4 transition-all"
              >
                <Key className="w-4 h-4" /> CONECTAR GOOGLE AI
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6 px-4 w-full flex-1 mb-20">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Zap className="w-20 h-20 text-amber-500 animate-pulse mb-8" />
            <p className="text-2xl font-black text-slate-800 italic">Analizando costos y técnica...</p>
          </div>
        )}

        {error && (
          <div className="bg-white border-2 border-red-100 p-8 rounded-[2rem] shadow-xl mb-8 flex flex-col items-center text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Problema de Conexión</h2>
            <p className="text-slate-500 mb-6 max-w-md">{error}</p>
            {!hasApiKey && (
              <button 
                onClick={handleOpenKeySelector}
                className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-xs hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-amber-500" /> VINCULAR MI API KEY AHORA
              </button>
            )}
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-200">
            <UtensilsCrossed className="w-12 h-12 text-slate-200 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Precisión Gastronómica</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium italic">Escriba el nombre de un plato para generar su ficha técnica completa y costeo.</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in">
            <div className="flex justify-end mb-6 no-print">
               <button 
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 font-black text-xs flex items-center gap-2"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  DESCARGAR PDF
                </button>
            </div>

            <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden" id="printable-area">
              <div className="bg-slate-900 p-10 md:p-14 text-white border-b-8 border-amber-500">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-4">{sheet.dishName}</h2>
                    <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-amber-500" /> {sheet.category}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> {sheet.prepTime}</span>
                    </div>
                    <p className="mt-8 text-slate-300 italic text-lg leading-relaxed">{sheet.description}</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-8">
                    <div className="bg-white/10 p-6 rounded-3xl text-center min-w-[240px]">
                      <p className="text-[10px] uppercase font-black text-amber-500 mb-2">Precio Sugerido (COP)</p>
                      <p className="text-4xl font-black">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                    </div>
                    {sheet.imageUrl && (
                      <img src={sheet.imageUrl} className="w-48 h-48 object-cover rounded-[2rem] border-4 border-white shadow-xl" alt={sheet.dishName} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 md:p-14">
                <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" /> Desglose de Costos
                </h3>
                <div className="overflow-x-auto rounded-3xl border border-slate-100 mb-16">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Ingrediente</th>
                        <th className="px-8 py-5 text-right">Cant.</th>
                        <th className="px-8 py-5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.ingredients.map((ing, i) => (
                        <tr key={i}>
                          <td className="px-8 py-5 flex items-center gap-4">
                            <div className={`p-1.5 rounded-lg ${getCategoryBg(ing.category)}`}>
                              <IngredientIcon category={ing.category} />
                            </div>
                            <span className="font-bold text-slate-800">{ing.name}</span>
                          </td>
                          <td className="px-8 py-5 text-right font-medium text-slate-600">{ing.amount} {ing.unit}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">${ing.subtotal.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                      <tr>
                        <td colSpan={2} className="px-8 py-6 text-right uppercase text-[10px] font-black">Costo Total Unitario</td>
                        <td className="px-8 py-6 text-right text-2xl font-black text-amber-500">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-3"><FileText className="w-6 h-6 text-indigo-500" /> Preparación</h3>
                      {sheet.preparationSteps.map(s => (
                        <div key={s.step} className="flex gap-4">
                          <span className="bg-slate-900 text-white w-7 h-7 shrink-0 flex items-center justify-center rounded-lg font-black text-xs">{s.step}</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{s.description}</p>
                        </div>
                      ))}
                   </div>
                   <div className="bg-slate-50 p-8 rounded-[2rem]">
                      <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Zap className="w-6 h-6 text-amber-500" /> Mise en Place</h3>
                      <ul className="space-y-3">
                        {sheet.miseEnPlace.map((m, i) => (
                          <li key={i} className="flex items-center gap-3 font-bold text-slate-600 text-sm">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> {m}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest no-print">
        © {new Date().getFullYear()} CHEFMASTER | PRECISIÓN FINANCIERA GASTRONÓMICA
      </footer>
    </div>
  );
};

export default App;
