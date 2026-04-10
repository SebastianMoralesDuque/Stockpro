import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Download, ExternalLink, Mail, Send } from 'lucide-react';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import { SearchInput } from '../components/atoms/SearchInput';
import { Feedback } from '../components/molecules/Feedback';
import { Modal } from '../components/molecules/Modal';
import { BlockchainLoader } from '../components/molecules/BlockchainLoader';
import { IntegrityInfo } from '../components/molecules/IntegrityInfo';
import { useAuth } from '../context/AuthContext';

export const InventarioPage = () => {
    const { api } = useAuth();
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [search, setSearch] = useState('');
    const [fetching, setFetching] = useState(true);
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [certResult, setCertResult] = useState(null);
    const [certLoading, setCertLoading] = useState(false);
    const [blockchainStep, setBlockchainStep] = useState(0);
    const [emailFeedback, setEmailFeedback] = useState(null);

    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        setFetching(true);
        api.get('/productos/')
            .then(res => {
                setProductos(res.data);
                setFilteredProductos(res.data);
            })
            .finally(() => setFetching(false));
    }, []);

    useEffect(() => {
        const filtered = productos.filter(p =>
            p.empresa.toLowerCase().includes(search.toLowerCase()) ||
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.includes(search)
        );
        setFilteredProductos(filtered);
    }, [search, productos]);

    const downloadPDF = async () => {
        setPdfLoading(true);
        try {
            const queryParams = certResult?.txHash && certResult.txHash !== "SIMULATED_TX_HASH"
                ? `?tx_hash=${certResult.txHash}`
                : '';
            const res = await api.get(`/productos/generate_inventory_pdf/${queryParams}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventario${certResult?.txHash ? '_certificado' : ''}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setPdfLoading(false);
        }
    };

    const certifyBlockchain = async () => {
        setCertLoading(true);
        setCertResult(null);
        setBlockchainStep(0);

        // Simular progreso para mejor feedback visual
        const timer1 = setTimeout(() => setBlockchainStep(1), 1200);
        const timer2 = setTimeout(() => setBlockchainStep(2), 2500);

        try {
            const res = await api.post('/productos/certify_inventory/');
            clearTimeout(timer1);
            clearTimeout(timer2);
            setBlockchainStep(2);
            setCertResult(res.data);
        } catch (err) {
            clearTimeout(timer1);
            clearTimeout(timer2);
            const msg = err.response?.data?.error || 'Error al certificar en Solana';
            alert(msg);
        } finally {
            // Dar tiempo para ver el último paso completado
            setTimeout(() => setCertLoading(false), 800);
        }
    };

    const sendEmail = async (e) => {
        e.preventDefault();
        setSending(true);
        setEmailFeedback(null);
        try {
            await api.post('/productos/send_inventory_pdf/', {
                email,
                tx_hash: certResult?.txHash
            });
            setEmailFeedback({ type: 'success', message: `Reporte enviado exitosamente a ${email}` });
            setEmail('');
        } catch (err) {
            setEmailFeedback({ type: 'error', message: 'Error al enviar el correo. Revisa la configuración.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pt-12 lg:pt-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">Reporte de Inventario</h2>
                    <p className="text-muted text-sm md:text-base">Consolidado general de existencias y valoración</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Button
                        onClick={certifyBlockchain}
                        loading={certLoading}
                        variant="primary"
                        className="text-xs md:text-sm"
                    >
                        {certLoading ? 'Certificando...' : <><ShieldCheck size={16} md:size={20} /> <span className="hidden sm:inline">Certificar con Solana</span><span className="sm:hidden">Certificar</span></>}
                    </Button>
                    <Button
                        onClick={downloadPDF}
                        variant="secondary"
                        loading={pdfLoading}
                        disabled={pdfLoading}
                        className="text-xs md:text-sm"
                    >
                        {pdfLoading ? 'Generando...' : <><Download size={16} md:size={20} /> <span className="hidden sm:inline">Descargar Reporte</span><span className="sm:hidden">PDF</span></>}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {certResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card border-indigo-500/30 p-5 md:p-8 rounded-3xl bg-indigo-500/5 mb-6 md:mb-8">
                            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                                <div className="p-3 md:p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
                                    <ShieldCheck size={24} md:size={32} />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
                                        <h3 className="text-lg md:text-2xl font-bold text-indigo-100">Certificación On-Chain</h3>
                                        <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest">Devnet Verified</span>
                                    </div>
                                    <div className="bg-indigo-500/10 p-3 md:p-4 rounded-2xl mb-4 md:mb-6 border border-indigo-500/10">
                                        <p className="text-sm leading-relaxed italic text-indigo-200">"{certResult.ai_analysis}"</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-black/30 p-3 md:p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-muted uppercase font-black mb-2 tracking-widest">SHA-256 PDF Context</p>
                                            <p className="text-xs font-mono break-all text-slate-300">{certResult.pdf_hash}</p>
                                        </div>
                                        <div className="bg-black/30 p-3 md:p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-muted uppercase font-black mb-2 tracking-widest">Solana Transaction Hash</p>
                                            {certResult.txHash ? (
                                                <a
                                                    href={`https://explorer.solana.com/tx/${certResult.txHash}?cluster=devnet`}
                                                    target="_blank"
                                                    className="text-xs font-mono break-all text-emerald-400 hover:underline flex items-center gap-1 leading-normal"
                                                >
                                                    {certResult.txHash} <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <p className="text-xs text-orange-400 leading-normal">{certResult.warning}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal
                isOpen={certLoading}
                onClose={() => { }}
                title="Integridad Blockchain"
            >
                <BlockchainLoader currentStep={blockchainStep} />
            </Modal>

            <div className="flex justify-start">
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar por empresa o producto..."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-14rem)]">
                <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full order-2 lg:order-1">
                    <div className="bg-white/5 sticky top-0 z-10 border-b border-white/5 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr>
                                    <th className="p-4 md:p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-1/2">Producto</th>
                                    <th className="p-4 md:p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-1/4">Empresa</th>
                                    <th className="p-4 md:p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-1/4">Valoración</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar overflow-x-auto">
                        {fetching ? (
                            <div className="flex justify-center p-10 md:p-20">
                                <LoadingSpinner size={40} />
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <tbody>
                                        {filteredProductos.map(p => (
                                            <tr key={p.codigo} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 md:p-5 w-1/2">
                                                    <p className="font-bold text-slate-100 text-sm md:text-base">{p.nombre}</p>
                                                    <p className="text-[10px] text-muted font-mono">{p.codigo}</p>
                                                </td>
                                                <td className="p-4 md:p-5 text-sm text-indigo-300/60 font-medium w-1/4">{p.empresa}</td>
                                                <td className="p-4 md:p-5 text-right font-mono font-bold text-emerald-400 w-1/4">
                                                    {Object.entries(p.precios).map(([curr, price]) => (
                                                        <div key={curr} className="text-xs">{price} <span className="text-[10px] opacity-50">{curr}</span></div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredProductos.length === 0 && <p className="text-center py-10 md:py-20 text-muted">No se encontraron resultados.</p>}
                            </>
                        )}
                    </div>
                </div>

                <div className="glass-card p-5 md:p-8 rounded-3xl border-indigo-500/10 sticky top-20 lg:top-0 order-1 lg:order-2">
                    <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-white">
                        <Mail className="text-indigo-500" /> Compartir Reporte
                    </h3>
                    <p className="text-sm text-muted mb-4 md:mb-6">Envía el reporte de inventario directamente a cualquier correo electrónico.</p>

                    <Feedback {...emailFeedback} />

                    <form onSubmit={sendEmail} className="space-y-4">
                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="destinatario@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" loading={sending} className="w-full">
                            {sending ? 'Enviando...' : <><Send size={18} /> Enviar Reporte</>}
                        </Button>
                    </form>

                    <IntegrityInfo />
                </div>
            </div>
        </div>
    );
};
