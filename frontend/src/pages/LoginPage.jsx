import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Hexagon } from 'lucide-react';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Feedback } from '../components/molecules/Feedback';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const { api, login } = useAuth();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/token/', { correo: email, password });
            login({
                access: res.data.access,
                refresh: res.data.refresh,
                email: res.data.email,
                is_administrator: res.data.is_administrator
            });
        } catch (err) {
            setFeedback({ type: 'error', message: 'Credenciales inválidas. Por favor intenta de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] to-[#121217] p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 rounded-3xl w-full max-w-md shadow-2xl border-white/5"
            >
                <div className="text-center mb-10">
                    <div className="inline-block p-4 rounded-2xl bg-indigo-600/10 text-indigo-500 mb-6">
                        <Hexagon size={44} className="animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido de nuevo</h1>
                    <p className="text-muted">Ingresa tus credenciales para continuar</p>
                </div>

                <Feedback {...feedback} />

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Correo Electrónico</label>
                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Contraseña</label>
                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" loading={loading} className="w-full">
                        Iniciar Sesión
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};
