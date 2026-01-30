
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
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Thermometer,
  Zap,
  ImageIcon,
  Loader2,
  ChevronRight,
  Beef,
  Carrot,
  Milk,
  Apple,
  Wheat,
  Droplets,
  Fish,
  Egg,
  Leaf,
  CircleDashed
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
      if (err.message?.includes("CONFIG_ERROR")) {
        setError("Error de configuración: La API Key no está configurada en el servidor.");
      } else if (err.message?.includes("401") || err.message?.includes("API key not valid")) {
        setError("Error de autenticación: La API Key proporcionada no es válida.");
      } else {
        setError("Error al procesar la solicitud. Por favor, verifica tu conexión o intenta con otro plato.");
      }
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
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error al generar el PDF. Intente nuevamente.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <header className="bg-slate-900 text-white py-4 px-4 no-print shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
              <ChefHat className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl lg:text-2xl font-black leading-none">
                CHEFMASTER <span className="text-[8px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-black italic">PRO</span>
              </h1>
              <p className="text-[9px] uppercase font-bold text-slate-400 mt-0.5 tracking-tighter">Gestión de Costos & Fichas Técnicas</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
            <form onSubmit={handleGenerate} className="relative flex-1 group w-full">
              <input
                type="text"
                placeholder="Nombre del plato..."
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-2.5 px-6 pl-11 focus:outline-none focus:border-amber-500 transition-all text-sm text-white placeholder-slate-500"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] uppercase px-5 py-1.5 rounded-full shadow-lg disabled:opacity-50 transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generar Ficha"}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6 px-4 w-full flex-1 mb-20">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Zap className="w-20 h-20 text-amber-500 animate-pulse mb-8" />
            <p className="text-2xl font-black text-slate-800 italic">Generando ficha técnica...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 flex items-center gap-5 shadow-lg animate-in fade-in">
            <AlertTriangle className="text-red-500 w-8 h-8 shrink-0" />
            <div>
              <p className="text-red-700 font-bold">Error detectado</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!sheet && !loading && !error && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-200 px-6">
            <UtensilsCrossed className="w-10 h-10 text-slate-200 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Panel de Control de Costos</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Cree fichas técnicas profesionales con precisión financiera para su restaurante.</p>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-end mb-8 no-print">
               <button 
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 transition-all font-black text-xs disabled:opacity-70"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {exporting ? "Generando..." : "Descargar PDF"}
                </button>
            </div>

            <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200" id="printable-area">
              <div className="bg-slate-900 p-8 md:p-14 text-white border-b-8 border-amber-500">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1">
                    <h2 className="text-4xl md:text-7xl font-black uppercase mb-6 leading-tight">{sheet.dishName}</h2>
                    <div className="flex items-center gap-6 text-slate-400 font-black text-xs uppercase tracking-widest">
                      <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-amber-500" /> {sheet.category}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> {sheet.prepTime}</span>
                    </div>
                    <p className="mt-10 text-slate-300 italic text-xl border-l-8 border-amber-500/30 pl-8">"{sheet.description}"</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-10">
                    <div className="bg-white/10 p-8 rounded-[2.5rem] text-center border border-white/10 w-full sm:min-w-[300px]">
                      <p className="text-[10px] uppercase font-black text-amber-500 mb-3 tracking-widest">Precio Sugerido</p>
                      <p className="text-5xl font-black text-white">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-2">COP | Multiplicador 3.3x</p>
                    </div>
                    {sheet.imageUrl && (
                      <img src={sheet.imageUrl} className="w-56 h-56 object-cover rounded-[3rem] border-8 border-white shadow-2xl" alt={sheet.dishName} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-14 space-y-16">
                <div>
                  <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-emerald-600" /> Estructura de Costos
                  </h3>
                  <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="px-8 py-6">Ingrediente</th>
                          <th className="px-8 py-6 text-right">Cantidad</th>
                          <th className="px-8 py-6 text-right">Costo (u)</th>
                          <th className="px-8 py-6 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sheet.ingredients.map((ing, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${getCategoryBg(ing.category)}`}>
                                  <IngredientIcon category={ing.category} />
                                </div>
                                <span className="font-bold text-slate-800">{ing.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right text-slate-600">{ing.amount} {ing.unit}</td>
                            <td className="px-8 py-6 text-right text-slate-500">${ing.unitCost.toLocaleString('es-CO')}</td>
                            <td className="px-8 py-6 text-right font-black text-slate-900">${ing.subtotal.toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white font-black">
                        <tr>
                          <td colSpan={3} className="px-8 py-8 text-right uppercase text-xs opacity-50">Costo Total Unitario</td>
                          <td className="px-8 py-8 text-right text-3xl text-amber-500">${sheet.financials.totalCost.toLocaleString('es-CO')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <section className="bg-slate-50 p-10 rounded-[3rem]">
                    <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-amber-500" /> Mise en Place
                    </h3>
                    <ul className="space-y-4">
                      {sheet.miseEnPlace.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 font-bold text-slate-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-600" /> Preparación
                    </h3>
                    <div className="space-y-8">
                      {sheet.preparationSteps.map((s) => (
                        <div key={s.step} className="relative pl-12 border-l-2 border-slate-100 pb-4">
                          <span className="absolute -left-[18px] top-0 bg-slate-900 text-white font-black w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                            {s.step}
                          </span>
                          <p className="font-bold text-slate-900 mb-2">{s.description}</p>
                          <div className="flex gap-4">
                            {s.temp && <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500">{s.temp}</span>}
                            {s.time && <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500">{s.time}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center no-print">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} CHEFMASTER | PRECISIÓN GASTRONÓMICA
        </p>
      </footer>
    </div>
  );
};

export default App;
