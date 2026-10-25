'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language, TRANSLATIONS } from '../i18n'; // Путь к вашему i18n файлу

export default function LoginPage() {
    const router = useRouter();
    const [lang, setLang] = useState<Language>('ru');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const t = TRANSLATIONS[lang];
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Ошибка авторизации');

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.name || email.split('@')[0]);

        router.push('/');
        } catch (err: any) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030308] text-[#e2e8f0] font-mono flex items-center justify-center p-4 relative">
        
        {/* Переключатель языков в правом верхнем углу */}
        <div className="absolute top-4 right-4 flex items-center gap-1 border border-gray-800 p-1 bg-black">
            {(['ru', 'uk', 'pl', 'en'] as Language[]).map((l) => (
            <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-xs font-bold uppercase transition-all ${
                lang === l ? 'bg-[#00f0ff] text-black' : 'text-gray-400 hover:text-white'
                }`}
            >
                {l}
            </button>
            ))}
        </div>

        <div className="w-full max-w-md bg-[#080814] border border-[#00f0ff]/50 p-8 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
            
            <div className="text-[10px] text-[#00f0ff] tracking-widest mb-2">[AION_SECURITY // SYSTEM_LOGIN]</div>
            <h1 className="text-2xl font-bold text-white mb-6 tracking-wider">{t.loginTitle}</h1>

            {error && (
            <div className="mb-4 p-3 bg-[#ff0055]/10 border border-[#ff0055] text-[#ff0055] text-xs">
                [ОШИБКА]: {error}
            </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs text-gray-400 mb-1">{t.emailLabel}</label>
                <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white p-2.5 text-sm focus:border-[#00f0ff] focus:outline-none"
                placeholder="agent@aion-system.net"
                />
            </div>

            <div>
                <label className="block text-xs text-gray-400 mb-1">{t.passwordLabel}</label>
                <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white p-2.5 text-sm focus:border-[#00f0ff] focus:outline-none"
                placeholder="••••••••"
                />
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00f0ff] text-black font-bold text-xs tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] mt-2 cursor-pointer"
            >
                {loading ? t.loadingText : t.loginButton}
            </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
            {t.noAccount}{' '}
            <Link href="/register" className="text-[#00f0ff] hover:underline">
                {t.goToRegister}
            </Link>
            </div>
        </div>
        </div>
    );
}