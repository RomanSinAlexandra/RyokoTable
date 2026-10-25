'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Language, MONTH_NAMES, WEEKDAYS, TRANSLATIONS } from './i18n';

const SHIFT_STYLES = {
  WORK: 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10',
  DAY_OFF: 'border-gray-700 text-gray-500 bg-black/40',
  VACATION: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  SICK: 'border-[#ff0055] text-[#ff0055] bg-[#ff0055]/10',
};

export default function PersonalCalendar() {
  const [lang, setLang] = useState<Language>('ru');
  const [userId] = useState('employee-001');
  const [year] = useState(2026);
  const [month, setMonth] = useState(10);
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [editType, setEditType] = useState('WORK');
  const [editHours, setEditHours] = useState(8);

  const t = TRANSLATIONS[lang];
  const API_URL = process.env.NEXT_API_URL || 'http://localhost:3001';

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/schedules/${userId}?year=${year}&month=${month}`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setSchedule(data);
      if (data?.days?.length > 0) {
        setSelectedDay(data.days[0]);
        setEditType(data.days[0].type);
        setEditHours(data.days[0].hours);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [month]);

  const handleSaveDay = async () => {
    if (!selectedDay) return;
    try {
      const res = await fetch(`${API_URL}/schedules/day/${selectedDay.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: editType, hours: Number(editHours) }),
      });
      if (res.ok) fetchSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const totalHours = schedule?.days?.reduce((acc: number, d: any) => acc + d.hours, 0) || 0;
  const workDaysCount = schedule?.days?.filter((d: any) => d.type === 'WORK').length || 0;

  return (
    <div className="bg-[#030308] text-[#e2e8f0] font-mono p-4 md:p-8 min-h-screen border border-[#00f0ff]/30">
      
      {/* Шапка терминала */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#00f0ff]/30 pb-4 gap-4">
        <div>
          <div className="text-xs text-[#00f0ff] mb-1">[AION_TIMELINE // AGENT: {userId}]</div>
          <h2 className="text-2xl font-bold tracking-wider text-white">{t.calendarTitle}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Переключатель языков */}
          <div className="flex items-center gap-1 border border-gray-800 p-1 bg-black">
            {(['ru', 'uk', 'pl', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-xs font-bold uppercase transition-all ${
                  lang === l ? 'bg-[#00f0ff] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <Link 
            href={`/report?lang=${lang}`}
            className="px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all text-xs font-bold"
          >
            {t.reportButton}
          </Link>

          {/* Селектор месяца с отображением названия */}
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-black border border-[#00f0ff] text-[#00f0ff] px-3 py-1.5 text-sm focus:outline-none cursor-pointer"
          >
            {MONTH_NAMES[lang].map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name} ({year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Сетка и редактор */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#080814] p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4 text-xs text-gray-400">
            <span className="text-white font-bold text-sm">
              {MONTH_NAMES[lang][month - 1]} {year}
            </span>
            <span className="text-[#00ff66]">{t.totalHours}: {totalHours}h ({workDaysCount})</span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#00f0ff] animate-pulse">SYNCING...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Заголовки дней недели на выбранном языке */}
              {WEEKDAYS[lang].map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-500 font-bold mb-2">{d}</div>
              ))}

              {/* Отступ перед 1-м числом */}
              {schedule?.days?.length > 0 &&
                Array.from({ length: (new Date(year, month - 1, 1).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16" />
                ))}

              {/* Дни */}
              {schedule?.days?.map((day: any) => {
                const isSelected = selectedDay?.id === day.id;
                const style = SHIFT_STYLES[day.type as keyof typeof SHIFT_STYLES] || SHIFT_STYLES.WORK;

                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      setSelectedDay(day);
                      setEditType(day.type);
                      setEditHours(day.hours);
                    }}
                    className={`h-16 p-1.5 text-left flex flex-col justify-between transition-all border ${
                      isSelected ? 'ring-2 ring-[#00f0ff] scale-105 z-10' : ''
                    } ${style}`}
                  >
                    <div className="flex justify-between items-center w-full text-xs font-bold">
                      <span>{day.dayNumber}</span>
                      <span className="text-[10px] opacity-80">{day.hours}h</span>
                    </div>
                    <div className="text-[9px] tracking-tighter truncate opacity-90 font-semibold">
                      {t.types[day.type as keyof typeof t.types]}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Настройка дня */}
        <div className="bg-[#080814] p-6 border border-[#00f0ff]/50 flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#00f0ff] mb-2">[{t.dayConfig}]</div>
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedDay ? `${selectedDay.dayNumber} ${MONTH_NAMES[lang][month - 1]} ${year}` : '---'}
            </h3>

            {selectedDay && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t.shiftType}:</label>
                  <select 
                    value={editType} 
                    onChange={(e) => {
                      const newType = e.target.value;
                      setEditType(newType);
                      setEditHours(newType === 'WORK' ? 8 : 0);
                    }}
                    className="w-full bg-black border border-gray-700 text-white p-2 text-sm focus:border-[#00f0ff] focus:outline-none"
                  >
                    <option value="WORK">{t.types.WORK}</option>
                    <option value="DAY_OFF">{t.types.DAY_OFF}</option>
                    <option value="VACATION">{t.types.VACATION}</option>
                    <option value="SICK">{t.types.SICK}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t.workHours}:</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    max="24"
                    value={editHours} 
                    onChange={(e) => setEditHours(Number(e.target.value))}
                    className="w-full bg-black border border-gray-700 text-white p-2 text-sm focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {selectedDay && (
            <button
              onClick={handleSaveDay}
              className="mt-6 w-full py-3 bg-[#00f0ff] text-black font-bold text-xs tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              {t.save}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}