import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import { SearchInput } from '../components/atoms/SearchInput';
import { Feedback } from '../components/molecules/Feedback';
import { Modal } from '../components/molecules/Modal';
import { useAuth } from '../context/AuthContext';

export const EmpresasPage = () => {
    const { api, user } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [filteredEmpresas, setFilteredEmpresas] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nit: '', nombre: '', direccion: '', telefono: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, nit: null }); // State for delete modal

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        const filtered = empresas.filter(emp =>
            emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
            emp.nit.includes(search)
        );
        setFilteredEmpresas(filtered);
    }, [search, empresas]);

    const fetchEmpresas = async () => {
        setFetching(true);
        try {
            const res = await api.get('/empresas/');
            setEmpresas(res.data);
            setFilteredEmpresas(res.data);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            await api.post('/empresas/', form);
            setFeedback({ type: 'success', message: 'Empresa registrada correctamente.' });
            setForm({ nit: '', nombre: '', direccion: '', telefono: '' });
            fetchEmpresas();
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al registrar la empresa. Verifica el NIT.' });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (nit) => {
        setDeleteModal({ show: true, nit });
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/empresas/${deleteModal.nit}/`);
            fetchEmpresas();
            setDeleteModal({ show: false, nit: null });
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col pt-12 lg:pt-0">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-12 h-full">
                {user?.is_administrator && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-96 shrink-0">
                        <div className="glass-card p-5 md:p-8 rounded-3xl border-indigo-500/10">
                            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                                <PlusCircle className="text-indigo-500" /> Nueva Empresa
                            </h3>
                            {feedback && <Feedback {...feedback} />}
                            <form onSubmit={handleCreate} className="space-y-4">
                                <Input placeholder="NIT (Identificador Único)" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} required />
                                <Input placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                                <Input placeholder="Dirección física" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
                                <Input placeholder="Teléfono de contacto" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
                                <Button type="submit" loading={loading} className="w-full">
                                    {loading ? 'Registrando...' : 'Registrar Empresa'}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}

                <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                            <Building2 className="text-indigo-500" /> Directorio
                        </h3>
                        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa..." />
                    </div>

                    {fetching ? (
                        <div className="flex justify-center p-10 md:p-20"><LoadingSpinner size={40} /></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                            <AnimatePresence>
                                {filteredEmpresas.map(emp => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={emp.nit}
                                        className="glass-card p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shrink-0"
                                    >
                                        <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
                                            <div className="p-3 md:p-4 rounded-xl bg-white/5 group-hover:bg-indigo-600/10 transition-colors shrink-0">
                                                <Building2 size={20} md:size={24} className="group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-base md:text-lg truncate">{emp.nombre}</p>
                                                <p className="text-xs md:text-sm text-muted truncate">NIT: {emp.nit} • {emp.direccion}</p>
                                            </div>
                                        </div>
                                        {user?.is_administrator && (
                                            <button
                                                onClick={() => confirmDelete(emp.nit)}
                                                className="p-3 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all self-end sm:self-auto"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredEmpresas.length === 0 && (
                                <p className="text-center py-10 md:py-20 text-muted">No se encontraron empresas.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, nit: null })}
                title="Eliminar Empresa"
                variant="danger"
            >
                <p className="text-slate-300 mb-8">
                    Esta acción eliminará la empresa y todos sus productos asociados. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setDeleteModal({ show: false, nit: null })}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleDelete}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                        Eliminar Definitivamente
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
