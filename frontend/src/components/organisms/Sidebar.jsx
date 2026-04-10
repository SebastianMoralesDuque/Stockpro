import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, ShoppingBag, FileText, LogOut, Hexagon, Menu, X } from 'lucide-react';
import { Modal } from '../molecules/Modal';
import { Button } from '../atoms/Button';

import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ user, isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems = [
        { path: '/empresas', icon: Building2, label: 'Empresas' },
        { path: '/productos', icon: ShoppingBag, label: 'Productos', admin: true },
        { path: '/inventario', icon: FileText, label: 'Inventario', admin: true },
    ];

    const handleLogout = () => {
        logout();
    };

    const handleNavClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors lg:hidden"
            >
                {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>

            <aside className={`
                w-72 glass border-r border-white/5 p-6 md:p-8 flex flex-col fixed h-full z-50
                transform transition-transform duration-300 ease-in-out
                -translate-x-full lg:translate-x-0
                ${isOpen ? 'translate-x-0' : ''}
            `}>
                <div className="flex items-center gap-3 mb-8 md:mb-12 px-2">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
                        <Hexagon className="text-white fill-white/20" size={24} md:size={28} />
                    </div>
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-white">STOCK<span className="text-indigo-500">PRO</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map(item => {
                        if (item.admin && !user?.is_administrator) return null;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className={`flex items-center gap-4 px-4 md:px-5 py-3 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    } `}
                            >
                                <item.icon size={20} className={`${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                <span className="font-semibold tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 md:pt-8 border-t border-white/5">
                    <div className="bg-white/10 p-4 md:p-5 rounded-2xl mb-4 md:mb-6 flex items-center gap-4 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-inner">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-100">{user?.email}</p>
                            <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400">
                                {user?.is_administrator ? 'Administrator' : 'External Access'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-4 px-4 md:px-5 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group cursor-pointer"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Cerrar Sesión"
                variant="danger"
            >
                <p className="text-slate-300 mb-8">
                    ¿Estás seguro de que deseas salir de la aplicación?
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleLogout}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                        Sí, Salir
                    </Button>
                </div>
            </Modal>
        </>
    );
};
