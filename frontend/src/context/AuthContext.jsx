import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    // Dynamic API instance configuration
    const api = useMemo(() => {
        const baseURL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000';
        const instance = axios.create({
            baseURL: `${baseURL}/api`,
        });

        // Request Interceptor
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        // Response Interceptor for 401 & Refresh
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        try {
                            const res = await axios.post(`${baseURL}/api/token/refresh/`, {
                                refresh: refreshToken
                            });
                            localStorage.setItem('token', res.data.access);
                            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                            return instance(originalRequest);
                        } catch (err) {
                            logout();
                        }
                    } else {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        const userData = {
            email: data.email,
            is_administrator: data.is_administrator
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setAuth(true);
    };

    const logout = () => {
        localStorage.clear();
        setAuth(false);
        setUser(null);
        // Redirect to login (handle via router usually, but keeping simple)
        // window.location.href = '/login'; 
    };

    const value = {
        auth,
        user,
        api,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
