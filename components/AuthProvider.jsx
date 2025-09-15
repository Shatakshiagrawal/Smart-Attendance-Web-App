"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // FIX: Function to process user data consistently
    const processUserData = (data) => {
        if (!data || !data.name) return data;
        const nameParts = data.name.split(' ');
        return {
            ...data,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
        };
    };

    const checkAuth = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(processUserData(data)); // Process data on auth check
            } else {
                await logout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, role) => {
        const deviceIdentifier = localStorage.getItem('deviceIdentifier');

        try {
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role, deviceIdentifier }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Login failed.');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            const processedUser = processUserData(data); // Process data on login
            setUser(processedUser);
            return processedUser;
        } catch (error) {
            console.error('Login error:', error);
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
        router.replace('/login');
    };

    const handleApiError = (response) => {
        if (response.status === 401 || response.status === 403) {
            toast.error("Session expired. Please log in again.");
            logout();
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = { user, setUser, loading, checkAuth, login, logout, handleApiError };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};