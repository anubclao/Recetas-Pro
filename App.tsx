
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTechnicalSheet, generateDishImage } from './geminiService';
import { TechnicalSheet, Ingredient } from './types';
import * as userService from './userService';
import { 
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
  Users,
  ServerCrash,
  Percent,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Menu,
  X
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  isAuthorized: boolean;
  queries: number;
  isAdmin: boolean;
}

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

const HotelLogo = () => (
  <div className="w-14 h-14 bg-[#002611] rounded-full flex items-center justify-center shadow-xl border-2 border-amber-500/30 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
    <div className="text-white flex flex-col items-center leading-none scale-[0.85]">
      <div className="flex items-center gap-1">
        <span className="font-black text-lg tracking-tighter">ONE</span>
        <div className="bg-white text-[#002611] px-1 py-0.5 text-[10px] font-black rounded-sm">116</div>
      </div>
      <span className="text-[7px] font-black tracking-[0.2em] mt-1 whitespace-nowrap">SIXTEEN HOTEL</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  const [showPending, setShowPending] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [dishName, setDishName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sheet, setSheet] = useState<TechnicalSheet | null>(null);
  const [error, setError] = useState<{ message: string; type: 'overload' | 'generic' | 'auth' } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chefmaster_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      fetchUserStatus(parsed.email);
    }
  }, []);

  const fetchUserStatus = async (email: string) => {
    try {
      const data = await userService.loginUser(email);
      setUser(data);
      localStorage.setItem('chefmaster_user', JSON.stringify(data));
      if (!data.isAuthorized && !data.isAdmin) {
        setShowPending(true);
      } else {
        setShowAuth(false);
        setShowPending(false);
      }
    } catch (err) {
      console.error("Error fetching user status", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = userService.getUsers();
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching all users", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let data;
      if (authMode === 'login') {
        data = await userService.loginUser(authForm.email);
      } else {
        data = await userService.registerUser(authForm.name, authForm.email);
      }
      
      setUser(data);
      localStorage.setItem('chefmaster_user', JSON.stringify(data));
      if (!data.isAuthorized && !data.isAdmin) {
        setShowPending(true);
      } else {
        setShowAuth(false);
        setShowPending(false);
      }
    } catch (err: any) {
      setError({ message: err.message || "Error en la autenticación", type: 'auth' });
    }
  };

  const handleAuthorize = async (userId: string, isAuthorized: boolean) => {
    try {
      await userService.authorizeUser(userId, isAuthorized);
      fetchAllUsers();
    } catch (err) {
      console.error("Error authorizing user", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await userService.deleteUser(id);
      fetchAllUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await userService.updateUser(editingUser);
      setEditingUser(null);
      fetchAllUsers();
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chefmaster_user');
    setUser(null);
    setShowAuth(true);
    setShowAdmin(false);
    setShowPending(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !user) return;

    setLoading(true);
    setError(null);
    setSheet(null);
    
    try {
      const data = await generateTechnicalSheet(dishName);
      const imageUrl = await generateDishImage(data.imagePrompt || data.dishName);
      setSheet({ ...data, imageUrl });
      
      // Increment query count
      await userService.incrementQueries(user.email);
    } catch (err: any) {
      const isOverload = err.message?.includes("503") || err.message?.includes("overloaded") || err.message?.includes("UNAVAILABLE");
      setError({
        message: isOverload 
          ? "Nuestros servidores están saturados. Por favor, reintenta en un momento."
          : (err.message || "No pudimos procesar tu solicitud."),
        type: isOverload ? 'overload' : 'generic'
      });
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
        filename: `Ficha_ChefMaster_${sheet.dishName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      // @ts-ignore
      await html2pdf().from(element).set(opt).save();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Auth Screens */}
      <AnimatePresence>
        {showAuth && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 md:p-16 w-full max-w-md shadow-2xl border border-white/10"
            >
              <div className="flex flex-col items-center mb-10">
                <HotelLogo />
                <h2 className="text-3xl font-black uppercase mt-6 tracking-tighter text-slate-900">
                  {authMode === 'login' ? 'Bienvenido' : 'Registro'}
                </h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">ChefMaster Pro</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-amber-500 outline-none transition-all font-bold"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-amber-500 outline-none transition-all font-bold"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>

                {error?.type === 'auth' && (
                  <p className="text-red-500 text-xs font-bold text-center">{error.message}</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                  {authMode === 'login' ? 'Ingresar' : 'Registrarme'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-all"
                >
                  {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[3rem] p-12 text-center max-w-md shadow-2xl">
              <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Clock size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter mb-4">En Espera de Autorización</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Tu solicitud ha sido recibida. El administrador debe autorizar tu acceso antes de que puedas utilizar la plataforma.
              </p>
              <button 
                onClick={handleLogout}
                className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}

        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[120] bg-slate-50 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto p-6 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Panel de Administración</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestión de Usuarios y Accesos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdmin(false)}
                  className="bg-white p-4 rounded-2xl shadow-lg hover:bg-slate-100 transition-all"
                >
                  <X />
                </button>
              </div>

              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-6">Usuario</th>
                        <th className="px-8 py-6">Correo</th>
                        <th className="px-8 py-6 text-center">Consultas</th>
                        <th className="px-8 py-6 text-center">Autorizado</th>
                        <th className="px-8 py-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${u.isAdmin ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{u.name} {u.isAdmin && <span className="ml-2 text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Admin</span>}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-medium">{u.email}</td>
                          <td className="px-8 py-6 text-center">
                            <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-black text-slate-600">
                              {u.queries}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            {!u.isAdmin && (
                              <input 
                                type="checkbox" 
                                checked={u.isAuthorized}
                                onChange={(e) => handleAuthorize(u.id, e.target.checked)}
                                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                            )}
                            {u.isAdmin && <CheckCircle2 className="mx-auto text-emerald-500" />}
                          </td>
                          <td className="px-8 py-6 text-right">
                            {!u.isAdmin && (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setEditingUser(u)}
                                  className="p-2 text-slate-400 hover:text-indigo-500 transition-all"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit User Modal */}
            <AnimatePresence>
              {editingUser && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-[130] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl"
                  >
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Editar Usuario</h3>
                    <form onSubmit={handleUpdateUser} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-amber-500 outline-none transition-all font-bold"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Correo</label>
                        <input 
                          type="email" 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-amber-500 outline-none transition-all font-bold"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-800 transition-all shadow-lg"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-slate-900 text-white py-4 px-6 shadow-2xl sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-5">
            <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.location.reload()}>
              <HotelLogo />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    ChefMaster <span className="text-amber-500">PRO</span>
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-amber-500 text-slate-900 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                    Onesixteen Hotel
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                    Costeo & Merma
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              {user?.isAdmin && (
                <button 
                  onClick={() => { fetchAllUsers(); setShowAdmin(true); }}
                  className="p-3 bg-slate-800 rounded-xl text-amber-500"
                >
                  <ShieldCheck size={20} />
                </button>
              )}
              <button onClick={handleLogout} className="p-3 bg-slate-800 rounded-xl text-slate-400">
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleGenerate} className="relative flex-1 w-full md:max-w-xl">
            <input
              type="text"
              placeholder="¿Qué plato vamos a costear hoy?"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-full py-3.5 px-8 pl-14 focus:outline-none focus:border-amber-500 text-white transition-all shadow-inner text-sm"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              disabled={loading}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <button
              type="submit"
              disabled={loading || !dishName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[10px] px-6 py-2.5 rounded-full uppercase transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CALCULAR"}
            </button>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user?.isAdmin && (
              <button 
                onClick={() => { fetchAllUsers(); setShowAdmin(true); }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-500 px-5 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <ShieldCheck size={16} /> Admin
              </button>
            )}
            <div className="flex items-center gap-3 bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 font-black text-xs">
                {user?.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight leading-none">{user?.name}</span>
                <button onClick={handleLogout} className="text-[8px] font-bold text-slate-500 uppercase hover:text-red-400 transition-all text-left mt-1">Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-10 px-6 w-full flex-1 mb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Zap className="w-20 h-20 text-amber-500 animate-pulse mb-6" />
            <h2 className="text-3xl font-black text-slate-900 uppercase">Analizando Insumos...</h2>
            <p className="text-slate-500 mt-2 font-medium">Recalculando mermas y costos brutos de producción.</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-xl text-center max-w-2xl mx-auto">
            <div className={`p-6 rounded-full inline-block mb-8 ${error.type === 'overload' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
              {error.type === 'overload' ? <ServerCrash size={48} /> : <AlertTriangle size={48} />}
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">{error.type === 'overload' ? "Demanda Alta" : "Error de Conexión"}</h2>
            <p className="text-slate-500 mb-10 text-lg">{error.message}</p>
            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-12 py-4 rounded-full font-black text-xs hover:bg-slate-800 transition-all">
              REINTENTAR AHORA
            </button>
          </div>
        )}

        {sheet && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center mb-8 no-print">
               <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div> Ficha de Ingeniería Activa
               </div>
               <button onClick={handleExportPDF} className="bg-slate-900 text-white px-10 py-4 rounded-full hover:bg-slate-800 transition-all font-black text-xs flex items-center gap-3 shadow-xl">
                  {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  EXPORTAR PDF TÉCNICO
               </button>
            </div>

            <article className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200" id="printable-area">
              <div className="bg-slate-900 p-12 md:p-16 text-white border-b-[12px] border-amber-500 relative">
                <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                  <div className="flex-1">
                    <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">{sheet.dishName}</h2>
                    <div className="flex flex-wrap gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2 border-r border-slate-700 pr-8"><UtensilsCrossed size={16} className="text-amber-500" /> {sheet.category}</span>
                      <span className="flex items-center gap-2 border-r border-slate-700 pr-8"><Clock size={16} className="text-amber-500" /> {sheet.prepTime}</span>
                      <span className="flex items-center gap-2"><Users size={16} className="text-amber-500" /> {sheet.financials.yieldPortions} Porciones</span>
                    </div>
                    <p className="mt-10 text-slate-300 italic text-xl leading-relaxed max-w-2xl border-l-4 border-amber-500/40 pl-8">"{sheet.description}"</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-10">
                    <div className="bg-white/5 backdrop-blur-lg p-8 rounded-[2.5rem] text-center border border-white/10 w-full md:min-w-[300px]">
                      <p className="text-[10px] uppercase font-black text-amber-500 mb-2 tracking-[0.2em]">PVP Recomendado</p>
                      <p className="text-6xl font-black tracking-tighter">${sheet.financials.suggestedPrice.toLocaleString('es-CO')}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[9px] font-black text-slate-500 uppercase">
                        <span>Costo Ideal: 30%</span>
                        <span>COP / UNID</span>
                      </div>
                    </div>
                    {sheet.imageUrl && (
                      <img src={sheet.imageUrl} className="w-56 h-56 object-cover rounded-[3rem] border-8 border-white shadow-2xl" alt={sheet.dishName} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-12 md:p-16">
                <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4">
                  <DollarSign className="w-8 h-8 text-emerald-600 bg-emerald-50 p-2 rounded-xl" /> Análisis de Costo & Merma
                </h3>
                
                <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm mb-16 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-8 py-6">Ingrediente</th>
                        <th className="px-8 py-6 text-right">Cant. Neto</th>
                        <th className="px-8 py-6 text-center">Merma %</th>
                        <th className="px-8 py-6 text-right">Costo Unit.</th>
                        <th className="px-8 py-6 text-right">Subtotal Bruto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {sheet.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${getCategoryBg(ing.category)}`}>
                                <IngredientIcon category={ing.category} />
                              </div>
                              <span className="font-bold text-slate-900">{ing.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-500">
                            {ing.amount} <span className="text-[10px] font-bold uppercase">{ing.unit}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${ing.wastePercentage > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {ing.wastePercentage}%
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right text-sm text-slate-400 font-medium">${ing.unitCost.toLocaleString('es-CO')}</td>
                          <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">
                            ${ing.subtotal.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-4 border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-right uppercase text-[10px] font-black text-slate-500 tracking-[0.3em]">Costo Total Producción</td>
                        <td className="px-8 py-10 text-right text-3xl font-black text-slate-900">
                           <span className="text-emerald-600 mr-2 text-xl">$</span>{sheet.financials.totalCost.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                   <div>
                      <h3 className="text-xl font-black uppercase flex items-center gap-3 mb-10"><FileText className="text-indigo-500" /> Método Profesional</h3>
                      <div className="space-y-10">
                        {sheet.preparationSteps.map((s, i) => (
                          <div key={i} className="flex gap-6">
                            <span className="bg-slate-900 text-white w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl font-black shadow-lg">{s.step}</span>
                            <div>
                              <p className="text-slate-800 font-bold text-lg leading-tight mb-3">{s.description}</p>
                              <div className="flex gap-2">
                                {s.temp && <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 uppercase">{s.temp}</span>}
                                {s.time && <span className="text-[9px] font-black bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100 uppercase">{s.time}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-12">
                      <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                        <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-amber-500"><Zap /> Mise en Place</h3>
                        <ul className="grid grid-cols-1 gap-6">
                          {sheet.miseEnPlace.map((m, i) => (
                            <li key={i} className="flex items-start gap-4">
                              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 shrink-0"></div>
                              <span className="font-bold text-slate-300 text-lg">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                         <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3"><RefreshCw size={20} className="text-emerald-500" /> Control HACCP</h3>
                         <div className="grid grid-cols-2 gap-6 mb-8">
                           <div className="bg-white p-5 rounded-3xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Refrigeración</p>
                             <p className="font-black text-slate-800">{sheet.conservation.refrigeration}</p>
                           </div>
                           <div className="bg-white p-5 rounded-3xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Congelación</p>
                             <p className="font-black text-slate-800">{sheet.conservation.freezing}</p>
                           </div>
                         </div>
                         <ul className="space-y-4">
                           {sheet.qcChecklist.map((q, i) => (
                             <li key={i} className="flex items-center gap-4 text-slate-600 font-bold text-sm">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> {q}
                             </li>
                           ))}
                         </ul>
                      </div>
                   </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="py-20 text-center no-print">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white px-8 py-3 rounded-full border border-slate-200 shadow-xl flex items-center gap-4">
            <div className="w-8 h-8 bg-[#002611] rounded-full flex items-center justify-center scale-75">
               <div className="text-white flex flex-col items-center leading-none scale-[0.5]">
                <div className="flex items-center gap-1">
                  <span className="font-black text-lg tracking-tighter">ONE</span>
                  <div className="bg-white text-[#002611] px-1 py-0.5 text-[10px] font-black rounded-sm">116</div>
                </div>
                <span className="text-[7px] font-black tracking-[0.2em] mt-1 whitespace-nowrap">SIXTEEN HOTEL</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} ChefMaster Pro | Onesixteen Hotel
            </p>
          </div>
          <p className="text-[9px] uppercase tracking-[0.6em] font-black text-slate-400">PRECISIÓN GASTRONÓMICA | INGENIERÍA DE COSTOS 4.0</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
