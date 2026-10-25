'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Language, MONTH_NAMES, WEEKDAYS, TRANSLATIONS } from '../i18n';

const HOURLY_RATE = 25;

function ReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [lang, setLang] = useState<Language>((searchParams.get('lang') as Language) || 'ru');
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('АГЕНТ');
    const [year] = useState(2026);
    const [month, setMonth] = useState(10);
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const t = TRANSLATIONS[lang];
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ryokotable.onrender.com';

    // Проверка авторизации при загрузке отчета
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        const storedName = localStorage.getItem('userName');

        if (!token || !storedUserId) {
            router.push('/login');
            return;
        }

        setUserId(storedUserId);
        if (storedName) setUserName(storedName);
    }, [router]);

    const fetchReport = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/schedules/${userId}?year=${year}&month=${month}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.clear();
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error('Error');
            const data = await res.json();
            setSchedule(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchReport();
        }
    }, [month, userId]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const daysData = schedule?.days || [];
    const activeShiftsCount = daysData.filter((d: any) => d.hours > 0).length;
    const totalGrossHours = daysData.reduce((sum: number, d: any) => sum + (d.hours || 0), 0);
    
    // Часы не уменьшаются на перерыв, но перерыв отображается в таблице
    const totalNetPaidHours = totalGrossHours; 
    const totalSalary = totalNetPaidHours * HOURLY_RATE;

    return (
        <div className="min-h-screen bg-[#030308] text-[#e2e8f0] font-mono p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

            {/* Навигация */}
            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#00f0ff]/30 pb-4 gap-4">
            <div className="flex items-center gap-4">
                <Link 
                href="/"
                className="px-3 py-1.5 bg-black border border-gray-700 text-gray-300 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all text-xs font-bold"
                >
                {t.calendarButton}
                </Link>
                <div>
                <div className="text-[10px] text-[#00f0ff] tracking-widest flex items-center gap-2">
                    <span>[RYOKO // TIMESHEET // AGENT: <strong className="text-white">{userName}</strong>]</span>
                    {/* Кнопка выхода */}
                    <button 
                    onClick={handleLogout}
                    className="px-3 py-1 bg-[#ff0055]/10 border border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-black transition-all text-xs font-bold"
                    >
                    {t.logout}
                    </button>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                    {t.reportTitle} — {MONTH_NAMES[lang][month - 1]} {year}
                </h1>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Выбор языка */}
                <div className="flex items-center gap-1 border border-gray-800 p-1 bg-black">
                {(['ru', 'uk', 'pl', 'en'] as Language[]).map((l) => (
                    <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-0.5 text-xs font-bold uppercase ${
                        lang === l ? 'bg-[#00f0ff] text-black' : 'text-gray-400 hover:text-white'
                    }`}
                    >
                    {l}
                    </button>
                ))}
                </div>

                <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-black border border-[#00f0ff] text-[#00f0ff] px-3 py-1 text-sm focus:outline-none cursor-pointer"
                >
                {MONTH_NAMES[lang].map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                ))}
                </select>

                <button 
                onClick={() => window.print()}
                className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] text-xs font-bold"
                >
                {t.print}
                </button>

            </div>
            </nav>

            {/* Сводка зарплаты */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#080814] p-4 border border-[#00ff66]/60">
                <div className="text-[10px] text-[#00ff66] font-bold tracking-widest mb-1">[ {t.netSalary} ]</div>
                <div className="text-3xl font-extrabold text-[#00ff66]">{totalSalary.toFixed(2)} $</div>
                <div className="text-[10px] text-gray-400 mt-2">25.00 $/h ({totalNetPaidHours}h)</div>
            </div>

            <div className="bg-[#080814] p-4 border border-[#00f0ff]/40">
                <div className="text-[10px] text-[#00f0ff] mb-1">{t.paidHours}</div>
                <div className="text-2xl font-bold text-[#00f0ff]">{totalNetPaidHours} h</div>
                <div className="text-[10px] text-gray-500 mt-1">{t.grossHours}: {totalGrossHours}h</div>
            </div>

            <div className="bg-[#080814] p-4 border border-gray-800">
                <div className="text-[10px] text-gray-400 mb-1">{t.shiftsCount}</div>
                <div className="text-2xl font-bold text-white">{activeShiftsCount}</div>
                <div className="text-[10px] text-gray-500 mt-1">Break: 30m (≥8h) / 45m (≥11h)</div>
            </div>

            <div className="bg-[#080814] p-4 border border-gray-800">
                <div className="text-[10px] text-gray-400 mb-1">{t.nonWorkDays}</div>
                <div className="text-xl font-bold text-white">
                {daysData.filter((d: any) => d.type === 'VACATION').length} / {daysData.filter((d: any) => d.type === 'SICK').length}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Vacation / Sick</div>
            </div>
            </div>

            {/* Таблица */}
            <div className="bg-[#080814] border border-gray-800 overflow-x-auto">
            {loading ? (
                <div className="text-center py-20 text-[#00f0ff] animate-pulse">LOADING...</div>
            ) : (
                <table className="w-full text-left border-collapse text-xs">
                <thead>
                    <tr className="border-b border-gray-800 text-gray-500 uppercase bg-black/60">
                    <th className="p-3">#</th>
                    <th className="p-3">{t.month}</th>
                    <th className="p-3">Day</th>
                    <th className="p-3">{t.shiftType}</th>
                    <th className="p-3 text-center">{t.grossHours}</th>
                    <th className="p-3 text-center">{t.break}</th>
                    <th className="p-3 text-center">{t.paid}</th>
                    <th className="p-3 text-right">{t.sum}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {daysData.map((day: any) => {
                    const dateObj = new Date(day.date);
                    const dayOfWeekStr = WEEKDAYS[lang][(dateObj.getDay() + 6) % 7];
                    const grossHours = day.hours || 0;
                    
                    // Логика отображения перерыва (30 мин при >= 8ч, 45 мин при >= 11ч)
                    let breakLabel = '—';
                    if (grossHours >= 11) {
                        breakLabel = '-45 min';
                    } else if (grossHours >= 8) {
                        breakLabel = '-30 min';
                    }

                    const netPaidHours = grossHours; 
                    const daySalary = netPaidHours * HOURLY_RATE;

                    return (
                        <tr key={day.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-gray-400">{day.dayNumber}</td>
                        <td className="p-3 text-white">{MONTH_NAMES[lang][month - 1]} {day.dayNumber}</td>
                        <td className="p-3 font-semibold text-gray-300">{dayOfWeekStr}</td>
                        <td className="p-3">{t.types[day.type as keyof typeof t.types]}</td>
                        <td className="p-3 text-center text-[#00f0ff]">{grossHours}h</td>
                        <td className="p-3 text-center text-gray-500">{breakLabel}</td>
                        <td className="p-3 text-center font-bold text-[#00f0ff]">{netPaidHours}h</td>
                        <td className="p-3 text-right font-bold text-[#00ff66]">+{daySalary.toFixed(2)} $</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            )}
            </div>
        </div>
        </div>
    );
}

export default function MonthlyReportPage() {
    return (
        <Suspense fallback={<div className="bg-[#030308] min-h-screen text-[#00f0ff] p-8 font-mono">LOADING TERMINAL...</div>}>
        <ReportContent />
        </Suspense>
    );
}