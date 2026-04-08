import React, { useState, useEffect, useCallback } from 'react';
import { expenseService, incomeService } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CAT_COLORS = { Food:'#10b981', Travel:'#3b82f6', Shopping:'#8b5cf6', Bills:'#f59e0b', Investment:'#06b6d4', Other:'#94a3b8' };

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [expAnalytics, setExpAnalytics] = useState({ monthlyData: [], categoryData: [] });
  const [incAnalytics, setIncAnalytics] = useState({ monthlyIncome: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ea, ia] = await Promise.all([
        expenseService.getAnalytics({ year }),
        incomeService.getAnalytics({ year })
      ]);
      setExpAnalytics(ea);
      setIncAnalytics(ia);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  // Process monthly expense data
  const monthlyExpenses = Array(12).fill(0);
  (expAnalytics.monthlyData || []).forEach(d => {
    if (d && d._id && d._id.month) {
      monthlyExpenses[d._id.month - 1] += d.total || 0;
    }
  });

  // Process monthly income
  const monthlyIncome = Array(12).fill(0);
  (incAnalytics.monthlyIncome || []).forEach(d => {
    if (d && d._id && d._id.month) {
      monthlyIncome[d._id.month - 1] = d.total || 0;
    }
  });

  const monthlySavings = monthlyIncome.map((inc, i) => inc - monthlyExpenses[i]);

  // Category data
  const catLabels = (expAnalytics.categoryData || []).map(d => d._id || 'Unknown');
  const catAmounts = (expAnalytics.categoryData || []).map(d => d.total || 0);
  const catColors = catLabels.map(l => CAT_COLORS[l] || '#94a3b8');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--bg-card)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(128,128,128,0.08)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 } },
        border: { color: 'var(--border-color)' }
      },
      y: {
        grid: { color: 'rgba(128,128,128,0.08)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 }, callback: v => `$${v}` },
        border: { color: 'var(--border-color)' }
      }
    }
  };

  const totalExpenses = monthlyExpenses.reduce((a, b) => a + b, 0);
  const totalIncome = monthlyIncome.reduce((a, b) => a + b, 0);
  const totalSavings = monthlySavings.reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Analytics</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>Full year financial overview</p>
        </div>
        <select value={year} onChange={e => setYear(+e.target.value)} className="ft-input" style={{ width: 'auto' }}>
          {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Income', value: totalIncome, color: '#10b981' },
          { label: 'Total Expenses', value: totalExpenses, color: '#f43f5e' },
          { label: 'Net Savings', value: totalSavings, color: '#3b82f6' },
          { label: 'Savings Rate', value: totalIncome > 0 ? (totalSavings / totalIncome * 100) : 0, color: '#8b5cf6', suffix: '%' },
        ].map(({ label, value, color, suffix }, i) => (
          <div key={label} className={`stat-card animate-fade-in-up stagger-${i+1}`}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>
              {suffix ? `${value.toFixed(1)}${suffix}` : `$${value.toFixed(0)}`}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Income vs Expense Line Chart */}
      <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '22px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>
          Income vs Expenses — {year}
        </h3>
        <div style={{ height: 280 }}>
          {loading ? <div className="skeleton" style={{ height: '100%', borderRadius: 10 }} /> : (
            <Line
              data={{
                labels: MONTHS,
                datasets: [
                  {
                    label: 'Income',
                    data: monthlyIncome,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    tension: 0.4, fill: true, pointRadius: 4,
                    pointBackgroundColor: '#10b981',
                  },
                  {
                    label: 'Expenses',
                    data: monthlyExpenses,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244,63,94,0.08)',
                    tension: 0.4, fill: true, pointRadius: 4,
                    pointBackgroundColor: '#f43f5e',
                  }
                ]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    labels: { color: 'var(--text-secondary)', usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } }
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Bar + Pie row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Monthly Spending Bar */}
        <div className="glass-card animate-fade-in-up stagger-3" style={{ padding: '22px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Monthly Spending</h3>
          <div style={{ height: 240 }}>
            {loading ? <div className="skeleton" style={{ height: '100%', borderRadius: 10 }} /> : (
              <Bar
                data={{
                  labels: MONTHS,
                  datasets: [{
                    label: 'Expenses',
                    data: monthlyExpenses,
                    backgroundColor: monthlyExpenses.map((_, i) => i === new Date().getMonth() ? '#f43f5e' : 'rgba(244,63,94,0.5)'),
                    borderRadius: 6,
                    borderSkipped: false,
                  }]
                }}
                options={chartOptions}
              />
            )}
          </div>
        </div>

        {/* Category Doughnut */}
        <div className="glass-card animate-fade-in-up stagger-4" style={{ padding: '22px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Expense by Category</h3>
          {catLabels.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No data for this period
            </div>
          ) : (
            <>
              <div style={{ height: 200 }}>
                <Doughnut
                  data={{
                    labels: catLabels,
                    datasets: [{ data: catAmounts, backgroundColor: catColors, borderWidth: 2, borderColor: 'var(--bg-card)', hoverOffset: 6 }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { ...chartOptions.plugins.tooltip }
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {catLabels.map((cat, i) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: catColors[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>${catAmounts[i].toFixed(0)}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {totalExpenses > 0 ? ((catAmounts[i] / totalExpenses) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Savings trend */}
      <div className="glass-card animate-fade-in-up stagger-5" style={{ padding: '22px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Monthly Savings Trend</h3>
        <div style={{ height: 200 }}>
          {loading ? <div className="skeleton" style={{ height: '100%', borderRadius: 10 }} /> : (
            <Bar
              data={{
                labels: MONTHS,
                datasets: [{
                  label: 'Net Savings',
                  data: monthlySavings,
                  backgroundColor: monthlySavings.map(v => v >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(244,63,94,0.7)'),
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              }}
              options={chartOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
