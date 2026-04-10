import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, PackagePlus, Box, Trash2 } from 'lucide-react';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import { SearchInput } from '../components/atoms/SearchInput';
import { Feedback } from '../components/molecules/Feedback';
import { Modal } from '../components/molecules/Modal';
import { useAuth } from '../context/AuthContext';

export const ProductosPage = () => {
    const { api, user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ codigo: '', nombre: '', caracteristicas: '', empresa: '', usd: '', cop: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, codigo: null });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const filtered = productos.filter(p =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.includes(search)
        );
        setFilteredProductos(filtered);
    }, [search, productos]);

    const fetchInitialData = async () => {
        setFetching(true);
        try {
            const [prodRes, empRes] = await Promise.all([
                api.get('/productos/'),
                api.get('/empresas/')
            ]);
            setProductos(prodRes.data);
            setFilteredProductos(prodRes.data);
            setEmpresas(empRes.data);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            const payload = {
                codigo: form.codigo,
                nombre: form.nombre,
                caracteristicas: form.caracteristicas,
                precios: { USD: form.usd, COP: form.cop },
                empresa: form.empresa
            };
            await api.post('/productos/', payload);
            setFeedback({ type: 'success', message: 'Producto agregado exitosamente.' });
            setForm({ codigo: '', nombre: '', caracteristicas: '', empresa: '', usd: '', cop: '' });
            fetchInitialData();
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al registrar el producto. Verifica los datos.' });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (codigo) => {
        setDeleteModal({ show: true, codigo });
    };

    const handleDelete = async () => {
        setLoading(true);
        setFeedback(null);
        try {
            await api.delete(`/productos/${deleteModal.codigo}/`);
            setFeedback({ type: 'success', message: 'Producto eliminado exitosamente.' });
            setDeleteModal({ show: false, codigo: null });
            fetchInitialData();
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al eliminar el producto.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col pt-12 lg:pt-0">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-12 h-full">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-96 shrink-0">
                    <div className="glass-card p-5 md:p-8 rounded-3xl border-violet-500/10 shadow-2xl">
                        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                            <PackagePlus className="text-violet-500" /> Nuevo Producto
                        </h3>
                        {feedback && <Feedback {...feedback} />}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input placeholder="Código de producto" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} required />
                            <Input placeholder="Nombre del producto" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />

                            <textarea
                                className="input-field min-h-[100px] md:min-h-[120px] pt-4 custom-scrollbar"
                                placeholder="Características y descripción..."
                                value={form.caracteristicas}
                                onChange={e => setForm({ ...form, caracteristicas: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Precio USD" type="number" value={form.usd} onChange={e => setForm({ ...form, usd: e.target.value })} required />
                                <Input placeholder="Precio COP" type="number" value={form.cop} onChange={e => setForm({ ...form, cop: e.target.value })} required />
                            </div>

                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none transition-all duration-300 focus:border-violet-500/50 focus:bg-white/10 text-slate-100 cursor-pointer appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '1.25rem'
                                    }}
                                    value={form.empresa}
                                    onChange={e => setForm({ ...form, empresa: e.target.value })}
                                    required
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Selecciona una Empresa</option>
                                    {empresas.map(emp => (
                                        <option key={emp.nit} value={emp.nit} className="bg-slate-900 text-slate-100">
                                            {emp.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" loading={loading} className="w-full bg-violet-600 hover:bg-violet-500 shadow-violet-600/20">
                                {loading ? 'Agregando...' : 'Agregar al Inventario'}
                            </Button>
                        </form>
                    </div>
                </motion.div>

                <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
                            <ShoppingBag className="text-violet-500" /> Catálogo
                        </h3>
                        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..." />
                    </div>

                    {fetching ? (
                        <div className="flex justify-center p-10 md:p-20"><LoadingSpinner size={40} /></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:gap-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                            <AnimatePresence>
                                {filteredProductos.map(p => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={p.codigo}
                                        className="glass-card p-4 md:p-6 rounded-3xl border-transparent hover:border-violet-500/20 shadow-xl group shrink-0"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                            <div className="flex items-start gap-3 w-full sm:w-auto">
                                                <div className="p-2 md:p-3 rounded-2xl bg-white/5 text-violet-400 group-hover:bg-violet-600/10 transition-colors shrink-0">
                                                    <Box size={20} md:size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black tracking-widest uppercase py-0.5 px-2 rounded bg-violet-500/20 text-violet-400">
                                                            {p.codigo}
                                                        </span>
                                                        <h3 className="text-base md:text-lg font-bold text-slate-100 truncate">{p.nombre}</h3>
                                                    </div>
                                                    <p className="text-xs text-indigo-400 font-medium">NIT: {p.empresa}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                                                <div className="text-right">
                                                     <p className="text-lg md:text-xl font-bold text-emerald-400 font-mono">${(p.precios?.venta || p.precios?.COP || 0).toLocaleString('es-CO')} <span className="text-xs opacity-50 uppercase tracking-tighter">COP</span></p>
                                                     <p className="text-xs text-muted font-mono">Compra: ${(p.precios?.compra || p.precios?.USD || 0).toLocaleString('es-CO')}</p>
                                                 </div>
                                                {user?.is_administrator && (
                                                    <button
                                                        onClick={() => confirmDelete(p.codigo)}
                                                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                                                        title="Eliminar producto"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-black/20 p-3 md:p-4 rounded-2xl border border-white/5">
                                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 md:line-clamp-none">{p.caracteristicas}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredProductos.length === 0 && (
                                <p className="text-center py-10 md:py-20 text-muted">No se encontraron productos.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, codigo: null })}
                title="Eliminar Producto"
                variant="danger"
            >
                <p className="text-slate-300 mb-8">
                    Esta acción eliminará permanentemente el producto del inventario. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setDeleteModal({ show: false, codigo: null })}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleDelete}
                        loading={loading}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                        Eliminar Definitivamente
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
